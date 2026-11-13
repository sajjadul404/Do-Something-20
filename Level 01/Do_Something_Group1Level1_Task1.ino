/*
  SmartClass - Level 1: Dual-core tasks, health and watchdog
  Board : ESP32S3 Dev Module (Arduino-ESP32 core 2.x or 3.x)
  Tools : USB CDC On Boot = Enabled, PSRAM = OPI (N16R8) or QSPI (N8R2), Flash size = match your board
  Libs  : "DHT sensor library" (Adafruit) + "Adafruit Unified Sensor", "MFRC522" (GithubCommunity)

  >>> CHECK THE PIN BLOCK BELOW AGAINST YOUR BOARD'S CAMERA PINOUT <<<
*/

#include <Arduino.h>
#include <SPI.h>
#include <MFRC522.h>
#include <DHT.h>
#include <stdarg.h>
#include "esp_task_wdt.h"
#include "esp_system.h"

// ---------------------------------------------------------------- pins
#define RGB_PIN        48    // onboard WS2812 (some boards use 38)
#define DHT_PIN        14
#define DHT_TYPE       DHT11
#define FLAME_PIN      21
#define FLAME_ACTIVE_LOW 1   // most IR flame modules pull DO LOW when a flame is seen
// idle pull makes an unplugged flame sensor read "no flame" instead of floating into a false fire
#define FLAME_IDLE_PULL  (FLAME_ACTIVE_LOW ? INPUT_PULLUP : INPUT_PULLDOWN)
#define BUZZER_PIN     2
#define BUZZER_ACTIVE_HIGH 1 // set to 0 if your buzzer sounds when the pin is LOW
#define RFID_SCK       41
#define RFID_MISO      42
#define RFID_MOSI      40
#define RFID_SS        1
#define RFID_RST       3

// ---------------------------------------------------------------- config
#define FW_VERSION     "1.0.0"
#define WDT_TIMEOUT_MS 8000      // < 10 s requirement, leaves margin
#define LED_BRIGHTNESS 40        // 0-255

// ---------------------------------------------------------------- shared state
static SemaphoreHandle_t logMux;
static volatile bool  flameNow   = false;
static volatile bool  doorUnlocked = false;
static volatile bool  dhtValid   = false;
static volatile float gTemp      = 0;
static volatile float gHum       = 0;
static volatile uint32_t panicStart = 0;   // ms (tick based) when panic began
static volatile uint32_t panicUntil = 0;   // 0 = no panic
#define PANIC_MS 10000
static volatile bool  errDht     = false;
static volatile bool  errFlame   = false;
static volatile bool  errRfid    = false;
static const char* volatile gState = "SAFE"; // SAFE or FIRE for now, later levels add more
static const char*    gBootReason = "POWER_ON";

struct TaskInfo { const char* name; TaskHandle_t h; int core; };
static TaskInfo taskList[10];
static int taskCount = 0;

DHT dht(DHT_PIN, DHT_TYPE);
MFRC522 rfid(RFID_SS, RFID_RST);

// ---------------------------------------------------------------- helpers
static void plog(const char* fmt, ...) {
  char buf[256];
  va_list ap; va_start(ap, fmt);
  vsnprintf(buf, sizeof(buf), fmt, ap);
  va_end(ap);
  if (xSemaphoreTake(logMux, pdMS_TO_TICKS(50))) {
    Serial.println(buf);
    xSemaphoreGive(logMux);
  }
}

static const char* bootReason() {
  switch (esp_reset_reason()) {
    case ESP_RST_SW:       return "SOFTWARE";
    case ESP_RST_PANIC:    return "CRASH";
    case ESP_RST_INT_WDT:
    case ESP_RST_TASK_WDT:
    case ESP_RST_WDT:      return "WATCHDOG";
    case ESP_RST_BROWNOUT: return "BROWNOUT";
    default:               return "POWER_ON";   // POWERON, EXT, USB, unknown
  }
}

static bool readFlame() {
  int v = digitalRead(FLAME_PIN);
  return FLAME_ACTIVE_LOW ? (v == LOW) : (v == HIGH);
}

// A connected module drives DO itself (its own pull-up, or its comparator pulling low), so the
// reading is the same with our internal pull-up and pull-down. An unplugged pin just follows
// the internal resistor: HIGH with pull-up, LOW with pull-down.
static bool flameDisconnected() {
  pinMode(FLAME_PIN, INPUT_PULLUP);   delayMicroseconds(50);
  int up = digitalRead(FLAME_PIN);
  pinMode(FLAME_PIN, INPUT_PULLDOWN); delayMicroseconds(50);
  int dn = digitalRead(FLAME_PIN);
  pinMode(FLAME_PIN, FLAME_IDLE_PULL);
  return (up == HIGH && dn == LOW);
}

static void startTask(TaskFunction_t fn, const char* name, uint32_t stack, UBaseType_t prio, int core) {
  TaskHandle_t h = NULL;
  xTaskCreatePinnedToCore(fn, name, stack, NULL, prio, &h, core);
  taskList[taskCount++] = { name, h, core };
}

static void wdtSetup() {
#if ESP_ARDUINO_VERSION_MAJOR >= 3
  esp_task_wdt_config_t cfg = {};
  cfg.timeout_ms     = WDT_TIMEOUT_MS;
  cfg.idle_core_mask = 0;      // only watch our own tasks
  cfg.trigger_panic  = true;   // reset the board when a task freezes
  if (esp_task_wdt_reconfigure(&cfg) != ESP_OK) esp_task_wdt_init(&cfg);
#else
  esp_task_wdt_init(WDT_TIMEOUT_MS / 1000, true);
#endif
}

// ---------------------------------------------------------------- LED task (core 0)
// Follows the Device Signals table for the states used in Level 1:
//   1 Fire         : red, 5 flashes/s (100 ms on / 100 ms off), buzzer 200 ms on / 200 ms off, continuous
//   6 Sensor error : magenta, 2 Hz heartbeat (250/250), no buzzer
//  11 Safe         : green,   2 Hz heartbeat (250/250), no buzzer
//   2 Panic        : red/blue alternating, buzzer 100 ms on / 100 ms off, for 10 s after the fire ends
// Priority: Fire > Panic (while active) > Sensor error > Safe
// A new flame during panic switches to Fire at once and cancels the panic.
static void ledTask(void*) {
  esp_task_wdt_add(NULL);
  int lastLed = -1, lastBuz = -1;

  for (;;) {
    uint32_t t = (uint32_t)xTaskGetTickCount() * portTICK_PERIOD_MS;   // ms
    bool ledOn, buzOn = false;
    uint8_t r = 0, g = 0, b = 0;

    if (!flameNow && panicUntil != 0 && (int32_t)(panicUntil - t) > 0) {   // 2) PANIC (10 s after the fire ends)
      bool redPhase = ((t - panicStart) % 200) < 100;         // 100 ms red / 100 ms blue
      ledOn = true;
      buzOn = redPhase;                                       // buzzer 100 ms on / 100 ms off
      if (redPhase) r = LED_BRIGHTNESS; else b = LED_BRIGHTNESS;
    } else if (flameNow) {                           // 1) FIRE
      ledOn = (t % 200) < 100;                       // 5 Hz
      buzOn = (t % 400) < 200;                       // 200 ms on / 200 ms off
      r = LED_BRIGHTNESS;
    } else if (errDht || errRfid || errFlame) {      // 6) SENSOR ERROR
      ledOn = (t % 500) < 250;                       // 2 Hz
      r = LED_BRIGHTNESS; b = LED_BRIGHTNESS;        // magenta
    } else {                                         // 11) SAFE
      ledOn = (t % 500) < 250;                       // 2 Hz
      g = LED_BRIGHTNESS;                            // green
    }

    int ledCode = ledOn ? (1 + r + g * 3 + b * 7) : 0;   // write only on change
    if (ledCode != lastLed) {
      lastLed = ledCode;
      if (ledOn) neopixelWrite(RGB_PIN, r, g, b); else neopixelWrite(RGB_PIN, 0, 0, 0);
    }
    if ((int)buzOn != lastBuz) {
      lastBuz = buzOn;
      digitalWrite(BUZZER_PIN, (buzOn == (bool)BUZZER_ACTIVE_HIGH) ? HIGH : LOW);
    }

    esp_task_wdt_reset();
    vTaskDelay(pdMS_TO_TICKS(10));
  }
}

// ---------------------------------------------------------------- flame task (core 0, every 100 ms)
static void flameTask(void*) {
  esp_task_wdt_add(NULL);
  TickType_t last = xTaskGetTickCount();
  bool prevFlame = false;
  int probeCount = 0, badCount = 0, goodCount = 0;
  for (;;) {
    flameNow = readFlame();
    if (++probeCount >= 5) {                             // check the connection every 500 ms
      probeCount = 0;
      if (flameDisconnected()) {
        goodCount = 0;
        if (++badCount >= 3 && !errFlame) {              // ~1.5 s
          errFlame = true;
          plog("[ERROR] SENSOR ERROR: FLAME");
        }
      } else {
        badCount = 0;
        if (errFlame && ++goodCount >= 2) {
          errFlame = false;
          goodCount = 0;
          plog("[ERROR] SENSOR ERROR CLEARED: FLAME");
        }
      }
    }
    if (errFlame) flameNow = false;                      // never show fire for a missing sensor
    uint32_t t = (uint32_t)xTaskGetTickCount() * portTICK_PERIOD_MS;
    if (flameNow) {
      panicUntil = 0;                                    // fire (again) -> FIRE state at once, panic cancelled
    } else if (prevFlame && !errFlame) {                 // fire just ended -> panic for 10 s
      panicStart = t;
      panicUntil = t + PANIC_MS;
      if (panicUntil == 0) panicUntil = 1;
    }
    prevFlame = flameNow;
    bool panicActive = (panicUntil != 0) && ((int32_t)(panicUntil - t) > 0);
    doorUnlocked = flameNow || panicActive;   // UNLOCKED during fire and during the 10 s panic, else LOCKED
    gState = (flameNow || panicActive) ? "FIRE" : "SAFE";
    esp_task_wdt_reset();
    vTaskDelayUntil(&last, pdMS_TO_TICKS(100));
  }
}

// ---------------------------------------------------------------- RFID task (core 0, every 200 ms)
static void rfidTask(void*) {
  esp_task_wdt_add(NULL);
  SPI.begin(RFID_SCK, RFID_MISO, RFID_MOSI, RFID_SS);
  rfid.PCD_Init();

  TickType_t last = xTaskGetTickCount();
  int fails = 0, miss = 0;
  bool present = false;

  for (;;) {
    byte v = rfid.PCD_ReadRegister(MFRC522::VersionReg);
    bool ok = (v != 0x00 && v != 0xFF);   // clones report odd values such as 0x82

    if (!ok) {
      // 3 failures x 200 ms ~ 0.6 s  -> well inside the 3 s limit
      if (++fails >= 3 && !errRfid) {
        errRfid = true;
        present = false;
        plog("[ERROR] SENSOR ERROR: RFID");
      }
    } else {
      if (fails > 0) rfid.PCD_Init();          // chip came back: reconfigure it
      fails = 0;
      if (errRfid) {
        errRfid = false;
        plog("[ERROR] SENSOR ERROR CLEARED: RFID");
      }

      // WUPA wakes both new and halted cards, so a held card stays "present"
      byte atqa[2]; byte len = sizeof(atqa);
      MFRC522::StatusCode st = rfid.PICC_WakeupA(atqa, &len);
      if (st == MFRC522::STATUS_OK || st == MFRC522::STATUS_COLLISION) {
        if (rfid.PICC_ReadCardSerial()) {
          if (!present) {                       // one line per tap
            present = true;
            char uid[24] = {0};
            for (byte i = 0; i < rfid.uid.size && i < 10; i++) sprintf(uid + i * 2, "%02X", rfid.uid.uidByte[i]);
            plog("[CARD] uid=%s", uid);
          }
          rfid.PICC_HaltA();
        }
        miss = 0;
      } else {
        if (++miss >= 2) present = false;       // card removed (~400 ms without answer)
      }
    }
    esp_task_wdt_reset();
    vTaskDelayUntil(&last, pdMS_TO_TICKS(200));
  }
}

// ---------------------------------------------------------------- DHT task (core 1, every 5 s)
static void dhtTask(void*) {
  esp_task_wdt_add(NULL);
  dht.begin();
  uint32_t next = 0;
  int fails = 0;

  for (;;) {
    uint32_t now = millis();
    if ((int32_t)(now - next) >= 0) {
      float t = dht.readTemperature(false, true);   // force a fresh read
      float h = dht.readHumidity();
      if (!isnan(t) && !isnan(h)) {
        gTemp = t; gHum = h; dhtValid = true;
        fails = 0;
        if (errDht) { errDht = false; plog("[ERROR] SENSOR ERROR CLEARED: DHT11"); }
        next = now + 5000;
      } else {
        // retry every second; 3 fails -> error about 7 s after the last good read (limit 12 s)
        if (++fails >= 3 && !errDht) {
          errDht = true;
          dhtValid = false;
          plog("[ERROR] SENSOR ERROR: DHT11");
        }
        next = now + 1000;
      }
    }
    esp_task_wdt_reset();
    vTaskDelay(pdMS_TO_TICKS(20));
  }
}

// ---------------------------------------------------------------- status task (core 1, every 1 s)
static void printStatus() {
  char t[16] = "-", h[16] = "-";
  if (dhtValid) {
    snprintf(t, sizeof(t), "%.1fC", (float)gTemp);
    snprintf(h, sizeof(h), "%d%%", (int)lroundf(gHum));
  }
  plog("[STATUS] up=%lus T=%s RH=%s HI=- flame=%d door=%s state=%s trend=- rssi=- heap=%luk psram=%luk chip=%.1fC fw=%s",
       (unsigned long)(millis() / 1000), t, h,
       flameNow ? 1 : 0,
       doorUnlocked ? "UNLOCKED" : "LOCKED",
       gState,
       (unsigned long)(ESP.getFreeHeap() / 1024),
       (unsigned long)(ESP.getFreePsram() / 1024),
       temperatureRead(), FW_VERSION);
}

static void statusTask(void*) {
  esp_task_wdt_add(NULL);
  TickType_t last = xTaskGetTickCount();
  for (;;) {
    printStatus();
    esp_task_wdt_reset();
    vTaskDelayUntil(&last, pdMS_TO_TICKS(1000));
  }
}

// ---------------------------------------------------------------- command task = the "main" task (core 1)
static void cmdHelp() {
  plog("[CMD] help   - list commands");
  plog("[CMD] status - print one status line now");
  plog("[CMD] health - chip temp, heap, PSRAM, flash, CPU, RSSI, uptime, reset reason, firmware");
  plog("[CMD] tasks  - running tasks, CPU core, free stack");
  plog("[CMD] ver    - firmware version and build date");
  plog("[CMD] hang   - freeze this task to test the watchdog");
}

static void cmdHealth() {
  plog("[CMD] chip_temp=%.1fC", temperatureRead());
  plog("[CMD] free_heap=%luk", (unsigned long)(ESP.getFreeHeap() / 1024));
  plog("[CMD] free_psram=%luk", (unsigned long)(ESP.getFreePsram() / 1024));
  plog("[CMD] flash=%luMB", (unsigned long)(ESP.getFlashChipSize() / (1024 * 1024)));
  plog("[CMD] cpu=%luMHz", (unsigned long)ESP.getCpuFreqMHz());
  plog("[CMD] rssi=-");
  plog("[CMD] uptime=%lus", (unsigned long)(millis() / 1000));
  plog("[CMD] last_reset=%s", gBootReason);
  plog("[CMD] fw=%s", FW_VERSION);
}

static void cmdTasks() {
  for (int i = 0; i < taskCount; i++) {
    plog("[CMD] task=%s core=%d free_stack=%luB", taskList[i].name, taskList[i].core,
         (unsigned long)uxTaskGetStackHighWaterMark(taskList[i].h));
  }
}

static void handleCommand(String c) {
  c.trim();
  c.toLowerCase();
  if (c.length() == 0) return;
  if      (c == "help")   cmdHelp();
  else if (c == "status") printStatus();
  else if (c == "health") cmdHealth();
  else if (c == "tasks")  cmdTasks();
  else if (c == "ver")    plog("[CMD] fw=%s build=%s %s", FW_VERSION, __DATE__, __TIME__);
  else if (c == "hang") {
    plog("[CMD] hang: freezing main task, watchdog should restart the board within 10 s");
    Serial.flush();
    for (;;) { __asm__ __volatile__("nop"); }   // never feeds the watchdog
  }
  else plog("[CMD] unknown or not available yet: %s (type help)", c.c_str());
}

static void cmdTask(void*) {
  esp_task_wdt_add(NULL);
  String line;
  for (;;) {
    while (Serial.available()) {
      char ch = (char)Serial.read();
      if (ch == '\n') { handleCommand(line); line = ""; }
      else if (ch != '\r' && line.length() < 64) line += ch;
    }
    esp_task_wdt_reset();
    vTaskDelay(pdMS_TO_TICKS(10));
  }
}

// ---------------------------------------------------------------- setup
void setup() {
  // 1) Flame sensor FIRST: no flame -> LOCKED, flame -> UNLOCKED
  pinMode(FLAME_PIN, FLAME_IDLE_PULL);
  int votes = 0;
  for (int i = 0; i < 5; i++) { if (readFlame()) votes++; delayMicroseconds(200); }
  flameNow = (votes >= 3);
  doorUnlocked = flameNow;
  gState = flameNow ? "FIRE" : "SAFE";

  pinMode(BUZZER_PIN, OUTPUT);
  digitalWrite(BUZZER_PIN, LOW);

  Serial.begin(115200);
  logMux = xSemaphoreCreateMutex();
  delay(1500);   // lets USB-CDC re-enumerate so the BOOT line is not lost

  gBootReason = bootReason();
  plog("[EVENT] BOOT reason=%s", gBootReason);

  wdtSetup();

  // Core 0: led, flame, rfid   |   Core 1: dht, status, commands
  startTask(ledTask,    "led",    3072, 2, 0);
  startTask(flameTask,  "flame",  3072, 3, 0);
  startTask(rfidTask,   "rfid",   4096, 2, 0);
  startTask(dhtTask,    "dht",    4096, 2, 1);
  startTask(statusTask, "status", 4096, 2, 1);
  startTask(cmdTask,    "cmd",    4096, 2, 1);

  vTaskDelete(NULL);   // Arduino loop task is no longer needed
}

void loop() {}

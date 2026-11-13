import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Sidebar } from './components/Sidebar.jsx';
import { TopBar } from './components/TopBar.jsx';
import { MetricCards } from './components/MetricCards.jsx';
import { LiveCameraFeed } from './components/LiveCameraFeed.jsx';
import { DoorControlCard } from './components/DoorControlCard.jsx';
import { StatusRow } from './components/StatusRow.jsx';
import { SettingsView } from './components/SettingsView.jsx';
import { HistoryView } from './components/HistoryView.jsx';
import { AboutView } from './components/AboutView.jsx';
import { INITIAL_ACTIVITIES, INITIAL_ROOMS, INITIAL_SETTINGS } from './data/initialData.js';
import { EventCategory, NavTab } from './types/classroom.js';

export default function App() {
  const [activeTab, setActiveTab] = useState(NavTab.Home);
  const [mobileNavOpen, setMobileNavOpen] = useState(false);

  const [rooms, setRooms] = useState(INITIAL_ROOMS);
  const [activeRoomId, setActiveRoomId] = useState(INITIAL_ROOMS[0].id);
  const [settings, setSettings] = useState(INITIAL_SETTINGS);
  const [activities, setActivities] = useState(INITIAL_ACTIVITIES);
  const [autoLockRemaining, setAutoLockRemaining] = useState(null);
  const [toastMessage, setToastMessage] = useState(null);

  const activeRoom = useMemo(
    () => rooms.find((r) => r.id === activeRoomId) ?? rooms[0],
    [rooms, activeRoomId]
  );

  const showToast = useCallback((msg) => {
    setToastMessage(msg);
  }, []);

  useEffect(() => {
    if (!toastMessage) return;
    const t = setTimeout(() => setToastMessage(null), 2800);
    return () => clearTimeout(t);
  }, [toastMessage]);

  const appendActivity = useCallback(
    (category, title, detail, actor, severity = 'normal') => {
      const now = new Date();
      const hh = String(now.getHours()).padStart(2, '0');
      const mm = String(now.getMinutes()).padStart(2, '0');
      const newEvent = {
        id: `evt-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
        timestamp: `${hh}:${mm}`,
        isoTime: now.toISOString(),
        category,
        title,
        detail,
        actor,
        severity,
      };
      setActivities((prev) => [newEvent, ...prev].slice(0, 50));
    },
    []
  );

  const updateActiveRoom = useCallback(
    (updater) => {
      setRooms((prev) =>
        prev.map((r) => (r.id === activeRoomId ? updater(r) : r))
      );
    },
    [activeRoomId]
  );

  // Auto-lock countdown effect when door is unlocked
  useEffect(() => {
    if (activeRoom.doorLocked || settings.autoLockSeconds <= 0 || activeRoom.fireAlert) {
      setAutoLockRemaining(null);
      return;
    }

    if (autoLockRemaining === null) {
      setAutoLockRemaining(settings.autoLockSeconds);
      return;
    }

    if (autoLockRemaining <= 0) {
      updateActiveRoom((r) => ({ ...r, doorLocked: true }));
      appendActivity(
        EventCategory.Access,
        `Door locked automatically (${activeRoom.name})`,
        `Re-engaged after ${settings.autoLockSeconds}s auto-lock countdown`,
        'Auto-Lock Timer'
      );
      setAutoLockRemaining(null);
      showToast('Door automatically locked');
      return;
    }

    const timer = setTimeout(() => {
      setAutoLockRemaining((prev) => (prev !== null ? prev - 1 : null));
    }, 1000);

    return () => clearTimeout(timer);
  }, [
    activeRoom.doorLocked,
    activeRoom.fireAlert,
    activeRoom.name,
    autoLockRemaining,
    settings.autoLockSeconds,
    updateActiveRoom,
    appendActivity,
    showToast,
  ]);

  // Periodic subtle sensor drift when liveSimulation is enabled
  useEffect(() => {
    if (!settings.liveSimulation || !activeRoom.wifiConnected) return;
    const interval = setInterval(() => {
      setRooms((prev) =>
        prev.map((room) => {
          if (room.id !== activeRoomId) return room;
          const humDelta = Math.random() > 0.5 ? 1 : -1;
          const nextHumidity = Math.max(45, Math.min(76, room.humidity + humDelta));
          return { ...room, humidity: nextHumidity };
        })
      );
    }, 12000);
    return () => clearInterval(interval);
  }, [settings.liveSimulation, activeRoom.wifiConnected, activeRoomId]);

  const handleToggleLock = () => {
    const nextLocked = !activeRoom.doorLocked;
    updateActiveRoom((r) => ({ ...r, doorLocked: nextLocked }));

    if (nextLocked) {
      setAutoLockRemaining(null);
      appendActivity(
        EventCategory.Access,
        'Door locked from dashboard',
        `${activeRoom.name} entry secured by administrator`,
        'Admin Console'
      );
      showToast(`${activeRoom.name} locked`);
    } else {
      setAutoLockRemaining(settings.autoLockSeconds > 0 ? settings.autoLockSeconds : null);
      appendActivity(
        EventCategory.Access,
        'Door unlocked remotely',
        `${activeRoom.name} entry unlocked via FastRobox Hub`,
        'Admin Console'
      );
      showToast(`${activeRoom.name} unlocked`);
    }
  };

  const handleAdjustStudents = (delta) => {
    const next = Math.max(0, Math.min(settings.maxCapacity, activeRoom.students + delta));
    if (next === activeRoom.students) return;
    updateActiveRoom((r) => ({ ...r, students: next }));
    appendActivity(
      EventCategory.Environment,
      `Occupancy adjusted to ${next} students`,
      `${activeRoom.name} student count updated`,
      'Occupancy Counter'
    );
  };

  const handleAdjustTemp = (delta) => {
    const next = Math.max(16, Math.min(42, activeRoom.temp + delta));
    if (next === activeRoom.temp) return;
    updateActiveRoom((r) => ({ ...r, temp: next }));
    const isWarn = next >= settings.tempAlertThreshold;
    appendActivity(
      EventCategory.Environment,
      `Temperature reading ${next}°C`,
      isWarn
        ? `Exceeded threshold of ${settings.tempAlertThreshold}°C`
        : 'Within normal classroom comfort range',
      'Climate Sensor',
      isWarn ? 'warning' : 'normal'
    );
  };

  const handleToggleFireAlert = () => {
    const nextAlert = !activeRoom.fireAlert;
    updateActiveRoom((r) => ({
      ...r,
      fireAlert: nextAlert,
      doorLocked: nextAlert ? false : r.doorLocked,
    }));

    if (nextAlert) {
      setAutoLockRemaining(null);
      appendActivity(
        EventCategory.Safety,
        'Fire & smoke alert triggered',
        'Emergency protocol unlocked classroom doors automatically',
        'MQ-2 Safety Drill',
        'alert'
      );
      showToast('Emergency drill active: classroom door unlocked');
    } else {
      appendActivity(
        EventCategory.Safety,
        'Fire alert cleared — room safe',
        'MQ-2 smoke sensor returned to nominal baseline',
        'Admin Console'
      );
      showToast('Fire safety status restored to Safe');
    }
  };

  const handleToggleWifi = () => {
    const nextConnected = !activeRoom.wifiConnected;
    updateActiveRoom((r) => ({ ...r, wifiConnected: nextConnected }));
    appendActivity(
      EventCategory.System,
      nextConnected ? 'Hub Wi-Fi reconnected' : 'Hub Wi-Fi connection lost',
      nextConnected
        ? `Restored link to ${activeRoom.wifiSsid}`
        : 'Switched to local edge fail-safe mode',
      'Network Monitor',
      nextConnected ? 'normal' : 'warning'
    );
    showToast(nextConnected ? 'Wi-Fi connected' : 'Hub switched to offline test mode');
  };

  const handleRunDiagnostics = () => {
    appendActivity(
      EventCategory.System,
      'Sensor self-check completed',
      `All 6 IoT nodes in ${activeRoom.name} passed telemetry verification`,
      'FastRobox Hub'
    );
    showToast('All classroom sensors passed self-check');
  };

  const handleChangeAngle = (angle) => {
    updateActiveRoom((r) => ({ ...r, cameraAngle: angle }));
  };

  const handleToggleCameraSource = () => {
    const nextSource = settings.cameraSource === 'simulated' ? 'webcam' : 'simulated';
    setSettings((prev) => ({ ...prev, cameraSource: nextSource }));
    appendActivity(
      EventCategory.System,
      `Camera feed switched to ${nextSource === 'webcam' ? 'device webcam' : 'classroom view'}`,
      `Active view: ${activeRoom.cameraAngle}`,
      'Camera Module'
    );
  };

  const handleSnapshotTaken = (angle) => {
    appendActivity(
      EventCategory.System,
      `Camera snapshot captured (${angle})`,
      `Frame archived for ${activeRoom.name}`,
      'Camera Module'
    );
    showToast(`Snapshot saved (${angle})`);
  };

  const handleUpdateSettings = (patch) => {
    setSettings((prev) => ({ ...prev, ...patch }));
  };

  const handleResetDefaults = () => {
    setSettings(INITIAL_SETTINGS);
    appendActivity(
      EventCategory.System,
      'Classroom settings reset to defaults',
      'Restored standard automation thresholds and timers',
      'Admin Console'
    );
    showToast('Settings restored to defaults');
  };

  return (
    <div className="relative flex min-h-screen w-full overflow-x-hidden bg-[#F5F3FF]">
      {/* Subtle Pastel Ambient Blobs matching Mockup Canvas */}
      <div
        className="pointer-events-none fixed top-0 left-48 h-80 w-80 rounded-full bg-[#ECE4FF]/70 blur-3xl"
        aria-hidden="true"
      />
      <div
        className="pointer-events-none fixed right-0 bottom-0 h-96 w-96 rounded-full bg-[#EAE2FF]/65 blur-3xl"
        aria-hidden="true"
      />

      {/* Left Purple Sidebar */}
      <Sidebar
        activeTab={activeTab}
        onSelectTab={setActiveTab}
        mobileOpen={mobileNavOpen}
        onCloseMobile={() => setMobileNavOpen(false)}
      />

      {/* Main Content Area */}
      <div className="relative z-10 flex min-w-0 flex-1 flex-col">
        <TopBar
          rooms={rooms}
          activeRoom={activeRoom}
          onSelectRoom={(id) => {
            setActiveRoomId(id);
            setAutoLockRemaining(null);
          }}
          activeTab={activeTab}
          onNavigate={setActiveTab}
          onOpenMobileNav={() => setMobileNavOpen(true)}
          onToggleWifi={handleToggleWifi}
        />

        <main className="flex-1 px-5 pt-2 pb-7 sm:px-7">
          {activeTab === NavTab.Home && (
            <div className="mx-auto flex w-full max-w-[1220px] flex-col gap-5">
              {/* Row 1: 4 Pastel Telemetry Cards */}
              <MetricCards
                room={activeRoom}
                settings={settings}
                onAdjustStudents={handleAdjustStudents}
                onAdjustTemp={handleAdjustTemp}
                onToggleFireAlert={handleToggleFireAlert}
              />

              {/* Row 2: Live Camera Feed + Door Control Card */}
              <section
                aria-label="Live Classroom Feed and Door Access"
                className="grid grid-cols-1 items-stretch gap-5 lg:grid-cols-12"
              >
                <div className="lg:col-span-7 xl:col-span-8">
                  <LiveCameraFeed
                    room={activeRoom}
                    settings={settings}
                    onChangeAngle={handleChangeAngle}
                    onToggleCameraSource={handleToggleCameraSource}
                    onSnapshotTaken={handleSnapshotTaken}
                  />
                </div>
                <div className="lg:col-span-5 xl:col-span-4">
                  <DoorControlCard
                    doorLocked={activeRoom.doorLocked}
                    autoLockRemaining={autoLockRemaining}
                    onToggleLock={handleToggleLock}
                  />
                </div>
              </section>

              {/* Row 3: Network + Device Health + Recent Activity */}
              <StatusRow
                room={activeRoom}
                activities={activities}
                onToggleWifi={handleToggleWifi}
                onRunDiagnostics={handleRunDiagnostics}
                onViewAllHistory={() => setActiveTab(NavTab.History)}
              />
            </div>
          )}

          {activeTab === NavTab.Settings && (
            <SettingsView
              room={activeRoom}
              settings={settings}
              onUpdateSettings={handleUpdateSettings}
              onToggleFireAlert={handleToggleFireAlert}
              onResetDefaults={handleResetDefaults}
            />
          )}

          {activeTab === NavTab.History && (
            <HistoryView room={activeRoom} activities={activities} />
          )}

          {activeTab === NavTab.About && <AboutView room={activeRoom} />}
        </main>
      </div>

      {/* Transient Feedback Toast */}
      {toastMessage && (
        <div
          role="status"
          aria-live="polite"
          className="fixed right-6 bottom-6 z-50 rounded-2xl bg-[#1E1445] px-4 py-3 text-sm font-medium text-white shadow-xl"
        >
          {toastMessage}
        </div>
      )}
    </div>
  );
}

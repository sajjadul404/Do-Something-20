import React from 'react';
import { Cpu, Flame, Lock, ThermometerSun, Users, Video } from 'lucide-react';

const HARDWARE_MODULES = [
  {
    name: 'Occupancy Counter',
    sensor: 'Dual-Beam IR + Vision Edge',
    detail: 'Tracks student entry and exit in real time without storing personal biometrics.',
    icon: Users,
    accent: 'bg-[#EBE3FF] text-[#5B2EDB]',
  },
  {
    name: 'Climate Monitor',
    sensor: 'BME280 / DHT22 Node',
    detail: 'Measures ambient classroom temperature and relative humidity every 5 seconds.',
    icon: ThermometerSun,
    accent: 'bg-[#D6F5E3] text-[#15803D]',
  },
  {
    name: 'Fire & Smoke Watch',
    sensor: 'MQ-2 Gas & Optical Flame',
    detail: 'Continuously monitors air quality for smoke particles and triggers automatic evacuation unlock.',
    icon: Flame,
    accent: 'bg-[#FFE3D4] text-[#EA580C]',
  },
  {
    name: 'Smart Solenoid Lock',
    sensor: '12V Relay + Hall Feedback',
    detail: 'Remote classroom access control with automatic re-lock safety countdown.',
    icon: Lock,
    accent: 'bg-[#DCECFD] text-[#1D4ED8]',
  },
  {
    name: 'Classroom Camera',
    sensor: 'ESP32-CAM / RTSP Bridge',
    detail: 'Provides live multi-angle visual verification and instant snapshot capture.',
    icon: Video,
    accent: 'bg-[#EFEAFF] text-[#4D2CA1]',
  },
  {
    name: 'FastRobox Core Hub',
    sensor: 'ESP32-S3 Dual-Core MCU',
    detail: 'Coordinates MQTT/WebSocket telemetry, local safety fail-safes, and Wi-Fi health checks.',
    icon: Cpu,
    accent: 'bg-[#E6F4EA] text-[#15803D]',
  },
];

export const AboutView = ({ room }) => {
  return (
    <div className="mx-auto flex w-full max-w-5xl flex-col gap-5">
      <div className="rounded-[22px] bg-white p-6 shadow-[0_12px_32px_-12px_rgba(45,27,105,0.12)] sm:p-8">
        <h1 className="font-display text-2xl font-bold text-[#17153B]">
          About FastRobox Smart Classroom
        </h1>
        <p className="mt-2 max-w-3xl text-sm leading-relaxed text-[#564D7C]">
          FastRobox unifies classroom safety, environmental monitoring, live camera verification, and remote door access into a single low-latency control center designed for university labs and modern lecture halls.
        </p>

        <div className="mt-5 grid grid-cols-2 gap-4 border-t border-[#EFEAFF] pt-5 sm:grid-cols-4">
          <div>
            <div className="text-xs font-medium text-[#6B6490]">Active Node</div>
            <div className="mt-0.5 font-display text-base font-bold text-[#17153B]">
              {room.name}
            </div>
          </div>
          <div>
            <div className="text-xs font-medium text-[#6B6490]">Firmware</div>
            <div className="mt-0.5 font-mono text-sm font-semibold text-[#4D2CA1]">
              {room.firmwareVersion}
            </div>
          </div>
          <div>
            <div className="text-xs font-medium text-[#6B6490]">Continuous Uptime</div>
            <div className="mt-0.5 font-mono text-sm font-semibold text-[#15803D] tabular-nums">
              {room.uptimeHours} hours
            </div>
          </div>
          <div>
            <div className="text-xs font-medium text-[#6B6490]">Network SSID</div>
            <div className="mt-0.5 font-mono text-sm font-semibold text-[#17153B]">
              {room.wifiSsid}
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {HARDWARE_MODULES.map(({ name, sensor, detail, icon: Icon, accent }) => (
          <div
            key={name}
            className="flex flex-col gap-3 rounded-[22px] bg-white p-5 shadow-[0_12px_32px_-12px_rgba(45,27,105,0.12)]"
          >
            <div className="flex items-center gap-3">
              <div className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl ${accent}`}>
                <Icon className="h-5 w-5" />
              </div>
              <div>
                <h2 className="font-display text-base font-bold text-[#17153B]">{name}</h2>
                <div className="text-xs font-medium text-[#6B6490]">{sensor}</div>
              </div>
            </div>
            <p className="text-sm leading-relaxed text-[#564D7C]">{detail}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

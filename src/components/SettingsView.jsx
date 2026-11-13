import React from 'react';
import { Bell, Lock, RotateCcw, ShieldAlert, Sliders, Video } from 'lucide-react';

export const SettingsView = ({
  room,
  settings,
  onUpdateSettings,
  onToggleFireAlert,
  onResetDefaults,
}) => {
  return (
    <div className="mx-auto flex w-full max-w-4xl flex-col gap-5">
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-[22px] bg-white p-6 shadow-[0_12px_32px_-12px_rgba(45,27,105,0.12)]">
        <div>
          <h1 className="font-display text-2xl font-bold text-[#17153B]">
            Classroom Automation & Thresholds
          </h1>
          <p className="mt-1 text-sm text-[#564D7C]">
            Configure smart lock timers, climate alert limits, and camera preferences for {room.name}.
          </p>
        </div>

        <button
          type="button"
          onClick={onResetDefaults}
          className="flex items-center gap-2 rounded-xl bg-[#F5F2FF] px-4 py-2.5 text-sm font-semibold text-[#4D2CA1] transition-colors hover:bg-[#EAE3FF]"
        >
          <RotateCcw className="h-4 w-4" />
          <span>Reset Defaults</span>
        </button>
      </div>

      <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
        {/* Door Access Automation */}
        <div className="rounded-[22px] bg-white p-6 shadow-[0_12px_32px_-12px_rgba(45,27,105,0.12)]">
          <div className="mb-4 flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#EFEAFF] text-[#5B2EDB]">
              <Lock className="h-4 w-4" />
            </div>
            <h2 className="font-display text-lg font-bold text-[#17153B]">
              Door Access Control
            </h2>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-semibold text-[#2E2759]">
                Auto-Lock Delay After Unlock
              </label>
              <p className="mb-2 text-xs text-[#6B6490]">
                Automatically re-engage solenoid lock after unlocking from dashboard.
              </p>
              <div className="grid grid-cols-4 gap-2">
                {[0, 10, 15, 30].map((sec) => {
                  const selected = settings.autoLockSeconds === sec;
                  return (
                    <button
                      key={sec}
                      type="button"
                      onClick={() => onUpdateSettings({ autoLockSeconds: sec })}
                      className={`rounded-xl py-2 text-sm font-semibold transition-colors tabular-nums ${
                        selected
                          ? 'bg-[#6D41E8] text-white'
                          : 'bg-[#F5F2FF] text-[#4D2CA1] hover:bg-[#EAE3FF]'
                      }`}
                    >
                      {sec === 0 ? 'Off' : `${sec}s`}
                    </button>
                  );
                })}
              </div>
            </div>

            <div>
              <label htmlFor="max-cap" className="block text-sm font-semibold text-[#2E2759]">
                Classroom Seating Capacity
              </label>
              <div className="mt-2 flex items-center gap-3">
                <input
                  id="max-cap"
                  type="range"
                  min={15}
                  max={80}
                  value={settings.maxCapacity}
                  onChange={(e) => onUpdateSettings({ maxCapacity: Number(e.target.value) })}
                  className="h-2 w-full cursor-pointer accent-[#6D41E8]"
                />
                <span className="w-12 text-right font-mono text-sm font-bold text-[#17153B] tabular-nums">
                  {settings.maxCapacity}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Climate Thresholds */}
        <div className="rounded-[22px] bg-white p-6 shadow-[0_12px_32px_-12px_rgba(45,27,105,0.12)]">
          <div className="mb-4 flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#D6F5E3] text-[#15803D]">
              <Sliders className="h-4 w-4" />
            </div>
            <h2 className="font-display text-lg font-bold text-[#17153B]">
              Environmental Alerts
            </h2>
          </div>

          <div className="space-y-4">
            <div>
              <label htmlFor="temp-limit" className="block text-sm font-semibold text-[#2E2759]">
                High Temperature Threshold (°C)
              </label>
              <div className="mt-2 flex items-center gap-3">
                <input
                  id="temp-limit"
                  type="range"
                  min={24}
                  max={38}
                  value={settings.tempAlertThreshold}
                  onChange={(e) => onUpdateSettings({ tempAlertThreshold: Number(e.target.value) })}
                  className="h-2 w-full cursor-pointer accent-[#16A34A]"
                />
                <span className="w-14 text-right font-mono text-sm font-bold text-[#17153B] tabular-nums">
                  {settings.tempAlertThreshold}°C
                </span>
              </div>
            </div>

            <div>
              <label htmlFor="hum-limit" className="block text-sm font-semibold text-[#2E2759]">
                Maximum Humidity Warning (%)
              </label>
              <div className="mt-2 flex items-center gap-3">
                <input
                  id="hum-limit"
                  type="range"
                  min={50}
                  max={90}
                  value={settings.humidityAlertMax}
                  onChange={(e) => onUpdateSettings({ humidityAlertMax: Number(e.target.value) })}
                  className="h-2 w-full cursor-pointer accent-[#2563EB]"
                />
                <span className="w-14 text-right font-mono text-sm font-bold text-[#17153B] tabular-nums">
                  {settings.humidityAlertMax}%
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Camera & Live Telemetry */}
        <div className="rounded-[22px] bg-white p-6 shadow-[0_12px_32px_-12px_rgba(45,27,105,0.12)]">
          <div className="mb-4 flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#DCECFD] text-[#1D4ED8]">
              <Video className="h-4 w-4" />
            </div>
            <h2 className="font-display text-lg font-bold text-[#17153B]">
              Camera & Telemetry Stream
            </h2>
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between gap-4 rounded-xl bg-[#F8F6FF] p-3.5">
              <div>
                <div className="text-sm font-semibold text-[#17153B]">
                  Live Telemetry Simulation
                </div>
                <div className="text-xs text-[#6B6490]">
                  Periodically updates sensor temperature and humidity drift
                </div>
              </div>
              <button
                type="button"
                role="switch"
                aria-checked={settings.liveSimulation}
                onClick={() => onUpdateSettings({ liveSimulation: !settings.liveSimulation })}
                className={`relative h-7 w-12 shrink-0 rounded-full transition-colors ${
                  settings.liveSimulation ? 'bg-[#6D41E8]' : 'bg-[#D1CBEB]'
                }`}
              >
                <span
                  className={`block h-5 w-5 translate-y-1 rounded-full bg-white shadow-xs transition-transform ${
                    settings.liveSimulation ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>

            <div className="flex items-center justify-between gap-4 rounded-xl bg-[#F8F6FF] p-3.5">
              <div>
                <div className="text-sm font-semibold text-[#17153B]">
                  Camera Input Source
                </div>
                <div className="text-xs text-[#6B6490]">
                  Choose classroom view or browser webcam feed
                </div>
              </div>
              <div className="flex rounded-xl bg-white p-1 shadow-xs">
                <button
                  type="button"
                  onClick={() => onUpdateSettings({ cameraSource: 'simulated' })}
                  className={`rounded-lg px-2.5 py-1 text-xs font-semibold ${
                    settings.cameraSource === 'simulated'
                      ? 'bg-[#6D41E8] text-white'
                      : 'text-[#564D7C]'
                  }`}
                >
                  Classroom
                </button>
                <button
                  type="button"
                  onClick={() => onUpdateSettings({ cameraSource: 'webcam' })}
                  className={`rounded-lg px-2.5 py-1 text-xs font-semibold ${
                    settings.cameraSource === 'webcam'
                      ? 'bg-[#6D41E8] text-white'
                      : 'text-[#564D7C]'
                  }`}
                >
                  Webcam
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Fire Safety Test */}
        <div className="rounded-[22px] bg-white p-6 shadow-[0_12px_32px_-12px_rgba(45,27,105,0.12)]">
          <div className="mb-4 flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#FFE3D4] text-[#EA580C]">
              <ShieldAlert className="h-4 w-4" />
            </div>
            <h2 className="font-display text-lg font-bold text-[#17153B]">
              Fire & Smoke Drill
            </h2>
          </div>

          <p className="mb-4 text-sm text-[#564D7C]">
            Verify that FastRobox emergency alerts trigger correctly across the dashboard and automatically unlock classroom doors during evacuation drills.
          </p>

          <button
            type="button"
            onClick={onToggleFireAlert}
            className={`flex w-full items-center justify-center gap-2 rounded-xl px-4 py-3 text-sm font-semibold text-white transition-colors ${
              room.fireAlert
                ? 'bg-[#15803D] hover:bg-[#166534]'
                : 'bg-[#DC2626] hover:bg-[#B91C1C]'
            }`}
          >
            <Bell className="h-4 w-4" />
            <span>
              {room.fireAlert ? 'Clear Active Fire Drill' : 'Trigger Fire Safety Drill'}
            </span>
          </button>
        </div>
      </div>
    </div>
  );
};

import React, { useState } from 'react';
import { Check, AlertTriangle, ChevronRight, Clock, Cpu, Wifi, WifiOff } from 'lucide-react';
import { EventCategory } from '../types/classroom.js';

const CATEGORY_COLORS = {
  [EventCategory.Environment]: 'bg-[#2596FF]',
  [EventCategory.Access]: 'bg-[#16A34A]',
  [EventCategory.Safety]: 'bg-[#EA580C]',
  [EventCategory.System]: 'bg-[#7C4DFF]',
};

export const StatusRow = ({
  room,
  activities,
  onToggleWifi,
  onRunDiagnostics,
  onViewAllHistory,
}) => {
  const [showNetworkDetails, setShowNetworkDetails] = useState(false);
  const [showHealthDetails, setShowHealthDetails] = useState(false);

  const isHealthy = room.deviceHealthy && !room.fireAlert;

  return (
    <section
      aria-label="Hardware Status and Recent Activity"
      className="grid grid-cols-1 gap-4 md:grid-cols-12"
    >
      {/* 1. Connected Wi-Fi Card */}
      <div className="relative overflow-hidden rounded-[22px] bg-white p-5 shadow-[0_12px_32px_-12px_rgba(45,27,105,0.14)] md:col-span-3">
        <svg
          viewBox="0 0 260 130"
          className="pointer-events-none absolute inset-0 h-full w-full opacity-75"
          preserveAspectRatio="none"
          aria-hidden="true"
        >
          <path
            d="M0 95C60 70 110 115 180 82C220 62 245 78 260 72V130H0V95Z"
            fill={room.wifiConnected ? '#EAF4FF' : '#FEF2F2'}
          />
          <path
            d="M0 30C45 12 95 45 145 20C195 -4 235 28 260 14V0H0V30Z"
            fill={room.wifiConnected ? '#F1F8FF' : '#FFF5F5'}
          />
        </svg>

        <button
          type="button"
          onClick={() => setShowNetworkDetails((prev) => !prev)}
          className="relative z-10 flex h-full w-full flex-col items-center justify-center gap-3 text-center focus-visible:outline-2 focus-visible:outline-[#2596FF]"
        >
          <div className="relative flex h-14 w-16 items-center justify-center">
            {room.wifiConnected ? (
              <Wifi className="h-12 w-12 text-[#2394FF]" strokeWidth={2.4} />
            ) : (
              <WifiOff className="h-12 w-12 text-[#DC2626]" strokeWidth={2.4} />
            )}
            <span
              className={`absolute right-0 bottom-0 flex h-6 w-6 items-center justify-center rounded-full border-2 border-white text-white shadow-xs ${
                room.wifiConnected ? 'bg-[#16A34A]' : 'bg-[#DC2626]'
              }`}
            >
              {room.wifiConnected ? (
                <Check className="h-3.5 w-3.5" strokeWidth={3} />
              ) : (
                <AlertTriangle className="h-3 w-3" />
              )}
            </span>
          </div>

          <div>
            <div className="font-display text-[17px] font-bold text-[#17153B]">
              {room.wifiConnected ? 'Connected' : 'Disconnected'}
            </div>
            {showNetworkDetails && (
              <div className="mt-1 text-xs text-[#564D7C] tabular-nums">
                {room.wifiSsid} · {room.wifiSignalDbm} dBm
              </div>
            )}
          </div>
        </button>

        {showNetworkDetails && (
          <button
            type="button"
            onClick={onToggleWifi}
            className="relative z-10 mt-2 w-full rounded-lg bg-[#EAF4FF] py-1.5 text-xs font-semibold text-[#1D4ED8] hover:bg-[#D8ECFF]"
          >
            {room.wifiConnected ? 'Simulate Disconnect' : 'Reconnect Wi-Fi'}
          </button>
        )}
      </div>

      {/* 2. Device Healthy Card */}
      <div className="relative overflow-hidden rounded-[22px] bg-white p-5 shadow-[0_12px_32px_-12px_rgba(45,27,105,0.14)] md:col-span-4">
        <svg
          viewBox="0 0 280 130"
          className="pointer-events-none absolute inset-0 h-full w-full opacity-75"
          preserveAspectRatio="none"
          aria-hidden="true"
        >
          <path
            d="M0 100C70 72 135 112 205 84C240 70 262 85 280 78V130H0V100Z"
            fill={isHealthy ? '#ECFDF5' : '#FEF2F2'}
          />
        </svg>

        <button
          type="button"
          onClick={() => setShowHealthDetails((prev) => !prev)}
          className="relative z-10 flex h-full w-full flex-col items-center justify-center gap-3 text-center focus-visible:outline-2 focus-visible:outline-[#6E40E8]"
        >
          <div className="relative flex h-14 w-16 items-center justify-center">
            <Cpu className="h-12 w-12 text-[#5B2EDB]" strokeWidth={2.1} />
            <span
              className={`absolute right-0 bottom-0 flex h-6 w-6 items-center justify-center rounded-full border-2 border-white text-white shadow-xs ${
                isHealthy ? 'bg-[#16A34A]' : 'bg-[#DC2626]'
              }`}
            >
              {isHealthy ? (
                <Check className="h-3.5 w-3.5" strokeWidth={3} />
              ) : (
                <AlertTriangle className="h-3 w-3" />
              )}
            </span>
          </div>

          <div>
            <div className="font-display text-[17px] font-bold text-[#17153B]">
              {isHealthy ? 'Device Healthy' : 'Safety Alert'}
            </div>
            {showHealthDetails && (
              <div className="mt-1 text-xs text-[#564D7C] tabular-nums">
                {room.firmwareVersion} · Uptime {room.uptimeHours}h
              </div>
            )}
          </div>
        </button>

        {showHealthDetails && (
          <button
            type="button"
            onClick={onRunDiagnostics}
            className="relative z-10 mt-2 w-full rounded-lg bg-[#EFEAFF] py-1.5 text-xs font-semibold text-[#4D2CA1] hover:bg-[#E2D8FF]"
          >
            Run Sensor Self-Check
          </button>
        )}
      </div>

      {/* 3. Recent Activity Card */}
      <div className="flex flex-col justify-between rounded-[22px] bg-white p-5 shadow-[0_12px_32px_-12px_rgba(45,27,105,0.14)] md:col-span-5">
        <div className="mb-3 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[#EFEAFF] text-[#4D2CA1]">
              <Clock className="h-4 w-4" />
            </div>
            <h2 className="font-display text-[17px] font-bold text-[#17153B]">
              Recent Activity
            </h2>
          </div>

          <button
            type="button"
            onClick={onViewAllHistory}
            className="flex h-8 w-8 items-center justify-center rounded-full text-[#4D2CA1] transition-colors hover:bg-[#F5F2FF] focus-visible:outline-2 focus-visible:outline-[#6E40E8]"
            aria-label="Open full activity history"
            title="View full history"
          >
            <ChevronRight className="h-5 w-5" />
          </button>
        </div>

        <ul className="flex flex-col gap-2.5">
          {activities.slice(0, 3).map((event) => (
            <li
              key={event.id}
              className="flex items-center justify-between gap-3 rounded-xl bg-[#F8F6FF] px-3 py-2 text-sm"
            >
              <div className="flex min-w-0 items-center gap-2.5">
                <span
                  className={`h-2.5 w-2.5 shrink-0 rounded-full ${CATEGORY_COLORS[event.category]}`}
                  aria-hidden="true"
                />
                <span className="truncate font-medium text-[#231B4B]">
                  {event.title}
                </span>
              </div>
              <span className="shrink-0 font-mono text-xs text-[#6B6490] tabular-nums">
                {event.timestamp}
              </span>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
};

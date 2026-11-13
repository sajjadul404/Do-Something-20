import React, { useState } from 'react';
import { Minus, Plus, ShieldCheck, ShieldAlert } from 'lucide-react';

export const MetricCards = ({
  room,
  settings,
  onAdjustStudents,
  onAdjustTemp,
  onToggleFireAlert,
}) => {
  const [expandedCard, setExpandedCard] = useState(null);

  const isHighTemp = room.temp >= settings.tempAlertThreshold;
  const isHighHumidity = room.humidity >= settings.humidityAlertMax;

  return (
    <section aria-label="Classroom Environmental Metrics" className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
      {/* 1. Students Card */}
      <div
        className="relative flex flex-col justify-center rounded-[20px] bg-[#EBE3FF] px-5 py-4 shadow-[0_8px_24px_-10px_rgba(79,45,158,0.16)] transition-transform duration-150 hover:-translate-y-0.5"
      >
        <button
          type="button"
          onClick={() => setExpandedCard((prev) => (prev === 'students' ? null : 'students'))}
          className="flex w-full items-center gap-4 text-left focus-visible:outline-2 focus-visible:outline-[#6E40E8]"
          aria-expanded={expandedCard === 'students'}
        >
          {room.wifiConnected && (
            <span
              className="absolute top-3.5 right-3.5 h-2.5 w-2.5 rounded-full bg-[#16A34A]"
              title="IR Occupancy Sensor Active"
            />
          )}
          <div className="flex h-14 w-14 shrink-0 items-center justify-center">
            <svg viewBox="0 0 64 56" className="h-12 w-14" fill="none" aria-hidden="true">
              <circle cx="16" cy="20" r="6.5" fill="url(#stuSide)" />
              <path d="M5 42C5 34.8 9.9 30 16 30C22.1 30 27 34.8 27 42V45H5V42Z" fill="url(#stuSide)" />
              <circle cx="48" cy="20" r="6.5" fill="url(#stuSide)" />
              <path d="M37 42C37 34.8 41.9 30 48 30C54.1 30 59 34.8 59 42V45H37V42Z" fill="url(#stuSide)" />
              <circle cx="32" cy="17" r="8" fill="url(#stuMain)" />
              <path d="M17 45C17 36.2 23.7 30 32 30C40.3 30 47 36.2 47 45V48H17V45Z" fill="url(#stuMain)" />
              <defs>
                <linearGradient id="stuMain" x1="32" y1="9" x2="32" y2="48" gradientUnits="userSpaceOnUse">
                  <stop stopColor="#8155F7" />
                  <stop offset="1" stopColor="#4F29B7" />
                </linearGradient>
                <linearGradient id="stuSide" x1="16" y1="13" x2="16" y2="45" gradientUnits="userSpaceOnUse">
                  <stop stopColor="#9E7BFA" />
                  <stop offset="1" stopColor="#653CD1" />
                </linearGradient>
              </defs>
            </svg>
          </div>
          <div className="min-w-0">
            <div className="font-display text-[28px] leading-tight font-bold tracking-tight text-[#151238] tabular-nums">
              {room.students}
            </div>
            <div className="text-[14px] font-medium text-[#564D7C]">
              Students
            </div>
          </div>
        </button>

        {expandedCard === 'students' && (
          <div className="mt-3 flex items-center justify-between border-t border-[#D8CBFF] pt-2.5 text-xs text-[#433875]">
            <span>Capacity: {room.students}/{settings.maxCapacity}</span>
            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={() => onAdjustStudents(-1)}
                className="flex h-7 w-7 items-center justify-center rounded-lg bg-white text-[#4D2CA1] shadow-xs hover:bg-[#F5F2FF]"
                aria-label="Decrease student count"
              >
                <Minus className="h-3.5 w-3.5" />
              </button>
              <button
                type="button"
                onClick={() => onAdjustStudents(1)}
                className="flex h-7 w-7 items-center justify-center rounded-lg bg-white text-[#4D2CA1] shadow-xs hover:bg-[#F5F2FF]"
                aria-label="Increase student count"
              >
                <Plus className="h-3.5 w-3.5" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* 2. Temperature Card */}
      <div
        className={`relative flex flex-col justify-center rounded-[20px] px-5 py-4 shadow-[0_8px_24px_-10px_rgba(22,163,74,0.16)] transition-transform duration-150 hover:-translate-y-0.5 ${
          isHighTemp ? 'bg-[#FEE4D6]' : 'bg-[#D6F5E3]'
        }`}
      >
        <button
          type="button"
          onClick={() => setExpandedCard((prev) => (prev === 'temp' ? null : 'temp'))}
          className="flex w-full items-center gap-4 text-left focus-visible:outline-2 focus-visible:outline-[#16A34A]"
          aria-expanded={expandedCard === 'temp'}
        >
          <div className="flex h-14 w-12 shrink-0 items-center justify-center">
            <svg viewBox="0 0 48 60" className="h-12 w-10" fill="none" aria-hidden="true">
              <path
                d="M21 8C17.686 8 15 10.686 15 14V34.1C12.56 35.92 11 38.82 11 42C11 47.523 15.477 52 21 52C26.523 52 31 47.523 31 42C31 38.82 29.44 35.92 27 34.1V14C27 10.686 24.314 8 21 8Z"
                fill="#FFFFFF"
                stroke="#EA4C2B"
                strokeWidth="3.2"
              />
              <rect x="19" y="19" width="4" height="20" rx="2" fill="#EA4C2B" />
              <circle cx="21" cy="42" r="6" fill="#EA4C2B" />
              <path d="M34 15H39M34 22H38M34 29H39" stroke="#EA4C2B" strokeWidth="2.8" strokeLinecap="round" />
            </svg>
          </div>
          <div className="min-w-0">
            <div className="font-display text-[28px] leading-tight font-bold tracking-tight text-[#151238] tabular-nums">
              {room.temp}°C
            </div>
            <div className="text-[14px] font-medium text-[#3F6351]">
              {isHighTemp ? 'High Temp' : 'Temp'}
            </div>
          </div>
        </button>

        {expandedCard === 'temp' && (
          <div className="mt-3 flex items-center justify-between border-t border-[#BCE8CF] pt-2.5 text-xs text-[#23543B]">
            <span>Alert at {settings.tempAlertThreshold}°C</span>
            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={() => onAdjustTemp(-1)}
                className="flex h-7 w-7 items-center justify-center rounded-lg bg-white text-[#15803D] shadow-xs hover:bg-[#ECFDF5]"
                aria-label="Decrease temperature"
              >
                <Minus className="h-3.5 w-3.5" />
              </button>
              <button
                type="button"
                onClick={() => onAdjustTemp(1)}
                className="flex h-7 w-7 items-center justify-center rounded-lg bg-white text-[#15803D] shadow-xs hover:bg-[#ECFDF5]"
                aria-label="Increase temperature"
              >
                <Plus className="h-3.5 w-3.5" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* 3. Humidity Card */}
      <div className="relative flex items-center gap-4 rounded-[20px] bg-[#DCECFD] px-5 py-4 shadow-[0_8px_24px_-10px_rgba(37,99,235,0.16)] transition-transform duration-150 hover:-translate-y-0.5">
        <div className="flex h-14 w-12 shrink-0 items-center justify-center">
          <svg viewBox="0 0 48 58" className="h-12 w-10" fill="none" aria-hidden="true">
            <path
              d="M24 5C24 5 8 24.4 8 36C8 44.837 15.163 52 24 52C32.837 52 40 44.837 40 36C40 24.4 24 5 24 5Z"
              fill="url(#dropGrad)"
            />
            <path
              d="M15.5 36.5C15.5 41.2 18.8 44.8 23 45.8"
              stroke="#CBE6FF"
              strokeWidth="3"
              strokeLinecap="round"
            />
            <defs>
              <linearGradient id="dropGrad" x1="24" y1="5" x2="24" y2="52" gradientUnits="userSpaceOnUse">
                <stop stopColor="#3B9CFF" />
                <stop offset="1" stopColor="#125BE0" />
              </linearGradient>
            </defs>
          </svg>
        </div>
        <div className="min-w-0">
          <div className="font-display text-[28px] leading-tight font-bold tracking-tight text-[#151238] tabular-nums">
            {room.humidity}%
          </div>
          <div className="text-[14px] font-medium text-[#3C587A]">
            {isHighHumidity ? 'High Humidity' : 'Humidity'}
          </div>
        </div>
      </div>

      {/* 4. Fire Safety Card */}
      <div
        className={`relative flex flex-col justify-center rounded-[20px] px-5 py-4 shadow-[0_8px_24px_-10px_rgba(234,88,12,0.16)] transition-transform duration-150 hover:-translate-y-0.5 ${
          room.fireAlert ? 'bg-[#FECACA] ring-2 ring-[#DC2626]' : 'bg-[#FFE3D4]'
        }`}
      >
        <button
          type="button"
          onClick={() => setExpandedCard((prev) => (prev === 'fire' ? null : 'fire'))}
          className="flex w-full items-center gap-4 text-left focus-visible:outline-2 focus-visible:outline-[#EA580C]"
          aria-expanded={expandedCard === 'fire'}
        >
          <div className="flex h-14 w-12 shrink-0 items-center justify-center">
            <svg viewBox="0 0 52 60" className="h-12 w-11" fill="none" aria-hidden="true">
              <path
                d="M27.5 6C27.5 6 38.5 16.2 38.5 27.5C38.5 29.8 37.9 32.1 36.8 34.1C39.2 32.2 41 29.2 41 25.5C44.8 30 46 35 46 39C46 49.5 37.5 56 26 56C14.5 56 6 48.2 6 37.5C6 27.2 13.8 18.8 18.8 15.2C18 19.6 19.4 23.2 21.5 25.4C20.2 17.5 23.6 10.6 27.5 6Z"
                fill="url(#flameOuter)"
              />
              <path
                d="M26 27C29.5 31.8 33 36.2 33 41.5C33 46.5 29.8 50 25.8 50C21.8 50 18.5 46.5 18.5 41.8C18.5 37.5 21.8 32.8 26 27Z"
                fill="#FFD08A"
              />
              <defs>
                <linearGradient id="flameOuter" x1="26" y1="6" x2="26" y2="56" gradientUnits="userSpaceOnUse">
                  <stop stopColor="#FF9233" />
                  <stop offset="1" stopColor="#EB4C1A" />
                </linearGradient>
              </defs>
            </svg>
          </div>
          <div className="min-w-0">
            <div
              className={`font-display flex items-center gap-1.5 text-[24px] leading-tight font-bold tracking-tight ${
                room.fireAlert ? 'text-[#B91C1C]' : 'text-[#15803D]'
              }`}
            >
              {room.fireAlert ? (
                <>
                  <span>Alert</span>
                  <ShieldAlert className="h-5 w-5 shrink-0" />
                </>
              ) : (
                <>
                  <span>Safe</span>
                  <ShieldCheck className="h-5 w-5 shrink-0 opacity-85" />
                </>
              )}
            </div>
            <div className={`text-[14px] font-medium ${room.fireAlert ? 'text-[#7F1D1D]' : 'text-[#6A534B]'}`}>
              {room.fireAlert ? 'Smoke Detected' : 'No Fire'}
            </div>
          </div>
        </button>

        {expandedCard === 'fire' && (
          <div className="mt-3 flex items-center justify-between border-t border-[#F7CBB4] pt-2.5 text-xs">
            <span className="font-medium text-[#6A534B]">MQ-2 Sensor</span>
            <button
              type="button"
              onClick={onToggleFireAlert}
              className={`rounded-lg px-2.5 py-1 font-semibold text-white transition-colors ${
                room.fireAlert
                  ? 'bg-[#15803D] hover:bg-[#166534]'
                  : 'bg-[#DC2626] hover:bg-[#B91C1C]'
              }`}
            >
              {room.fireAlert ? 'Clear Alarm' : 'Test Alarm'}
            </button>
          </div>
        )}
      </div>
    </section>
  );
};

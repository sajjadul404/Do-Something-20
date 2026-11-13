import React from 'react';
import { Lock, Unlock } from 'lucide-react';

export const DoorControlCard = ({
  doorLocked,
  autoLockRemaining,
  onToggleLock,
}) => {
  return (
    <div className="flex h-full flex-col justify-between rounded-[24px] bg-white p-6 shadow-[0_12px_32px_-12px_rgba(45,27,105,0.14)]">
      {/* Upper Door Illustration + Status */}
      <div className="flex flex-1 items-center justify-center gap-6 py-2">
        <div className="relative flex h-28 w-28 shrink-0 items-center justify-center rounded-full bg-[#EFEAFF]">
          <svg
            viewBox="0 0 28 28"
            className={`absolute -top-1 -right-2 h-7 w-7 transition-colors ${
              doorLocked ? 'text-[#16A34A]' : 'text-[#F59E0B]'
            }`}
            fill="none"
            aria-hidden="true"
          >
            <path d="M5 10L10 4" stroke="currentColor" strokeWidth="2.8" strokeLinecap="round" />
            <path d="M10 15L19 10" stroke="currentColor" strokeWidth="2.8" strokeLinecap="round" />
            <path d="M12 21L21 20" stroke="currentColor" strokeWidth="2.8" strokeLinecap="round" />
          </svg>

          <svg viewBox="0 0 64 72" className="h-16 w-16" fill="none" aria-hidden="true">
            <rect
              x="16"
              y="8"
              width="32"
              height="56"
              rx="4"
              fill={doorLocked ? '#572EC8' : '#3C1E94'}
            />
            <path
              d={
                doorLocked
                  ? 'M18 10H46V62H18V10Z'
                  : 'M18 10L39 15V57L18 62V10Z'
              }
              fill="#6D41E8"
              className="transition-all duration-200"
            />
            <circle cx="34" cy="36" r="2.6" fill="#DDD2FF" />
          </svg>

          <div
            className={`absolute right-1 bottom-1 flex h-10 w-10 items-center justify-center rounded-full border-2 border-white text-white shadow-md transition-colors duration-150 ${
              doorLocked ? 'bg-[#FB923C]' : 'bg-[#16A34A]'
            }`}
          >
            {doorLocked ? <Lock className="h-4 w-4" /> : <Unlock className="h-4 w-4" />}
          </div>
        </div>

        <div className="min-w-0">
          <div className="text-[20px] font-medium text-[#2E2759]">Door</div>
          <div
            className={`font-display text-[32px] leading-tight font-bold tracking-tight ${
              doorLocked ? 'text-[#17153B]' : 'text-[#15803D]'
            }`}
          >
            {doorLocked ? 'Locked' : 'Unlocked'}
          </div>
          {!doorLocked && autoLockRemaining !== null && autoLockRemaining > 0 && (
            <div className="mt-1 text-xs font-medium text-[#6B6490] tabular-nums">
              Auto-locks in {autoLockRemaining}s
            </div>
          )}
        </div>
      </div>

      {/* Primary Action Button */}
      <div className="relative mt-5">
        <svg
          viewBox="0 0 28 28"
          className="pointer-events-none absolute -top-4 right-1 h-7 w-7 text-[#6E40E8]/75"
          fill="none"
          aria-hidden="true"
        >
          <path d="M5 10L10 4" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round" />
          <path d="M10 15L19 10" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round" />
          <path d="M12 21L21 20" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round" />
        </svg>

        <button
          type="button"
          onClick={onToggleLock}
          className={`flex min-h-[58px] w-full items-center justify-center gap-3 rounded-[18px] px-6 py-3.5 text-[18px] font-semibold text-white transition-all duration-150 active:scale-[0.98] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#6E40E8] ${
            doorLocked
              ? 'bg-gradient-to-r from-[#7F53F8] to-[#5B2EDB] shadow-[0_12px_26px_-6px_rgba(104,58,232,0.55)] hover:from-[#8B62FA] hover:to-[#673AE4]'
              : 'bg-gradient-to-r from-[#16A34A] to-[#15803D] shadow-[0_12px_26px_-6px_rgba(22,163,74,0.45)] hover:from-[#1DB954] hover:to-[#168A42]'
          }`}
        >
          {doorLocked ? (
            <>
              <Lock className="h-5 w-5" />
              <span>Unlock</span>
            </>
          ) : (
            <>
              <Unlock className="h-5 w-5" />
              <span>Lock Door</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
};

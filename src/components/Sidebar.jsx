import React from 'react';
import { BarChart3, Home, Info, Settings, X } from 'lucide-react';
import { NavTab } from '../types/classroom.js';

const NAV_ITEMS = [
  { id: NavTab.Home, label: 'Home', icon: Home },
  { id: NavTab.Settings, label: 'Settings', icon: Settings },
  { id: NavTab.History, label: 'History', icon: BarChart3 },
  { id: NavTab.About, label: 'About', icon: Info },
];

export const Sidebar = ({
  activeTab,
  onSelectTab,
  mobileOpen,
  onCloseMobile,
}) => {
  const handleNav = (tab) => {
    onSelectTab(tab);
    onCloseMobile();
  };

  return (
    <>
      {mobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-[#17153B]/40 backdrop-blur-xs lg:hidden"
          onClick={onCloseMobile}
          aria-hidden="true"
        />
      )}

      <aside
        className={`fixed inset-y-0 left-0 z-50 flex w-[235px] shrink-0 flex-col justify-between overflow-hidden bg-gradient-to-b from-[#4D2CA1] via-[#3F2188] to-[#5734B1] text-white shadow-[8px_0_32px_-12px_rgba(59,30,138,0.45)] transition-transform duration-200 ease-out lg:static lg:translate-x-0 lg:rounded-r-[26px] ${
          mobileOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
        aria-label="Primary Navigation"
      >
        {/* Top Brand + Nav */}
        <div className="relative z-10 px-5 pt-7">
          <button
            type="button"
            onClick={onCloseMobile}
            className="absolute top-4 right-4 flex h-9 w-9 items-center justify-center rounded-lg text-white/80 hover:bg-white/10 hover:text-white focus-visible:outline-2 focus-visible:outline-white lg:hidden"
            aria-label="Close navigation menu"
          >
            <X className="h-5 w-5" />
          </button>

          {/* Brand Mark */}
          <div className="flex flex-col items-center text-center">
            <div className="mb-2.5 flex items-center justify-center">
              <svg
                viewBox="0 0 64 52"
                className="h-12 w-14 drop-shadow-[0_4px_12px_rgba(0,0,0,0.2)]"
                fill="none"
                aria-hidden="true"
              >
                <path
                  d="M32 6L4 20L32 34L60 20L32 6Z"
                  fill="url(#capTop)"
                />
                <path
                  d="M15 26.5V39.5C15 43.2 22.6 46.5 32 46.5C41.4 46.5 49 43.2 49 39.5V26.5L32 35L15 26.5Z"
                  fill="url(#capBase)"
                />
                <path
                  d="M52 24V38"
                  stroke="#E9DFFE"
                  strokeWidth="2.8"
                  strokeLinecap="round"
                />
                <circle cx="52" cy="40" r="2.8" fill="#E9DFFE" />
                <defs>
                  <linearGradient id="capTop" x1="12" y1="6" x2="54" y2="34" gradientUnits="userSpaceOnUse">
                    <stop stopColor="#FFFFFF" />
                    <stop offset="1" stopColor="#D6C6FF" />
                  </linearGradient>
                  <linearGradient id="capBase" x1="15" y1="26" x2="49" y2="46" gradientUnits="userSpaceOnUse">
                    <stop stopColor="#CBB5FF" />
                    <stop offset="1" stopColor="#A888FB" />
                  </linearGradient>
                </defs>
              </svg>
            </div>
            <span className="font-display text-[23px] font-bold tracking-tight text-white">
              FastRobox
            </span>
            <span className="mt-0.5 text-[13px] font-medium text-white/75">
              Smart Classroom
            </span>
          </div>

          {/* Navigation Links */}
          <nav className="mt-9 flex flex-col gap-2">
            {NAV_ITEMS.map(({ id, label, icon: Icon }) => {
              const isActive = activeTab === id;
              return (
                <button
                  key={id}
                  type="button"
                  onClick={() => handleNav(id)}
                  aria-current={isActive ? 'page' : undefined}
                  className={`flex min-h-[46px] w-full items-center gap-3.5 rounded-2xl px-4 py-2.5 text-left text-[15px] font-semibold transition-all duration-150 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white ${
                    isActive
                      ? 'bg-gradient-to-r from-[#8B62FA] to-[#7446EC] text-white shadow-[0_10px_24px_-6px_rgba(124,77,255,0.65)]'
                      : 'text-white/80 hover:bg-white/10 hover:text-white'
                  }`}
                >
                  <Icon className="h-[19px] w-[19px] shrink-0" />
                  <span className="whitespace-nowrap">{label}</span>
                </button>
              );
            })}
          </nav>
        </div>

        {/* Bottom Architectural School Silhouette */}
        <div className="pointer-events-none relative mt-6 select-none">
          <svg
            viewBox="0 0 240 120"
            className="w-full text-[#8B68E8]/30"
            fill="none"
            aria-hidden="true"
          >
            <path
              d="M0 95C35 72 78 82 118 70C156 58 198 64 240 84V120H0V95Z"
              fill="currentColor"
            />
            <path
              d="M0 105C50 86 110 92 165 84C198 79 220 88 240 94V120H0V105Z"
              fill="#9F7FF2"
              fillOpacity="0.22"
            />
            <ellipse cx="28" cy="84" rx="14" ry="18" fill="#B69BF9" fillOpacity="0.32" />
            <rect x="26" y="96" width="4" height="14" rx="1" fill="#B69BF9" fillOpacity="0.38" />
            <ellipse cx="212" cy="86" rx="14" ry="17" fill="#B69BF9" fillOpacity="0.32" />
            <rect x="210" y="97" width="4" height="13" rx="1" fill="#B69BF9" fillOpacity="0.38" />
            <rect x="50" y="64" width="140" height="46" rx="3" fill="#C4AEFB" fillOpacity="0.28" />
            <rect x="92" y="46" width="56" height="64" rx="2" fill="#D2C0FC" fillOpacity="0.35" />
            <path d="M84 48L120 26L156 48H84Z" fill="#DFD2FD" fillOpacity="0.45" />
            <line x1="120" y1="12" x2="120" y2="27" stroke="#E8DFFE" strokeOpacity="0.55" strokeWidth="2" />
            <path d="M120 12L133 16L120 20V12Z" fill="#E8DFFE" fillOpacity="0.55" />
            <circle cx="120" cy="40" r="7" fill="#462695" fillOpacity="0.7" />
            <path d="M120 36V40L123 42" stroke="#E8DFFE" strokeWidth="1.5" strokeLinecap="round" />
            <rect x="60" y="74" width="10" height="12" rx="1.5" fill="#462695" fillOpacity="0.45" />
            <rect x="76" y="74" width="10" height="12" rx="1.5" fill="#462695" fillOpacity="0.45" />
            <rect x="154" y="74" width="10" height="12" rx="1.5" fill="#462695" fillOpacity="0.45" />
            <rect x="170" y="74" width="10" height="12" rx="1.5" fill="#462695" fillOpacity="0.45" />
            <rect x="100" y="56" width="9" height="11" rx="1.5" fill="#462695" fillOpacity="0.45" />
            <rect x="115.5" y="56" width="9" height="11" rx="1.5" fill="#462695" fillOpacity="0.45" />
            <rect x="131" y="56" width="9" height="11" rx="1.5" fill="#462695" fillOpacity="0.45" />
            <path
              d="M111 110V86C111 81 115 77 120 77C125 77 129 81 129 86V110H111Z"
              fill="#462695"
              fillOpacity="0.55"
            />
          </svg>
        </div>
      </aside>
    </>
  );
};

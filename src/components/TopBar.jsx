import React, { useState, useRef, useEffect } from 'react';
import { ChevronDown, Menu, User, Wifi, WifiOff, Check, Building2 } from 'lucide-react';
import { NavTab } from '../types/classroom.js';

const TAB_TITLES = {
  [NavTab.Home]: 'Classroom Overview',
  [NavTab.Settings]: 'Classroom Settings',
  [NavTab.History]: 'Telemetry & Activity History',
  [NavTab.About]: 'About FastRobox',
};

export const TopBar = ({
  rooms,
  activeRoom,
  onSelectRoom,
  activeTab,
  onNavigate,
  onOpenMobileNav,
  onToggleWifi,
}) => {
  const [roomDropdownOpen, setRoomDropdownOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  const roomRef = useRef(null);
  const userRef = useRef(null);

  useEffect(() => {
    const handleOutside = (e) => {
      if (roomRef.current && !roomRef.current.contains(e.target)) {
        setRoomDropdownOpen(false);
      }
      if (userRef.current && !userRef.current.contains(e.target)) {
        setUserDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleOutside);
    return () => document.removeEventListener('mousedown', handleOutside);
  }, []);

  return (
    <header className="flex items-center justify-between gap-4 px-5 pt-5 pb-3 sm:px-7">
      {/* Left: Mobile Menu + Room Selector Breadcrumb */}
      <div className="flex min-w-0 items-center gap-3">
        <button
          type="button"
          onClick={onOpenMobileNav}
          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white text-[#3B1E8A] shadow-xs hover:bg-[#EFEAFF] focus-visible:outline-2 focus-visible:outline-[#6E40E8] lg:hidden"
          aria-label="Open navigation menu"
        >
          <Menu className="h-5 w-5" />
        </button>

        <div className="relative" ref={roomRef}>
          <button
            type="button"
            onClick={() => setRoomDropdownOpen((prev) => !prev)}
            className="flex min-h-[40px] items-center gap-2 rounded-xl bg-white/85 px-3.5 py-2 text-left text-sm font-semibold text-[#231B4B] shadow-[0_2px_10px_-2px_rgba(79,45,158,0.08)] transition-colors hover:bg-white focus-visible:outline-2 focus-visible:outline-[#6E40E8]"
            aria-expanded={roomDropdownOpen}
          >
            <Building2 className="h-4 w-4 shrink-0 text-[#6D41E8]" />
            <span className="max-w-[175px] truncate sm:max-w-none">{activeRoom.name}</span>
            <span className="hidden text-xs font-normal text-[#6B6490] md:inline">
              · {TAB_TITLES[activeTab]}
            </span>
            <ChevronDown className="h-4 w-4 shrink-0 text-[#6B6490]" />
          </button>

          {roomDropdownOpen && (
            <div className="absolute left-0 z-30 mt-2 w-64 rounded-2xl bg-white p-1.5 shadow-[0_14px_34px_-8px_rgba(45,27,105,0.2)] ring-1 ring-[#E6E0FF]">
              <p className="px-3 py-1.5 text-xs font-semibold text-[#6B6490]">
                Switch Classroom Node
              </p>
              {rooms.map((room) => {
                const selected = room.id === activeRoom.id;
                return (
                  <button
                    key={room.id}
                    type="button"
                    onClick={() => {
                      onSelectRoom(room.id);
                      setRoomDropdownOpen(false);
                    }}
                    className={`flex w-full items-center justify-between rounded-xl px-3 py-2.5 text-left text-sm transition-colors ${
                      selected
                        ? 'bg-[#F1ECFF] font-semibold text-[#4D2CA1]'
                        : 'text-[#261E4D] hover:bg-[#F8F6FF]'
                    }`}
                  >
                    <div className="min-w-0">
                      <div className="truncate">{room.name}</div>
                      <div className="text-xs font-normal text-[#6B6490]">
                        {room.building} · {room.students} students
                      </div>
                    </div>
                    {selected && <Check className="h-4 w-4 shrink-0 text-[#6D41E8]" />}
                  </button>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Right: Wi-Fi Telemetry Status + User Profile */}
      <div className="flex shrink-0 items-center gap-3">
        <button
          type="button"
          onClick={onToggleWifi}
          title={
            activeRoom.wifiConnected
              ? `Connected to ${activeRoom.wifiSsid} (${activeRoom.wifiSignalDbm} dBm) — click to test offline state`
              : 'Disconnected — click to reconnect hub'
          }
          className={`flex h-10 items-center gap-2 rounded-full px-3.5 transition-colors focus-visible:outline-2 focus-visible:outline-[#6E40E8] ${
            activeRoom.wifiConnected
              ? 'bg-[#D6F5E3] text-[#15803D] hover:bg-[#C3EED5]'
              : 'bg-[#FEE2E2] text-[#B91C1C] hover:bg-[#FECACA]'
          }`}
          aria-label={activeRoom.wifiConnected ? 'Hub Wi-Fi connected' : 'Hub Wi-Fi offline'}
        >
          {activeRoom.wifiConnected ? (
            <>
              <Wifi className="h-4 w-4 shrink-0" />
              <span className="h-2.5 w-2.5 rounded-full bg-[#16A34A]" />
            </>
          ) : (
            <>
              <WifiOff className="h-4 w-4 shrink-0" />
              <span className="text-xs font-semibold whitespace-nowrap">Offline</span>
            </>
          )}
        </button>

        <div className="relative" ref={userRef}>
          <button
            type="button"
            onClick={() => setUserDropdownOpen((prev) => !prev)}
            className="flex h-10 items-center gap-1.5 rounded-full bg-white/90 pr-2.5 pl-1 shadow-[0_2px_10px_-2px_rgba(79,45,158,0.1)] transition-colors hover:bg-white focus-visible:outline-2 focus-visible:outline-[#6E40E8]"
            aria-expanded={userDropdownOpen}
            aria-label="Account menu"
          >
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[#E6DFFF] text-[#3F2188]">
              <User className="h-4 w-4" />
            </div>
            <ChevronDown className="h-4 w-4 text-[#4B4376]" />
          </button>

          {userDropdownOpen && (
            <div className="absolute right-0 z-30 mt-2 w-56 rounded-2xl bg-white p-2 shadow-[0_14px_34px_-8px_rgba(45,27,105,0.2)] ring-1 ring-[#E6E0FF]">
              <div className="border-b border-[#EFEAFF] px-3 py-2">
                <p className="text-sm font-semibold text-[#17153B]">Classroom Admin</p>
                <p className="truncate text-xs text-[#6B6490]">CSE Department · Hub Control</p>
              </div>
              <div className="mt-1 flex flex-col gap-0.5">
                <button
                  type="button"
                  onClick={() => {
                    onNavigate(NavTab.Settings);
                    setUserDropdownOpen(false);
                  }}
                  className="rounded-xl px-3 py-2 text-left text-sm font-medium text-[#261E4D] hover:bg-[#F5F2FF]"
                >
                  Automation Settings
                </button>
                <button
                  type="button"
                  onClick={() => {
                    onNavigate(NavTab.History);
                    setUserDropdownOpen(false);
                  }}
                  className="rounded-xl px-3 py-2 text-left text-sm font-medium text-[#261E4D] hover:bg-[#F5F2FF]"
                >
                  View Activity Log
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

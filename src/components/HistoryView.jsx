import React, { useMemo, useState } from 'react';
import { Download, Search } from 'lucide-react';
import { EventCategory } from '../types/classroom.js';

export const HistoryView = ({ room, activities }) => {
  const [filter, setFilter] = useState('All');
  const [search, setSearch] = useState('');

  const filteredEvents = useMemo(() => {
    const query = search.trim().toLowerCase();
    return activities.filter((item) => {
      const matchCategory = filter === 'All' || item.category === filter;
      const matchQuery =
        !query ||
        item.title.toLowerCase().includes(query) ||
        item.detail.toLowerCase().includes(query) ||
        item.actor.toLowerCase().includes(query);
      return matchCategory && matchQuery;
    });
  }, [activities, filter, search]);

  const handleExportCsv = () => {
    const headers = ['Timestamp', 'Category', 'Title', 'Detail', 'Actor', 'Severity'];
    const rows = filteredEvents.map((e) => [
      e.timestamp,
      e.category,
      `"${e.title.replace(/"/g, '""')}"`,
      `"${e.detail.replace(/"/g, '""')}"`,
      `"${e.actor.replace(/"/g, '""')}"`,
      e.severity,
    ]);
    const csv = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `fastrobox-${room.id}-history.csv`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const points = room.telemetryHistory;
  const chartWidth = 640;
  const chartHeight = 140;
  const xStep = points.length > 1 ? chartWidth / (points.length - 1) : chartWidth;

  const tempCoords = points
    .map((p, idx) => {
      const x = idx * xStep;
      const y = chartHeight - ((p.temp - 18) / 20) * (chartHeight - 24) - 12;
      return `${x},${Math.max(10, Math.min(chartHeight - 10, y))}`;
    })
    .join(' ');

  const humCoords = points
    .map((p, idx) => {
      const x = idx * xStep;
      const y = chartHeight - ((p.humidity - 40) / 45) * (chartHeight - 24) - 12;
      return `${x},${Math.max(10, Math.min(chartHeight - 10, y))}`;
    })
    .join(' ');

  return (
    <div className="mx-auto flex w-full max-w-5xl flex-col gap-5">
      {/* Telemetry Trend Chart */}
      <div className="rounded-[22px] bg-white p-6 shadow-[0_12px_32px_-12px_rgba(45,27,105,0.12)]">
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
          <div>
            <h1 className="font-display text-xl font-bold text-[#17153B]">
              Environmental Telemetry Trend — {room.name}
            </h1>
            <p className="text-xs text-[#6B6490]">
              Temperature (°C) and Humidity (%) recorded across today’s class schedule
            </p>
          </div>
          <div className="flex items-center gap-4 text-xs font-semibold">
            <span className="flex items-center gap-1.5 text-[#15803D]">
              <span className="h-2.5 w-2.5 rounded-full bg-[#16A34A]" />
              Temperature (°C)
            </span>
            <span className="flex items-center gap-1.5 text-[#1D4ED8]">
              <span className="h-2.5 w-2.5 rounded-full bg-[#2596FF]" />
              Humidity (%)
            </span>
          </div>
        </div>

        <div className="w-full overflow-x-auto">
          <svg viewBox={`0 0 ${chartWidth} ${chartHeight + 28}`} className="h-44 w-full min-w-[460px]">
            {[0.25, 0.5, 0.75].map((ratio) => (
              <line
                key={ratio}
                x1={0}
                y1={chartHeight * ratio}
                x2={chartWidth}
                y2={chartHeight * ratio}
                stroke="#EFEAFF"
                strokeWidth="1.5"
              />
            ))}

            <polyline
              fill="none"
              stroke="#2596FF"
              strokeWidth="3"
              strokeLinecap="round"
              strokeLinejoin="round"
              points={humCoords}
            />
            <polyline
              fill="none"
              stroke="#16A34A"
              strokeWidth="3"
              strokeLinecap="round"
              strokeLinejoin="round"
              points={tempCoords}
            />

            {points.map((p, idx) => {
              const x = idx * xStep;
              return (
                <text
                  key={p.hour}
                  x={x}
                  y={chartHeight + 20}
                  textAnchor={idx === 0 ? 'start' : idx === points.length - 1 ? 'end' : 'middle'}
                  className="fill-[#6B6490] font-mono text-[11px]"
                >
                  {p.hour}
                </text>
              );
            })}
          </svg>
        </div>
      </div>

      {/* Filter + Event Log Table */}
      <div className="rounded-[22px] bg-white p-6 shadow-[0_12px_32px_-12px_rgba(45,27,105,0.12)]">
        <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
          <div className="flex flex-wrap items-center gap-1 rounded-xl bg-[#F5F2FF] p-1">
            {['All', ...Object.values(EventCategory)].map((cat) => {
              const active = filter === cat;
              return (
                <button
                  key={cat}
                  type="button"
                  onClick={() => setFilter(cat)}
                  className={`rounded-lg px-3 py-1.5 text-xs font-semibold whitespace-nowrap transition-colors ${
                    active
                      ? 'bg-white text-[#4D2CA1] shadow-xs'
                      : 'text-[#6B6490] hover:text-[#17153B]'
                  }`}
                >
                  {cat}
                </button>
              );
            })}
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            <div className="relative">
              <Search className="pointer-events-none absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-[#6B6490]" />
              <input
                type="search"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search events..."
                className="h-9 w-48 rounded-xl border border-[#E5DFFF] bg-[#FAF9FF] pr-3 pl-9 text-sm text-[#17153B] placeholder-[#8A83AC] focus:border-[#6D41E8] focus:outline-none sm:w-56"
              />
            </div>

            <button
              type="button"
              onClick={handleExportCsv}
              className="flex h-9 items-center gap-1.5 rounded-xl bg-[#6D41E8] px-3.5 text-xs font-semibold text-white transition-colors hover:bg-[#5B2EDB]"
            >
              <Download className="h-3.5 w-3.5" />
              <span>Export CSV</span>
            </button>
          </div>
        </div>

        {filteredEvents.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-[#DFD7FF] bg-[#FAF9FF] py-10 text-center">
            <p className="text-sm font-semibold text-[#2E2759]">No matching events found</p>
            <p className="mt-1 text-xs text-[#6B6490]">
              Try clearing your search filter or interact with classroom controls to log new events.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full border-collapse text-left text-sm">
              <thead>
                <tr className="border-b border-[#EFEAFF] text-xs font-semibold text-[#6B6490]">
                  <th className="py-2.5 pr-4">Time</th>
                  <th className="py-2.5 pr-4">Category</th>
                  <th className="py-2.5 pr-4">Event</th>
                  <th className="py-2.5 pr-4">Source</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#F4F0FF]">
                {filteredEvents.map((ev) => (
                  <tr key={ev.id} className="hover:bg-[#FAF9FF]">
                    <td className="py-3 pr-4 font-mono text-xs text-[#564D7C] tabular-nums whitespace-nowrap">
                      {ev.timestamp}
                    </td>
                    <td className="py-3 pr-4 text-xs font-semibold text-[#4D2CA1] whitespace-nowrap">
                      {ev.category}
                    </td>
                    <td className="py-3 pr-4">
                      <div className="font-medium text-[#17153B]">{ev.title}</div>
                      <div className="text-xs text-[#6B6490]">{ev.detail}</div>
                    </td>
                    <td className="py-3 pr-4 text-xs text-[#564D7C] whitespace-nowrap">
                      {ev.actor}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

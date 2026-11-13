import React, { useEffect, useRef, useState } from 'react';
import { Camera, Maximize2, Minimize2, Video, VideoOff, Download } from 'lucide-react';
import { CameraAngle } from '../types/classroom.js';

export const LiveCameraFeed = ({
  room,
  settings,
  onChangeAngle,
  onToggleCameraSource,
  onSnapshotTaken,
}) => {
  const [expanded, setExpanded] = useState(false);
  const [flash, setFlash] = useState(false);
  const [webcamError, setWebcamError] = useState(null);
  const [clockText, setClockText] = useState(() =>
    new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })
  );
  const videoRef = useRef(null);
  const streamRef = useRef(null);

  useEffect(() => {
    const timer = setInterval(() => {
      setClockText(
        new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })
      );
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    let active = true;
    const stopStream = () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((track) => track.stop());
        streamRef.current = null;
      }
    };

    if (settings.cameraSource === 'webcam') {
      setWebcamError(null);
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        setWebcamError('Camera API unavailable in this browser context.');
        return;
      }
      navigator.mediaDevices
        .getUserMedia({ video: true, audio: false })
        .then((stream) => {
          if (!active) {
            stream.getTracks().forEach((t) => t.stop());
            return;
          }
          streamRef.current = stream;
          if (videoRef.current) {
            videoRef.current.srcObject = stream;
          }
        })
        .catch(() => {
          if (active) {
            setWebcamError('Camera access denied or unavailable. Showing classroom view.');
          }
        });
    } else {
      stopStream();
      setWebcamError(null);
    }

    return () => {
      active = false;
      stopStream();
    };
  }, [settings.cameraSource]);

  const handleSnapshot = () => {
    setFlash(true);
    setTimeout(() => setFlash(false), 180);
    onSnapshotTaken(room.cameraAngle);
  };

  const renderClassroomViewport = (heightClass) => (
    <div className={`relative w-full overflow-hidden rounded-[18px] bg-[#E8ECF2] ${heightClass}`}>
      {settings.cameraSource === 'webcam' && !webcamError ? (
        <video
          ref={videoRef}
          autoPlay
          playsInline
          muted
          className="h-full w-full object-cover"
        />
      ) : (
        <svg
          viewBox="0 0 800 430"
          className="h-full w-full object-cover"
          preserveAspectRatio="xMidYMid slice"
          role="img"
          aria-label={`Live camera view of ${room.name} (${room.cameraAngle})`}
        >
          <defs>
            <linearGradient id="ceilingGrad" x1="400" y1="0" x2="400" y2="120" gradientUnits="userSpaceOnUse">
              <stop stopColor="#E6E1D8" />
              <stop offset="1" stopColor="#F5F2EC" />
            </linearGradient>
            <linearGradient id="wallBack" x1="400" y1="90" x2="400" y2="300" gradientUnits="userSpaceOnUse">
              <stop stopColor="#EFECE6" />
              <stop offset="1" stopColor="#DFDAD0" />
            </linearGradient>
            <linearGradient id="floorGrad" x1="400" y1="265" x2="400" y2="430" gradientUnits="userSpaceOnUse">
              <stop stopColor="#D7D0C4" />
              <stop offset="1" stopColor="#B8AFA0" />
            </linearGradient>
            <linearGradient id="skyGlass" x1="0" y1="60" x2="180" y2="290" gradientUnits="userSpaceOnUse">
              <stop stopColor="#B5DCF9" />
              <stop offset="0.6" stopColor="#DDF0FF" />
              <stop offset="1" stopColor="#F4E9D8" />
            </linearGradient>
            <linearGradient id="sunShaft" x1="120" y1="120" x2="520" y2="380" gradientUnits="userSpaceOnUse">
              <stop stopColor="#FFF7DC" stopOpacity="0.34" />
              <stop offset="1" stopColor="#FFF7DC" stopOpacity="0" />
            </linearGradient>
          </defs>

          <rect width="800" height="430" fill="url(#wallBack)" />
          <polygon points="0,0 800,0 640,95 160,95" fill="url(#ceilingGrad)" />
          <polygon points="160,95 640,95 640,285 160,285" fill="url(#wallBack)" />
          <polygon points="0,430 160,285 640,285 800,430" fill="url(#floorGrad)" />

          <polygon points="0,0 160,95 160,285 0,430" fill="#E8E4DB" />
          <polygon points="16,42 142,102 142,258 16,320" fill="url(#skyGlass)" />
          <line x1="16" y1="42" x2="142" y2="102" stroke="#4D5563" strokeWidth="6" />
          <line x1="142" y1="102" x2="142" y2="258" stroke="#4D5563" strokeWidth="6" />
          <line x1="142" y1="258" x2="16" y2="320" stroke="#4D5563" strokeWidth="6" />
          <line x1="16" y1="320" x2="16" y2="42" stroke="#4D5563" strokeWidth="6" />
          <line x1="58" y1="62" x2="58" y2="299" stroke="#4D5563" strokeWidth="5" />
          <line x1="102" y1="83" x2="102" y2="278" stroke="#4D5563" strokeWidth="5" />
          <line x1="16" y1="180" x2="142" y2="180" stroke="#4D5563" strokeWidth="5" />
          <polygon points="20,250 48,225 56,238 82,215 100,235 138,210 138,256 20,312" fill="#C4B6A4" opacity="0.55" />

          <polygon points="800,0 640,95 640,285 800,430" fill="#DDD7CC" />
          <polygon points="682,115 764,68 764,365 682,302" fill="#215B48" />
          <polygon points="688,122 758,80 758,355 688,298" fill="#2B725B" />
          <polygon points="698,136 720,123 720,218 698,226" fill="#B8D5CD" opacity="0.65" />
          <polygon points="728,118 750,105 750,210 728,216" fill="#B8D5CD" opacity="0.65" />
          <circle cx="695" cy="242" r="4" fill="#D4D8DF" />

          <polygon points="220,26 242,26 276,88 260,88" fill="#FFFFFF" opacity="0.95" />
          <polygon points="558,26 580,26 540,88 524,88" fill="#FFFFFF" opacity="0.95" />
          <polygon points="392,16 408,16 405,88 395,88" fill="#FFFFFF" opacity="0.9" />

          <rect x="275" y="130" width="250" height="106" rx="3" fill="#B8BEC9" />
          <rect x="280" y="135" width="240" height="96" rx="2" fill="#F9FAFC" />
          <line x1="305" y1="160" x2="385" y2="160" stroke="#6D41E8" strokeWidth="2.5" strokeLinecap="round" opacity="0.45" />
          <line x1="305" y1="175" x2="435" y2="175" stroke="#64748B" strokeWidth="2" strokeLinecap="round" opacity="0.3" />
          <line x1="305" y1="188" x2="405" y2="188" stroke="#64748B" strokeWidth="2" strokeLinecap="round" opacity="0.25" />
          <rect x="455" y="156" width="44" height="36" rx="3" stroke="#16A34A" strokeWidth="2" opacity="0.4" />
          <rect x="280" y="229" width="240" height="5" fill="#9AA3B2" />

          <circle cx="400" cy="112" r="9" fill="#FFFFFF" stroke="#64748B" strokeWidth="2" />
          <line x1="400" y1="112" x2="400" y2="106" stroke="#1E293B" strokeWidth="1.8" strokeLinecap="round" />
          <line x1="400" y1="112" x2="405" y2="112" stroke="#6D41E8" strokeWidth="1.6" strokeLinecap="round" />

          <polygon points="212,248 242,248 237,292 217,292" fill="#464E59" />
          <ellipse cx="227" cy="224" rx="22" ry="26" fill="#4B7B3C" />
          <ellipse cx="215" cy="232" rx="14" ry="18" fill="#5E944B" />
          <ellipse cx="238" cy="230" rx="14" ry="18" fill="#3B682F" />

          <polygon points="560,248 590,248 585,292 565,292" fill="#464E59" />
          <ellipse cx="575" cy="224" rx="22" ry="26" fill="#4B7B3C" />
          <ellipse cx="563" cy="230" rx="14" ry="18" fill="#5E944B" />
          <ellipse cx="586" cy="232" rx="14" ry="18" fill="#3B682F" />

          {[210, 315, 420, 525].map((x) => (
            <g key={`back-${x}`}>
              <rect x={x} y="278" width="66" height="8" rx="2" fill="#D5B88E" />
              <rect x={x + 8} y="286" width="4" height="24" fill="#374151" />
              <rect x={x + 54} y="286" width="4" height="24" fill="#374151" />
              <rect x={x + 15} y="268" width="36" height="22" rx="4" fill="#22262E" />
            </g>
          ))}

          {[165, 290, 415, 540].map((x) => (
            <g key={`mid-${x}`}>
              <rect x={x} y="314" width="84" height="10" rx="2" fill="#DCBE93" />
              <rect x={x + 9} y="324" width="5" height="32" fill="#303642" />
              <rect x={x + 70} y="324" width="5" height="32" fill="#303642" />
              <rect x={x + 20} y="302" width="44" height="26" rx="5" fill="#1E222A" />
            </g>
          ))}

          {[100, 260, 420, 580].map((x) => (
            <g key={`front-${x}`}>
              <rect x={x} y="362" width="110" height="12" rx="3" fill="#E3C69D" />
              <rect x={x + 12} y="374" width="6" height="44" fill="#252A34" />
              <rect x={x + 92} y="374" width="6" height="44" fill="#252A34" />
              <rect x={x + 26} y="346" width="56" height="34" rx="6" fill="#181B22" />
            </g>
          ))}

          <polygon points="16,42 142,258 680,430 16,430" fill="url(#sunShaft)" />

          {room.cameraAngle === CameraAngle.Whiteboard && (
            <rect
              x="255"
              y="116"
              width="290"
              height="140"
              rx="6"
              fill="none"
              stroke="#7C4DFF"
              strokeWidth="2.5"
              strokeDasharray="8 5"
            />
          )}
          {room.cameraAngle === CameraAngle.Entrance && (
            <rect
              x="668"
              y="58"
              width="108"
              height="312"
              rx="6"
              fill="none"
              stroke="#7C4DFF"
              strokeWidth="2.5"
              strokeDasharray="8 5"
            />
          )}
        </svg>
      )}

      <div className="pointer-events-none absolute inset-x-0 bottom-0 flex items-center justify-between bg-gradient-to-t from-black/65 via-black/25 to-transparent px-4 py-2.5 text-xs text-white">
        <span className="font-mono tabular-nums">
          CAM-01 · {room.cameraAngle}
        </span>
        <span className="font-mono tabular-nums">
          {clockText}
        </span>
      </div>

      {flash && <div className="pointer-events-none absolute inset-0 bg-white/75" />}
    </div>
  );

  return (
    <>
      <div className="flex flex-col rounded-[24px] bg-white p-4 shadow-[0_12px_32px_-12px_rgba(45,27,105,0.14)] sm:p-5">
        <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-[#EFEAFF] text-[#2F1A78]">
              <Video className="h-4 w-4" />
            </div>
            <div className="flex items-center gap-1.5">
              {Object.values(CameraAngle).map((angle) => {
                const active = room.cameraAngle === angle;
                return (
                  <button
                    key={angle}
                    type="button"
                    onClick={() => onChangeAngle(angle)}
                    className={`rounded-lg px-2.5 py-1 text-xs font-semibold whitespace-nowrap transition-colors ${
                      active
                        ? 'bg-[#EFEAFF] text-[#4D2CA1]'
                        : 'text-[#6B6490] hover:bg-[#F7F5FF] hover:text-[#231B4B]'
                    }`}
                  >
                    {angle}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onToggleCameraSource}
              className="flex h-8 items-center gap-1.5 rounded-lg bg-[#F5F3FF] px-2.5 text-xs font-semibold text-[#4D2CA1] transition-colors hover:bg-[#EAE3FF]"
              title="Switch between simulated classroom feed and your device camera"
            >
              {settings.cameraSource === 'webcam' ? (
                <>
                  <VideoOff className="h-3.5 w-3.5" />
                  <span>Classroom View</span>
                </>
              ) : (
                <>
                  <Camera className="h-3.5 w-3.5" />
                  <span>Use Webcam</span>
                </>
              )}
            </button>

            <button
              type="button"
              onClick={handleSnapshot}
              className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#F5F3FF] text-[#4D2CA1] transition-colors hover:bg-[#EAE3FF]"
              title="Capture snapshot"
              aria-label="Capture classroom snapshot"
            >
              <Download className="h-3.5 w-3.5" />
            </button>

            <button
              type="button"
              onClick={() => setExpanded(true)}
              className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#F5F3FF] text-[#4D2CA1] transition-colors hover:bg-[#EAE3FF]"
              title="Expand camera feed"
              aria-label="Expand camera feed"
            >
              <Maximize2 className="h-3.5 w-3.5" />
            </button>

            <div className="flex items-center gap-1.5 rounded-full bg-[#DCFCE7] px-3 py-1 text-xs font-bold text-[#15803D]">
              <span className="h-2 w-2 rounded-full bg-[#16A34A]" />
              <span>Live</span>
            </div>
          </div>
        </div>

        {webcamError && (
          <div className="mb-2.5 rounded-xl bg-[#FEF3C7] px-3 py-1.5 text-xs font-medium text-[#92400E]">
            {webcamError}
          </div>
        )}

        {renderClassroomViewport('aspect-[16/9] max-h-[340px]')}
      </div>

      {expanded && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-[#120D2D]/75 p-4 backdrop-blur-xs"
          role="dialog"
          aria-modal="true"
          aria-label="Expanded Classroom Camera Feed"
        >
          <div className="w-full max-w-4xl rounded-[24px] bg-white p-5 shadow-2xl">
            <div className="mb-3 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <Video className="h-5 w-5 text-[#4D2CA1]" />
                <h2 className="font-display text-base font-bold text-[#17153B]">
                  {room.name} — {room.cameraAngle}
                </h2>
              </div>
              <button
                type="button"
                onClick={() => setExpanded(false)}
                className="flex h-9 items-center gap-1.5 rounded-xl bg-[#F5F2FF] px-3 text-xs font-semibold text-[#4D2CA1] hover:bg-[#EAE3FF]"
              >
                <Minimize2 className="h-4 w-4" />
                <span>Close</span>
              </button>
            </div>
            {renderClassroomViewport('aspect-[16/9]')}
          </div>
        </div>
      )}
    </>
  );
};

"use client";
import { useRef, useState, useCallback } from "react";

interface BeforeAfterSliderProps { beforeUrl: string; afterUrl: string; }
export default function BeforeAfterSlider({ beforeUrl, afterUrl }: BeforeAfterSliderProps) {
  const [position, setPosition] = useState(50);
  const containerRef = useRef<HTMLDivElement>(null);
  const dragging = useRef(false);

  const updatePosition = useCallback((clientX: number) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const pct = Math.max(0, Math.min(100, ((clientX - rect.left) / rect.width) * 100));
    setPosition(pct);
  }, []);

  const onMouseDown = () => { dragging.current = true; };
  const onMouseMove = (e: React.MouseEvent) => { if (dragging.current) updatePosition(e.clientX); };
  const onMouseUp = () => { dragging.current = false; };
  const onTouchMove = (e: React.TouchEvent) => updatePosition(e.touches[0].clientX);

  return (
    <div ref={containerRef} className="relative w-full rounded-xl overflow-hidden select-none cursor-ew-resize aspect-video bg-[#1F2937]"
      onMouseDown={onMouseDown} onMouseMove={onMouseMove} onMouseUp={onMouseUp} onMouseLeave={onMouseUp}
      onTouchMove={onTouchMove} onTouchEnd={onMouseUp}>
      <img src={afterUrl} alt="After" className="absolute inset-0 w-full h-full object-contain" />
      <div className="absolute inset-0 overflow-hidden" style={{ clipPath: `inset(0 ${100 - position}% 0 0)` }}>
        <img src={beforeUrl} alt="Before" className="w-full h-full object-contain" />
      </div>
      <div className="absolute top-0 bottom-0 w-0.5 bg-white shadow-lg" style={{ left: `${position}%` }}>
        <div className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 w-8 h-8 bg-white rounded-full flex items-center justify-center shadow-lg">
          <svg className="w-4 h-4 text-[#0B0F14]" fill="currentColor" viewBox="0 0 24 24">
            <path d="M8 5l-7 7 7 7V5zM16 5l7 7-7 7V5z"/>
          </svg>
        </div>
      </div>
      <div className="absolute top-2 left-2 bg-black/60 px-2 py-1 rounded text-xs text-white">Before</div>
      <div className="absolute top-2 right-2 bg-black/60 px-2 py-1 rounded text-xs text-white">After</div>
    </div>
  );
}

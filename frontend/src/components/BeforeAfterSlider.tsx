import { useState, useRef, useCallback } from 'react'

interface BeforeAfterSliderProps {
  beforeLabel?: string
  afterLabel?: string
  beforeColor?: string
  afterColor?: string
}

export default function BeforeAfterSlider({
  beforeLabel = 'Original',
  afterLabel = 'Processed',
  beforeColor = '#1F2937',
  afterColor = '#0F766E',
}: BeforeAfterSliderProps) {
  const [sliderPos, setSliderPos] = useState(50)
  const containerRef = useRef<HTMLDivElement>(null)
  const dragging = useRef(false)

  const updatePos = useCallback((clientX: number) => {
    if (!containerRef.current) return
    const rect = containerRef.current.getBoundingClientRect()
    const pos = Math.min(100, Math.max(0, ((clientX - rect.left) / rect.width) * 100))
    setSliderPos(pos)
  }, [])

  const handleMouseDown = () => { dragging.current = true }
  const handleMouseMove = (e: React.MouseEvent) => { if (dragging.current) updatePos(e.clientX) }
  const handleMouseUp = () => { dragging.current = false }
  const handleTouchMove = (e: React.TouchEvent) => { updatePos(e.touches[0].clientX) }

  return (
    <div
      ref={containerRef}
      className="relative w-full h-[400px] rounded-xl overflow-hidden cursor-ew-resize select-none"
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
      onTouchMove={handleTouchMove}
    >
      {/* Before panel */}
      <div
        className="absolute inset-0 flex items-center justify-center"
        style={{ backgroundColor: beforeColor }}
      >
        <div className="text-center opacity-40">
          <div className="text-6xl mb-2">🖼</div>
          <p className="text-brand-secondary text-sm">Original file</p>
        </div>
      </div>

      {/* After panel — clipped dynamically */}
      <div
        className="absolute inset-0 flex items-center justify-center"
        style={{ clipPath: `inset(0 ${100 - sliderPos}% 0 0)`, backgroundColor: afterColor }}
      >
        <div className="text-center opacity-50">
          <div className="text-6xl mb-2">✨</div>
          <p className="text-brand-text text-sm">Processed output</p>
        </div>
      </div>

      {/* Divider handle */}
      <div
        className="absolute top-0 bottom-0 w-0.5 pointer-events-none"
        style={{ left: `${sliderPos}%`, backgroundColor: '#14B8A6', transform: 'translateX(-50%)' }}
      >
        <div
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-8 h-8 rounded-full flex items-center justify-center text-brand-bg text-sm font-bold"
          style={{ backgroundColor: '#14B8A6', boxShadow: '0 0 0 3px rgba(20,184,166,0.3)' }}
        >
          ⟺
        </div>
      </div>

      {/* Labels */}
      <div className="absolute top-3 left-3 pointer-events-none">
        <span className="bg-black/70 text-brand-secondary text-xs font-semibold px-2.5 py-1 rounded">
          {beforeLabel}
        </span>
      </div>
      <div className="absolute top-3 right-3 pointer-events-none">
        <span
          className="text-xs font-semibold px-2.5 py-1 rounded"
          style={{ backgroundColor: 'rgba(20,184,166,0.2)', color: '#14B8A6' }}
        >
          {afterLabel}
        </span>
      </div>
    </div>
  )
}

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

  const handleTouchMove = (e: React.TouchEvent) => {
    updatePos(e.touches[0].clientX)
  }

  return (
    <div
      ref={containerRef}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
      onTouchMove={handleTouchMove}
      style={{
        position: 'relative',
        width: '100%',
        height: '400px',
        borderRadius: '12px',
        overflow: 'hidden',
        cursor: 'ew-resize',
        userSelect: 'none',
      }}
    >
      {/* Before panel */}
      <div style={{
        position: 'absolute',
        inset: 0,
        backgroundColor: beforeColor,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}>
        <div style={{ textAlign: 'center', opacity: 0.4 }}>
          <div style={{ fontSize: '64px', marginBottom: '8px' }}>🖼</div>
          <p style={{ color: '#9CA3AF', fontSize: '14px' }}>Original file</p>
        </div>
      </div>

      {/* After panel (clipped) */}
      <div style={{
        position: 'absolute',
        inset: 0,
        clipPath: `inset(0 ${100 - sliderPos}% 0 0)`,
        backgroundColor: afterColor,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}>
        <div style={{ textAlign: 'center', opacity: 0.5 }}>
          <div style={{ fontSize: '64px', marginBottom: '8px' }}>✨</div>
          <p style={{ color: '#E5E7EB', fontSize: '14px' }}>Processed output</p>
        </div>
      </div>

      {/* Divider line */}
      <div style={{
        position: 'absolute',
        top: 0,
        bottom: 0,
        left: `${sliderPos}%`,
        width: '2px',
        backgroundColor: '#14B8A6',
        transform: 'translateX(-50%)',
        pointerEvents: 'none',
      }}>
        <div style={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          width: '32px',
          height: '32px',
          borderRadius: '50%',
          backgroundColor: '#14B8A6',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: '#0B0F14',
          fontSize: '14px',
          fontWeight: '700',
          boxShadow: '0 0 0 3px rgba(20,184,166,0.3)',
        }}>
          ⟺
        </div>
      </div>

      {/* Labels */}
      <div style={{ position: 'absolute', top: '12px', left: '12px', pointerEvents: 'none' }}>
        <span style={{ backgroundColor: 'rgba(0,0,0,0.7)', color: '#9CA3AF', fontSize: '12px', fontWeight: '600', padding: '4px 10px', borderRadius: '4px' }}>{beforeLabel}</span>
      </div>
      <div style={{ position: 'absolute', top: '12px', right: '12px', pointerEvents: 'none' }}>
        <span style={{ backgroundColor: 'rgba(20,184,166,0.2)', color: '#14B8A6', fontSize: '12px', fontWeight: '600', padding: '4px 10px', borderRadius: '4px' }}>{afterLabel}</span>
      </div>
    </div>
  )
}

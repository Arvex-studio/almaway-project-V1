'use client'
import { useState, useEffect } from 'react'
export default function Preview() {
  const [size, setSize] = useState('mobile')
  const [available, setAvailable] = useState(390)
  useEffect(() => { const resize=()=>setAvailable(window.innerWidth-32); resize(); window.addEventListener('resize',resize); return ()=>window.removeEventListener('resize',resize) }, [])
  const scale=Math.min(1,available/(size==='mobile'?390:1440))
  return (
    <main style={{ padding: 16, background: '#d9ded3', minHeight: '100vh' }}>
      <header
        style={{
          display: 'flex',
          gap: 16,
          alignItems: 'center',
          marginBottom: 16,
          flexWrap: 'wrap',
        }}
      >
        <strong>AlmaWay F1 / Interactive preview</strong>
        {['mobile', 'desktop'].map((x) => (
          <button
            key={x}
            onClick={() => setSize(x)}
            aria-pressed={size === x}
            style={{
              padding: 12,
              background: size === x ? '#123b30' : '#fffefa',
              color: size === x ? 'white' : '#123b30',
            }}
          >
            {x === 'mobile' ? 'Mobile 390 × 844' : 'Desktop 1440 × 900'}
          </button>
        ))}
        <a href="/explore" target="_blank">
          Открыть приложение ↗
        </a>
      </header>
      <div style={{ overflow: 'hidden', height: (size==='mobile'?844:900)*scale }}>
        <iframe
          title={`AlmaWay ${size}`}
          src="/explore"
          width={size === 'mobile' ? 390 : 1440}
          height={size === 'mobile' ? 844 : 900}
          style={{
            display: 'block',
            transform: `scale(${scale})`, transformOrigin: 'top left',
            border: '1px solid #123b30',
            background: '#f6f3eb',
          }}
        />
      </div>
    </main>
  )
}

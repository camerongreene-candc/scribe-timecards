import { useState } from 'react';
import { TransferOrb } from '../components/TransferOrb';

export default function TransferOrbDevPage() {
  const [externalProgress, setExternalProgress] = useState(0.5);
  const [size, setSize] = useState(300);
  const [mode, setMode] = useState<'external' | 'self'>('self');

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', flex: 1, gap: '2rem', padding: '2rem' }}>
      {mode === 'external'
        ? <TransferOrb progress={externalProgress} size={size} />
        : <TransferOrb size={size} />
      }

      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', width: '320px', fontFamily: 'monospace', fontSize: '13px', color: '#444' }}>

        {/* Mode toggle */}
        <div style={{ display: 'flex', gap: '8px' }}>
          {(['self', 'external'] as const).map((m) => (
            <button
              key={m}
              onClick={() => setMode(m)}
              style={{ flex: 1, padding: '6px', background: mode === m ? '#3296ff' : '#e8edf5', color: mode === m ? '#fff' : '#444', border: 'none', borderRadius: '6px', cursor: 'pointer', fontFamily: 'monospace', fontSize: '12px' }}
            >
              {m === 'self' ? 'Self-controlled' : 'External (slider)'}
            </button>
          ))}
        </div>

        {/* External controls */}
        {mode === 'external' && (
          <>
            <label style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
              <span>progress: <strong style={{ color: '#3296ff' }}>{externalProgress.toFixed(2)}</strong></span>
              <input type="range" min={0} max={1} step={0.01} value={externalProgress} onChange={(e) => setExternalProgress(Number(e.target.value))} style={{ width: '100%', accentColor: '#3296ff' }} />
            </label>
            <div style={{ display: 'flex', gap: '8px' }}>
              {[0, 0.25, 0.5, 0.75, 1].map((v) => (
                <button key={v} onClick={() => setExternalProgress(v)}
                  style={{ flex: 1, padding: '4px', background: externalProgress === v ? '#3296ff' : '#e8edf5', color: externalProgress === v ? '#fff' : '#444', border: 'none', borderRadius: '4px', cursor: 'pointer', fontFamily: 'monospace', fontSize: '12px' }}>
                  {v}
                </button>
              ))}
            </div>
          </>
        )}

        {/* Size always available */}
        <label style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
          <span>size: <strong style={{ color: '#3296ff' }}>{size}px</strong></span>
          <input type="range" min={100} max={500} step={10} value={size} onChange={(e) => setSize(Number(e.target.value))} style={{ width: '100%', accentColor: '#3296ff' }} />
        </label>
      </div>
    </div>
  );
}

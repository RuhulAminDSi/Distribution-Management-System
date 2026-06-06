import { useState, useEffect, useRef } from 'react';

export function OtpTimer({ expiresAt, onExpire }) {
  const [remaining, setRemaining] = useState(() =>
    expiresAt ? Math.max(0, Math.floor((expiresAt - Date.now()) / 1000)) : 0
  );
  const called = useRef(false);

  useEffect(() => {
    if (!expiresAt) return;
    const tick = () => {
      const diff = Math.max(0, Math.floor((expiresAt - Date.now()) / 1000));
      setRemaining(diff);
      if (diff <= 0 && !called.current) {
        called.current = true;
        onExpire?.();
      }
    };
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [expiresAt, onExpire]);

  if (!expiresAt) return null;

  const total = 60;
  const pct = (remaining / total) * 100;
  const mins = Math.floor(remaining / 60);
  const secs = remaining % 60;
  const color = remaining <= 10 ? '#e74c3c' : remaining <= 20 ? '#f39c12' : '#27ae60';
  const dash = 2 * Math.PI * 44;
  const offset = dash - (pct / 100) * dash;

  return (
    <div style={{ textAlign: 'center', marginTop: '8px' }}>
      <svg width="72" height="72" viewBox="0 0 100 100" style={{ display: 'block', margin: '0 auto 4px' }}>
        <circle cx="50" cy="50" r="44" fill="none" stroke="var(--border-color)" strokeWidth="8" />
        <circle
          cx="50" cy="50" r="44" fill="none"
          stroke={color} strokeWidth="8" strokeLinecap="round"
          strokeDasharray={dash} strokeDashoffset={offset}
          transform="rotate(-90 50 50)"
          style={{ transition: 'stroke-dashoffset 1s linear, stroke 1s linear' }}
        />
        <text x="50" y="55" textAnchor="middle" fontSize="16" fontWeight="bold" fill={color} fontFamily="monospace">
          {remaining > 0
            ? `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`
            : '✕'}
        </text>
      </svg>
    </div>
  );
}

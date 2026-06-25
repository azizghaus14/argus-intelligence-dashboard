"use client";

// A 270° radial gauge with a restrained cyan-to-red gradient sweep.
// `value` is 0..1 of the arc.
export default function RadialGauge({
  value,
  label,
  center,
  sub,
  size = 120,
  id = "g",
}: {
  value: number;
  label?: string;
  center: string;
  sub?: string;
  size?: number;
  id?: string;
}) {
  const r = 38;
  const C = 2 * Math.PI * r;
  const track = 0.75 * C; // 270°
  const v = Math.max(0, Math.min(1, value));
  const valueLen = v * track;

  return (
    <div className="relative flex items-center justify-center" style={{ width: size, height: size }}>
      <svg viewBox="0 0 100 100" className="h-full w-full -rotate-[0deg]">
        <defs>
          <linearGradient id={`grad-${id}`} x1="0%" y1="100%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#46c7d6" />
            <stop offset="55%" stopColor="#6aa8ff" />
            <stop offset="100%" stopColor="#f2b45c" />
          </linearGradient>
        </defs>
        {/* track */}
        <circle
          cx="50"
          cy="50"
          r={r}
          fill="none"
          stroke="rgba(255,255,255,0.08)"
          strokeWidth="6"
          strokeLinecap="round"
          strokeDasharray={`${track} ${C}`}
          transform="rotate(135 50 50)"
        />
        {/* value */}
        <circle
          cx="50"
          cy="50"
          r={r}
          fill="none"
          stroke={`url(#grad-${id})`}
          strokeWidth="6"
          strokeLinecap="round"
          strokeDasharray={`${valueLen} ${C}`}
          transform="rotate(135 50 50)"
          style={{ transition: "stroke-dasharray 700ms ease" }}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
        <span className="font-mono text-base font-bold leading-none text-text-primary">{center}</span>
        {label && <span className="mt-0.5 stat-label">{label}</span>}
        {sub && <span className="mt-0.5 font-mono text-[8px] text-text-tertiary">{sub}</span>}
      </div>
    </div>
  );
}

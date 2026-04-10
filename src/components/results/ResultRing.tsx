

interface ResultRingProps {
  fee: number;
  maxFee: number;
  size?: number;
}

const ResultRing: React.FC<ResultRingProps> = ({ fee, maxFee, size = 180 }) => {
  const cx = size / 2;
  const cy = size / 2;
  const strokeWidth = size * 0.08;
  const radius = (size / 2) - strokeWidth - 4;
  const circumference = 2 * Math.PI * radius;
  const progress = Math.min(fee / maxFee, 1);
  const strokeDashoffset = circumference * (1 - progress);

  const formatShort = (n: number): string => {
    if (n >= 1_000_000_000) return `${(n / 1_000_000_000).toFixed(1)}M`;
    if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(0)}Jt`;
    if (n >= 1_000) return `${(n / 1_000).toFixed(0)}Rb`;
    return n.toString();
  };

  return (
    <svg
      width={size}
      height={size}
      viewBox={`0 0 ${size} ${size}`}
      role="img"
      aria-label={`Biaya sertifikasi: Rp ${fee.toLocaleString('id-ID')}`}
    >
      {/* Track */}
      <circle
        cx={cx} cy={cy} r={radius}
        fill="none"
        stroke="#1B4E4D"
        strokeWidth={strokeWidth}
        opacity="0.12"
      />
      {/* Progress arc */}
      <circle
        cx={cx} cy={cy} r={radius}
        fill="none"
        stroke="#D3FEAB"
        strokeWidth={strokeWidth}
        strokeDasharray={`${circumference} ${circumference}`}
        strokeDashoffset={strokeDashoffset}
        strokeLinecap="round"
        transform={`rotate(-90 ${cx} ${cy})`}
        style={{ transition: 'stroke-dashoffset 0.6s cubic-bezier(0.4,0,0.2,1)' }}
      />
      {/* Inner ring accent */}
      <circle
        cx={cx} cy={cy} r={radius - strokeWidth}
        fill="none"
        stroke="#1B4E4D"
        strokeWidth="0.5"
        opacity="0.1"
      />
      {/* Center text */}
      <text
        x={cx} y={cy - size * 0.08}
        textAnchor="middle"
        dominantBaseline="middle"
        fontSize={size * 0.07}
        fontFamily="Inter, sans-serif"
        fontWeight="400"
        fill="#1B4E4D"
        opacity="0.6"
      >
        Total Biaya
      </text>
      <text
        x={cx} y={cy + size * 0.06}
        textAnchor="middle"
        dominantBaseline="middle"
        fontSize={size * 0.11}
        fontFamily="Inter, sans-serif"
        fontWeight="700"
        fill="#1B4E4D"
        style={{ fontVariantNumeric: 'tabular-nums' }}
      >
        {formatShort(fee)}
      </text>
      <text
        x={cx} y={cy + size * 0.18}
        textAnchor="middle"
        dominantBaseline="middle"
        fontSize={size * 0.063}
        fontFamily="Inter, sans-serif"
        fontWeight="400"
        fill="#1B4E4D"
        opacity="0.5"
      >
        IDR
      </text>
    </svg>
  );
};

export default ResultRing;

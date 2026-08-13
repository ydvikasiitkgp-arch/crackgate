const SPOKE_ANGLES = Array.from({ length: 24 }, (_, i) => i * 15);

export function AshokaChakra({ size = 64 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="-32 -32 64 64"
      role="img"
      aria-label="Ashoka Chakra"
      className="shrink-0"
    >
      <circle r="29" fill="none" stroke="#000080" strokeWidth="3" />
      <circle r="5" fill="#000080" />
      {SPOKE_ANGLES.map((angle) => (
        <line
          key={angle}
          x1="0"
          y1="-25"
          x2="0"
          y2="-11"
          stroke="#000080"
          strokeWidth="2"
          transform={`rotate(${angle})`}
        />
      ))}
    </svg>
  );
}
type BrandMarkProps = {
  className?: string;
  color?: string;
  size?: number;
};

export function BrandMark({ className, color = "currentColor", size = 42 }: BrandMarkProps) {
  return (
    <svg
      className={className}
      width={size}
      height={size}
      viewBox="0 0 64 64"
      fill="none"
      aria-hidden="true"
    >
      <path
        d="M32 5c8 10 16 21 16 34 0 11-7 20-16 20S16 50 16 39C16 26 24 15 32 5Z"
        fill={color}
      />
      <path
        d="M32 14c5 8 9 16 9 25 0 7-4 12-9 12s-9-5-9-12c0-9 4-17 9-25Z"
        fill="rgba(251,246,235,0.24)"
      />
      <path
        d="M32 23v27M24 34l8 6 8-6M26 44l6 4 6-4"
        stroke="rgba(251,246,235,0.72)"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

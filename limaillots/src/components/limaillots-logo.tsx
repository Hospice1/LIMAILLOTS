interface LimaillotsLogoProps {
  className?: string;
}

export function LimaillotsLogo({ className }: LimaillotsLogoProps) {
  return (
    <svg
      viewBox="0 0 360 72"
      role="img"
      aria-label="LIMAILLOTS"
      className={className}
    >
      <title>LIMAILLOTS</title>
      <text
        x="0"
        y="50"
        fill="currentColor"
        style={{
          fontFamily: "var(--font-hero), 'Segoe UI', sans-serif",
          fontWeight: 800,
          fontSize: "44px",
          letterSpacing: "0.16em",
          textTransform: "uppercase",
        }}
      >
        LIMAILLOTS
      </text>
    </svg>
  );
}

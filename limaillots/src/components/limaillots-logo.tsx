import { useId } from "react";

interface LimaillotsLogoProps {
  className?: string;
}

export function LimaillotsLogo({ className }: LimaillotsLogoProps) {
  const baseId = useId().replace(/:/g, "");
  const arrowAId = `${baseId}-arrow-a`;
  const arrowBId = `${baseId}-arrow-b`;

  return (
    <svg
      viewBox="0 0 420 92"
      role="img"
      aria-label="LIMAILLOTS"
      className={className}
    >
      <title>LIMAILLOTS</title>
      <defs>
        <marker
          id={arrowAId}
          markerWidth="9"
          markerHeight="9"
          refX="8"
          refY="4.5"
          orient="auto"
        >
          <path d="M0 0L9 4.5L0 9Z" fill="var(--logo-arc-1)" />
        </marker>
        <marker
          id={arrowBId}
          markerWidth="9"
          markerHeight="9"
          refX="8"
          refY="4.5"
          orient="auto"
        >
          <path d="M0 0L9 4.5L0 9Z" fill="var(--logo-arc-2)" />
        </marker>
      </defs>

      <text
        x="8"
        y="38"
        fill="currentColor"
        style={{
          fontFamily: "var(--font-hero), 'Segoe UI', sans-serif",
          fontWeight: 700,
          fontSize: "36px",
          letterSpacing: "0.25em",
          textTransform: "uppercase",
        }}
      >
        LIMAILLOTS
      </text>

      <path
        d="M18 54 C36 70, 77 70, 116 57"
        fill="none"
        stroke="var(--logo-arc-1)"
        strokeWidth="3"
        strokeLinecap="round"
        markerEnd={`url(#${arrowAId})`}
      />

      <path
        d="M95 65 C162 92, 307 91, 392 64"
        fill="none"
        stroke="var(--logo-arc-2)"
        strokeWidth="3.5"
        strokeLinecap="round"
        markerEnd={`url(#${arrowBId})`}
      />
    </svg>
  );
}

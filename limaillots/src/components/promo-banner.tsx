interface PromoBannerProps {
  message: string;
}

export function PromoBanner({ message }: PromoBannerProps) {
  return (
    <div className="sticky top-0 z-50 overflow-hidden border-b border-white/10 bg-[var(--accent)] text-white shadow-lg">
      <div className="promo-marquee flex w-max items-center gap-10 px-4 py-2 text-xs font-semibold uppercase tracking-[0.22em] md:text-sm">
        <span>{message}</span>
        <span>{message}</span>
        <span>{message}</span>
        <span>{message}</span>
      </div>
    </div>
  );
}
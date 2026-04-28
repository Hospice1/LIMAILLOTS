interface PromoBannerProps {
  message: string;
}

export function PromoBanner({ message }: PromoBannerProps) {
  return (
    <div className="bg-[var(--accent)] px-3 py-2 text-center text-xs font-semibold tracking-[0.2em] text-white md:text-sm">
      {message}
    </div>
  );
}

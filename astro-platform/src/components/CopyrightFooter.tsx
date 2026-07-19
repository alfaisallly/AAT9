export default function CopyrightFooter({ compact = false }: { compact?: boolean }) {
  const year = new Date().getFullYear();

  if (compact) {
    return (
      <p className="text-center text-[10px] text-[var(--muted)]">
        © {year} Eng. Ahmed alfaisal
      </p>
    );
  }

  return (
    <div className="text-center">
      <p className="text-xs font-medium text-white/80">Eng. Ahmed alfaisal</p>
      <p className="mt-1 text-[10px] leading-relaxed text-[var(--muted)]">
        © {year} Eng. Ahmed alfaisal — جميع الحقوق محفوظة
      </p>
      <p className="mt-0.5 text-[9px] text-[var(--muted)]/70">
        All Rights Reserved — AstroLab Platform
      </p>
    </div>
  );
}

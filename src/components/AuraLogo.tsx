export function AuraLogo({ compact = false }: { compact?: boolean }) {
  return <span className="inline-flex items-center gap-2" aria-label="AuraSlim">
    <img src="/auraslim-mark.svg" alt="" aria-hidden="true" width={compact ? 32 : 48} height={compact ? 32 : 48} className="shrink-0 rounded-xl" />
    <span className={compact ? 'text-lg font-extrabold' : 'text-2xl font-extrabold'} style={{ background: 'linear-gradient(100deg,#ff6939 8%,#ffbd21 52%,#00b987 100%)', backgroundClip: 'text', WebkitBackgroundClip: 'text', color: 'transparent' }}>AuraSlim</span>
  </span>;
}

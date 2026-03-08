interface SectionHeaderProps {
  title: string
  subtitle?: string
  action?: React.ReactNode
  className?: string
}

export function SectionHeader({ title, subtitle, action, className }: SectionHeaderProps) {
  return (
    <header className={`flex items-start justify-between gap-3 ${className ?? ''}`.trim()}>
      <div className="space-y-1">
        <h2 className="sidebar-title">{title}</h2>
        {subtitle ? <p className="sidebar-muted">{subtitle}</p> : null}
      </div>
      {action ? <div className="shrink-0">{action}</div> : null}
    </header>
  )
}

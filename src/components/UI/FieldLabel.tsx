interface FieldLabelProps {
  label: string
  value?: string
  className?: string
}

export function FieldLabel({ label, value, className }: FieldLabelProps) {
  return (
    <div className={`flex items-center justify-between gap-2 ${className ?? ''}`.trim()}>
      <span className="text-xs font-medium text-slate-600">{label}</span>
      {value ? <span className="text-xs text-slate-500">{value}</span> : null}
    </div>
  )
}

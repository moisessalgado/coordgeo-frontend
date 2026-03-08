import type { ButtonHTMLAttributes, ReactNode } from 'react'

type ActionButtonVariant = 'primary' | 'secondary' | 'subtle' | 'danger'

interface ActionButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  label: string
  icon?: ReactNode
  variant?: ActionButtonVariant
  compact?: boolean
}

const variantClass: Record<ActionButtonVariant, string> = {
  primary: 'btn-ui-primary',
  secondary: 'btn-ui-secondary',
  subtle: 'btn-ui-subtle',
  danger: 'btn-ui-danger',
}

export function ActionButton({
  label,
  icon,
  variant = 'secondary',
  compact = false,
  className,
  type,
  ...props
}: ActionButtonProps) {
  const compactClass = compact ? 'min-h-9 px-2 text-xs' : ''

  return (
    <button
      type={type ?? 'button'}
      aria-label={label}
      title={label}
      className={`${variantClass[variant]} ${compactClass} ${className ?? ''}`.trim()}
      {...props}
    >
      {icon ? <span aria-hidden="true">{icon}</span> : null}
      {!compact ? <span>{label}</span> : null}
    </button>
  )
}

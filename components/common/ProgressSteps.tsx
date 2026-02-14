import { cn } from '@/lib/utils'

interface Step {
  label: string
  status: 'pending' | 'active' | 'completed' | 'error'
}

interface ProgressStepsProps {
  steps: Step[]
  className?: string
}

export function ProgressSteps({ steps, className }: ProgressStepsProps) {
  return (
    <div className={cn('flex items-center gap-2', className)} role="progressbar" aria-valuenow={steps.filter((s) => s.status === 'completed').length} aria-valuemin={0} aria-valuemax={steps.length}>
      {steps.map((step, i) => (
        <div key={i} className="flex items-center gap-2">
          <div className={cn(
            'flex h-6 w-6 shrink-0 items-center justify-center rounded-full font-mono text-xs font-bold',
            step.status === 'completed' && 'bg-success text-white',
            step.status === 'active' && 'bg-accent-blue text-white animate-pulse',
            step.status === 'error' && 'bg-error text-white',
            step.status === 'pending' && 'bg-bg-tertiary text-text-muted',
          )}>
            {step.status === 'completed' ? '✓' : i + 1}
          </div>
          <span className={cn(
            'font-mono text-xs',
            step.status === 'active' && 'text-accent-blue font-bold',
            step.status === 'completed' && 'text-success',
            step.status === 'error' && 'text-error',
            step.status === 'pending' && 'text-text-muted',
          )}>
            {step.label}
          </span>
          {i < steps.length - 1 && (
            <div className={cn(
              'h-px w-8',
              step.status === 'completed' ? 'bg-success' : 'bg-bg-tertiary',
            )} />
          )}
        </div>
      ))}
    </div>
  )
}

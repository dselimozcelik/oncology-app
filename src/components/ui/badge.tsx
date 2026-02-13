import { cn } from '@/lib/utils';

type BadgeVariant = 'default' | 'success' | 'warning' | 'danger' | 'info';

const variants: Record<BadgeVariant, string> = {
  default: 'bg-gray-100 text-gray-700',
  success: 'bg-green-100 text-green-700',
  warning: 'bg-amber-100 text-amber-700',
  danger: 'bg-red-100 text-red-700',
  info: 'bg-blue-100 text-blue-700',
};

interface BadgeProps {
  variant?: BadgeVariant;
  children: React.ReactNode;
  className?: string;
}

export function Badge({ variant = 'default', className, children }: BadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium',
        variants[variant],
        className
      )}
    >
      {children}
    </span>
  );
}

export function statusBadgeVariant(status: string): BadgeVariant {
  switch (status) {
    case 'active': return 'success';
    case 'critical': return 'danger';
    case 'inactive': return 'warning';
    case 'discharged': return 'default';
    case 'completed': return 'success';
    case 'pending': return 'warning';
    case 'expired': return 'danger';
    default: return 'default';
  }
}

export function statusLabel(status: string): string {
  const labels: Record<string, string> = {
    active: 'Aktif',
    inactive: 'Pasif',
    critical: 'Kritik',
    discharged: 'Taburcu',
    completed: 'Tamamlandı',
    pending: 'Bekliyor',
    expired: 'Süresi Doldu',
  };
  return labels[status] || status;
}

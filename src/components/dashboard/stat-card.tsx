import { Card, CardContent } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { LucideIcon } from 'lucide-react';

interface StatCardProps {
  title: string;
  value: string | number;
  icon: LucideIcon;
  color: 'blue' | 'green' | 'amber' | 'purple';
}

const colors = {
  blue: 'bg-blue-100 text-blue-600',
  green: 'bg-green-100 text-green-600',
  amber: 'bg-amber-100 text-amber-600',
  purple: 'bg-purple-100 text-purple-600',
};

export function StatCard({ title, value, icon: Icon, color }: StatCardProps) {
  return (
    <Card>
      <CardContent className="flex items-center gap-4 py-5">
        <div className={cn('w-12 h-12 rounded-xl flex items-center justify-center', colors[color])}>
          <Icon className="h-6 w-6" />
        </div>
        <div>
          <p className="text-sm text-gray-500">{title}</p>
          <p className="text-2xl font-bold text-gray-900">{value}</p>
        </div>
      </CardContent>
    </Card>
  );
}

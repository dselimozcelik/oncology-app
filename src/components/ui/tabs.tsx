'use client';

import { cn } from '@/lib/utils';
import { createContext, useContext, useState, ReactNode } from 'react';

const TabsContext = createContext<{ active: string; setActive: (v: string) => void }>({
  active: '',
  setActive: () => {},
});

export function Tabs({ defaultValue, children, className }: { defaultValue: string; children: ReactNode; className?: string }) {
  const [active, setActive] = useState(defaultValue);
  return (
    <TabsContext.Provider value={{ active, setActive }}>
      <div className={className}>{children}</div>
    </TabsContext.Provider>
  );
}

export function TabsList({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <div className={cn('flex gap-1 border-b border-gray-200 pb-px', className)}>
      {children}
    </div>
  );
}

export function TabsTrigger({ value, children, className }: { value: string; children: ReactNode; className?: string }) {
  const { active, setActive } = useContext(TabsContext);
  return (
    <button
      onClick={() => setActive(value)}
      className={cn(
        'px-4 py-2 text-sm font-medium rounded-t-lg transition-colors -mb-px',
        active === value
          ? 'text-blue-600 border-b-2 border-blue-600'
          : 'text-gray-500 hover:text-gray-700',
        className
      )}
    >
      {children}
    </button>
  );
}

export function TabsContent({ value, children, className }: { value: string; children: ReactNode; className?: string }) {
  const { active } = useContext(TabsContext);
  if (active !== value) return null;
  return <div className={cn('pt-4', className)}>{children}</div>;
}

'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { LayoutDashboard, Users, ClipboardList, Stethoscope, Menu, X } from 'lucide-react';
import { useState } from 'react';

const navItems = [
  { href: '/dashboard', label: 'Panel', icon: LayoutDashboard },
  { href: '/patients', label: 'Hastalar', icon: Users },
  { href: '/surveys', label: 'Anketler', icon: ClipboardList },
];

export function Sidebar() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="lg:hidden fixed top-4 left-4 z-50 p-2 bg-white rounded-lg shadow-md border border-gray-200"
      >
        <Menu className="h-5 w-5 text-gray-600" />
      </button>

      {open && (
        <div className="lg:hidden fixed inset-0 bg-black/50 z-40" onClick={() => setOpen(false)} />
      )}

      <aside
        className={cn(
          'fixed top-0 left-0 z-40 h-screen w-60 bg-white border-r border-gray-200 flex flex-col transition-transform lg:translate-x-0',
          open ? 'translate-x-0' : '-translate-x-full'
        )}
      >
        <div className="flex items-center gap-3 px-6 py-5 border-b border-gray-200">
          <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
            <Stethoscope className="h-4 w-4 text-white" />
          </div>
          <span className="font-semibold text-gray-900">Hasta Yönetim</span>
          <button onClick={() => setOpen(false)} className="ml-auto lg:hidden">
            <X className="h-5 w-5 text-gray-400" />
          </button>
        </div>

        <nav className="flex-1 px-3 py-4 space-y-1">
          {navItems.map((item) => {
            const isActive = pathname === item.href || pathname.startsWith(item.href + '/');
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setOpen(false)}
                className={cn(
                  'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors',
                  isActive
                    ? 'bg-blue-50 text-blue-700'
                    : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                )}
              >
                <item.icon className="h-5 w-5" />
                {item.label}
              </Link>
            );
          })}
        </nav>
      </aside>
    </>
  );
}

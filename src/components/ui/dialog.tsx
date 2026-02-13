'use client';

import { cn } from '@/lib/utils';
import { X } from 'lucide-react';
import { ReactNode, useEffect } from 'react';

interface DialogProps {
  open: boolean;
  onClose: () => void;
  children: ReactNode;
  className?: string;
}

export function Dialog({ open, onClose, children, className }: DialogProps) {
  useEffect(() => {
    if (open) {
      document.body.style.overflow = 'hidden';
      return () => { document.body.style.overflow = ''; };
    }
  }, [open]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="fixed inset-0 bg-black/50" onClick={onClose} />
      <div className={cn('relative bg-white rounded-xl shadow-xl max-h-[85vh] overflow-y-auto w-full max-w-lg mx-4', className)}>
        <button
          onClick={onClose}
          className="absolute right-4 top-4 text-gray-400 hover:text-gray-600"
        >
          <X className="h-5 w-5" />
        </button>
        {children}
      </div>
    </div>
  );
}

export function DialogHeader({ children, className }: { children: ReactNode; className?: string }) {
  return <div className={cn('px-6 pt-6 pb-4', className)}>{children}</div>;
}

export function DialogContent({ children, className }: { children: ReactNode; className?: string }) {
  return <div className={cn('px-6 pb-6', className)}>{children}</div>;
}

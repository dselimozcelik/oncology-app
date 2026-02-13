'use client';

import { useState, useEffect } from 'react';
import { Profile } from '@/lib/supabase/types';
import { Dialog, DialogHeader, DialogContent } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { createClient } from '@/lib/supabase/client';
import { Search, Check } from 'lucide-react';

interface Props {
  open: boolean;
  onClose: () => void;
  onAssign: (patientIds: string[]) => void;
  loading?: boolean;
}

export function PatientSelector({ open, onClose, onAssign, loading }: Props) {
  const [patients, setPatients] = useState<Profile[]>([]);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [search, setSearch] = useState('');
  const supabase = createClient();

  useEffect(() => {
    if (open) {
      supabase
        .from('profiles')
        .select('*')
        .eq('role', 'patient')
        .order('full_name')
        .then(({ data }) => setPatients(data ?? []));
    }
  }, [open]);

  function toggle(id: string) {
    const next = new Set(selected);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    setSelected(next);
  }

  const filtered = patients.filter((p) =>
    p.full_name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <Dialog open={open} onClose={onClose}>
      <DialogHeader>
        <h2 className="text-lg font-semibold text-gray-900">Hastalara Ata</h2>
        <p className="text-sm text-gray-500">Bu anketi alacak hastaları seçin</p>
      </DialogHeader>
      <DialogContent>
        <div className="space-y-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Hasta ara..."
              className="pl-9"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          <div className="max-h-64 overflow-y-auto space-y-1">
            {filtered.map((p) => (
              <button
                key={p.id}
                type="button"
                onClick={() => toggle(p.id)}
                className="w-full flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-gray-50 text-left"
              >
                <div className={`w-5 h-5 rounded border flex items-center justify-center ${selected.has(p.id) ? 'bg-blue-600 border-blue-600' : 'border-gray-300'}`}>
                  {selected.has(p.id) && <Check className="h-3 w-3 text-white" />}
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-900">{p.full_name}</p>
                  <p className="text-xs text-gray-500">{p.email}</p>
                </div>
              </button>
            ))}
          </div>

          <div className="flex justify-between items-center pt-2 border-t">
            <span className="text-sm text-gray-500">{selected.size} seçildi</span>
            <div className="flex gap-2">
              <Button variant="secondary" onClick={onClose}>İptal</Button>
              <Button onClick={() => onAssign(Array.from(selected))} disabled={selected.size === 0 || loading}>
                {loading ? 'Atanıyor...' : 'Ata'}
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

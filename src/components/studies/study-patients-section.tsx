'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardHeader, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogHeader, DialogContent } from '@/components/ui/dialog';
import { assignPatientsToStudy, removePatientFromStudy } from '@/app/(dashboard)/studies/actions';
import { createClient } from '@/lib/supabase/client';
import { Profile, PatientStudy } from '@/lib/supabase/types';
import { Plus, X, Search, Check, UserMinus } from 'lucide-react';
import Link from 'next/link';
import { format } from 'date-fns';

interface PatientStudyWithProfile extends PatientStudy {
  patient: Profile;
}

interface Props {
  studyId: string;
  patientStudies: PatientStudyWithProfile[];
}

export function StudyPatientsSection({ studyId, patientStudies }: Props) {
  const [showPicker, setShowPicker] = useState(false);
  const [patients, setPatients] = useState<Profile[]>([]);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const supabase = createClient();

  const assignedIds = new Set(patientStudies.map((ps) => ps.patient_id));

  useEffect(() => {
    if (showPicker) {
      supabase
        .from('profiles')
        .select('*')
        .eq('role', 'patient')
        .order('full_name')
        .then(({ data }) => setPatients(data ?? []));
    }
  }, [showPicker]);

  function toggle(id: string) {
    const next = new Set(selected);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    setSelected(next);
  }

  async function handleAssign() {
    setLoading(true);
    await assignPatientsToStudy(studyId, Array.from(selected));
    setSelected(new Set());
    setShowPicker(false);
    setLoading(false);
    router.refresh();
  }

  async function handleRemove(patientId: string) {
    await removePatientFromStudy(studyId, patientId);
    router.refresh();
  }

  const availablePatients = patients
    .filter((p) => !assignedIds.has(p.id))
    .filter((p) => p.full_name.toLowerCase().includes(search.toLowerCase()));

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <h2 className="font-semibold text-gray-900">Hastalar</h2>
          <Button variant="secondary" size="sm" onClick={() => setShowPicker(true)}>
            <Plus className="h-4 w-4" />
            Hasta Ekle
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {patientStudies.length === 0 ? (
          <p className="text-sm text-gray-500 text-center py-4">Bu çalışmaya henüz hasta atanmamış</p>
        ) : (
          <div className="space-y-2">
            {patientStudies.map((ps) => (
              <div key={ps.id} className="flex items-center justify-between bg-gray-50 rounded-lg px-4 py-3">
                <div>
                  <Link href={`/patients/${ps.patient_id}`} className="text-sm font-medium text-blue-600 hover:text-blue-800">
                    {ps.patient?.full_name}
                  </Link>
                  <p className="text-xs text-gray-500">
                    Atanma: {format(new Date(ps.assigned_at), 'dd.MM.yyyy')}
                  </p>
                </div>
                <button
                  onClick={() => handleRemove(ps.patient_id)}
                  className="text-gray-400 hover:text-red-500"
                  title="Çalışmadan çıkar"
                >
                  <UserMinus className="h-4 w-4" />
                </button>
              </div>
            ))}
          </div>
        )}
      </CardContent>

      <Dialog open={showPicker} onClose={() => setShowPicker(false)}>
        <DialogHeader>
          <h2 className="text-lg font-semibold text-gray-900">Çalışmaya Hasta Ekle</h2>
          <p className="text-sm text-gray-500">Bu çalışmaya dahil edilecek hastaları seçin</p>
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
              {availablePatients.length === 0 ? (
                <p className="text-sm text-gray-400 text-center py-4">Eklenebilecek hasta bulunamadı</p>
              ) : (
                availablePatients.map((p) => (
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
                ))
              )}
            </div>

            <div className="flex justify-between items-center pt-2 border-t">
              <span className="text-sm text-gray-500">{selected.size} seçildi</span>
              <div className="flex gap-2">
                <Button variant="secondary" onClick={() => setShowPicker(false)}>İptal</Button>
                <Button onClick={handleAssign} disabled={selected.size === 0 || loading}>
                  {loading ? 'Ekleniyor...' : 'Ekle'}
                </Button>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </Card>
  );
}

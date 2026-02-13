'use client';

import Link from 'next/link';
import { Badge, statusBadgeVariant, statusLabel } from '@/components/ui/badge';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/components/ui/table';
import { Profile } from '@/lib/supabase/types';
import { format } from 'date-fns';

export function PatientTable({ patients }: { patients: Profile[] }) {
  if (patients.length === 0) {
    return (
      <div className="text-center py-12 text-gray-500">
        Hasta bulunamadı
      </div>
    );
  }

  return (
    <Table>
      <TableHeader>
        <tr>
          <TableHead>Ad Soyad</TableHead>
          <TableHead>Durum</TableHead>
          <TableHead>Tanılar</TableHead>
          <TableHead>Son Güncelleme</TableHead>
        </tr>
      </TableHeader>
      <TableBody>
        {patients.map((patient) => (
          <TableRow key={patient.id}>
            <TableCell>
              <Link href={`/patients/${patient.id}`} className="text-blue-600 hover:text-blue-800 font-medium">
                {patient.full_name}
              </Link>
            </TableCell>
            <TableCell>
              <Badge variant={statusBadgeVariant(patient.status)}>{statusLabel(patient.status)}</Badge>
            </TableCell>
            <TableCell>
              <div className="flex flex-wrap gap-1">
                {patient.conditions.slice(0, 3).map((c) => (
                  <Badge key={c} variant="info">{c}</Badge>
                ))}
                {patient.conditions.length > 3 && (
                  <Badge variant="default">+{patient.conditions.length - 3}</Badge>
                )}
              </div>
            </TableCell>
            <TableCell className="text-gray-500 text-sm">
              {format(new Date(patient.updated_at), 'dd.MM.yyyy')}
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}

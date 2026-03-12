import { createClient } from '@/lib/supabase/server';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import Link from 'next/link';
import { format } from 'date-fns';

export default async function StudiesPage() {
  const supabase = await createClient();

  const { data: studies } = await supabase
    .from('studies')
    .select('*, study_periods(id), patient_studies(id)')
    .order('created_at', { ascending: false });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Çalışmalar</h1>
        <Link href="/studies/new">
          <Button>
            <Plus className="h-4 w-4" />
            Yeni Çalışma
          </Button>
        </Link>
      </div>

      <Card>
        {!studies || studies.length === 0 ? (
          <div className="text-center py-12 text-gray-500">
            Henüz çalışma oluşturulmamış
          </div>
        ) : (
          <Table>
            <TableHeader>
              <tr>
                <TableHead>Çalışma Adı</TableHead>
                <TableHead>Dönem Sayısı</TableHead>
                <TableHead>Hasta Sayısı</TableHead>
                <TableHead>Oluşturulma</TableHead>
              </tr>
            </TableHeader>
            <TableBody>
              {studies.map((study) => (
                <TableRow key={study.id}>
                  <TableCell>
                    <Link href={`/studies/${study.id}`} className="text-blue-600 hover:text-blue-800 font-medium">
                      {study.name}
                    </Link>
                    {study.description && (
                      <p className="text-xs text-gray-500 mt-0.5">{study.description}</p>
                    )}
                  </TableCell>
                  <TableCell>
                    <Badge variant="info">
                      {(study.study_periods as unknown[])?.length ?? 0} dönem
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge variant="default">
                      {(study.patient_studies as unknown[])?.length ?? 0} hasta
                    </Badge>
                  </TableCell>
                  <TableCell className="text-gray-500 text-sm">
                    {format(new Date(study.created_at), 'dd.MM.yyyy')}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </Card>
    </div>
  );
}

import { createClient } from '@/lib/supabase/server';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { SurveysExportAll } from '@/components/surveys/export-button';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/components/ui/table';
import { Plus } from 'lucide-react';
import Link from 'next/link';
import { format } from 'date-fns';

export default async function SurveysPage() {
  const supabase = await createClient();

  const { data: surveys } = await supabase
    .from('surveys')
    .select('*, survey_assignments(status)')
    .order('created_at', { ascending: false });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Anketler</h1>
        <div className="flex items-center gap-2">
          {surveys && surveys.length > 0 && (
            <SurveysExportAll
              surveys={surveys.map((s) => {
                const assignments = (s.survey_assignments ?? []) as { status: string }[];
                const total = assignments.length;
                const completed = assignments.filter((a) => a.status === 'completed').length;
                const rate = total > 0 ? Math.round((completed / total) * 100) : 0;
                return {
                  title: s.title,
                  created_at: s.created_at,
                  is_active: s.is_active,
                  total,
                  completed,
                  rate,
                };
              })}
            />
          )}
          <Link href="/surveys/new">
            <Button>
              <Plus className="h-4 w-4" />
              Yeni Anket
            </Button>
          </Link>
        </div>
      </div>

      <Card>
        <Table>
          <TableHeader>
            <tr>
              <TableHead>Başlık</TableHead>
              <TableHead>Oluşturulma</TableHead>
              <TableHead>Atanan</TableHead>
              <TableHead>Tamamlanma</TableHead>
              <TableHead>Durum</TableHead>
            </tr>
          </TableHeader>
          <TableBody>
            {surveys?.map((survey) => {
              const assignments = (survey.survey_assignments ?? []) as { status: string }[];
              const total = assignments.length;
              const completed = assignments.filter((a) => a.status === 'completed').length;
              const rate = total > 0 ? Math.round((completed / total) * 100) : 0;

              return (
                <TableRow key={survey.id}>
                  <TableCell>
                    <Link href={`/surveys/${survey.id}`} className="flex items-center gap-3 text-blue-600 hover:text-blue-800 font-medium">
                      {survey.image_url && (
                        <img
                          src={survey.image_url}
                          alt=""
                          className="h-9 w-9 rounded-md object-cover shrink-0"
                        />
                      )}
                      {survey.title}
                    </Link>
                  </TableCell>
                  <TableCell className="text-gray-500">
                    {format(new Date(survey.created_at), 'dd.MM.yyyy')}
                  </TableCell>
                  <TableCell>{total}</TableCell>
                  <TableCell>
                    {total > 0 ? (
                      <span>{completed}/{total} (%{rate})</span>
                    ) : (
                      <span className="text-gray-400">—</span>
                    )}
                  </TableCell>
                  <TableCell>
                    <Badge variant={survey.is_active ? 'success' : 'default'}>
                      {survey.is_active ? 'Aktif' : 'Pasif'}
                    </Badge>
                  </TableCell>
                </TableRow>
              );
            })}
            {(!surveys || surveys.length === 0) && (
              <TableRow>
                <TableCell colSpan={5} className="text-center text-gray-500 py-8">
                  Henüz anket yok. İlk anketinizi oluşturun.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </Card>
    </div>
  );
}

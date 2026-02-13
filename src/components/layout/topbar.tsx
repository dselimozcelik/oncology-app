import { createClient } from '@/lib/supabase/server';
import { LogoutButton } from './logout-button';

export async function Topbar() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  let name = 'Doktor';
  if (user) {
    const { data: profile } = await supabase
      .from('profiles')
      .select('full_name')
      .eq('id', user.id)
      .single();
    if (profile) name = profile.full_name;
  }

  return (
    <header className="h-16 bg-white border-b border-gray-200 flex items-center justify-end px-6 gap-4">
      <span className="text-sm text-gray-700 font-medium">{name}</span>
      <LogoutButton />
    </header>
  );
}

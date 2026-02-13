import { Sidebar } from '@/components/layout/sidebar';
import { Topbar } from '@/components/layout/topbar';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-gray-50">
      <Sidebar />
      <div className="lg:ml-60">
        <Topbar />
        <main className="max-w-7xl mx-auto p-6">{children}</main>
      </div>
    </div>
  );
}

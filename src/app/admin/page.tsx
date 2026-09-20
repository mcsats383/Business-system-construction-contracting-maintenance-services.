import { redirect } from 'next/navigation';
import { getSessionFromCookies } from '@/src/lib/auth';
import AdminDashboard from '@/src/components/AdminDashboard';

export default async function AdminPage() {
  const session = await getSessionFromCookies();
  if (!session) redirect('/login');
  if (session.role !== 'ADMIN') redirect(session.role === 'CLIENT' ? '/approval' : '/checklist');

  return <AdminDashboard user={session} />;
}

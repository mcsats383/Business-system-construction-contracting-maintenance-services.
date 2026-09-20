import { redirect } from 'next/navigation';
import { getSessionFromCookies } from '@/src/lib/auth';

export default async function HomePage() {
  const session = await getSessionFromCookies();
  if (!session) redirect('/login');

  if (session.role === 'ADMIN') redirect('/admin');
  if (session.role === 'TECHNICIAN') redirect('/checklist');
  redirect('/approval');
}

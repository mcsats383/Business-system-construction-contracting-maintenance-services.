import { redirect } from 'next/navigation';
import { getSessionFromCookies } from '@/src/lib/auth';
import ChecklistForm from '@/src/components/ChecklistForm';

export default async function ChecklistPage() {
  const session = await getSessionFromCookies();
  if (!session) redirect('/login');
  if (session.role !== 'TECHNICIAN') redirect(session.role === 'ADMIN' ? '/admin' : '/approval');

  return <main><ChecklistForm user={session} /></main>;
}

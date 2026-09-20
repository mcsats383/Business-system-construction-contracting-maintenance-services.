import { redirect } from 'next/navigation';
import { getSessionFromCookies } from '@/src/lib/auth';
import ClientApproval from '@/src/components/ClientApproval';

export default async function ApprovalPage() {
  const session = await getSessionFromCookies();
  if (!session) redirect('/login');
  if (session.role !== 'CLIENT') redirect(session.role === 'ADMIN' ? '/admin' : '/checklist');

  return <main><ClientApproval user={session} /></main>;
}

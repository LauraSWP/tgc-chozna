import { redirect } from 'next/navigation';
import { getUser } from '@/lib/auth';
import AppNavigation from '@/components/AppNavigation';

export default async function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await getUser();

  if (!user) {
    redirect('/login');
  }

  return (
    <div className="min-h-screen bg-background">
      <AppNavigation user={user} />
      <main className="container mx-auto px-4 py-6">
        {children}
      </main>
    </div>
  );
}

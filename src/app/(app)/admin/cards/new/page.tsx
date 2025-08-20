import { redirect } from 'next/navigation';
import { getUser, getUserProfile } from '@/lib/auth';
import CardEditor from '@/components/admin/CardEditor';
import Link from 'next/link';
import { Button } from '@/components/ui/button';

export default async function NewCardPage() {
  const user = await getUser();
  if (!user) redirect('/login');

  const { data: profile } = await getUserProfile(user.id);
  if (profile?.role !== 'admin') redirect('/dashboard');

  const handleCardSaved = () => {
    // Redirect to cards management after saving
    window.location.href = '/admin/cards';
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Create New Card</h1>
          <p className="text-gray-600 dark:text-gray-300">
            Add a new card to the game
          </p>
        </div>
        <Button asChild variant="outline">
          <Link href="/admin/cards">← Back to Cards</Link>
        </Button>
      </div>

      <CardEditor
        onSave={handleCardSaved}
        onCancel={() => window.history.back()}
      />
    </div>
  );
}

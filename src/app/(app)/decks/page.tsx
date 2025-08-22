import { redirect } from 'next/navigation';
import { getUser, getUserProfile } from '@/lib/auth';
import DeckBuilderClient from '@/components/DeckBuilderClient';

export default async function DecksPage() {
  const user = await getUser();
  if (!user) redirect('/login');

  const { data: profile } = await getUserProfile(user.id);

  return (
    <div className="space-y-6">
      {/* Deck Builder Component - Will fetch data client-side */}
      <DeckBuilderWrapper />
    </div>
  );
}

// Wrapper component to handle client-side data fetching
function DeckBuilderWrapper() {
  return (
    <DeckBuilderClient 
      collection={[]} 
      decks={[]} 
    />
  );
}

import { redirect } from 'next/navigation';
import { getUser, getUserProfile } from '@/lib/auth';
import CollectionClient from '@/components/CollectionClient';

async function getCollection(userId: string) {
  try {
    const response = await fetch(`${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/api/collection`, {
      headers: {
        'Cookie': `supabase-auth-token=${userId}` // This is a simplified example
      }
    });
    
    if (!response.ok) {
      console.error('Failed to fetch collection');
      return { collection: [], summary: [], totalCards: 0 };
    }
    
    return await response.json();
  } catch (error) {
    console.error('Error fetching collection:', error);
    return { collection: [], summary: [], totalCards: 0 };
  }
}

export default async function CollectionPage() {
  const user = await getUser();
  if (!user) redirect('/login');

  const { data: profile } = await getUserProfile(user.id);
  
  // For now, we'll pass empty data and let the client component handle the API calls
  // In a production app, you'd want to fetch this server-side with proper auth
  
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center space-y-2">
        <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
          📚 My Collection
        </h1>
        <p className="text-gray-600 dark:text-gray-300">
          View and manage your card collection
        </p>
      </div>

      {/* Collection Component - Will fetch data client-side */}
      <CollectionWrapper />
    </div>
  );
}

// Wrapper component to handle client-side data fetching
function CollectionWrapper() {
  return (
    <div className="space-y-6">
      <CollectionClient 
        collection={[]} 
        summary={[]} 
        totalCards={0} 
      />
    </div>
  );
}

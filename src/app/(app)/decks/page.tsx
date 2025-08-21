import { redirect } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { getUser, getUserProfile } from '@/lib/auth';

export default async function DecksPage() {
  const user = await getUser();
  if (!user) redirect('/login');

  const { data: profile } = await getUserProfile(user.id);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center space-y-2">
        <h1 className="text-4xl font-bold bg-gradient-to-r from-green-600 to-blue-600 bg-clip-text text-transparent">
          🏗️ Deck Builder
        </h1>
        <p className="text-gray-600 dark:text-gray-300">
          Create and manage your decks
        </p>
      </div>

      {/* Coming Soon */}
      <Card>
        <CardHeader>
          <CardTitle>Deck Management</CardTitle>
          <CardDescription>
            Build competitive decks and manage your strategies
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center space-y-4 py-8">
            <div className="text-6xl">🚧</div>
            <h3 className="text-xl font-semibold">Coming Soon!</h3>
            <p className="text-gray-600">
              Deck building tools are currently in development.
              You'll be able to create decks, test them, and save your favorite strategies here.
            </p>
            <div className="flex justify-center gap-2">
              <Button variant="outline">
                Create Deck
              </Button>
              <Button variant="outline">
                Import Deck
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

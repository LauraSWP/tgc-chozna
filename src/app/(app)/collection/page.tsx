import { redirect } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { getUser, getUserProfile } from '@/lib/auth';

export default async function CollectionPage() {
  const user = await getUser();
  if (!user) redirect('/login');

  const { data: profile } = await getUserProfile(user.id);

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

      {/* Coming Soon */}
      <Card>
        <CardHeader>
          <CardTitle>Collection Management</CardTitle>
          <CardDescription>
            Your card collection and deck building tools
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center space-y-4 py-8">
            <div className="text-6xl">🚧</div>
            <h3 className="text-xl font-semibold">Coming Soon!</h3>
            <p className="text-gray-600">
              Collection management features are currently in development.
              You'll be able to view all your cards, filter by rarity, and organize your collection here.
            </p>
            <div className="flex justify-center gap-2">
              <Button variant="outline">
                View Cards
              </Button>
              <Button variant="outline">
                Filter Collection
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

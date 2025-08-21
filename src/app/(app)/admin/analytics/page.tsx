import { redirect } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { getUser, getUserProfile } from '@/lib/auth';
import Link from 'next/link';

export default async function AdminAnalyticsPage() {
  const user = await getUser();
  if (!user) redirect('/login');

  const { data: profile } = await getUserProfile(user.id);
  if (profile?.role !== 'admin') redirect('/dashboard');

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Analytics Dashboard</h1>
          <p className="text-gray-600 dark:text-gray-300">
            Game statistics, user behavior, and performance metrics
          </p>
        </div>
        <Button asChild variant="outline">
          <Link href="/admin">← Back to Admin</Link>
        </Button>
      </div>

      {/* Coming Soon */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            📊 Game Analytics
          </CardTitle>
          <CardDescription>
            Detailed insights into game performance and user engagement
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center space-y-4 py-8">
            <div className="text-6xl">🚧</div>
            <h3 className="text-xl font-semibold">Coming Soon!</h3>
            <p className="text-gray-600">
              Analytics features are currently in development.
              You'll be able to view user engagement, card usage statistics, and game performance metrics here.
            </p>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
              <Button variant="outline" disabled>
                User Analytics
              </Button>
              <Button variant="outline" disabled>
                Card Statistics
              </Button>
              <Button variant="outline" disabled>
                Match Analytics
              </Button>
              <Button variant="outline" disabled>
                Revenue Reports
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

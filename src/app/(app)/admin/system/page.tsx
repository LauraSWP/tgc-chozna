import { redirect } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { getUser, getUserProfile } from '@/lib/auth';
import Link from 'next/link';

export default async function AdminSystemPage() {
  const user = await getUser();
  if (!user) redirect('/login');

  const { data: profile } = await getUserProfile(user.id);
  if (profile?.role !== 'admin') redirect('/dashboard');

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">System Tools</h1>
          <p className="text-gray-600 dark:text-gray-300">
            Database utilities and system maintenance
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
            🔧 System Management
          </CardTitle>
          <CardDescription>
            Database maintenance, backups, and system health monitoring
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center space-y-4 py-8">
            <div className="text-6xl">🚧</div>
            <h3 className="text-xl font-semibold">Coming Soon!</h3>
            <p className="text-gray-600">
              System management tools are currently in development.
              You'll be able to perform database maintenance, system backups, and health checks here.
            </p>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
              <Button variant="outline" disabled>
                Database Tools
              </Button>
              <Button variant="outline" disabled>
                System Health
              </Button>
              <Button variant="outline" disabled>
                Backup Manager
              </Button>
              <Button variant="outline" disabled>
                Logs Viewer
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

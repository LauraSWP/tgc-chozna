import { redirect } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { getUser, getUserProfile } from '@/lib/auth';
import Link from 'next/link';

export default async function AdminShopPage() {
  const user = await getUser();
  if (!user) redirect('/login');

  const { data: profile } = await getUserProfile(user.id);
  if (profile?.role !== 'admin') redirect('/dashboard');

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Shop Management</h1>
          <p className="text-gray-600 dark:text-gray-300">
            Configure pack contents, pricing, and shop settings
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
            🏪 Shop Configuration
          </CardTitle>
          <CardDescription>
            Manage pack pricing, contents, and shop availability
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center space-y-4 py-8">
            <div className="text-6xl">🚧</div>
            <h3 className="text-xl font-semibold">Coming Soon!</h3>
            <p className="text-gray-600">
              Shop management features are currently in development.
              You'll be able to configure pack contents, set pricing, and manage shop availability here.
            </p>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
              <Button variant="outline" disabled>
                Pack Configuration
              </Button>
              <Button variant="outline" disabled>
                Pricing Settings
              </Button>
              <Button variant="outline" disabled>
                Shop Availability
              </Button>
              <Button variant="outline" disabled>
                Sales Analytics
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

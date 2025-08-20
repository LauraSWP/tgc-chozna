import { redirect } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { getUser, getUserProfile } from '@/lib/auth';
import { getCardDefinitions } from '@/lib/db/queries';
import Link from 'next/link';

export default async function AdminPage() {
  const user = await getUser();
  if (!user) redirect('/login');

  const { data: profile } = await getUserProfile(user.id);
  
  // Check if user is admin
  if (profile?.role !== 'admin') {
    redirect('/dashboard');
  }

  // Get some basic stats
  const { data: cards } = await getCardDefinitions();
  const cardStats = cards?.reduce((stats, card) => {
    const rarity = card.rarities?.code || 'unknown';
    stats[rarity] = (stats[rarity] || 0) + 1;
    return stats;
  }, {} as Record<string, number>) || {};

  return (
    <div className="space-y-6">
      {/* Admin Header */}
      <div className="text-center space-y-2">
        <h1 className="text-4xl font-bold bg-gradient-to-r from-red-600 to-orange-600 bg-clip-text text-transparent">
          🛠️ Admin Dashboard
        </h1>
        <p className="text-gray-600 dark:text-gray-300">
          Game management and administration tools
        </p>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-2">
              <span className="text-2xl">🃏</span>
              <div>
                <p className="text-2xl font-bold">{cards?.length || 0}</p>
                <p className="text-sm text-gray-600">Total Cards</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-2">
              <span className="text-2xl">👥</span>
              <div>
                <p className="text-2xl font-bold">-</p>
                <p className="text-sm text-gray-600">Active Users</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-2">
              <span className="text-2xl">📦</span>
              <div>
                <p className="text-2xl font-bold">-</p>
                <p className="text-sm text-gray-600">Packs Opened</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-2">
              <span className="text-2xl">⚔️</span>
              <div>
                <p className="text-2xl font-bold">-</p>
                <p className="text-sm text-gray-600">Matches Played</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Management Tools */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              🃏 Card Management
            </CardTitle>
            <CardDescription>
              Create, edit, and manage card definitions
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="text-sm space-y-1">
                <p><strong>Card Breakdown:</strong></p>
                {Object.entries(cardStats).map(([rarity, count]) => (
                  <div key={rarity} className="flex justify-between">
                    <span className="capitalize">{rarity}:</span>
                    <span>{count}</span>
                  </div>
                ))}
              </div>
              <div className="grid grid-cols-2 gap-2">
                <Button asChild className="w-full">
                  <Link href="/admin/cards">Manage Cards</Link>
                </Button>
                <Button asChild variant="outline" className="w-full">
                  <Link href="/admin/cards/new">New Card</Link>
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              👥 User Management
            </CardTitle>
            <CardDescription>
              View and manage user accounts
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <p className="text-sm text-gray-600">
                Monitor user activity and manage accounts
              </p>
              <Button asChild className="w-full" variant="outline">
                <Link href="/admin/users">Manage Users</Link>
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              📊 Analytics
            </CardTitle>
            <CardDescription>
              Game statistics and performance metrics
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <p className="text-sm text-gray-600">
                View detailed analytics and reports
              </p>
              <Button asChild className="w-full" variant="outline">
                <Link href="/admin/analytics">View Analytics</Link>
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              🏪 Shop Management
            </CardTitle>
            <CardDescription>
              Configure pack contents and pricing
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <p className="text-sm text-gray-600">
                Manage pack configurations and shop settings
              </p>
              <Button asChild className="w-full" variant="outline">
                <Link href="/admin/shop">Shop Settings</Link>
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              ⚔️ Match Management
            </CardTitle>
            <CardDescription>
              Monitor ongoing matches and game state
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <p className="text-sm text-gray-600">
                View active matches and game statistics
              </p>
              <Button asChild className="w-full" variant="outline">
                <Link href="/admin/matches">View Matches</Link>
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              🔧 System Tools
            </CardTitle>
            <CardDescription>
              Database tools and system maintenance
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <p className="text-sm text-gray-600">
                Database utilities and system diagnostics
              </p>
              <Button asChild className="w-full" variant="outline">
                <Link href="/admin/system">System Tools</Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
          <CardDescription>
            Common administrative tasks
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Button asChild variant="outline" className="h-auto p-4 flex flex-col items-center space-y-2">
              <Link href="/admin/cards/new">
                <span className="text-2xl">🆕</span>
                <span>Create New Card</span>
              </Link>
            </Button>
            
            <Button asChild variant="outline" className="h-auto p-4 flex flex-col items-center space-y-2">
              <Link href="/admin/users">
                <span className="text-2xl">🎁</span>
                <span>Manage Users</span>
              </Link>
            </Button>
            
            <Button variant="outline" className="h-auto p-4 flex flex-col items-center space-y-2">
              <span className="text-2xl">🚨</span>
              <span>View System Alerts</span>
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* System Status */}
      <Card>
        <CardHeader>
          <CardTitle>System Status</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="flex items-center space-x-3">
              <div className="w-3 h-3 bg-green-500 rounded-full"></div>
              <span className="text-sm">Database: Healthy</span>
            </div>
            
            <div className="flex items-center space-x-3">
              <div className="w-3 h-3 bg-green-500 rounded-full"></div>
              <span className="text-sm">API: Operational</span>
            </div>
            
            <div className="flex items-center space-x-3">
              <div className="w-3 h-3 bg-green-500 rounded-full"></div>
              <span className="text-sm">Pack Opening: Active</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Security Warning */}
      <Card className="border-orange-200 bg-orange-50 dark:bg-orange-900/20">
        <CardContent className="pt-6">
          <div className="flex items-start space-x-3">
            <span className="text-orange-500 text-xl">⚠️</span>
            <div className="space-y-1">
              <p className="font-semibold text-orange-800 dark:text-orange-200">
                Admin Access Notice
              </p>
              <p className="text-sm text-orange-700 dark:text-orange-300">
                You have administrative privileges. Please use these tools responsibly and 
                follow security best practices. All admin actions are logged.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

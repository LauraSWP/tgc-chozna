import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { getUser, getUserProfile } from '@/lib/auth';
import { redirect } from 'next/navigation';
import UserManagementClient from '@/components/admin/UserManagementClient';
import { createClient } from '@/lib/auth';

export default async function AdminUsersPage() {
  const user = await getUser();
  if (!user) redirect('/login');

  const { data: profile } = await getUserProfile(user.id);
  if (profile?.role !== 'admin') redirect('/dashboard');

  // Get users with their profiles and stats
  const supabase = await createClient();
  
  const { data: users } = await supabase
    .from('profiles')
    .select(`
      *,
      user_currencies(coins, gems),
      user_cards(count)
    `)
    .order('created_at', { ascending: false });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">User Management</h1>
          <p className="text-gray-600 dark:text-gray-300">
            Monitor and manage user accounts
          </p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="text-2xl font-bold">{users?.length || 0}</div>
            <p className="text-sm text-gray-600">Total Users</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="text-2xl font-bold">
              {users?.filter(u => u.role === 'admin').length || 0}
            </div>
            <p className="text-sm text-gray-600">Admins</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="text-2xl font-bold">
              {users?.filter(u => u.username?.startsWith('Guest_')).length || 0}
            </div>
            <p className="text-sm text-gray-600">Guest Users</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="text-2xl font-bold">
              {users?.filter(u => 
                u.created_at && 
                new Date(u.created_at) > new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
              ).length || 0}
            </div>
            <p className="text-sm text-gray-600">New This Week</p>
          </CardContent>
        </Card>
      </div>

      {/* User Management */}
      <UserManagementClient initialUsers={users || []} />
    </div>
  );
}

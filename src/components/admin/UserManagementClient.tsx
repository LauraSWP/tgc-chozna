'use client';

import React, { useState, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { supabase } from '@/lib/supabaseClient';
import { formatCurrency, formatNumber } from '@/lib/utils';

interface UserWithStats {
  id: string;
  username: string;
  role: 'player' | 'admin' | 'moderator';
  avatar_url?: string;
  created_at: string;
  updated_at: string;
  user_currencies?: {
    coins: number;
    gems: number;
  };
  user_cards?: {
    count: number;
  }[];
}

interface UserManagementClientProps {
  initialUsers: UserWithStats[];
}

const UserManagementClient: React.FC<UserManagementClientProps> = ({ initialUsers }) => {
  const [users, setUsers] = useState<UserWithStats[]>(initialUsers);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedRole, setSelectedRole] = useState<string>('all');
  const [showGuestUsers, setShowGuestUsers] = useState(true);
  const [editingUser, setEditingUser] = useState<string | null>(null);

  // Filter users
  const filteredUsers = useMemo(() => {
    return users.filter(user => {
      const matchesSearch = 
        user.username?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.id.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesRole = selectedRole === 'all' || user.role === selectedRole;
      const matchesGuest = showGuestUsers || !user.username?.startsWith('Guest_');

      return matchesSearch && matchesRole && matchesGuest;
    });
  }, [users, searchTerm, selectedRole, showGuestUsers]);

  const handleRoleChange = async (userId: string, newRole: 'player' | 'admin' | 'moderator') => {
    try {
      const { error } = await supabase
        .from('profiles')
        .update({ role: newRole })
        .eq('id', userId);

      if (error) throw error;

      setUsers(prev => prev.map(user => 
        user.id === userId ? { ...user, role: newRole } : user
      ));
    } catch (error) {
      console.error('Error updating user role:', error);
      alert('Failed to update user role');
    }
  };

  const handleGiveCurrency = async (userId: string, coins: number, gems: number) => {
    try {
      // Get current currency
      const { data: currency } = await supabase
        .from('user_currencies')
        .select('*')
        .eq('user_id', userId)
        .single();

      if (currency) {
        // Update existing
        const { error } = await supabase
          .from('user_currencies')
          .update({
            coins: currency.coins + coins,
            gems: currency.gems + gems
          })
          .eq('user_id', userId);

        if (error) throw error;

        // Log transaction
        await supabase
          .from('transactions')
          .insert({
            user_id: userId,
            type: 'admin_grant',
            amount_coins: coins,
            amount_gems: gems,
            description: `Admin granted ${coins} coins and ${gems} gems`
          });
      } else {
        // Create new currency record
        await supabase
          .from('user_currencies')
          .insert({
            user_id: userId,
            coins: 1000 + coins,
            gems: 0 + gems
          });
      }

      // Update local state
      setUsers(prev => prev.map(user => 
        user.id === userId ? {
          ...user,
          user_currencies: {
            coins: (user.user_currencies?.coins || 1000) + coins,
            gems: (user.user_currencies?.gems || 0) + gems
          }
        } : user
      ));

      alert(`Successfully gave ${coins} coins and ${gems} gems to ${users.find(u => u.id === userId)?.username}`);
    } catch (error) {
      console.error('Error giving currency:', error);
      alert('Failed to give currency');
    }
  };

  const promptGiveCurrency = (userId: string, username: string) => {
    const coins = prompt(`How many coins to give to ${username}?`, '100');
    const gems = prompt(`How many gems to give to ${username}?`, '0');
    
    if (coins !== null && gems !== null) {
      const coinsNum = parseInt(coins) || 0;
      const gemsNum = parseInt(gems) || 0;
      
      if (coinsNum !== 0 || gemsNum !== 0) {
        handleGiveCurrency(userId, coinsNum, gemsNum);
      }
    }
  };

  return (
    <div className="space-y-6">
      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle>Filters</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Search</label>
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full border rounded-md px-3 py-2"
                placeholder="Search users..."
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Role</label>
              <select
                value={selectedRole}
                onChange={(e) => setSelectedRole(e.target.value)}
                className="w-full border rounded-md px-3 py-2"
              >
                <option value="all">All Roles</option>
                <option value="player">Players</option>
                <option value="admin">Admins</option>
                <option value="moderator">Moderators</option>
              </select>
            </div>

            <div className="flex items-end">
              <label className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={showGuestUsers}
                  onChange={(e) => setShowGuestUsers(e.target.checked)}
                  className="rounded"
                />
                <span className="text-sm">Show guest users</span>
              </label>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Results Summary */}
      <div className="flex items-center justify-between">
        <p className="text-sm text-gray-600">
          Showing {filteredUsers.length} of {users.length} users
        </p>
      </div>

      {/* Users Table */}
      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 dark:bg-gray-800">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    User
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Role
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Currency
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Cards
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Joined
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white dark:bg-gray-900 divide-y divide-gray-200 dark:divide-gray-700">
                {filteredUsers.map((user) => (
                  <tr key={user.id} className="hover:bg-gray-50 dark:hover:bg-gray-800">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-10 w-10">
                          <div className="h-10 w-10 rounded-full bg-gray-300 flex items-center justify-center">
                            <span className="text-sm font-medium text-gray-700">
                              {user.username?.charAt(0).toUpperCase() || '?'}
                            </span>
                          </div>
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900 dark:text-gray-100">
                            {user.username}
                          </div>
                          <div className="text-sm text-gray-500 font-mono">
                            {user.id.slice(0, 8)}...
                          </div>
                        </div>
                      </div>
                    </td>
                    
                    <td className="px-6 py-4 whitespace-nowrap">
                      <select
                        value={user.role}
                        onChange={(e) => handleRoleChange(user.id, e.target.value as any)}
                        className="text-sm border rounded px-2 py-1"
                      >
                        <option value="player">Player</option>
                        <option value="moderator">Moderator</option>
                        <option value="admin">Admin</option>
                      </select>
                    </td>
                    
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100">
                      <div>
                        🪙 {formatNumber(user.user_currencies?.coins || 0)}
                      </div>
                      <div>
                        💎 {formatNumber(user.user_currencies?.gems || 0)}
                      </div>
                    </td>
                    
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100">
                      {formatNumber(user.user_cards?.[0]?.count || 0)}
                    </td>
                    
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(user.created_at).toLocaleDateString()}
                    </td>
                    
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => promptGiveCurrency(user.id, user.username)}
                      >
                        Give Currency
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {filteredUsers.length === 0 && (
        <Card>
          <CardContent className="py-12 text-center">
            <p className="text-gray-500 mb-4">No users found matching your filters</p>
            <Button
              onClick={() => {
                setSearchTerm('');
                setSelectedRole('all');
                setShowGuestUsers(true);
              }}
              variant="outline"
            >
              Clear Filters
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default UserManagementClient;

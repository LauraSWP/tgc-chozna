import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { getUser, getUserProfile } from '@/lib/auth';
import { getCardDefinitions } from '@/lib/db/queries';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import CardManagementClient from '@/components/admin/CardManagementClient';

export default async function AdminCardsPage() {
  const user = await getUser();
  if (!user) redirect('/login');

  const { data: profile } = await getUserProfile(user.id);
  if (profile?.role !== 'admin') redirect('/dashboard');

  // Get cards with related data
  const { data: cards } = await getCardDefinitions();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Card Management</h1>
          <p className="text-gray-600 dark:text-gray-300">
            Create, edit, and manage all game cards
          </p>
        </div>
        <Button asChild>
          <Link href="/admin/cards/new">Create New Card</Link>
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {(() => {
          const stats = cards?.reduce((acc, card) => {
            const rarity = card.rarities?.code || 'unknown';
            acc.total++;
            acc[rarity] = (acc[rarity] || 0) + 1;
            if (card.is_active) acc.active++;
            return acc;
          }, { total: 0, active: 0 } as Record<string, number>) || { total: 0, active: 0 };

          return (
            <>
              <Card>
                <CardContent className="p-6">
                  <div className="text-2xl font-bold">{stats.total}</div>
                  <p className="text-sm text-gray-600">Total Cards</p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-6">
                  <div className="text-2xl font-bold">{stats.active}</div>
                  <p className="text-sm text-gray-600">Active Cards</p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-6">
                  <div className="text-2xl font-bold">{stats.rare || 0}</div>
                  <p className="text-sm text-gray-600">Rare Cards</p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-6">
                  <div className="text-2xl font-bold">{stats.mythic || 0}</div>
                  <p className="text-sm text-gray-600">Mythic Cards</p>
                </CardContent>
              </Card>
            </>
          );
        })()}
      </div>

      {/* Card Management Interface */}
      <CardManagementClient initialCards={cards || []} />
    </div>
  );
}

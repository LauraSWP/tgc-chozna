import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { getUser, getUserProfile } from '@/lib/auth';
import { getUserCurrency, getUserCollection, getUserDecks } from '@/lib/db/queries';
import { formatCurrency, formatNumber } from '@/lib/utils';
import Link from 'next/link';

export default async function DashboardPage() {
  const user = await getUser();
  if (!user) return null;

  // Fetch user data
  const [
    { data: profile },
    { data: currency },
    { data: collection },
    { data: decks }
  ] = await Promise.all([
    getUserProfile(user.id),
    getUserCurrency(user.id),
    getUserCollection(user.id),
    getUserDecks(user.id)
  ]);

  // Calculate collection stats
  const collectionStats = collection?.reduce((stats, item) => {
    stats.total += item.total_cards || 0;
    stats.foils += item.foil_cards || 0;
    stats.byRarity[item.rarity || 'common'] = (stats.byRarity[item.rarity || 'common'] || 0) + (item.total_cards || 0);
    return stats;
  }, {
    total: 0,
    foils: 0,
    byRarity: {} as Record<string, number>
  }) || { total: 0, foils: 0, byRarity: {} };

  return (
    <div className="space-y-6">
      {/* Welcome Header */}
      <div className="text-center space-y-2">
        <h1 className="text-4xl font-bold bg-gradient-to-r from-yellow-600 to-orange-600 bg-clip-text text-transparent">
          ¡Ey {profile?.username || 'Colega'}!
        </h1>
        <p className="text-gray-600 dark:text-gray-300">
          ¿Listo para jugar unas partidas?
        </p>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-2">
              <span className="text-2xl">🪙</span>
              <div>
                <p className="text-2xl font-bold">{formatNumber(currency?.coins || 0)}</p>
                <p className="text-sm text-gray-600">Moneditas</p>
              </div>
            </div>
          </CardContent>
        </Card>



        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-2">
              <span className="text-2xl">🃏</span>
              <div>
                <p className="text-2xl font-bold">{formatNumber(collectionStats.total)}</p>
                <p className="text-sm text-gray-600">Cartas</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-2">
              <span className="text-2xl">🏗️</span>
              <div>
                <p className="text-2xl font-bold">{formatNumber(decks?.length || 0)}</p>
                <p className="text-sm text-gray-600">Mazos</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              🛒 Tienda
            </CardTitle>
            <CardDescription>
              Abre sobres y consigue cartas chulas
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <p className="text-sm text-gray-600">
                Sobres Base disponibles por {formatCurrency(150)}
              </p>
              <Button asChild className="w-full">
                <Link href="/shop">Ir a la Tienda</Link>
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              🏗️ Crear Mazos
            </CardTitle>
            <CardDescription>
              Monta mazos para machacar
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <p className="text-sm text-gray-600">
                {decks?.length ? `Tienes ${decks.length} mazo${decks.length !== 1 ? 's' : ''}` : 'Crea tu primer mazo'}
              </p>
              <Button asChild className="w-full" variant="outline">
                <Link href="/decks">Ver Mazos</Link>
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              ⚔️ Jugar
            </CardTitle>
            <CardDescription>
              Reta a tus colegas online
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <p className="text-sm text-gray-600">
                Encuentra rivales y demuestra quién manda
              </p>
              <Button asChild className="w-full" variant="secondary">
                <Link href="/play">¡A Jugar!</Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Collection Overview */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Collection Overview</CardTitle>
            <CardDescription>
              Your card collection summary
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span>Total Cards:</span>
                <span className="font-mono">{formatNumber(collectionStats.total)}</span>
              </div>
              <div className="flex justify-between">
                <span>Foil Cards:</span>
                <span className="font-mono">{formatNumber(collectionStats.foils)} ✨</span>
              </div>
              
              {Object.entries(collectionStats.byRarity).length > 0 && (
                <div className="pt-2 border-t">
                  <p className="text-sm font-semibold mb-2">By Rarity:</p>
                  {Object.entries(collectionStats.byRarity).map(([rarity, count]) => (
                    <div key={rarity} className="flex justify-between text-sm">
                      <span className="capitalize">{rarity}:</span>
                      <span className="font-mono">{formatNumber(count as number)}</span>
                    </div>
                  ))}
                </div>
              )}
              
              <Button asChild className="w-full mt-4" variant="outline">
                <Link href="/collection">View Full Collection</Link>
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Recent Decks</CardTitle>
            <CardDescription>
              Your most recently updated decks
            </CardDescription>
          </CardHeader>
          <CardContent>
            {decks && decks.length > 0 ? (
              <div className="space-y-3">
                {decks.slice(0, 5).map((deck) => (
                  <div key={deck.id} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                    <div>
                      <p className="font-semibold">{deck.name}</p>
                      <p className="text-sm text-gray-600">
                        {deck.mainboard_cards || 0} cards • {deck.format}
                      </p>
                    </div>
                    <div className="flex items-center space-x-2">
                      {deck.is_legal && (
                        <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded">
                          Legal
                        </span>
                      )}
                      <Button size="sm" variant="outline" asChild>
                        <Link href={`/decks/${deck.id}`}>Edit</Link>
                      </Button>
                    </div>
                  </div>
                ))}
                
                <Button asChild className="w-full" variant="outline">
                  <Link href="/decks">View All Decks</Link>
                </Button>
              </div>
            ) : (
              <div className="text-center py-8">
                <p className="text-gray-600 mb-4">No decks yet</p>
                <Button asChild>
                  <Link href="/decks">Build Your First Deck</Link>
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Daily Rewards / News */}
      <Card>
        <CardHeader>
          <CardTitle>Daily Bonus</CardTitle>
          <CardDescription>
            Come back tomorrow for your daily coin bonus!
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-4">
            <p className="text-2xl mb-2">🎁</p>
            <p className="text-gray-600 mb-4">
              Daily rewards help you grow your collection faster
            </p>
            <Button disabled>
              Claimed Today • +100 🪙
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

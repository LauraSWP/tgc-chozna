import { redirect } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { getUser, getUserProfile } from '@/lib/auth';

export default async function PlayPage() {
  const user = await getUser();
  if (!user) redirect('/login');

  const { data: profile } = await getUserProfile(user.id);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center space-y-2">
        <h1 className="text-4xl font-bold bg-gradient-to-r from-red-600 to-orange-600 bg-clip-text text-transparent">
          ⚔️ Play Game
        </h1>
        <p className="text-gray-600 dark:text-gray-300">
          Enter matches and battle other players
        </p>
      </div>

      {/* Coming Soon */}
      <Card>
        <CardHeader>
          <CardTitle>Game Lobby</CardTitle>
          <CardDescription>
            Find opponents and start playing matches
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center space-y-4 py-8">
            <div className="text-6xl">🚧</div>
            <h3 className="text-xl font-semibold">Coming Soon!</h3>
            <p className="text-gray-600">
              The game engine and multiplayer features are currently in development.
              You'll be able to challenge other players and test your decks here.
            </p>
            <div className="flex justify-center gap-2">
              <Button variant="outline">
                Quick Match
              </Button>
              <Button variant="outline">
                Create Room
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

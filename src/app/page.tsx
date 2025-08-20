import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import Link from 'next/link';

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 dark:from-gray-900 dark:to-gray-800">
      {/* Header */}
      <header className="border-b bg-white/50 backdrop-blur-sm dark:bg-gray-900/50">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              🃏 My TCG
            </h1>
          </div>
          <div className="flex items-center space-x-4">
            <Button variant="ghost" asChild>
              <Link href="/login">Log In</Link>
            </Button>
            <Button asChild>
              <Link href="/login">Get Started</Link>
            </Button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-20 text-center">
        <div className="container mx-auto px-4 max-w-4xl">
          <h2 className="text-5xl font-bold mb-6 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            Build. Battle. Dominate.
          </h2>
          <p className="text-xl text-gray-600 dark:text-gray-300 mb-8 max-w-2xl mx-auto">
            A modern trading card game where coding meets strategy. Open booster packs, 
            build powerful decks, and battle with fellow developers in this tech-themed TCG.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" asChild>
              <Link href="/login">Start Playing</Link>
            </Button>
            <Button size="lg" variant="outline" asChild>
              <Link href="#features">Learn More</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 bg-white/30 dark:bg-gray-800/30">
        <div className="container mx-auto px-4">
          <h3 className="text-3xl font-bold text-center mb-12">Game Features</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  📦 Pack Opening
                </CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-base">
                  Open booster packs with realistic rarities and foil chances. 
                  Collect cards featuring your favorite programming concepts and inside jokes.
                </CardDescription>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  🏗️ Deck Building
                </CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-base">
                  Build competitive decks with format validation and smart collection management. 
                  Create strategies around different programming paradigms.
                </CardDescription>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  ⚔️ Strategic Combat
                </CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-base">
                  Engage in turn-based battles with a sophisticated rule engine. 
                  Use effects, triggers, and stack-based spell resolution.
                </CardDescription>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  🎨 Beautiful Cards
                </CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-base">
                  Enjoy themed artwork and flavor text that celebrates developer culture. 
                  From &quot;Coffee-Powered Coder&quot; to &quot;The Architect&quot;.
                </CardDescription>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  🔄 Trading System
                </CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-base">
                  Trade cards with other players to complete your collection. 
                  Make offers and negotiate deals in a secure trading environment.
                </CardDescription>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  📱 Modern Web Tech
                </CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-base">
                  Built with Next.js, Supabase, and modern web technologies. 
                  Play on any device with real-time multiplayer support.
                </CardDescription>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Sample Cards Section */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <h3 className="text-3xl font-bold text-center mb-12">Featured Cards</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto">
            <Card className="bg-gradient-to-br from-blue-100 to-blue-200 dark:from-blue-900 dark:to-blue-800 border-blue-300">
              <CardHeader>
                <CardTitle className="text-lg">Coffee-Powered Coder</CardTitle>
                <CardDescription>Creature — Human Developer</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <p className="text-sm"><strong>Cost:</strong> {'{1}{B}'}</p>
                  <p className="text-sm"><strong>P/T:</strong> 1/2</p>
                  <p className="text-sm"><strong>Ability:</strong> Haste, When enters: Draw a card</p>
                  <p className="text-xs italic mt-2">
                    &quot;I can code for 48 hours straight, but only if there&apos;s caffeine.&quot;
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-purple-100 to-purple-200 dark:from-purple-900 dark:to-purple-800 border-purple-300">
              <CardHeader>
                <CardTitle className="text-lg">The Architect</CardTitle>
                <CardDescription>Legendary Creature — Human God</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <p className="text-sm"><strong>Cost:</strong> {'{4}{W}{U}{B}'}</p>
                  <p className="text-sm"><strong>P/T:</strong> 6/6</p>
                  <p className="text-sm"><strong>Ability:</strong> Flying, Vigilance, Lifelink</p>
                  <p className="text-xs italic mt-2">
                    &quot;I have seen the future of technology, and it is beautiful.&quot;
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-red-100 to-red-200 dark:from-red-900 dark:to-red-800 border-red-300">
              <CardHeader>
                <CardTitle className="text-lg">Stack Overflow</CardTitle>
                <CardDescription>Legendary Sorcery</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <p className="text-sm"><strong>Cost:</strong> {'{X}{X}{R}{R}'}</p>
                  <p className="text-sm"><strong>Ability:</strong> Deal 999 damage to all targets</p>
                  <p className="text-xs italic mt-2">
                    &quot;Maximum recursion depth exceeded. Core dumped.&quot;
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-blue-600 to-purple-600 text-white">
        <div className="container mx-auto px-4 text-center">
          <h3 className="text-4xl font-bold mb-6">Ready to Start Your Journey?</h3>
          <p className="text-xl mb-8 max-w-2xl mx-auto">
            Join thousands of developers already playing. Build your collection, 
            master the meta, and become a legendary programmer.
          </p>
          <Button size="lg" variant="secondary" asChild>
            <Link href="/login">Play Now - It&apos;s Free!</Link>
          </Button>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div>
              <h4 className="text-xl font-bold mb-4">🃏 My TCG</h4>
              <p className="text-gray-400">
                The trading card game for developers, by developers.
              </p>
            </div>
            <div>
              <h5 className="font-semibold mb-3">Game</h5>
              <ul className="space-y-2 text-gray-400">
                <li><Link href="/login" className="hover:text-white">Play Now</Link></li>
                <li><Link href="/cards" className="hover:text-white">Card Database</Link></li>
                <li><Link href="/rules" className="hover:text-white">Rules</Link></li>
              </ul>
            </div>
            <div>
              <h5 className="font-semibold mb-3">Community</h5>
              <ul className="space-y-2 text-gray-400">
                <li><Link href="/discord" className="hover:text-white">Discord</Link></li>
                <li><Link href="/reddit" className="hover:text-white">Reddit</Link></li>
                <li><Link href="/github" className="hover:text-white">GitHub</Link></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400">
            <p>&copy; 2024 My TCG. Built with Next.js and Supabase.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}

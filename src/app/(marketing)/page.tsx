import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import Link from 'next/link';
import MagicCard from '@/components/MagicCard';

export default function HomePage() {
  // Cartas de ejemplo para mostrar
  const featuredCards = [
    {
      name: "Dragón de Fuego",
      manaCost: "4RR",
      type: "Criatura — Dragón",
      power: 5,
      toughness: 4,
      rarity: "rare" as const,
      rulesText: "Vuela, prisa. Cuando el Dragón de Fuego entra al campo de batalla, hace 2 puntos de daño a cualquier objetivo.",
      flavorText: "Su rugido hace temblar montañas."
    },
    {
      name: "Guerrero Élfico",
      manaCost: "1G",
      type: "Criatura — Elfo Guerrero",
      power: 2,
      toughness: 2,
      rarity: "uncommon" as const,
      rulesText: "Vigilancia. Siempre que el Guerrero Élfico ataque, puedes poner un contador +1/+1 sobre él.",
      flavorText: "La naturaleza guía su espada."
    },
    {
      name: "Relámpago",
      manaCost: "R",
      type: "Instantáneo",
      rarity: "common" as const,
      rulesText: "El Relámpago hace 3 puntos de daño a cualquier objetivo.",
      flavorText: "La magia más simple es a menudo la más efectiva."
    },
    {
      name: "Ángel Guardián",
      manaCost: "3WW",
      type: "Criatura — Ángel",
      power: 3,
      toughness: 4,
      rarity: "mythic" as const,
      rulesText: "Vuela, vigilancia. Las otras criaturas que controlas tienen +1/+1 y vigilancia.",
      flavorText: "Su presencia trae esperanza a los corazones más oscuros."
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-purple-900">
      {/* Hero Section */}
      <section className="relative py-20 overflow-hidden">
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute inset-0" 
               style={{
                 backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.1'%3E%3Ccircle cx='30' cy='30' r='4'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
               }}
          />
        </div>
        
        <div className="container mx-auto px-4">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Left side - Content */}
            <div className="text-center lg:text-left">
              {/* Logo/Title */}
              <div className="mb-8">
                <h1 className="text-5xl lg:text-7xl font-bold bg-gradient-to-r from-yellow-400 via-red-500 to-purple-600 bg-clip-text text-transparent mb-4">
                  🃏 Skibidi TCG
                </h1>
                <p className="text-xl text-gray-300 max-w-xl">
                  El juego de cartas más cabra de todas las cabras, como si una cabra hubiera tenido una cabra pero más cabra aún.
                </p>
              </div>

              {/* Stats */}
              <div className="grid grid-cols-3 gap-6 mb-8">
                <div className="text-center">
                  <div className="text-3xl font-bold text-yellow-400">500+</div>
                  <div className="text-sm text-gray-400">Cartas Únicas</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-blue-400">1K+</div>
                  <div className="text-sm text-gray-400">Jugadores</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-purple-400">24/7</div>
                  <div className="text-sm text-gray-400">Online</div>
                </div>
              </div>

              {/* CTA Buttons */}
              <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
                <Button 
                  size="lg" 
                  asChild 
                  className="bg-gradient-to-r from-yellow-500 to-red-600 hover:from-yellow-600 hover:to-red-700 text-white font-bold px-8 py-4 rounded-xl text-lg shadow-xl transform transition hover:scale-105"
                >
                  <Link href="/login">¡Empezar a Jugar!</Link>
                </Button>
                <Button 
                  size="lg" 
                  variant="outline" 
                  asChild
                  className="border-2 border-white/30 text-white hover:bg-white/10 px-8 py-4 rounded-xl text-lg backdrop-blur-sm"
                >
                  <Link href="#cards">Ver Cartas</Link>
                </Button>
              </div>
            </div>

            {/* Right side - Hero Image */}
            <div className="flex justify-center lg:justify-end">
              <div className="relative">
                {/* Imagen de Dragonite "¡Por España!" */}
                <div className="w-96 h-96 lg:w-[500px] lg:h-[500px] rounded-full overflow-hidden border-4 border-yellow-400 shadow-2xl">
                  <img 
                    src="/assets/images/españa.jpeg" 
                    alt="¡Por España! Dragonite" 
                    className="w-full h-full object-cover"
                  />
                </div>
                {/* Glowing effect */}
                <div className="absolute inset-0 bg-gradient-to-br from-red-400 via-yellow-500 to-red-600 rounded-full opacity-20 blur-xl scale-110"></div>
                {/* Spanish flag colors glow */}
                <div className="absolute inset-0 bg-gradient-to-r from-red-500 to-yellow-400 rounded-full opacity-10 blur-2xl scale-125"></div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Cards Section */}
      <section id="cards" className="py-20 bg-black/20 backdrop-blur-sm">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-white mb-4">Cartas Destacadas</h2>
            <p className="text-xl text-gray-300 max-w-2xl mx-auto">
              Descubre algunas de las cartas más poderosas en nuestro arsenal. 
              Cada carta ha sido diseñada con estrategia y balance en mente.
            </p>
          </div>

          {/* Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 justify-items-center">
            {featuredCards.map((card, index) => (
              <MagicCard
                key={index}
                name={card.name}
                manaCost={card.manaCost}
                type={card.type}
                power={card.power}
                toughness={card.toughness}
                rarity={card.rarity}
                rulesText={card.rulesText}
                flavorText={card.flavorText}
                size="medium"
                className="transform transition-all duration-300 hover:scale-110 hover:z-10"
              />
            ))}
          </div>
        </div>
      </section>

      {/* Game Features */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="grid lg:grid-cols-3 gap-8">
            <Card className="bg-gradient-to-br from-blue-900/50 to-purple-900/50 border-blue-500/30 backdrop-blur-sm">
              <CardContent className="p-8 text-center">
                <div className="text-4xl mb-4">⚔️</div>
                <h3 className="text-2xl font-bold text-white mb-4">Combate Estratégico</h3>
                <p className="text-gray-300">
                  Sistema de combate profundo con fases, stack de efectos e interacciones complejas.
                  Domina el timing perfecto para ganar.
                </p>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-purple-900/50 to-pink-900/50 border-purple-500/30 backdrop-blur-sm">
              <CardContent className="p-8 text-center">
                <div className="text-4xl mb-4">🏗️</div>
                <h3 className="text-2xl font-bold text-white mb-4">Constructor de Mazos</h3>
                <p className="text-gray-300">
                  Crea mazos únicos con nuestro constructor avanzado. Analiza curvas de maná, 
                  sinergias y estadísticas detalladas.
                </p>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-green-900/50 to-blue-900/50 border-green-500/30 backdrop-blur-sm">
              <CardContent className="p-8 text-center">
                <div className="text-4xl mb-4">🏆</div>
                <h3 className="text-2xl font-bold text-white mb-4">Competición</h3>
                <p className="text-gray-300">
                  Participa en torneos ranked, eventos especiales y desafíos semanales.
                  Escala hasta convertirte en leyenda.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Game Modes */}
      <section className="py-20 bg-black/20 backdrop-blur-sm">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-white mb-4">Modos de Juego</h2>
            <p className="text-xl text-gray-300">Elige tu estilo de juego favorito</p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="bg-gradient-to-br from-yellow-500 to-orange-600 w-16 h-16 rounded-full flex items-center justify-center text-2xl text-white mx-auto mb-4">
                🏆
              </div>
              <h3 className="text-xl font-bold text-white mb-2">Ranked</h3>
              <p className="text-gray-400">Compite por subir en las clasificaciones globales</p>
            </div>
            <div className="text-center">
              <div className="bg-gradient-to-br from-blue-500 to-purple-600 w-16 h-16 rounded-full flex items-center justify-center text-2xl text-white mx-auto mb-4">
                🎯
              </div>
              <h3 className="text-xl font-bold text-white mb-2">Casual</h3>
              <p className="text-gray-400">Juega sin presión con amigos y la comunidad</p>
            </div>
            <div className="text-center">
              <div className="bg-gradient-to-br from-green-500 to-teal-600 w-16 h-16 rounded-full flex items-center justify-center text-2xl text-white mx-auto mb-4">
                📦
              </div>
              <h3 className="text-xl font-bold text-white mb-2">Draft</h3>
              <p className="text-gray-400">Construye mazos sobre la marcha con sobres aleatorios</p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20">
        <div className="container mx-auto px-4 text-center">
          <div className="max-w-3xl mx-auto">
            <h2 className="text-4xl lg:text-5xl font-bold text-white mb-6">
              ¿Listo para la Batalla?
            </h2>
            <p className="text-xl text-gray-300 mb-8">
              Únete a miles de jugadores en el TCG más emocionante. 
              Construye tu colección, perfecciona tus estrategias y domina el campo de batalla.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button 
                size="lg" 
                asChild 
                className="bg-gradient-to-r from-yellow-500 to-red-600 hover:from-yellow-600 hover:to-red-700 text-white font-bold px-12 py-6 rounded-xl text-xl shadow-xl"
              >
                <Link href="/login">Crear Cuenta Gratis</Link>
              </Button>
              <Button 
                size="lg" 
                variant="outline" 
                asChild
                className="border-2 border-white/30 text-white hover:bg-white/10 px-12 py-6 rounded-xl text-xl backdrop-blur-sm"
              >
                <Link href="/login">Iniciar Sesión</Link>
              </Button>
            </div>
            <p className="text-sm text-gray-500 mt-4">
              100% gratis • Sin descargas • Juega en tu navegador
            </p>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-black/50 backdrop-blur-sm py-12">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <h4 className="font-bold text-xl text-white mb-4">🃏 Skibidi TCG</h4>
              <p className="text-gray-400 text-sm">
                El TCG más emocionante de España, con estrategia profunda y diversión garantizada.
              </p>
            </div>
            <div>
              <h5 className="font-semibold text-white mb-4">Juego</h5>
              <ul className="space-y-2 text-sm text-gray-400">
                <li><Link href="/login" className="hover:text-white transition">Jugar Ahora</Link></li>
                <li><Link href="#cards" className="hover:text-white transition">Cartas</Link></li>
                <li><a href="#" className="hover:text-white transition">Reglas</a></li>
              </ul>
            </div>
            <div>
              <h5 className="font-semibold text-white mb-4">Comunidad</h5>
              <ul className="space-y-2 text-sm text-gray-400">
                <li><a href="#" className="hover:text-white transition">Discord</a></li>
                <li><a href="#" className="hover:text-white transition">Reddit</a></li>
                <li><a href="#" className="hover:text-white transition">Twitter</a></li>
              </ul>
            </div>
            <div>
              <h5 className="font-semibold text-white mb-4">Soporte</h5>
              <ul className="space-y-2 text-sm text-gray-400">
                <li><a href="#" className="hover:text-white transition">Ayuda</a></li>
                <li><a href="#" className="hover:text-white transition">Contacto</a></li>
                <li><a href="#" className="hover:text-white transition">Bug Reports</a></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-700 mt-8 pt-8 text-center text-sm text-gray-500">
            <p>&copy; 2024 Skibidi TCG. Hecho con ❤️ en España.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
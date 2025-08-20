import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import Link from 'next/link';
import MagicCard from '@/components/MagicCard';

export default function HomePage() {
  // Cartas de ejemplo para mostrar
  const featuredCards = [
    {
      name: "Dragón de Fuego",
      manaCost: "{4}{R}{R}",
      type: "Criatura — Dragón",
      power: 5,
      toughness: 4,
      rarity: "rare" as const,
      rulesText: "Vuela, prisa. Cuando el Dragón de Fuego entra al campo de batalla, hace 2 puntos de daño a cualquier objetivo.",
      flavorText: "Su rugido hace temblar montañas."
    },
    {
      name: "Guerrero Élfico",
      manaCost: "{1}{V}",
      type: "Criatura — Elfo Guerrero",
      power: 2,
      toughness: 2,
      rarity: "uncommon" as const,
      rulesText: "Vigilancia. Siempre que el Guerrero Élfico ataque, puedes poner un contador +1/+1 sobre él.",
      flavorText: "La naturaleza guía su espada."
    },
    {
      name: "Relámpago",
      manaCost: "{R}",
      type: "Instantáneo",
      rarity: "common" as const,
      rulesText: "El Relámpago hace 3 puntos de daño a cualquier objetivo.",
      flavorText: "La magia más simple es a menudo la más efectiva."
    },
    {
      name: "Ángel Guardián",
      manaCost: "{3}{B}{B}",
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
                  <div className="text-3xl font-bold text-yellow-400">MUCHAS</div>
                  <div className="text-sm text-gray-400">Cartas Únicas</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-blue-400">ALGUNOS</div>
                  <div className="text-sm text-gray-400">Jugadores</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-purple-400">DE VEZ EN CUANDO</div>
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
                  className="border-2 border-yellow-400 text-yellow-400 hover:bg-yellow-400 hover:text-black px-8 py-4 rounded-xl text-lg font-bold shadow-xl transform transition hover:scale-105"
                >
                  <Link href="#cards">Ver las Cartas</Link>
                </Button>
              </div>
            </div>

            {/* Right side - Hero Image */}
            <div className="flex justify-center lg:justify-end">
              <div className="relative">
                {/* Imagen de Dragonite "¡Por ESPAÑA!" */}
                <div className="w-96 h-96 lg:w-[500px] lg:h-[500px] rounded-full overflow-hidden border-4 border-yellow-400 shadow-2xl">
                  <img 
                    src="/assets/images/españa.jpeg" 
                    alt="¡Por ESPAÑA! Dragonite" 
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

      {/* Existential Cat Section */}
      <section className="py-20 bg-gradient-to-br from-yellow-900/20 to-orange-900/20">
        <div className="container mx-auto px-4">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Left side - Cat Image */}
            <div className="flex justify-center lg:justify-start">
              <div className="relative">
                {/* Imagen del Gato Pensativo */}
                <div className="w-96 h-96 lg:w-[400px] lg:h-[400px] rounded-full overflow-hidden border-4 border-yellow-400 shadow-2xl">
                  <img 
                    src="/assets/images/gato.jpg" 
                    alt="Gato pensativo filosófico" 
                    className="w-full h-full object-cover"
                  />
                </div>
                {/* Glowing effect */}
                <div className="absolute inset-0 bg-gradient-to-br from-yellow-400 via-orange-500 to-yellow-600 rounded-full opacity-20 blur-xl scale-110"></div>
                {/* Thinking glow */}
                <div className="absolute inset-0 bg-gradient-to-r from-yellow-500 to-orange-400 rounded-full opacity-10 blur-2xl scale-125"></div>
              </div>
            </div>

            {/* Right side - Content */}
            <div className="text-center lg:text-left">
              <div className="mb-8">
                <h2 className="text-4xl lg:text-6xl font-bold text-white mb-6">
                  ¿Por qué? ¿Qué necesidad había?
                </h2>
                <p className="text-xl text-gray-300 max-w-xl">
                  Buena pregunta, me alegra que me lo hayas preguntado. La respuesta es simple. Porque puedo.
                </p>
              </div>

              {/* Philosophy Stats */}
              <div className="grid grid-cols-3 gap-6 mb-8">
                <div className="text-center">
                  <div className="text-3xl font-bold text-yellow-400">∞</div>
                  <div className="text-sm text-gray-400">Preguntas Sin Respuesta</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-yellow-400">42</div>
                  <div className="text-sm text-gray-400">Respuesta Universal</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-yellow-400">1</div>
                  <div className="text-sm text-gray-400">Gato Pensativo</div>
                </div>
              </div>

              {/* Call to Action */}
              <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
                <Button 
                  size="lg" 
                  asChild
                  className="bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600 text-lg"
                >
                  <a 
                    href="https://www.youtube.com/watch?v=dQw4w9WgXcQ&list=RDdQw4w9WgXcQ&start_radio=1&pp=ygUJcmljayByb2xsoAcB" 
                    target="_blank" 
                    rel="noopener noreferrer"
                  >
                    Aceptar la Realidad
                  </a>
                </Button>
                <Button size="lg" variant="outline" className="border-yellow-500 text-yellow-400 hover:bg-yellow-50/10">
                  Seguir Preguntando
                </Button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Card Types */}
      <section className="py-20 bg-black/20 backdrop-blur-sm">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-white mb-4">Cómo Funciona el Juego</h2>
            <p className="text-xl text-gray-300">Lo básico que necesitas saber para no hacer el ridículo</p>
          </div>

          {/* Card Types */}
          <div className="mb-16">
            <h3 className="text-2xl font-bold text-white mb-8 text-center">Tipos de Cartas</h3>
            <div className="grid md:grid-cols-4 gap-6 max-w-4xl mx-auto">
              <div className="text-center bg-green-900/30 p-4 rounded-lg">
                <div className="text-4xl mb-2">🐉</div>
                <h4 className="text-lg font-bold text-white mb-2">Criaturas</h4>
                <p className="text-gray-400 text-sm">Atacan al rival y defienden. Tienen ⚔️ ataque y 🛡️ defensa.</p>
              </div>
              <div className="text-center bg-blue-900/30 p-4 rounded-lg">
                <div className="text-4xl mb-2">⚡</div>
                <h4 className="text-lg font-bold text-white mb-2">Instantáneos</h4>
                <p className="text-gray-400 text-sm">Se juegan cuando quieras, incluso en el turno del rival.</p>
              </div>
              <div className="text-center bg-red-900/30 p-4 rounded-lg">
                <div className="text-4xl mb-2">🔮</div>
                <h4 className="text-lg font-bold text-white mb-2">Conjuros</h4>
                <p className="text-gray-400 text-sm">Efectos únicos que se hacen y van al cementerio.</p>
              </div>
              <div className="text-center bg-yellow-900/30 p-4 rounded-lg">
                <div className="text-4xl mb-2">🏞️</div>
                <h4 className="text-lg font-bold text-white mb-2">Tierras</h4>
                <p className="text-gray-400 text-sm">Dan maná (energía) para jugar las otras cartas.</p>
              </div>
            </div>
          </div>

          {/* Mana Types */}
          <div>
            <h3 className="text-2xl font-bold text-white mb-8 text-center">Tipos de Maná</h3>
            <p className="text-center text-gray-300 mb-8">Cada carta necesita maná específico para jugarse</p>
            <div className="grid md:grid-cols-5 gap-4 max-w-5xl mx-auto">
              <div className="text-center bg-white/10 p-4 rounded-lg">
                <div className="text-3xl mb-2">☀️</div>
                <h4 className="text-lg font-bold text-yellow-400 mb-1">B (Blanco)</h4>
                <p className="text-gray-400 text-xs">Luz, curación, orden</p>
              </div>
              <div className="text-center bg-white/10 p-4 rounded-lg">
                <div className="text-3xl mb-2">💧</div>
                <h4 className="text-lg font-bold text-blue-400 mb-1">A (Azul)</h4>
                <p className="text-gray-400 text-xs">Agua, magia, control</p>
              </div>
              <div className="text-center bg-white/10 p-4 rounded-lg">
                <div className="text-3xl mb-2">💀</div>
                <h4 className="text-lg font-bold text-purple-400 mb-1">N (Negro)</h4>
                <p className="text-gray-400 text-xs">Muerte, poder, sacrificio</p>
              </div>
              <div className="text-center bg-white/10 p-4 rounded-lg">
                <div className="text-3xl mb-2">🔥</div>
                <h4 className="text-lg font-bold text-red-400 mb-1">R (Rojo)</h4>
                <p className="text-gray-400 text-xs">Fuego, velocidad, caos</p>
              </div>
              <div className="text-center bg-white/10 p-4 rounded-lg">
                <div className="text-3xl mb-2">🌿</div>
                <h4 className="text-lg font-bold text-green-400 mb-1">V (Verde)</h4>
                <p className="text-gray-400 text-xs">Naturaleza, fuerza, criaturas</p>
              </div>
            </div>
            <div className="text-center mt-6">
              <div className="bg-gray-800 rounded-lg p-4 max-w-md mx-auto">
                <p className="text-gray-300 text-sm mb-2">
                  <strong>Ejemplo de coste:</strong>
                </p>
                <div className="flex items-center justify-center gap-2 mb-2">
                  <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-gray-300 border border-gray-400 text-xs font-bold text-gray-700">3</span>
                  <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-red-100 border border-gray-400 text-xs font-bold text-red-400">🔥</span>
                  <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-green-100 border border-gray-400 text-xs font-bold text-green-400">🌿</span>
                </div>
                <p className="text-gray-400 text-xs">
                  = 3 maná cualquiera + 1 rojo + 1 verde = 5 maná total
                </p>
              </div>
            </div>
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
                El TCG más emocionante de ESPAÑA, segun estudio de la universidad de Mascachuches.
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
            <p>&copy; 2024 Skibidi TCG. Hecho con ❤️ en ESPAÑA.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
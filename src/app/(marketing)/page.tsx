import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import Link from 'next/link';

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 to-yellow-50 dark:from-gray-900 dark:to-red-900">
      {/* Header */}
      <header className="border-b bg-white/50 backdrop-blur-sm dark:bg-gray-900/50 sticky top-0 z-50">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <h1 className="text-2xl font-bold bg-gradient-to-r from-red-600 to-yellow-600 bg-clip-text text-transparent">
              🃏 TCG Chetado
            </h1>
          </div>
          <div className="flex items-center space-x-4">
            <Button variant="ghost" asChild>
              <Link href="/login">Entrar</Link>
            </Button>
            <Button asChild className="bg-gradient-to-r from-red-500 to-yellow-500 hover:from-red-600 hover:to-yellow-600">
              <Link href="/login">Ser Pro</Link>
            </Button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-20 text-center">
        <div className="container mx-auto px-4 max-w-4xl">
          <h2 className="text-6xl font-bold mb-6 bg-gradient-to-r from-red-600 to-yellow-600 bg-clip-text text-transparent">
            ¡VAYA JUEGAZO! 🔥
          </h2>
          <p className="text-xl text-gray-600 dark:text-gray-300 mb-8 max-w-2xl mx-auto">
            El TCG más cachondo de España. Abre sobres, monta mazos épicos, 
            y compite con tus colegas usando cartas con humor español auténtico.
          </p>
          <div className="text-lg mb-6 space-y-2">
            <div>🇪🇸 100% Español de Verdad 🇪🇸</div>
            <div>😂 Humor Sin Censura 😂</div>
            <div>🃏 Cartas de Infarto 🃏</div>
          </div>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" asChild className="bg-gradient-to-r from-red-500 to-yellow-500 hover:from-red-600 hover:to-yellow-600 text-lg">
              <Link href="/login">¡EMPEZAR A JUGAR!</Link>
            </Button>
            <Button size="lg" variant="outline" asChild className="border-red-500 text-red-600 hover:bg-red-50">
              <Link href="#features">Ver las Cartas</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 bg-white/30 dark:bg-gray-800/30">
        <div className="container mx-auto px-4">
          <h3 className="text-4xl font-bold text-center mb-12">🔥 CARACTERÍSTICAS ÉPICAS 🔥</h3>
          <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            <Card className="text-center border-2 border-red-200 hover:border-red-400 transition-colors">
              <CardHeader>
                <div className="text-6xl mb-4">📦</div>
                <CardTitle className="text-red-600">Sobres Chetados</CardTitle>
                <CardDescription>
                  Abre sobres con humor español auténtico
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-600 dark:text-gray-300">
                  Cada sobre viene con cartas temáticas españolas: El Tío de la Vara, 
                  La Siesta Imparable, y otras que harán las partidas cachondas.
                </p>
              </CardContent>
            </Card>

            <Card className="text-center border-2 border-yellow-200 hover:border-yellow-400 transition-colors">
              <CardHeader>
                <div className="text-6xl mb-4">⚔️</div>
                <CardTitle className="text-yellow-600">Batallas Intensas</CardTitle>
                <CardDescription>
                  Combate con humor negro incluido
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-600 dark:text-gray-300">
                  Sistema de combate estratégico con cartas de efectos únicos, 
                  vaciles épicos y humor que solo entenderán tus colegas.
                </p>
              </CardContent>
            </Card>

            <Card className="text-center border-2 border-green-200 hover:border-green-400 transition-colors">
              <CardHeader>
                <div className="text-6xl mb-4">🛠️</div>
                <CardTitle className="text-green-600">Constructor Pro</CardTitle>
                <CardDescription>
                  Arma mazos de pura maldad
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-600 dark:text-gray-300">
                  Construye mazos temáticos: "La Cuadrilla", "Humor de Bar", 
                  "Vaciles Clásicos", y más categorías para crear estrategias únicas.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Card Preview */}
      <section className="py-20 bg-gradient-to-r from-red-100 to-yellow-100 dark:from-gray-800 dark:to-red-800">
        <div className="container mx-auto px-4 text-center">
          <h3 className="text-4xl font-bold mb-12">🃏 CARTAS DISPONIBLES 🃏</h3>
          <div className="grid md:grid-cols-4 gap-6 max-w-5xl mx-auto">
            <Card className="bg-gradient-to-b from-blue-200 to-blue-300 border-2 border-blue-400">
              <CardHeader className="pb-2">
                <div className="text-3xl">⚔️</div>
                <CardTitle className="text-sm">Guerrero Arcano</CardTitle>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="text-xs">Poder: 4/3</div>
                <div className="text-xs mt-1">Habilidad: Contraataque</div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-b from-green-200 to-green-300 border-2 border-green-400">
              <CardHeader className="pb-2">
                <div className="text-3xl">🌿</div>
                <CardTitle className="text-sm">Druida Ancestral</CardTitle>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="text-xs">Poder: 2/5</div>
                <div className="text-xs mt-1">Habilidad: Regeneración</div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-b from-purple-200 to-purple-300 border-2 border-purple-400">
              <CardHeader className="pb-2">
                <div className="text-3xl">🔮</div>
                <CardTitle className="text-sm">Mago Sombrio</CardTitle>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="text-xs">Poder: 3/2</div>
                <div className="text-xs mt-1">Habilidad: Drenar Vida</div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-b from-red-200 to-red-300 border-2 border-red-400">
              <CardHeader className="pb-2">
                <div className="text-3xl">🔥</div>
                <CardTitle className="text-sm">Dragón de Fuego</CardTitle>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="text-xs">Poder: 7/5</div>
                <div className="text-xs mt-1">Habilidad: Vuelo, Prisa</div>
              </CardContent>
            </Card>
          </div>
          
          <div className="mt-8">
            <h4 className="text-2xl font-bold mb-4 text-red-600">Tipos de Cartas</h4>
            <div className="grid md:grid-cols-3 gap-4 max-w-3xl mx-auto text-sm">
              <div className="bg-white/50 p-3 rounded">
                <strong>⚔️ Criaturas:</strong> Guerreros, Magos, Dragones, Bestias
              </div>
              <div className="bg-white/50 p-3 rounded">
                <strong>✨ Hechizos:</strong> Instantáneos, Encantamientos, Artefactos
              </div>
              <div className="bg-white/50 p-3 rounded">
                <strong>🏔️ Tierras:</strong> Generan maná para jugar otras cartas
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Game Modes Section */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <h3 className="text-4xl font-bold text-center mb-12">🎮 MODOS DE JUEGO 🎮</h3>
          <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            <Card className="border-2 border-red-200">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-red-600">
                  <span className="text-3xl">🏆</span>
                  Ranked
                </CardTitle>
                <CardDescription>
                  Compite por subir en las clasificaciones
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="list-disc list-inside space-y-2 text-sm">
                  <li>Sistema de emparejamiento por habilidad</li>
                  <li>Temporadas con recompensas exclusivas</li>
                  <li>Múltiples formatos competitivos</li>
                  <li>Torneos mensuales</li>
                </ul>
              </CardContent>
            </Card>

            <Card className="border-2 border-yellow-200">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-yellow-600">
                  <span className="text-3xl">🎯</span>
                  Casual
                </CardTitle>
                <CardDescription>
                  Juega sin presión de ranking
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="list-disc list-inside space-y-2 text-sm">
                  <li>Partidas relajadas con amigos</li>
                  <li>Práctica contra IA avanzada</li>
                  <li>Modo sandbox para probar mazos</li>
                  <li>Eventos semanales especiales</li>
                </ul>
              </CardContent>
            </Card>

            <Card className="border-2 border-green-200">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-green-600">
                  <span className="text-3xl">⚔️</span>
                  Draft
                </CardTitle>
                <CardDescription>
                  Construye tu mazo sobre la marcha
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="list-disc list-inside space-y-2 text-sm">
                  <li>Escoge cartas de sobres aleatorios</li>
                  <li>Estrategia adaptativa en tiempo real</li>
                  <li>Recompensas basadas en victorias</li>
                  <li>Nuevos draft cada semana</li>
                </ul>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-20 bg-gradient-to-r from-red-600 to-yellow-600 text-white">
        <div className="container mx-auto px-4 text-center">
          <h3 className="text-4xl font-bold mb-12">🔥 ÚNETE AL CAOS 🔥</h3>
          <div className="grid md:grid-cols-4 gap-8 max-w-4xl mx-auto">
            <div>
              <div className="text-4xl font-bold mb-2">420</div>
              <div className="text-red-100">Cartas Épicas</div>
            </div>
            <div>
              <div className="text-4xl font-bold mb-2">69</div>
              <div className="text-red-100">Jugadores Pro</div>
            </div>
            <div>
              <div className="text-4xl font-bold mb-2">1337</div>
              <div className="text-red-100">Roasts Brutales</div>
            </div>
            <div>
              <div className="text-4xl font-bold mb-2">∞</div>
              <div className="text-red-100">Nivel de Troleo</div>
            </div>
          </div>
        </div>
      </section>

      {/* Call to Action */}
      <section className="py-20">
        <div className="container mx-auto px-4 text-center">
          <div className="max-w-2xl mx-auto">
            <h3 className="text-4xl font-bold mb-6">¿Listo para la diversión total? 🎮</h3>
            <p className="text-lg text-gray-600 dark:text-gray-300 mb-8">
              Únete a la comunidad de TCG más divertida en español. 
              ¡Crea tu cuenta y recibe tu starter pack con memes épicos gratis!
            </p>
            <div className="text-2xl mb-6">
              🎮 GRATIS Y SIN LÍMITES 🎮
            </div>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" asChild className="bg-gradient-to-r from-red-500 to-yellow-500 hover:from-red-600 hover:to-yellow-600 text-lg">
                <Link href="/login">¡CREAR CUENTA YA!</Link>
              </Button>
              <Button size="lg" variant="outline" asChild className="border-red-500 text-red-600 hover:bg-red-50">
                <Link href="/login">Ya tengo cuenta</Link>
              </Button>
            </div>
            <p className="text-sm text-gray-500 mt-4">
              Gratis para siempre • Sin complicaciones • Contenido épico garantizado
            </p>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t bg-red-50 dark:bg-gray-900 py-12">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <h4 className="font-bold mb-4 bg-gradient-to-r from-red-600 to-yellow-600 bg-clip-text text-transparent">
                🃏 TCG Chetado
              </h4>
              <p className="text-sm text-gray-600 dark:text-gray-300">
                El TCG más divertido de Latinoamérica, con humor único entre amigos.
              </p>
            </div>
            <div>
              <h5 className="font-semibold mb-4">Juego</h5>
              <ul className="space-y-2 text-sm">
                <li><Link href="/login" className="text-gray-600 hover:text-red-600">Jugar Ahora</Link></li>
                <li><Link href="#features" className="text-gray-600 hover:text-red-600">Cartas Épicas</Link></li>
                <li><Link href="/login" className="text-gray-600 hover:text-red-600">Rankings</Link></li>
              </ul>
            </div>
            <div>
              <h5 className="font-semibold mb-4">Comunidad</h5>
              <ul className="space-y-2 text-sm">
                <li><a href="#" className="text-gray-600 hover:text-red-600">Discord Chetado</a></li>
                <li><a href="#" className="text-gray-600 hover:text-red-600">Reddit Brainrot</a></li>
                <li><a href="#" className="text-gray-600 hover:text-red-600">Telegram Troleo</a></li>
              </ul>
            </div>
            <div>
              <h5 className="font-semibold mb-4">Soporte</h5>
              <ul className="space-y-2 text-sm">
                <li><a href="#" className="text-gray-600 hover:text-red-600">Centro de Ayuda</a></li>
                <li><a href="#" className="text-gray-600 hover:text-red-600">Contacto</a></li>
                <li><a href="#" className="text-gray-600 hover:text-red-600">Reportar Bugs</a></li>
              </ul>
            </div>
          </div>
          <div className="border-t mt-8 pt-8 text-center text-sm text-gray-600 dark:text-gray-300">
            <p>&copy; 2024 TCG Chetado. Construido para panas que entienden el humor sin filtro.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
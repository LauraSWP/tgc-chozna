'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { supabase } from '@/lib/supabaseClient';
import { getAppUrl } from '@/lib/utils';
import Link from 'next/link';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [username, setUsername] = useState('');
  const [isLogin, setIsLogin] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [emailPlaceholder, setEmailPlaceholder] = useState('staresgay@factos.com');
  const router = useRouter();

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    // Validación de contraseña idiota
    if (password === '123456') {
      setEmailPlaceholder('Te dije que no sea 123456 IMBÉCIL');
      setError('En serio... ¿123456? ¿Esa es tu contraseña?');
      setIsLoading(false);
      return;
    }

    try {
      if (isLogin) {
        // Login
        const { data, error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });

        if (error) throw error;

        if (data.user) {
          router.push('/dashboard');
        }
      } else {
        // Sign up
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: {
              username,
            },
          },
        });

        if (error) throw error;

        if (data.user) {
          // Update profile with username
          await supabase
            .from('profiles')
            .upsert({
              id: data.user.id,
              username,
            });

          router.push('/dashboard');
        }
      }
    } catch (error: any) {
      setError(error.message || 'Error tío, algo ha petado');
    } finally {
      setIsLoading(false);
    }
  };



  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 to-yellow-50 dark:from-gray-900 dark:to-red-900 flex items-center justify-center p-4">
      <div className="w-full max-w-md space-y-6">
        {/* Header */}
        <div className="text-center">
          <Link href="/" className="inline-block">
            <h1 className="text-4xl font-bold bg-gradient-to-r from-red-600 to-yellow-600 bg-clip-text text-transparent">
              🃏 TCG Chetado
            </h1>
          </Link>
          <p className="text-gray-600 dark:text-gray-300 mt-2 text-lg">
            {isLogin ? '¡Buenas, máquina! 💀' : '¡Únete al cachondeo! 🔥'}
          </p>
        </div>

        {/* Auth Form */}
        <Card className="border-2 border-red-200">
          <CardHeader>
            <CardTitle className="text-center text-red-600">
              {isLogin ? '🚪 Entrar al Caos' : '👑 Crear Cuenta Pro'}
            </CardTitle>
            <CardDescription className="text-center">
              {isLogin 
                ? 'Mete tus datos para entrar al desmadre'
                : 'Crea tu cuenta para empezar a trollear'
              }
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <form onSubmit={handleAuth} className="space-y-4">
              {!isLogin && (
                <div>
                  <label htmlFor="username" className="block text-sm font-medium mb-1">
                    Nombre de Usuario (Sin tonterías)
                  </label>
                  <input
                    id="username"
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    required={!isLogin}
                    className="w-full border-2 border-red-200 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
                    placeholder="Ej: ElTioDeLaVara"
                  /> 
                </div>
              )}
              
              <div>
                <label htmlFor="email" className="block text-sm font-medium mb-1">
                  Email (Que funcione)
                </label>
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="w-full border-2 border-red-200 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
                  placeholder={emailPlaceholder}
                />
              </div>

              <div>
                <label htmlFor="password" className="block text-sm font-medium mb-1">
                  Contraseña (Que no sea 123456)
                </label>
                <input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="w-full border-2 border-red-200 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
                  placeholder="Mínimo6caracteres"
                  minLength={6}
                />
              </div>

              {error && (
                <div className="text-red-600 text-sm bg-red-50 dark:bg-red-900/20 p-3 rounded-md border-l-4 border-red-500">
                  💀 {error}
                </div>
              )}

              <Button
                type="submit"
                className="w-full bg-gradient-to-r from-red-500 to-yellow-500 hover:from-red-600 hover:to-yellow-600 text-white font-bold text-lg"
                disabled={isLoading}
              >
                {isLoading ? '⏳ Cargando...' : (isLogin ? '🚀 ¡ENTRAR AL CAOS!' : '🎯 ¡CREAR CUENTA PRO!')}
              </Button>
            </form>

            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t border-red-300" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-background px-2 text-muted-foreground font-bold">O si tienes hueva</span>
              </div>
            </div>

            {/* Guest Option */}
            <div className="space-y-2">
              <Button
                variant="outline"
                className="w-full border-2 border-yellow-300 text-yellow-600 hover:bg-yellow-50 font-bold"
                onClick={handleGuestPlay}
              >
                🎮 Jugar como Invitado (Modo Fantasma)
              </Button>
            </div>

            {/* Toggle Login/Signup */}
            <div className="text-center text-sm">
              {isLogin ? (
                <span>
                  ¿No tienes cuenta aún?{' '}
                  <button
                    type="button"
                    onClick={() => setIsLogin(false)}
                    className="text-red-600 hover:underline font-bold"
                  >
                    ¡Crear una ya!
                  </button>
                </span>
              ) : (
                <span>
                  ¿Ya tienes cuenta?{' '}
                  <button
                    type="button"
                    onClick={() => setIsLogin(true)}
                    className="text-red-600 hover:underline font-bold"
                  >
                    Entrar como pro
                  </button>
                </span>
              )}
            </div>


          </CardContent>
        </Card>

        {/* Back to Home */}
        <div className="text-center">
          <Link href="/" className="text-sm text-gray-600 hover:text-red-600 dark:text-gray-400 dark:hover:text-red-400 font-medium">
            ← Regresar al inicio
          </Link>
        </div>
      </div>
    </div>
  );
}
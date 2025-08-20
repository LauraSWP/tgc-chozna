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
  const [usernameValidation, setUsernameValidation] = useState('');
  const [showUsernameConfirm, setShowUsernameConfirm] = useState(false);
  const router = useRouter();

  const validateUsername = (name: string) => {
    if (!name || name.length < 3) return '';
    
    const lowercaseName = name.toLowerCase();
    
    // Lista de nombres cuestionables
    const questionableNames = [
      'admin', 'root', 'god', 'señor', 'jefe', 'rey', 'emperador',
      'crack', 'pro', 'master', 'legend', 'boss', 'champion',
      'destroyer', 'killer', 'dark', 'shadow', 'demon', 'death',
      'angel', 'hero', 'warrior', 'fighter', 'slayer',
      'xxxx', '123', 'gamer', 'player', 'user', 'noob'
    ];

    const cringe = questionableNames.some(bad => lowercaseName.includes(bad));
    
    if (cringe) {
      return `¿En serio? ¿${name}? Bueno, si a ti te gusta...`;
    } else if (name.length > 15) {
      return `${name} está un poco largo, ¿no? Pero bueno...`;
    } else if (/^\d+$/.test(name)) {
      return `¿Solo números? ¿${name}? Vale, tú sabrás...`;
    } else if (name.includes('_') && name.split('_').length > 3) {
      return `Muchas rayitas bajas ahí, ${name}, pero vale...`;
    } else {
      return `${name}... no está mal, supongo.`;
    }
  };

  const handleUsernameChange = (value: string) => {
    setUsername(value);
    const validation = validateUsername(value);
    setUsernameValidation(validation);
    setShowUsernameConfirm(validation !== '' && value.length >= 3);
  };

  const handlePasswordChange = (value: string) => {
    setPassword(value);
    // Reset email placeholder to default when password changes
    if (value !== '123456' && value !== '654321') {
      setEmailPlaceholder('staresgay@factos.com');
    }
  };

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    // Validación de contraseñas idiotas
    if (password === '123456') {
      setEmailPlaceholder('Te dije que no sea 123456 IMBÉCIL');
      setError('En serio... ¿123456? ¿Esa es tu contraseña?');
      setIsLoading(false);
      return;
    }

    if (password === '654321') {
      setEmailPlaceholder('Eso tampoco te va a funcionar IMBÉCIL');
      setError('Eso tampoco te va a funcionar IMBÉCIL');
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
            {isLogin ? '¡Buenas, máquina!' : 'Crea tu cuenta'}
          </p>
        </div>

        {/* Auth Form */}
        <Card className="border-2 border-red-200">
          <CardHeader>
            <CardTitle className="text-center text-red-600">
              {isLogin ? '🚪 Entrar' : '👑 Crear Cuenta'}
            </CardTitle>
            <CardDescription className="text-center">
              {isLogin 
                ? 'Mete tus datos para entrar'
                : 'Crea tu cuenta para empezar'
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
                    onChange={(e) => handleUsernameChange(e.target.value)}
                    required={!isLogin}
                    className="w-full border-2 border-red-200 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
                    placeholder="Ej: ElTioDeLaVara"
                  />
                  
                  {/* Username Validation */}
                  {usernameValidation && (
                    <div className="mt-2 p-3 bg-yellow-50 border border-yellow-200 rounded-md">
                      <p className="text-sm text-yellow-800 mb-2">
                        {usernameValidation}
                      </p>
                      {showUsernameConfirm && (
                        <div className="flex gap-2">
                          <button
                            type="button"
                            onClick={() => {
                              setUsernameValidation('');
                              setShowUsernameConfirm(false);
                            }}
                            className="px-3 py-1 bg-green-500 text-white rounded text-xs hover:bg-green-600"
                          >
                            ✓ Vale, acepto
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              setUsername('');
                              setUsernameValidation('');
                              setShowUsernameConfirm(false);
                            }}
                            className="px-3 py-1 bg-red-500 text-white rounded text-xs hover:bg-red-600"
                          >
                            ✗ Cambiar
                          </button>
                        </div>
                      )}
                    </div>
                  )}
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
                  onChange={(e) => handlePasswordChange(e.target.value)}
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
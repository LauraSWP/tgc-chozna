import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/auth';

export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get('code');

  if (code) {
    const supabase = await createClient();
    const { data, error } = await supabase.auth.exchangeCodeForSession(code);
    
    if (error) {
      console.error('Error exchanging code for session:', error);
      return NextResponse.redirect(new URL('/login?error=auth_error', requestUrl.origin));
    }

    // Si el usuario se acaba de registrar, crear perfil
    if (data.user && data.user.email_confirmed_at) {
      try {
        // Intentar crear/actualizar el perfil
        const { error: profileError } = await supabase
          .from('profiles')
          .upsert({
            id: data.user.id,
            username: data.user.user_metadata?.username || 'Usuario',
            email: data.user.email,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          }, {
            onConflict: 'id'
          });

        if (profileError) {
          console.error('Error creating profile:', profileError);
        }
      } catch (err) {
        console.error('Error in profile creation:', err);
      }
    }
  }

  // Redirect to dashboard after successful authentication
  return NextResponse.redirect(new URL('/dashboard', requestUrl.origin));
}

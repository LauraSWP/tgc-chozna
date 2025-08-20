-- Función para crear automáticamente un perfil cuando se registra un usuario
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.profiles (id, username, created_at, updated_at)
  VALUES (
    new.id,
    COALESCE(new.raw_user_meta_data->>'username', 'Usuario'),
    now(),
    now()
  )
  ON CONFLICT (id) DO UPDATE SET
    username = COALESCE(new.raw_user_meta_data->>'username', profiles.username),
    updated_at = now();
  
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger que se ejecuta cuando se confirma un usuario
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT OR UPDATE OF email_confirmed_at ON auth.users
  FOR EACH ROW WHEN (NEW.email_confirmed_at IS NOT NULL)
  EXECUTE PROCEDURE public.handle_new_user();

-- Asegurar que el trigger funcione para usuarios existentes que se confirmen
UPDATE auth.users 
SET email_confirmed_at = email_confirmed_at 
WHERE email_confirmed_at IS NOT NULL 
AND id NOT IN (SELECT id FROM public.profiles);

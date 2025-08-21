# 🚀 Despliegue a Producción - TCG

## 📋 Pasos para Despliegue Completo

### 1. 🗄️ Configurar Base de Datos en Supabase

#### A) Ejecutar Script de Seeding
1. Ve a tu proyecto de Supabase (https://supabase.com/dashboard)
2. Navega a **SQL Editor**
3. Copia y pega el contenido completo de `complete_seed.sql`
4. Ejecuta el script (presiona **RUN** o Ctrl+Enter)
5. Verifica que se crearon las cartas:
   ```sql
   SELECT COUNT(*) FROM card_definitions;
   -- Debería mostrar 32 cartas
   ```

#### B) Verificar Configuración de Autenticación
1. Ve a **Authentication > Settings**
2. Asegúrate de que **Email confirmation** esté habilitado
3. Configura las **URLs de redirect** para tu dominio de producción

### 2. ⚡ Desplegar Edge Function

#### A) Instalar CLI de Supabase (si no lo tienes)
```bash
npm install -g supabase
```

#### B) Iniciar sesión y vincular proyecto
```bash
# Iniciar sesión
supabase login

# Vincular a tu proyecto (reemplaza con tu Project ID)
supabase link --project-ref your-project-id
```

#### C) Desplegar la función
```bash
# Desde la raíz de tu proyecto
supabase functions deploy open_pack

# Verificar que se desplegó correctamente
supabase functions list
```

#### D) Verificar la función
```bash
# Hacer una prueba básica
curl -X POST 'https://your-project-id.supabase.co/functions/v1/open_pack' \
  -H "Authorization: Bearer YOUR_ANON_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "userId": "test-user-id",
    "setCode": "BASE",
    "quantity": 1
  }'
```

### 3. 🌐 Variables de Entorno

Asegúrate de tener estas variables configuradas:

#### Para Desarrollo Local (.env.local)
```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
```

#### Para Producción (Vercel/Netlify)
- Agrega las mismas variables en tu plataforma de hosting
- **IMPORTANTE**: Nunca expongas el `SERVICE_ROLE_KEY` en el frontend

### 4. 🔐 Configurar Row Level Security (RLS)

#### Verificar Políticas de Seguridad
```sql
-- Verificar que RLS está habilitado
SELECT schemaname, tablename, rowsecurity 
FROM pg_tables 
WHERE schemaname = 'public' 
AND rowsecurity = true;

-- Si alguna tabla no tiene RLS habilitado:
ALTER TABLE table_name ENABLE ROW LEVEL SECURITY;
```

#### Políticas Importantes
```sql
-- Política para user_cards: Solo el propietario puede ver sus cartas
CREATE POLICY "Users can view own cards" ON user_cards
  FOR SELECT USING (auth.uid() = owner);

-- Política para user_currencies: Solo el propietario puede ver su dinero
CREATE POLICY "Users can view own currency" ON user_currencies
  FOR SELECT USING (auth.uid() = user_id);

-- Las card_definitions pueden ser vistas por todos (cartas públicas)
CREATE POLICY "Anyone can view active cards" ON card_definitions
  FOR SELECT USING (is_active = true);
```

### 5. 📱 Configurar PWA (Opcional)

#### A) Verificar Manifest
- El archivo `public/manifest.webmanifest` ya está configurado
- Personaliza iconos en `public/icons/`

#### B) Service Worker
- Next.js maneja automáticamente el caching básico
- Para funcionalidad offline avanzada, considera `next-pwa`

### 6. 🚀 Desplegar Aplicación

#### Opción A: Vercel (Recomendado)
```bash
# Instalar Vercel CLI
npm i -g vercel

# Desplegar
vercel

# Configurar variables de entorno en Vercel Dashboard
```

#### Opción B: Netlify
```bash
# Construir para producción
npm run build

# Subir dist/ a Netlify
# O conectar repositorio GitHub con auto-deploy
```

### 7. 🔍 Testing en Producción

#### A) Verificar Funcionalidades Críticas
1. **Registro/Login de usuarios** ✅
2. **Apertura de sobres** ✅
3. **Gestión de cartas (admin)** ✅
4. **Vista previa de cartas** ✅

#### B) Scripts de Testing
```javascript
// Test pack opening
const testPackOpening = async () => {
  const response = await fetch('/api/packs/open', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      set_code: 'BASE',
      quantity: 1
    })
  });
  
  const result = await response.json();
  console.log('Pack opened:', result);
};
```

### 8. 📊 Monitoreo y Analytics

#### A) Configurar Logs
- Los logs de Edge Functions aparecen en Supabase Dashboard
- Los errores de Next.js van a Vercel Dashboard

#### B) Métricas Importantes
- **Tasa de apertura de sobres**
- **Registros de usuarios**
- **Errores de API**
- **Tiempo de respuesta**

### 9. 🔄 Actualizaciones Futuras

#### A) Nuevas Cartas
```sql
-- Agregar nuevas cartas directamente en Supabase
INSERT INTO card_definitions (set_id, name, rarity_id, ...) 
VALUES (...);
```

#### B) Nuevos Sets
```sql
-- Crear nuevo set
INSERT INTO card_sets (code, name, description) 
VALUES ('EXP', 'Expansión 1', 'Primera expansión');

-- Configurar sobres para el nuevo set
INSERT INTO pack_configs (set_id, name, total_cards, price_coins)
VALUES ((SELECT id FROM card_sets WHERE code = 'EXP'), 'Sobre Expansión', 15, 200);
```

### 10. 🚨 Solución de Problemas Comunes

#### Error: "Function not found"
```bash
# Re-desplegar función
supabase functions deploy open_pack --no-verify-jwt
```

#### Error: "Insufficient coins"
```sql
-- Dar monedas a un usuario para testing
UPDATE user_currencies 
SET coins = 10000 
WHERE user_id = 'user-id-here';
```

#### Error: "No cards available"
```sql
-- Verificar que las cartas están activas
SELECT COUNT(*) FROM card_definitions WHERE is_active = true;
```

---

## ✅ Checklist Final

- [ ] ✅ Base de datos seeded con 32 cartas
- [ ] ✅ Edge Function desplegada y funcionando
- [ ] ✅ Variables de entorno configuradas
- [ ] ✅ RLS habilitado y políticas configuradas
- [ ] ✅ Aplicación desplegada en Vercel/Netlify
- [ ] ✅ Testing básico completado
- [ ] ✅ Monitoreo configurado

¡Tu TCG está listo para producción! 🎉

## 📞 Soporte

Si encuentras problemas:
1. Revisa los logs en Supabase Dashboard
2. Verifica las variables de entorno
3. Comprueba que todas las migraciones se ejecutaron
4. Testea la Edge Function directamente

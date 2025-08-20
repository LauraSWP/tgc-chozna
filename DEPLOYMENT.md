# 🚀 Deployment Guide - My TCG

## NEXT_PUBLIC_APP_URL Explanation

The `NEXT_PUBLIC_APP_URL` environment variable is used for:

1. **OAuth Redirects**: When users sign in with Google OAuth, Supabase needs to know where to redirect them after authentication
2. **Edge Function Callbacks**: Some Supabase Edge Functions need to make callbacks to your app
3. **Absolute URLs**: For generating absolute URLs in emails, sharing links, etc.
4. **CORS Configuration**: Some API endpoints may need to validate the origin

### Values by Environment:

- **Development**: `http://localhost:3000`
- **Production (Vercel)**: `https://your-app-name.vercel.app`

## 🔧 Vercel Deployment Setup

### 1. Prepare Your Repository

Make sure you have committed all your changes:
```bash
git add .
git commit -m "Complete TCG application with admin dashboard"
git push origin main
```

### 2. Deploy to Vercel

1. Go to [vercel.com](https://vercel.com)
2. Sign in with GitHub
3. Click "New Project"
4. Import your `tgc-chozna` repository
5. Configure the deployment:

### 3. Environment Variables in Vercel

Add these environment variables in your Vercel project settings:

```env
# Supabase Configuration (copy from your .env.local)
NEXT_PUBLIC_SUPABASE_URL=https://qczeryvxhzoeukytoukl.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFjemVyeXZ4aHpvZXVreXRvdWtsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTU2Nzg1MjIsImV4cCI6MjA3MTI1NDUyMn0.QBXesQkHbIMVYMJ4-bNNKOKPaPEC4hzybsXwFYo2mZ4
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFjemVyeXZ4aHpvZXVreXRvdWtsIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NTY3ODUyMiwiZXhwIjoyMDcxMjU0NTIyfQ._XLW5SF657AyJxfmHvKLkRE77ScwU_Sv23uE3F3R2T4

# App Configuration (this will be your actual Vercel URL)
NEXT_PUBLIC_APP_URL=https://your-app-name.vercel.app
```

**Important**: Replace `your-app-name.vercel.app` with your actual Vercel deployment URL.

### 4. Configure Supabase for Production

After your first deployment, you'll get a Vercel URL like `https://tgc-chozna.vercel.app`. You need to:

1. **Update OAuth Settings** in Supabase:
   - Go to Authentication > Settings in your Supabase dashboard
   - Add your Vercel URL to "Site URL"
   - Add `https://your-app-name.vercel.app/auth/callback` to "Redirect URLs"

2. **Update CORS Settings** (if needed):
   - Most settings should work automatically
   - Add your domain to any CORS configurations

### 5. Deploy Edge Functions

If you want to use the pack opening Edge Function:

```bash
# Install Supabase CLI if you haven't
npm install -g supabase

# Login to Supabase
supabase login

# Link your project
supabase link --project-ref qczeryvxhzoeukytoukl

# Deploy the edge function
supabase functions deploy open_pack
```

### 6. Database Setup

Your database is already configured in Supabase, but make sure:

1. **Run Migrations**: Apply the SQL files in your Supabase dashboard:
   - `supabase/migrations/000_init.sql`
   - `supabase/migrations/001_seed.sql`

2. **Seed Data**: Run the seeding script:
   ```bash
   # If you have Supabase CLI linked
   npx ts-node tools/seed.ts
   ```

## 🛠️ Post-Deployment Checklist

### ✅ Test Core Features:

1. **Authentication**:
   - [ ] Email/password signup
   - [ ] Google OAuth (if configured)
   - [ ] Guest login

2. **Pack Opening**:
   - [ ] Purchase packs with coins
   - [ ] Pack animation works
   - [ ] Cards are added to collection

3. **Deck Building**:
   - [ ] Create new decks
   - [ ] Add/remove cards
   - [ ] Deck validation

4. **Admin Dashboard** (for admin users):
   - [ ] Card management
   - [ ] User management
   - [ ] Create new cards

### 🔐 Security Checklist:

- [ ] Environment variables are set correctly
- [ ] Admin role is properly protected
- [ ] RLS policies are active
- [ ] OAuth redirects are configured

### 📱 Performance Checklist:

- [ ] PWA manifest loads correctly
- [ ] Images are optimized
- [ ] Page load times are acceptable
- [ ] Mobile responsive design works

## 🚨 Common Issues & Solutions

### Issue 1: OAuth Redirect Error
**Solution**: Make sure your Vercel URL is added to Supabase redirect URLs

### Issue 2: Edge Function Not Working
**Solution**: Deploy edge functions separately and check Supabase function logs

### Issue 3: Database Connection Error
**Solution**: Verify environment variables match your Supabase project

### Issue 4: Admin Dashboard Access Denied
**Solution**: Manually set a user's role to 'admin' in Supabase database

```sql
-- Run in Supabase SQL editor
UPDATE profiles 
SET role = 'admin' 
WHERE id = 'your-user-id-here';
```

## 🎯 Post-Launch Improvements

1. **Custom Domain**: Set up a custom domain in Vercel
2. **Analytics**: Add analytics tracking
3. **Monitoring**: Set up error monitoring (Sentry, LogRocket)
4. **Performance**: Add performance monitoring
5. **SEO**: Optimize meta tags and OpenGraph
6. **CDN**: Optimize static assets

## 📊 Monitoring Your App

### Vercel Analytics
- Enable Vercel Analytics in your dashboard
- Monitor page views, performance, and user behavior

### Supabase Monitoring
- Check database performance in Supabase dashboard
- Monitor Edge Function execution logs
- Track API usage and quotas

### User Feedback
- Monitor user registrations and activity
- Check for error patterns in game logs
- Gather feedback on card balance and gameplay

---

Your TCG is now ready for the world! 🃏🚀

The enhanced admin dashboard gives you complete control over:
- **Card Management**: Create, edit, and manage all game cards
- **User Management**: Monitor users, assign roles, give rewards
- **Effect System**: Visual editor for complex card effects
- **Real-time Monitoring**: Track game statistics and performance

Have fun managing your TCG empire! 👑

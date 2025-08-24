# 🃏 My TCG - Project Structure

This document outlines the complete structure of the My TCG project, detailing the purpose and contents of each file and directory.

## 📁 Root Structure

```
my-tcg/
├── src/                       # Source code directory
├── supabase/                  # Database and backend functions
├── tools/                     # Development and deployment tools
├── public/                    # Static assets and PWA files
├── package.json               # Project dependencies and scripts
├── next.config.mjs           # Next.js configuration
├── tailwind.config.ts        # Tailwind CSS configuration
├── tsconfig.json             # TypeScript configuration
├── postcss.config.mjs        # PostCSS configuration
├── .eslintrc.cjs             # ESLint configuration
├── vercel.json               # Vercel deployment configuration
├── env.example               # Environment variables template
└── README.md                 # Project documentation
```

## 📂 Source Directory (`src/`)

### Application Structure (`src/app/`)
Built using Next.js 13+ App Router with route groups for organization:

```
src/app/
├── layout.tsx                # Root layout component
├── (marketing)/              # Public marketing pages
│   └── page.tsx              # Landing page
├── (auth)/                   # Authentication pages
│   ├── login/page.tsx        # Login/signup page
│   └── callback/route.ts     # OAuth callback handler
├── (app)/                    # Protected application pages
│   ├── layout.tsx            # App layout with navigation
│   ├── dashboard/page.tsx    # User dashboard
│   ├── collection/page.tsx   # Card collection viewer with filtering & search
│   ├── decks/page.tsx       # Deck management with full deck builder
│   ├── shop/page.tsx        # Pack opening shop with animations
│   ├── play/page.tsx        # Game lobby (placeholder)
│   └── admin/               # Admin management tools
│       ├── page.tsx         # Admin dashboard
│       ├── cards/           # Card management
│       │   ├── page.tsx     # Card list management
│       │   └── new/page.tsx # Create new card
│       ├── users/page.tsx   # User management
│       ├── shop/page.tsx    # Shop management (placeholder)
│       ├── analytics/page.tsx # Analytics dashboard (placeholder)
│       ├── matches/page.tsx # Match management (placeholder)
│       └── system/page.tsx  # System tools (placeholder)
└── api/                     # API endpoints
    ├── collection/route.ts  # User collection management API
    ├── decks/              # Deck management APIs
    │   ├── route.ts        # List/create decks
    │   └── [id]/route.ts   # Specific deck CRUD operations
    ├── packs/open/route.ts # Pack opening API (App Router)
    └── open-pack-direct.ts # Direct pack opening API (Pages Router)
```

### Components (`src/components/`)
Reusable React components organized by purpose:

```
src/components/
├── ui/                      # Base UI components (shadcn/ui)
│   ├── button.tsx          # Button component
│   ├── card.tsx            # Card container component
│   └── ...                 # Other UI primitives
├── admin/                   # Admin-specific components
│   ├── CardEditor.tsx      # Card creation/editing interface
│   ├── CardManagementClient.tsx # Card management interface
│   ├── CardPreview.tsx     # Card preview component
│   └── UserManagementClient.tsx # User management interface
├── AppNavigation.tsx       # Main app navigation bar
├── CardView.tsx           # Individual card display
├── MagicCard.tsx          # Magic card rendering component
├── PackOpeningAnimation.tsx # Epic pack opening with 3D effects & particles
├── CollectionClient.tsx   # Collection viewing with search, filters & stats
├── DeckBuilderClient.tsx  # Complete deck management interface
└── DeckBuilder.tsx        # Core deck building logic component
```

### Library Code (`src/lib/`)
Core application logic and utilities:

```
src/lib/
├── game/                   # Game engine and logic
│   ├── engine/            # Core game mechanics
│   │   ├── state.ts       # Game state management
│   │   ├── stack.ts       # Effect stack handling
│   │   ├── resolver.ts    # Effect resolution
│   │   ├── turn.ts        # Turn and phase management
│   │   └── rules.ts       # Rule enforcement
│   ├── effects/           # Card effect implementations
│   │   └── index.ts       # All effect operations
│   ├── types.ts           # Game type definitions
│   └── constants.ts       # Game constants and rules
├── db/                    # Database interaction
│   ├── queries.ts         # Typed database queries
│   └── policy.ts          # RLS policy utilities
├── auth.ts                # Authentication utilities
├── supabaseClient.ts      # Supabase client setup
├── validate.ts            # Input validation schemas
├── rng.ts                 # Random number generation
└── utils.ts               # General utility functions
```

### Styles (`src/styles/`)
```
src/styles/
└── globals.css            # Global styles and Tailwind setup
```

## 🗄️ Database (`supabase/`)

### Migrations (`supabase/migrations/`)
Database schema definitions in SQL:

```
supabase/migrations/
├── 000_init.sql           # Main schema with tables and RLS
└── 001_seed.sql           # Basic seed data (rarities, sets)
```

**Key Tables:**
- `profiles` - User profiles linked to auth.users
- `card_sets` - Card set definitions (Base Set, etc.)
- `rarities` - Rarity definitions (common, rare, mythic, etc.)
- `card_definitions` - Master card catalog with effects
- `pack_configs` - Pack type configurations
- `pack_slots` - Pack slot definitions (rarity pools)
- `user_cards` - User-owned card instances
- `decks` - User deck definitions
- `deck_cards` - Cards in decks with quantities
- `matches` - Game match instances
- `match_players` - Players in matches
- `user_currencies` - Virtual currency balances
- `transactions` - Currency transaction log
- `trades` - Card trading between users

### Edge Functions (`supabase/functions/`)
Serverless functions for secure operations:

```
supabase/functions/
└── open_pack/             # Pack opening logic
    ├── index.ts           # Main function (Deno)
    └── deno.json          # Deno configuration
```

### Types (`supabase/types.ts`)
Generated TypeScript types from database schema.

## 🛠️ Tools (`tools/`)

```
tools/
└── seed.ts                # Card database seeding script
```

**Seeding Script Features:**
- 32+ unique programming-themed cards
- Balanced rarity distribution
- Fun flavor text and inside jokes
- Complex effect examples
- Special legendary cards

## 🌐 Public Assets (`public/`)

```
public/
├── icons/                 # PWA icons (various sizes)
├── screenshots/           # App screenshots for PWA
└── manifest.webmanifest   # PWA manifest
```

## 🎮 Game Features Implemented

### ✅ Completed Features
1. **User Authentication**
   - Email/password signup/login
   - OAuth (Google) support
   - Guest play mode
   - Row-level security

2. **Card System**
   - 32+ unique cards with programming theme
   - Rarity system (Common → Mythic)
   - Foil variants with visual effects
   - Complex effect DSL system

3. **Pack Opening** ✨
   - Realistic booster simulation with proper RNG
   - Configurable pack contents via database
   - Pity timer for rare cards
   - Epic animated opening experience with:
     * 3D pack rotation and explosion effects
     * Card reveal animations with face-down cards
     * Screen shake for mythic/foil reveals
     * Particle systems with rarity-based colors
     * Hover effects with enhanced glow
     * Click-to-reveal interaction
     * Card zoom modal for detailed viewing

4. **Collection Management** ✨
   - Personal card collection with complete database integration
   - Advanced search and filtering (name, type, rarity, foils)
   - Collection statistics dashboard (unique cards, totals, rarity breakdown)
   - Card detail modals with full information
   - Rarity indicators and foil tracking
   - Sort by name, rarity, acquisition date, or quantity
   - **Database Integration**: Complete API with proper field mapping and array handling

5. **Deck Building** ✨
   - Complete visual deck builder interface
   - Full deck CRUD operations (create, read, update, delete)
   - Format validation with real-time feedback
   - Card quantity management with deck limits
   - Mainboard/sideboard support
   - Deck list management with summary statistics
   - Collection integration (only use owned cards)
   - **Database Integration**: Complete API with proper field mapping and array handling

6. **Game Engine**
   - Turn-based structure
   - Priority system
   - Effect stack (Magic-like)
   - State-based actions
   - Trigger system

7. **UI/UX**
   - Responsive design
   - Dark mode support
   - PWA capabilities
   - Touch-friendly interface

### 🚧 In Progress
- Multiplayer match system
- Real-time game state sync
- Advanced admin tools

### 📋 Planned Features
- Tournament system
- Card trading interface
- Achievement system
- More card sets
- Mobile app (React Native)

## 🔧 Technical Architecture

### Frontend
- **Framework**: Next.js 14 with App Router
- **Styling**: Tailwind CSS with custom components
- **State Management**: React hooks + Supabase real-time
- **TypeScript**: Full type safety throughout
- **PWA**: Offline support and mobile installation

### Backend
- **Database**: PostgreSQL via Supabase
- **Authentication**: Supabase Auth with RLS
- **API**: Next.js API routes + Supabase Edge Functions
- **Real-time**: Supabase real-time subscriptions
- **Security**: Row-level security policies

### Deployment
- **Hosting**: Vercel for frontend and API routes
- **Configuration**: `vercel.json` for optimized Vercel deployment
- **Build Optimization**: SWC minification for production
- **Functions**: Serverless API routes with Node.js runtime

### Game Engine
- **Architecture**: Pure functions with immutable state
- **Effects**: JSON-based DSL for card abilities
- **Validation**: Comprehensive rule checking
- **Extensibility**: Easy to add new mechanics

## 📊 Database Schema Highlights

### Card Effect System
Cards use a flexible JSON-based effect system:

```typescript
interface CardRules {
  static?: EffectOp[];      // Permanent effects
  on_play?: EffectOp[];     // When spell is cast
  on_enter?: EffectOp[];    // When permanent enters
  activated?: {             // Activated abilities
    cost: string;
    effects: EffectOp[];
  }[];
  triggers?: {              // Triggered abilities
    condition: TriggerCondition;
    effects: EffectOp[];
  }[];
}
```

### Security Model
- All user data protected by RLS policies
- API routes validate user permissions
- Edge functions use service role key securely
- No direct database access from client

## 🎯 Development Workflow

1. **Database Changes**: Add migration SQL files
2. **New Features**: Implement in isolated components
3. **Game Logic**: Add to engine with proper typing
4. **Cards**: Add to seed script with effects
5. **Testing**: Manual testing in development
6. **Deployment**: Automatic via Vercel/Supabase

## 📈 Performance Optimizations

- **Images**: Optimized with Next.js Image component
- **Bundle**: Code splitting with dynamic imports
- **Database**: Indexed queries and efficient JOINs
- **Caching**: Static generation where possible
- **Real-time**: Selective subscriptions

This project demonstrates a complete modern web application with complex game logic, real-time features, and a scalable architecture suitable for a production TCG platform.

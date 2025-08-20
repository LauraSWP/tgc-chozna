# 🃏 My TCG - Trading Card Game

A modern web-based trading card game built with Next.js and Supabase, featuring programming-themed cards, strategic gameplay, and a comprehensive collection system.

## ✨ Features

### 🎮 Core Gameplay
- **Pack Opening**: Realistic booster pack simulation with rarities and foil chances
- **Deck Building**: Comprehensive deck builder with format validation
- **Strategic Combat**: Turn-based battles with stack-based spell resolution
- **Collection Management**: Track your cards with detailed statistics

### 🛠️ Technical Features
- **Modern Stack**: Next.js 14, TypeScript, Tailwind CSS, Supabase
- **Real-time**: Multiplayer support with real-time updates
- **PWA**: Progressive Web App for mobile installation
- **Responsive**: Works beautifully on desktop and mobile
- **Secure**: Row-level security with Supabase authentication

### 🎨 Content
- **40+ Unique Cards**: Programming-themed cards with inside jokes
- **Multiple Rarities**: Common, Uncommon, Rare, Mythic, and Land cards
- **Special Effects**: Complex card interactions and triggered abilities
- **Foil Cards**: Rare foil variants with visual effects

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ 
- A Supabase project
- pnpm, yarn, or npm

### Setup

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd my-tcg
   ```

2. **Install dependencies**
   ```bash
   pnpm install
   # or yarn install
   # or npm install
   ```

3. **Environment Setup**
   ```bash
   cp env.example .env.local
   ```
   
   Fill in your Supabase credentials:
   ```env
   NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
   SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key
   NEXT_PUBLIC_APP_URL=http://localhost:3000
   ```

4. **Database Setup**
   ```bash
   # Run migrations (if using Supabase CLI)
   supabase db push
   
   # Or apply the SQL files manually in your Supabase dashboard:
   # 1. supabase/migrations/000_init.sql
   # 2. supabase/migrations/001_seed.sql
   ```

5. **Seed the Database**
   ```bash
   pnpm run db:seed
   ```

6. **Deploy Edge Functions** (Optional)
   ```bash
   supabase functions deploy open_pack
   ```

7. **Start Development Server**
   ```bash
   pnpm dev
   ```

Visit `http://localhost:3000` to see the application.

## 📁 Project Structure

```
my-tcg/
├── src/
│   ├── app/                    # Next.js App Router
│   │   ├── (marketing)/        # Landing page
│   │   ├── (auth)/            # Authentication pages
│   │   ├── (app)/             # Main application
│   │   └── api/               # API routes
│   ├── components/            # React components
│   │   ├── ui/                # Reusable UI components
│   │   ├── CardView.tsx       # Card display component
│   │   ├── PackOpenReveal.tsx # Pack opening interface
│   │   └── DeckBuilder.tsx    # Deck building interface
│   ├── lib/                   # Utilities and core logic
│   │   ├── game/              # Game engine
│   │   │   ├── engine/        # Core game mechanics
│   │   │   ├── effects/       # Card effects system
│   │   │   ├── types.ts       # Type definitions
│   │   │   └── constants.ts   # Game constants
│   │   ├── db/                # Database queries
│   │   ├── auth.ts            # Authentication utilities
│   │   ├── validate.ts        # Input validation
│   │   └── rng.ts             # Random number generation
│   └── styles/                # Global styles
├── supabase/
│   ├── migrations/            # Database schema
│   ├── functions/             # Edge functions
│   └── types.ts               # Generated types
├── tools/
│   └── seed.ts                # Database seeding script
└── public/                    # Static assets
```

## 🎯 Game Mechanics

### Card Types
- **Creatures**: Have power/toughness and can attack/block
- **Instants**: Quick effects that can be played anytime
- **Sorceries**: Powerful effects played on your turn
- **Artifacts**: Permanent objects with various abilities
- **Enchantments**: Ongoing effects that modify the game
- **Lands**: Provide mana to cast other spells

### Rarities
- **Common** (Gray): Basic cards, easily obtained
- **Uncommon** (Green): More powerful, moderate rarity
- **Rare** (Blue): Strong cards with unique effects
- **Mythic Rare** (Orange): Legendary cards with game-changing abilities
- **Lands** (Purple): Essential for mana generation

### Pack Contents
- **Standard Booster**: 15 cards
  - 10 Commons
  - 3 Uncommons  
  - 1 Rare/Mythic (1/8 chance for Mythic)
  - 1 Basic Land
  - 1% chance for foil replacement

## 🃏 Featured Cards

### Programming-Themed Fun
- **Coffee-Powered Coder**: A humble 1/2 creature that draws cards
- **The Architect**: A legendary 6/6 that represents the ultimate developer
- **Stack Overflow**: A devastating spell that deals massive damage
- **Rubber Duck**: A defensive artifact that helps with debugging
- **Merge Conflict**: An enchantment that causes chaos
- **Zero-Day Exploit**: A powerful removal spell

## 🔧 Development

### Scripts
```bash
pnpm dev          # Start development server
pnpm build        # Build for production
pnpm start        # Start production server
pnpm lint         # Run ESLint
pnpm type-check   # Run TypeScript checks
pnpm db:migrate   # Apply database migrations
pnpm db:seed      # Seed database with cards
pnpm db:types     # Generate TypeScript types
```

### Database Schema
The game uses a comprehensive PostgreSQL schema with:
- User profiles and authentication
- Card definitions with flexible effect system
- User collections and deck management
- Match state and game history
- Trading system
- Currency and transactions

### Game Engine
Built with a modern, type-safe architecture:
- **State Management**: Immutable game state with proper typing
- **Effect System**: JSON-based DSL for card effects
- **Stack Resolution**: Magic-like priority and stack system
- **Turn Structure**: Comprehensive phase system
- **Validation**: Input validation and rule enforcement

## 🎨 Card Design

### Effect DSL
Cards use a JSON-based effect system:

```json
{
  "on_play": [
    { "op": "draw", "count": 1, "target": "self" }
  ],
  "triggers": [
    {
      "condition": { "when": "enters_battlefield" },
      "effects": [
        { "op": "damage", "amount": 2, "target": "any" }
      ]
    }
  ]
}
```

### Creating New Cards
1. Add card definition to `tools/seed.ts`
2. Include appropriate rarity and effects
3. Run the seed script to add to database
4. Cards automatically appear in game

## 🚀 Deployment

### Vercel (Recommended)
1. Connect your GitHub repository to Vercel
2. Add environment variables
3. Deploy automatically on push

### Self-Hosting
1. Build the project: `pnpm build`
2. Start the server: `pnpm start`
3. Ensure environment variables are set

### Database
- Use Supabase managed database (recommended)
- Or self-host PostgreSQL with the provided schema

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

### Adding Cards
- Keep the programming theme
- Include flavor text with developer humor
- Balance power level appropriately
- Test effects thoroughly

### Reporting Bugs
- Use GitHub issues
- Include reproduction steps
- Provide browser/device information

## 📝 License

This project is for educational purposes. Card art and some mechanics are inspired by existing TCGs but this is a non-commercial fan project.

## 🎯 Roadmap

### Planned Features
- [ ] Multiplayer matches with real-time sync
- [ ] Tournament system
- [ ] More card sets and mechanics
- [ ] Mobile app (React Native)
- [ ] Spectator mode
- [ ] Deck sharing and importing
- [ ] Advanced analytics
- [ ] Card art generation with AI

### Current Status
- ✅ Core game engine
- ✅ Pack opening system
- ✅ Deck builder
- ✅ User authentication
- ✅ Database schema
- ✅ 40+ programming-themed cards
- ✅ PWA support
- ⏳ Multiplayer implementation
- ⏳ Admin dashboard

## 🔗 Links

- [Live Demo](https://your-deployment-url.vercel.app)
- [GitHub Repository](https://github.com/your-username/my-tcg)
- [Supabase](https://supabase.com)
- [Next.js](https://nextjs.org)

---

**Built with ❤️ by developers, for developers**

*"It's not a bug, it's a feature!"* - Every card in this game

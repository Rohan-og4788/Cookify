# Recipe Finder

A production-ready recipe discovery and meal planning web application built with Next.js 15, PostgreSQL, and modern React patterns.

![Next.js](https://img.shields.io/badge/Next.js-15-black)
![TypeScript](https://img.shields.io/badge/TypeScript-5-blue)
![Tailwind CSS](https://img.shields.io/badge/Tailwind-4-38bdf8)
![Prisma](https://img.shields.io/badge/Prisma-ORM-2D3748)

## Features

### Search & Discovery
- Debounced search with autocomplete suggestions
- Multi-filter support: ingredients, cuisine, diet (vegan/gluten-free/keto), prep time slider, difficulty
- URL-based filter state for shareable links
- Loading skeletons during search
- ISR with 60-second revalidation on recipe listings

### Recipe Display
- Responsive recipe grid with optimized images (`next/image`)
- Detail pages with hero images, ingredient checklists, step-by-step instructions
- Nutritional info panel with visual progress bars
- Allergen warnings and diet tags
- User reviews with star ratings

### User Features
- Google & GitHub OAuth via NextAuth.js
- Save/unsave recipes to personal collection
- Custom recipe collections
- Personal dashboard with saved recipes, collections, and review history
- Add custom recipes with full form validation

### Meal Planning
- Drag-and-drop weekly calendar (`@dnd-kit`)
- Auto-generated shopping list from meal plan
- Serving size adjuster with ingredient scaling
- Email reminders via Resend API

### Cooking Mode
- Full-screen immersive step-by-step interface
- Built-in per-step timers (start/pause/reset)
- Large text and buttons for hands-free cooking
- Screen reader optimized with ARIA live regions

### Additional
- TheMealDB API integration with PostgreSQL caching
- PWA support with service worker for offline saved recipes
- Open Graph images for social sharing
- Internationalization (English + Spanish) via `next-intl`
- Admin panel for review moderation
- Rate limiting via Upstash Redis
- Dark mode with system preference detection

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | Next.js 15 (App Router) + TypeScript |
| Styling | Tailwind CSS v4 |
| Database | PostgreSQL + Prisma ORM |
| Auth | NextAuth.js v5 (Google, GitHub) |
| Forms | React Hook Form + Zod |
| Server State | TanStack React Query |
| Client State | Zustand |
| DnD | @dnd-kit |
| Animations | Framer Motion |
| i18n | next-intl |
| Email | Resend |
| Rate Limiting | Upstash Redis |
| Icons | Lucide React |

## Getting Started

### Prerequisites

- Node.js 20+
- PostgreSQL database
- Google OAuth credentials (optional)
- GitHub OAuth credentials (optional)

### Installation

```bash
# Clone the repository
git clone https://github.com/yourusername/recipe-finder.git
cd recipe-finder

# Install dependencies
npm install

# Copy environment variables
cp .env.example .env
# Edit .env with your values

# Set up the database
npm run db:push
npm run db:seed

# Start development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) — you'll be redirected to `/en`.

### Environment Variables

See [`.env.example`](.env.example) for all required variables:

| Variable | Description |
|----------|-------------|
| `DATABASE_URL` | PostgreSQL connection string |
| `AUTH_SECRET` | NextAuth secret (`openssl rand -base64 32`) |
| `AUTH_GOOGLE_ID/SECRET` | Google OAuth credentials |
| `AUTH_GITHUB_ID/SECRET` | GitHub OAuth credentials |
| `UPSTASH_REDIS_REST_URL/TOKEN` | Rate limiting (optional in dev) |
| `RESEND_API_KEY` | Email notifications (optional) |
| `SPOONACULAR_API_KEY` | Optional secondary recipe API |

## Database

```bash
# Generate Prisma client
npm run db:generate

# Push schema to database
npm run db:push

# Run migrations (production)
npm run db:migrate

# Seed sample data
npm run db:seed
```

### Models

- **User** — Authentication and profile
- **Recipe** — Recipe data with instructions, nutrition, diet tags
- **Ingredient** — Normalized ingredient catalog
- **SavedRecipe** — User saved recipes
- **Collection** — Custom recipe collections
- **Review** — User reviews with moderation status
- **MealPlan / MealPlanItem** — Weekly meal planning
- **ApiCache** — External API response caching

## Deployment (Vercel)

1. Push to GitHub
2. Import project in [Vercel](https://vercel.com)
3. Add environment variables from `.env.example`
4. Connect a PostgreSQL database (Vercel Postgres, Neon, or Supabase)
5. Deploy

```bash
# Vercel CLI alternative
npm i -g vercel
vercel
```

### Post-deploy checklist

- [ ] Set `AUTH_URL` and `NEXT_PUBLIC_APP_URL` to your production domain
- [ ] Configure OAuth redirect URIs: `https://yourdomain.com/api/auth/callback/google`
- [ ] Run `npm run db:push && npm run db:seed` against production DB
- [ ] Set up Upstash Redis for rate limiting
- [ ] Configure Resend for email notifications

## Project Structure

```
src/
├── app/
│   ├── [locale]/          # i18n routes
│   │   ├── page.tsx       # Homepage (ISR)
│   │   ├── recipes/       # Recipe detail + cooking mode
│   │   ├── dashboard/     # User dashboard (SSR)
│   │   ├── meal-plan/     # Meal planning
│   │   ├── add/           # Add recipe form
│   │   └── admin/         # Review moderation
│   └── api/               # API routes
├── components/            # React components
├── lib/                   # Utilities, auth, recipes, API
├── stores/                # Zustand stores
├── hooks/                 # Custom hooks
├── i18n/                  # Internationalization config
└── types/                 # TypeScript types
prisma/
├── schema.prisma
└── seed.ts
messages/
├── en.json
└── es.json
```

## API Routes

| Route | Method | Description |
|-------|--------|-------------|
| `/api/recipes` | GET | Search/filter recipes |
| `/api/recipes` | POST | Create user recipe |
| `/api/recipes/autocomplete` | GET | Search autocomplete |
| `/api/saved-recipes` | GET/POST | Saved recipes |
| `/api/collections` | GET/POST | Recipe collections |
| `/api/reviews` | GET/POST | Reviews |
| `/api/meal-plan` | GET/POST/DELETE | Meal planning |
| `/api/admin/reviews` | GET/PATCH | Review moderation |
| `/api/og/[recipeId]` | GET | Open Graph images |

## Security

- Input sanitization via DOMPurify on all user content
- Rate limiting on API routes (Upstash Redis)
- CSRF protection via NextAuth
- SQL injection prevention via Prisma parameterized queries
- Protected routes via middleware
- Admin role check for moderation panel

## Performance

- ISR (`revalidate: 60`) on recipe listing
- Static generation for locale layouts
- SSR for dynamic user pages
- Code splitting for calendar and cooking mode
- Image optimization via Vercel CDN
- Package import optimization for lucide-react and framer-motion

## License

MIT

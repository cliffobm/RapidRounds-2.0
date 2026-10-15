# RapidRounds - Nursing Education Platform

A gamified comprehensive assessment and clinical judgment platform for nursing education through scenario-based practice.

## 🚀 Features

- **Swipeable Scenario Flow**: Mobile-first swipe deck with left=next, right=bookmark gestures
- **Flipped Classroom**: Interactive micro-lessons (5-10 min) with checkpoints and progress gating
- **Comprehensive Gamification**: XP system, achievement badges, streak tracking, and confetti celebrations
- **Advanced Leaderboards**: Global and institution rankings with expandable user details
- **Accessibility Commitments**: WCAG 2.1 AA compliance, keyboard navigation, screen reader support
- **Monetization System**: Free tier (5 rationales), 7-day trial, Premium subscription with Stripe
- **Real-time Progress**: Zustand state management with offline sync and caching
- **Professional Design System**: Healthcare blue (#0A66C2) and energizing orange (#FC4C02) with 2xl rounded corners
- **Performance Optimized**: Lazy loading, intersection observers, and reduced motion support

## 🛠 Tech Stack

- **Frontend**: Next.js 15, React 19, TypeScript
- **Styling**: Tailwind CSS with custom healthcare design tokens
- **Backend**: Supabase (Auth, Database, RLS, Functions)
- **Payments**: Stripe (subscriptions, trials, webhooks)
- **State Management**: Zustand with persistence and offline sync
- **Forms**: React Hook Form + Zod validation
- **Animations**: Framer Motion with reduced motion support
- **UI Components**: Comprehensive design system with accessibility
- **Testing**: Vitest + Testing Library + Playwright + axe-core
- **Gestures**: react-swipeable for mobile interactions
- **Data Fetching**: TanStack React Query
- **Deployment**: Vercel

## 📋 Prerequisites

- Node.js 20+ 
- npm 10+
- Supabase account
- Stripe account (for payments)
- Vercel account (for deployment)

## 🚀 Getting Started

### 1. Clone and Install

```bash
git clone <your-repo-url>
cd rapidrounds
npm install
```

### 2. Environment Setup

Create a `.env.local` file in the root directory (copy from `.env.example`):

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key
NEXT_PUBLIC_APP_URL=http://localhost:3000
NEXT_PUBLIC_APP_NAME=RapidRounds
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=your_stripe_publishable_key
STRIPE_SECRET_KEY=your_stripe_secret_key
ANTHROPIC_API_KEY=your_anthropic_api_key
```

### 3. Database Setup

1. Create a new Supabase project at [supabase.com](https://supabase.com)
2. Go to the SQL Editor in your Supabase dashboard
3. Run the migration script from `supabase/migrations/20241214_design_revamp.sql`
4. Enable Row Level Security (RLS) policies (included in migration)
5. Configure Google OAuth in Authentication > Providers
6. Run seed data from `supabase/seed.sql` (optional)

### 4. Stripe Setup (for payments)

1. Create a Stripe account at [stripe.com](https://stripe.com)
2. Get your publishable and secret keys from the dashboard
3. Set up webhook endpoint at `/api/webhooks/stripe` for subscription events
4. Add webhook signing secret to environment variables

### 5. Development

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### 6. Testing

```bash
# Unit tests
npm run test
npm run test:watch
npm run test:coverage

# End-to-end tests  
npm run test:e2e
npm run test:e2e:ui

# All tests
npm run test:all
```
## 📁 Project Structure

```
rapidrounds/
├── app/                           # Next.js 15 app directory
│   ├── api/                      # API routes (webhooks, access control)
│   ├── auth/                     # Authentication pages
│   ├── flipped/                  # Flipped classroom module  
│   ├── leaderboard/              # Advanced leaderboard with tabs
│   ├── profile/                  # Multi-section profile page
│   ├── settings/                 # Comprehensive settings page
│   ├── study/                    # Study materials and lessons
│   ├── test/                     # Testing categories and scenarios
│   ├── globals.css               # Global styles with design tokens
│   ├── layout.tsx                # Root layout with providers
│   ├── page.tsx                  # Enhanced home dashboard
│   └── providers.tsx             # Zustand, React Query, Theme providers
├── components/                   # Component library
│   ├── flipped/                  # Lesson cards and checkpoints
│   ├── gamification/             # Badges, streaks, achievements
│   ├── layout/                   # App shell, FAB, page wrappers
│   ├── scenario/                 # Swipe deck, cards, answer blocks
│   ├── subscription/             # Payment and subscription components
│   └── ui/                       # Design system primitives
├── e2e/                          # Playwright end-to-end tests
├── lib/                          # Utility libraries
│   ├── accessibility.ts          # A11y utilities and helpers
│   ├── animations.ts             # Motion variants and spring configs
│   ├── access.ts                 # Access control and feature gating
│   ├── hooks/                    # Custom hooks (useAccess, usePerformance)
│   ├── payments/                 # Stripe integration and subscription logic
│   ├── rationales.ts             # Content access and monetization
│   └── supabase.ts               # Database client and types
├── store/                        # Zustand state management
│   ├── useAuth.ts                # Authentication and user profiles
│   └── useProgress.ts            # XP, achievements, offline sync
├── supabase/                     # Database schema and migrations
├── src/test/                     # Test setup and utilities
└── public/                       # Static assets and brand files
```

## 🎯 Core Features

### 📱 Swipeable Scenario Flow
- **Mobile-first Design**: Gesture-based navigation with left swipe = next, right swipe = bookmark
- **Interactive Questions**: Multiple choice, multi-select, drag-to-order, and text input
- **Real-time Feedback**: Immediate scoring with confetti celebrations on success
- **Accessibility**: Full keyboard navigation and screen reader support

### 📚 Flipped Classroom System
- **Micro-lessons**: 5-10 minute focused learning modules
- **Prerequisite Gating**: Lessons unlock based on completion dependencies
- **Interactive Checkpoints**: Knowledge validation with retry functionality
- **Progress Tracking**: Visual progress rings and completion analytics

### 🏆 Advanced Gamification
- **XP and Levels**: Point accumulation with automatic level progression
- **Achievement System**: 5 categories (Performance, Consistency, Learning, Social, Milestone)
- **Streak Tracking**: Daily activity streaks with risk alerts and weekly goals
- **Confetti Celebrations**: Motion-safe celebrations for achievements and completions

### 🏅 Comprehensive Leaderboards
- **Dual Scope**: Global and institution-specific rankings
- **Time Filtering**: Weekly, monthly, and all-time leaderboards
- **Rich Profiles**: Expandable user details with statistics and achievements
- **Top 3 Podium**: Special highlighting for top performers

### 💳 Monetization & Access Control
- **Free Tier**: 5 free rationale explanations, limited scenarios
- **7-Day Trial**: Full access to all premium features
- **Premium Subscription**: Unlimited access via Stripe integration
- **Server-side Validation**: Tamper-proof usage tracking

### Authentication & User Management
- Secure signup and login with Supabase
- Role-based access (student, educator, admin)
- Profile management and preferences
- Institution-based user organization

## 🚀 Deployment

### Vercel Deployment

1. Connect your GitHub repository to Vercel
2. Add environment variables in Vercel dashboard
3. Deploy automatically on push to main branch

### Environment Variables for Production

Make sure to set these in your Vercel project settings:

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`
- `NEXT_PUBLIC_APP_URL` (your production URL)
- `NEXT_PUBLIC_APP_NAME`

## 🧪 Scripts

```bash
# Development
npm run dev          # Start development server
npm run build        # Build for production  
npm run start        # Start production server
npm run lint         # Run ESLint
npm run type-check   # Run TypeScript type checking

# Testing
npm run test         # Run unit tests with Vitest
npm run test:watch   # Run tests in watch mode
npm run test:coverage # Run tests with coverage report
npm run test:e2e     # Run Playwright end-to-end tests
npm run test:e2e:ui  # Run E2E tests with UI mode
npm run test:all     # Run all tests

# Setup
npm run setup:env    # Setup environment variables
npm run setup:supabase # Configure Supabase
npm run setup:all    # Run all setup scripts
```

## 🎨 Design System

### Color Palette
- **Healthcare Blue**: `#0A66C2` - Primary brand color for trust and professionalism
- **Energizing Orange**: `#FC4C02` - Accent color for energy and action
- **Success Green**: `#16a34a` - Success states and positive feedback
- **Warning Amber**: `#f59e0b` - Warnings and attention states
- **Danger Red**: `#ef4444` - Errors and critical states
- **Slate Scale**: Complete neutral palette for text and backgrounds

### Design Principles
- **2xl Rounded Corners**: Default border radius for interactive components
- **44px Minimum Touch Targets**: Accessibility-compliant touch areas
- **Motion-Safe Animations**: Respects user preferences for reduced motion
- **WCAG 2.1 AA Compliance**: Accessible color contrast and interaction patterns

### Component Architecture
- **Compound Components**: Card with Header, Content, Footer subcomponents
- **Variant-based Design**: CVA (Class Variance Authority) for consistent styling
- **Accessibility-First**: Built-in ARIA support and keyboard navigation
- **Performance Optimized**: Lazy loading and intersection observers

### Typography
- **Font Family**: Inter (clean, readable)
- **Headings**: Bold, gradient text effects
- **Body**: Clean, accessible contrast ratios

### Components
- Card-based design with subtle shadows
- Rounded corners and smooth transitions
- Mobile-first responsive design
- Dark mode support throughout

## 🔧 Configuration

### Tailwind CSS
Custom healthcare-themed colors and components. Configuration in `tailwind.config.js`.

### TypeScript
Strict TypeScript configuration with path aliases. Configuration in `tsconfig.json`.

### ESLint & Prettier
Code quality and formatting tools configured for consistent code style.

## 📚 Available Scenarios

1. **Cardiac Assessment - Chest Pain** (Intermediate)
   - Acute coronary syndrome recognition
   - Priority nursing interventions
   - Medication administration

2. **Respiratory Assessment - Shortness of Breath** (Beginner)
   - COPD patient management
   - Oxygen therapy principles
   - Respiratory distress assessment

3. **Medication Administration - Insulin Management** (Advanced)
   - Insulin dosing calculations
   - Medication safety principles
   - Diabetes management protocols

4. **Neurological Assessment - Stroke Protocol** (Advanced)
   - NIH Stroke Scale assessment
   - Thrombolytic therapy time windows
   - Stroke recognition and management

5. **Pediatric Assessment - Fever and Dehydration** (Intermediate)
   - Pediatric dehydration assessment
   - Fluid resuscitation calculations
   - Age-appropriate care considerations

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🆘 Support

For support and questions:
- Create an issue in the GitHub repository
- Contact the development team
- Check the documentation in the `/docs` folder

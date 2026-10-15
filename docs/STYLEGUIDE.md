# RapidRounds Style Guide

A comprehensive guide to the RapidRounds design system, components, and usage patterns.

## 🎨 Design Tokens

### Color Palette

#### Primary Colors
- **Healthcare Blue**: `#0A66C2` - Primary brand color for trust and professionalism
- **Energizing Orange**: `#FC4C02` - Accent color for energy and action

#### System Colors
- **Success**: `#16a34a` - Success states and positive feedback
- **Warning**: `#f59e0b` - Warnings and attention-required states
- **Danger**: `#ef4444` - Errors and critical states

#### Neutral Scale (Slate)
- **slate-50**: `#f8fafc` - Lightest backgrounds
- **slate-100**: `#f1f5f9` - Light backgrounds and borders
- **slate-200**: `#e2e8f0` - Subtle borders and dividers
- **slate-300**: `#cbd5e1` - Input borders and inactive states
- **slate-400**: `#94a3b8` - Placeholder text and disabled states
- **slate-500**: `#64748b` - Secondary text
- **slate-600**: `#475569` - Body text
- **slate-700**: `#334155` - Headings and emphasized text
- **slate-800**: `#1e293b` - Dark mode backgrounds
- **slate-900**: `#0f172a` - Highest contrast text
- **slate-950**: `#020617` - Darkest backgrounds

### Typography

- **Font Family**: Inter - Clean, readable, professional
- **Headings**: Bold weights with gradient text effects
- **Body Text**: Regular weight with accessible contrast ratios
- **Code**: JetBrains Mono for technical content

### Spacing & Layout

- **Border Radius**: `2xl` (1rem) default for interactive components
- **Touch Targets**: Minimum 44px for accessibility compliance
- **Container**: Max-width with responsive padding
- **Grid Gaps**: 4-6 spacing units for comfortable layouts

## 🧩 Component Library

### Core Components

#### Button
```tsx
import { Button } from '@/components/ui/Button'

// Variants
<Button variant="primary">Primary Action</Button>
<Button variant="accent">Accent Action</Button>
<Button variant="outline">Secondary Action</Button>
<Button variant="ghost">Subtle Action</Button>
<Button variant="destructive">Danger Action</Button>

// Sizes
<Button size="sm">Small</Button>
<Button size="default">Default</Button>
<Button size="lg">Large</Button>
<Button size="icon">Icon Only</Button>

// States
<Button loading loadingText="Saving...">Save</Button>
<Button disabled>Disabled</Button>
```

#### Card
```tsx
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/Card'

<Card>
  <CardHeader>
    <CardTitle>Card Title</CardTitle>
    <CardDescription>Card description text</CardDescription>
  </CardHeader>
  <CardContent>
    Card content goes here
  </CardContent>
</Card>
```

#### Badge
```tsx
import { Badge } from '@/components/ui/Badge'

<Badge variant="default">Default</Badge>
<Badge variant="success">Success</Badge>
<Badge variant="warning">Warning</Badge>
<Badge variant="danger">Danger</Badge>
<Badge variant="accent">Accent</Badge>
<Badge variant="outline">Outline</Badge>
```

#### ProgressRing
```tsx
import { ProgressRing } from '@/components/ui/ProgressRing'

<ProgressRing 
  progress={75} 
  size={120} 
  strokeWidth={8}
  label="Progress"
  showLabel={true}
/>
```

### Layout Components

#### PageWrapper
```tsx
import { PageWrapper } from '@/components/layout/PageWrapper'

<PageWrapper
  title="Page Title"
  description="Page description"
  announcePageChange={true}
  focusOnMount={true}
>
  <YourPageContent />
</PageWrapper>
```

#### LazyLoad
```tsx
import { LazyCard, LazyImage } from '@/components/ui/LazyLoad'

<LazyCard delay={100}>
  <Card>Content that loads when in viewport</Card>
</LazyCard>

<LazyImage 
  src="/image.jpg" 
  alt="Description"
  className="w-full h-48 object-cover"
/>
```

### Scenario Components

#### SwipeDeck
```tsx
import { SwipeDeck } from '@/components/scenario/SwipeDeck'

<SwipeDeck
  items={swipeItems}
  onSwipeLeft={(item, index) => console.log('Next:', item)}
  onSwipeRight={(item, index) => console.log('Bookmark:', item)}
  showHints={true}
/>
```

#### AnswerBlock
```tsx
import { AnswerBlock } from '@/components/scenario/AnswerBlock'

<AnswerBlock
  question={questionData}
  onAnswer={(answers) => handleAnswer(answers)}
  showRationale={true}
  onCorrectAnswer={() => triggerConfetti()}
/>
```

### Gamification Components

#### BadgeGallery
```tsx
import { BadgeGallery } from '@/components/gamification/BadgeGallery'

<BadgeGallery 
  achievements={userAchievements}
  variant="grid"
  showLocked={true}
  onBadgeClick={(achievement) => showDetails(achievement)}
/>
```

#### StreakMeter
```tsx
import { StreakMeter } from '@/components/gamification/StreakMeter'

<StreakMeter 
  streakData={userStreakData}
  variant="full"
  showHistory={true}
  onStartActivity={() => navigateToActivity()}
/>
```

## ♿ Accessibility Guidelines

### WCAG 2.1 AA Compliance

#### Color Contrast
- All text meets 4.5:1 contrast ratio minimum
- Large text meets 3:1 contrast ratio minimum
- Interactive elements have clear focus indicators

#### Keyboard Navigation
- All interactive elements are keyboard accessible
- Logical tab order throughout the application
- Skip links provided for main content areas
- Arrow key navigation for lists and carousels

#### Screen Reader Support
- Semantic HTML structure with proper headings
- ARIA labels and descriptions for complex interactions
- Live regions for dynamic content announcements
- Alternative text for all images and icons

#### Touch Accessibility
- Minimum 44px touch targets for all interactive elements
- Adequate spacing between touch targets
- Gesture alternatives provided for all swipe interactions

### Motion & Animation

#### Reduced Motion Support
- Respects `prefers-reduced-motion: reduce` user preference
- Provides instant updates when motion is disabled
- Maintains functionality without animations

#### Safe Animations
- Gentle spring physics for natural movement
- Staggered animations for content lists
- Performance-optimized with Framer Motion
- Meaningful transitions that enhance UX

## 🎯 Usage Patterns

### State Management
```tsx
// Authentication
import { useAuth } from '@/store/useAuth'
const { user, profile, signIn, signOut } = useAuth()

// Progress tracking
import { useProgress } from '@/store/useProgress'
const { xp, level, addXP, achievements } = useProgress()

// Access control
import { useRationaleAccess } from '@/lib/hooks/useAccess'
const { canAccess, accessCheck } = useRationaleAccess(questionId)
```

### Theme Integration
```tsx
import { useTheme } from '@/app/providers'
const { isDark, toggleTheme, setTheme } = useTheme()
```

### Performance Optimization
```tsx
import { useIntersectionObserver, useDebounce } from '@/lib/hooks/usePerformance'

// Lazy loading
const { isIntersecting } = useIntersectionObserver(ref)

// Debounced search
const debouncedSearch = useDebounce(searchTerm, 300)
```

## 🔧 Development Guidelines

### Component Creation
1. Use TypeScript with proper interface definitions
2. Include proper ARIA attributes and accessibility features
3. Support both light and dark themes
4. Respect reduced motion preferences
5. Include loading and error states
6. Add proper JSDoc comments

### Animation Guidelines
1. Use the animation utilities from `lib/animations.ts`
2. Always check `shouldReduceMotion()` before applying animations
3. Use spring physics for natural movement
4. Keep animations under 300ms for interactions
5. Provide meaningful transitions, not decorative ones

### Accessibility Checklist
- [ ] Proper semantic HTML structure
- [ ] ARIA labels for complex interactions
- [ ] Keyboard navigation support
- [ ] Color contrast compliance
- [ ] Touch target size compliance
- [ ] Screen reader announcements
- [ ] Focus management
- [ ] Reduced motion support

### Testing Requirements
- Unit tests for business logic
- Component tests for user interactions
- E2E tests for critical user flows
- Accessibility tests with axe-core
- Performance tests for load times
- Visual regression tests for UI consistency

## 🎨 Design Principles

### Healthcare-Focused Design
- **Trust**: Professional blue conveys medical expertise
- **Energy**: Orange accent motivates learning and action
- **Clarity**: Clean typography and generous spacing
- **Accessibility**: Inclusive design for all learners

### Mobile-First Approach
- Touch-friendly interactions with large targets
- Gesture-based navigation for natural mobile UX
- Responsive layouts that scale beautifully
- Performance optimization for mobile devices

### Progressive Enhancement
- Core functionality works without JavaScript
- Enhanced experiences with modern browser features
- Graceful degradation for older devices
- Offline-first architecture with sync capabilities




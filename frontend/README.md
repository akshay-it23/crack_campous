# PrepMaster Frontend

A stunning, modern React + TypeScript frontend for the Smart Placement Prep Platform with premium UI/UX design.

## 🎨 Design Philosophy

This frontend is built with a **premium, modern aesthetic** featuring:
- **Glassmorphism** - Frosted glass effects with backdrop blur
- **Vibrant Gradients** - Eye-catching color combinations
- **Smooth Animations** - Framer Motion for fluid transitions
- **3D Elements** - Interactive floating particles and depth
- **Dark Theme** - Elegant dark mode with neon accents

**Goal**: Create a frontend that looks professional, unique, and definitely NOT like a typical AI-generated or basic college project.

---

## 🛠️ Tech Stack

### Core Framework
- **React 18** - Modern React with hooks and concurrent features
- **TypeScript** - Type safety and better developer experience
- **Vite** - Lightning-fast dev server and build tool

### Styling & UI
- **Tailwind CSS** - Utility-first CSS with custom theme
- **Framer Motion** - Smooth animations and transitions
- **Lucide React** - Beautiful, consistent icon library
- **React Hot Toast** - Elegant toast notifications

### State Management & Data Fetching
- **Zustand** - Lightweight state management (for auth, theme, etc.)
- **TanStack Query (React Query)** - Server state management with caching
- **Axios** - HTTP client with interceptors

### Real-Time & Advanced Features
- **Socket.IO Client** - Real-time study rooms and notifications
- **React Hook Form** - Performant form handling with validation
- **Zod** - Runtime type validation
- **Recharts** - Beautiful data visualizations

---

## 📁 Project Structure

```
frontend/
├── public/                      # Static assets
├── src/
│   ├── components/              # React components
│   │   ├── ui/                  # Reusable UI components
│   │   │   ├── Button.tsx       # Premium button with variants
│   │   │   ├── Card.tsx         # Glassmorphic card component
│   │   │   ├── Input.tsx        # Form input with validation
│   │   │   └── ...
│   │   ├── layout/              # Layout components
│   │   │   ├── Navbar.tsx       # Top navigation bar
│   │   │   ├── Sidebar.tsx      # Dashboard sidebar
│   │   │   └── DashboardLayout.tsx
│   │   ├── features/            # Feature-specific components
│   │   │   ├── auth/            # Authentication components
│   │   │   ├── dashboard/       # Dashboard widgets
│   │   │   ├── practice/        # Practice session components
│   │   │   └── ...
│   │   └── shared/              # Shared utility components
│   │       ├── LoadingSkeleton.tsx
│   │       └── ErrorBoundary.tsx
│   │
│   ├── pages/                   # Page components (routes)
│   │   ├── Landing.tsx          # Landing page with hero section
│   │   ├── Login.tsx            # Login page
│   │   ├── Register.tsx         # Registration page
│   │   ├── Dashboard.tsx        # Main dashboard
│   │   ├── Practice.tsx         # Practice interface
│   │   └── ...
│   │
│   ├── services/                # API services
│   │   ├── api.ts               # Axios instance with interceptors
│   │   ├── auth.service.ts      # Authentication API calls
│   │   ├── practice.service.ts  # Practice API calls
│   │   └── ...
│   │
│   ├── store/                   # Zustand stores
│   │   ├── authStore.ts         # Authentication state
│   │   ├── themeStore.ts        # Theme preferences
│   │   └── ...
│   │
│   ├── hooks/                   # Custom React hooks
│   │   ├── useAuth.ts           # Authentication hook
│   │   ├── useSocket.ts         # Socket.IO hook
│   │   └── ...
│   │
│   ├── types/                   # TypeScript type definitions
│   │   └── index.ts             # All type definitions
│   │
│   ├── utils/                   # Utility functions
│   │   ├── formatters.ts        # Date, number formatting
│   │   └── validators.ts        # Validation helpers
│   │
│   ├── styles/                  # Global styles
│   │   └── index.css            # Tailwind + custom CSS
│   │
│   ├── App.tsx                  # Main app component
│   ├── main.tsx                 # Entry point
│   └── router.tsx               # React Router configuration
│
├── .env                         # Environment variables
├── package.json                 # Dependencies
├── tsconfig.json                # TypeScript configuration
├── tailwind.config.js           # Tailwind CSS configuration
├── vite.config.ts               # Vite configuration
└── README.md                    # This file
```

---

## 🏗️ Architecture Overview

### 1. **Component Architecture**

#### UI Components (`src/components/ui/`)
Reusable, styled components with consistent design:

- **Button.tsx**
  - Variants: `primary`, `secondary`, `ghost`, `danger`
  - Sizes: `sm`, `md`, `lg`
  - Features: Loading states, icons, animations
  - Usage: `<Button variant="primary" isLoading={true}>Click Me</Button>`

- **Card.tsx**
  - Glassmorphic design with backdrop blur
  - Hover effects with scale and glow
  - Gradient variant for CTAs
  - Usage: `<Card hover gradient>Content</Card>`

- **Input.tsx**
  - Glassmorphic styling
  - Label and error message support
  - Icon support (left side)
  - Focus animations
  - Usage: `<Input label="Email" icon={<Mail />} error={errors.email} />`

#### Layout Components (`src/components/layout/`)
Structural components for page layouts:
- Navbar with logo and user menu
- Sidebar for dashboard navigation
- Footer
- DashboardLayout wrapper

#### Feature Components (`src/components/features/`)
Feature-specific, complex components organized by domain.

---

### 2. **State Management**

#### Zustand Stores (`src/store/`)

**authStore.ts** - Authentication state
```typescript
{
  user: User | null,
  isAuthenticated: boolean,
  isLoading: boolean,
  setUser: (user) => void,
  logout: () => void
}
```
- Persisted to localStorage
- Used across the app for auth checks

**Future stores:**
- `themeStore.ts` - Dark/light mode preferences
- `notificationStore.ts` - Real-time notifications

#### React Query (TanStack Query)
Used for server state management:
- Automatic caching with stale-time
- Background refetching
- Optimistic updates
- Loading and error states

---

### 3. **API Integration**

#### API Service (`src/services/api.ts`)

Axios instance with interceptors:

**Request Interceptor:**
- Automatically adds JWT token to `Authorization` header
- Reads token from `localStorage`

**Response Interceptor:**
- Handles 401 errors (unauthorized)
- Automatically refreshes expired tokens
- Retries failed requests with new token
- Redirects to login if refresh fails

```typescript
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('accessToken');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});
```

#### Service Files
Each domain has its own service file:

- **auth.service.ts** - `register()`, `login()`, `logout()`, `getCurrentUser()`
- **practice.service.ts** - Practice logging, stats
- **topic.service.ts** - Topic browsing, details
- **recommendation.service.ts** - AI recommendations
- **studyRoom.service.ts** - Study room management

---

### 4. **Routing**

React Router v6 with protected routes:

```
/ (public)              → Landing page
/login (public)         → Login page
/register (public)      → Register page
/dashboard (protected)  → Main dashboard
/practice (protected)   → Practice interface
/topics (protected)     → Topic browser
/recommendations (protected) → AI recommendations
/study-rooms (protected) → Study rooms
/leaderboard (protected) → Leaderboard
/profile (protected)    → User profile
```

**Protected Route Wrapper:**
- Checks authentication status
- Redirects to `/login` if not authenticated
- Shows loading state while checking auth

---

### 5. **Type System**

All types defined in `src/types/index.ts`:

**Core Types:**
- `User` - User profile data
- `Topic` - Topic information
- `PracticeLog` - Practice session data
- `UserProgress` - Progress metrics
- `Recommendation` - AI recommendations
- `StudyRoom` - Study room data
- `Badge` - Badge/achievement data
- `LeaderboardEntry` - Leaderboard ranking

**API Response Types:**
- `ApiResponse<T>` - Generic API response wrapper
- `AuthResponse` - Authentication response with tokens

---

## 🎨 Design System

### Color Palette

```javascript
colors: {
  primary: {
    400: '#38bdf8',  // Bright blue
    500: '#0ea5e9',
    600: '#0284c7',
  },
  accent: {
    400: '#c084fc',  // Purple
    500: '#a855f7',
    600: '#9333ea',
  },
}
```

### Gradients

```css
.bg-gradient-primary  → Blue to purple gradient
.bg-gradient-success  → Pink to red gradient
.bg-gradient-info     → Cyan to blue gradient
.bg-gradient-dark     → Dark blue gradient
```

### Custom Classes

```css
.glass-card           → Glassmorphic card
.glass-card-hover     → Glass card with hover effects
.gradient-text        → Gradient text effect
.btn-primary          → Primary button style
.input-glass          → Glassmorphic input
.animated-bg          → Animated gradient background
```

### Animations

```css
animate-float         → Floating animation (6s)
animate-pulse-slow    → Slow pulse (4s)
animate-bounce-slow   → Slow bounce (3s)
animate-spin-slow     → Slow spin (8s)
```

---

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ and npm
- Backend API running on `http://localhost:5000`

### Installation

```bash
# Navigate to frontend directory
cd frontend

# Install dependencies
npm install

# Create .env file
echo "VITE_API_URL=http://localhost:5000/api" > .env

# Start development server
npm run dev
```

The app will be available at `http://localhost:3000`

### Available Scripts

```bash
npm run dev          # Start development server
npm run build        # Build for production
npm run preview      # Preview production build
npm run type-check   # TypeScript type checking
```

---

## 📄 Pages Overview

### 1. **Landing Page** (`src/pages/Landing.tsx`)

**Features:**
- Animated gradient background
- Floating particles (20 animated dots)
- Hero section with 3D rocket icon
- Animated stats cards (4 metrics)
- Features grid (6 feature cards)
- CTA section with gradient card
- Glassmorphic navbar and footer

**Animations:**
- Page load: Stagger animation for all elements
- Particles: Infinite random movement
- Rocket: Gentle rotation animation
- Cards: Fade in on scroll (viewport detection)

### 2. **Login Page** (`src/pages/Login.tsx`)

**Features:**
- Glassmorphic form card
- Email and password inputs with icons
- Form validation with React Hook Form
- Loading state on submit
- Error handling with toast notifications
- Demo credentials display
- Link to register page

**Flow:**
1. User enters credentials
2. Form validates input
3. API call to `/api/auth/login`
4. Store tokens in localStorage
5. Update Zustand auth store
6. Redirect to `/dashboard`

### 3. **Register Page** (`src/pages/Register.tsx`)

**Features:**
- Multi-field registration form
- Password confirmation validation
- Optional fields (college, graduation year)
- Real-time validation feedback
- Success toast on registration
- Auto-login after registration

**Fields:**
- Full Name (required)
- Email (required, validated)
- Password (required, min 6 chars)
- Confirm Password (must match)
- College (optional)
- Graduation Year (optional, 2020-2030)

---

## 🔐 Authentication Flow

### Registration Flow
```
1. User fills registration form
2. Frontend validates input
3. POST /api/auth/register
4. Backend creates user + returns tokens
5. Store tokens in localStorage
6. Update authStore with user data
7. Redirect to /dashboard
```

### Login Flow
```
1. User enters credentials
2. Frontend validates input
3. POST /api/auth/login
4. Backend verifies + returns tokens
5. Store tokens in localStorage
6. Update authStore with user data
7. Redirect to /dashboard
```

### Token Refresh Flow
```
1. API request fails with 401
2. Interceptor catches error
3. POST /api/auth/refresh with refreshToken
4. Get new accessToken
5. Update localStorage
6. Retry original request
7. If refresh fails → logout + redirect to /login
```

### Logout Flow
```
1. User clicks logout
2. POST /api/auth/logout (optional)
3. Clear localStorage (tokens)
4. Clear authStore
5. Redirect to /login
```

---

## 🎯 Development Phases

### ✅ Phase 1: Foundation (COMPLETED)
- [x] Project setup with Vite
- [x] Tailwind CSS configuration
- [x] Custom theme and design system
- [x] API service with interceptors
- [x] Type definitions
- [x] Auth service and store

### 🔄 Phase 2: Core UI (IN PROGRESS - 60%)
- [x] UI components (Button, Card, Input)
- [x] Landing page
- [x] Login page
- [x] Register page
- [ ] Router configuration
- [ ] Protected routes
- [ ] App.tsx setup

### ⏳ Phase 3: Dashboard & Features (TODO)
- [ ] Dashboard layout
- [ ] Practice interface
- [ ] AI Recommendations
- [ ] Study Rooms
- [ ] Leaderboard
- [ ] Profile & Settings

### ⏳ Phase 4: Polish (TODO)
- [ ] Loading skeletons
- [ ] Error boundaries
- [ ] Responsive design
- [ ] Performance optimization
- [ ] PWA setup

---

## 🔧 Configuration Files

### `vite.config.ts`
- Path aliases (`@/` → `./src/`)
- API proxy to backend (`/api` → `http://localhost:5000`)
- Dev server on port 3000

### `tailwind.config.js`
- Custom color palette
- Gradient backgrounds
- Custom animations
- Glassmorphism utilities
- Extended shadows and blur

### `tsconfig.json`
- Strict mode enabled
- Path aliases matching Vite config
- ES2020 target
- React JSX

---

## 📦 Dependencies

### Production
```json
{
  "react": "^18.x",
  "react-dom": "^18.x",
  "react-router-dom": "^6.x",
  "framer-motion": "^11.x",
  "@tanstack/react-query": "^5.x",
  "axios": "^1.x",
  "zustand": "^4.x",
  "socket.io-client": "^4.x",
  "react-hook-form": "^7.x",
  "zod": "^3.x",
  "lucide-react": "latest",
  "react-hot-toast": "^2.x",
  "recharts": "^2.x"
}
```

### Development
```json
{
  "@vitejs/plugin-react": "^4.x",
  "typescript": "^5.x",
  "tailwindcss": "^3.x",
  "postcss": "^8.x",
  "autoprefixer": "^10.x"
}
```

---

## 🎨 UI Component Examples

### Button Usage
```tsx
import { Button } from '@/components/ui/Button';
import { LogIn } from 'lucide-react';

<Button variant="primary" size="lg" icon={<LogIn />}>
  Login
</Button>

<Button variant="secondary" isLoading={true}>
  Loading...
</Button>
```

### Card Usage
```tsx
import { Card } from '@/components/ui/Card';

<Card hover>
  <h3>Card Title</h3>
  <p>Card content</p>
</Card>

<Card gradient>
  <h3>Gradient Card</h3>
</Card>
```

### Input Usage
```tsx
import { Input } from '@/components/ui/Input';
import { Mail } from 'lucide-react';

<Input
  label="Email"
  type="email"
  icon={<Mail />}
  error={errors.email?.message}
  {...register('email')}
/>
```

---

## 🚧 TODO / Next Steps

1. **Complete Phase 2:**
   - Create router configuration
   - Set up protected routes
   - Wire up App.tsx
   - Test authentication flow

2. **Build Dashboard:**
   - Layout with sidebar
   - Stats cards
   - Activity feed
   - Quick actions

3. **Practice Interface:**
   - Topic browser
   - Practice session
   - Timer and progress
   - Results page

4. **Advanced Features:**
   - AI Recommendations dashboard
   - Real-time study rooms
   - Leaderboard with animations
   - Badge showcase

5. **Polish:**
   - Loading states
   - Error handling
   - Responsive design
   - Performance optimization

---

## 📝 Notes

- All API calls go through the centralized `api.ts` service
- Authentication is handled automatically by interceptors
- Use React Query for data fetching (caching, refetching)
- Use Zustand for client-side state (auth, theme, etc.)
- All animations use Framer Motion for consistency
- Follow the established design system for new components

---

Built with ❤️ using React, TypeScript, and Tailwind CSS

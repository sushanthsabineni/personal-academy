# Personal Academy

**AI-Powered E-Learning Course Creation Platform**

Transform your expertise into professional e-learning courses with intelligent automation. Personal Academy helps educators, trainers, and subject matter experts create engaging, interactive learning experiences in minutes, not weeks.

[![Next.js](https://img.shields.io/badge/Next.js-15.1.6-black?logo=next.js)](https://nextjs.org/)
[![React](https://img.shields.io/badge/React-19.0.0-blue?logo=react)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-blue?logo=typescript)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-4.0.0-38bdf8?logo=tailwind-css)](https://tailwindcss.com/)
[![License](https://img.shields.io/badge/License-MIT-green.svg)](LICENSE)

---

## 📋 Table of Contents

- [Features](#-features)
- [Tech Stack](#-tech-stack)
- [Getting Started](#-getting-started)
- [Project Structure](#-project-structure)
- [Environment Variables](#-environment-variables)
- [Development](#-development)
- [Deployment](#-deployment)
- [Documentation](#-documentation)
- [License](#-license)

---

## ✨ Features

### Core Functionality

- **🤖 AI-Powered Course Generation** - Automatically generate modules, lessons, and storyboards
- **📚 Complete Course Builder** - 4-step wizard with module/lesson organization
- **💳 Credits System** - Flexible pricing with free tier (1,000 credits)
- **🎨 Rich Content Creation** - Slide-by-slide storyboard designer
- **👥 User Management** - Email and Google OAuth authentication
- **📊 Admin Dashboard** - Platform metrics, user management, financial tracking
- **🌐 Internationalization** - English and Spanish support
- **🔒 Security & Privacy** - HTTPS, CSP headers, input validation
- **📈 Analytics** - Google Analytics 4 with 15+ custom events
- **♿ Accessibility** - WCAG 2.1 AA compliant (96%)
- **🎯 SEO Optimized** - Meta tags, Open Graph, sitemap, robots.txt

---

## 🛠 Tech Stack

- **Framework:** Next.js 15 (App Router) + React 19
- **Language:** TypeScript 5
- **Styling:** Tailwind CSS 4
- **Database:** Supabase (PostgreSQL)
- **Authentication:** Supabase Auth
- **Analytics:** Google Analytics 4
- **Icons:** Lucide React

---

## 🚀 Getting Started

### Prerequisites

- Node.js 18.0.0+
- npm 9.0.0+

### Installation

```bash
# Clone repository
git clone https://github.com/yourusername/personal-academy.git
cd personal-academy

# Install dependencies
npm install

# Set up environment variables
cp .env.example .env.local
# Edit .env.local with your credentials

# Run development server
npm run dev

# Open http://localhost:3000
```

### Quick Start (No Database)

The app works with localStorage for demo purposes. Just install and run!

---

## 📁 Project Structure

```
personal-academy/
├── app/                   # Next.js pages (App Router)
│   ├── account/           # User account
│   ├── admin/             # Admin dashboard
│   ├── create/            # Course creation wizard
│   ├── dashboard/         # User dashboard
│   └── ...
├── components/            # React components
│   ├── course/
│   ├── layout/
│   └── ui/
├── lib/                   # Utilities
│   ├── i18n/              # Internationalization
│   ├── supabase/          # Database utilities
│   ├── analytics.ts       # GA4 tracking
│   ├── auth.ts            # Authentication
│   └── ...
├── hooks/                 # Custom React hooks
├── public/                # Static assets
└── docs/                  # Documentation
```

---

## 🔐 Environment Variables

Create `.env.local`:

```bash
# Supabase (required for production)
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# Google Analytics (optional)
NEXT_PUBLIC_GA_MEASUREMENT_ID=G-XXXXXXXXXX

# Google OAuth (optional)
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret
```

---

## 💻 Development

```bash
npm run dev          # Start dev server
npm run build        # Build for production
npm run start        # Start production server
npm run lint         # Run ESLint
```

### Database Setup

1. Create Supabase project: https://supabase.com
2. Run migrations from `DATABASE_SCHEMA.md`
3. Create storage buckets: `user-uploads`, `course-exports`
4. Add credentials to `.env.local`

See `DATABASE_SCHEMA.md` for complete setup (1,500+ lines).

---

## 🚢 Deployment

### Vercel (Recommended)

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new)

1. Push to GitHub
2. Import to Vercel
3. Add environment variables
4. Deploy!

---

## 📚 Documentation

Comprehensive docs in `/docs`:

- **[DATABASE_SCHEMA.md](DATABASE_SCHEMA.md)** - Complete Supabase schema (1,500+ lines)
- **[GOOGLE_ANALYTICS_SETUP.md](GOOGLE_ANALYTICS_SETUP.md)** - GA4 setup (800+ lines)
- **[ADMIN_DASHBOARD.md](ADMIN_DASHBOARD.md)** - Admin panel guide
- **[ACCESSIBILITY.md](ACCESSIBILITY.md)** - WCAG 2.1 compliance (96%)
- **[GOOGLE_SSO_SETUP.md](GOOGLE_SSO_SETUP.md)** - OAuth integration
- **[I18N_IMPLEMENTATION.md](I18N_IMPLEMENTATION.md)** - Multi-language
- **[SECURITY_AUDIT.md](SECURITY_AUDIT.md)** - Security best practices

---

## 📜 License

MIT License - see [LICENSE](LICENSE) file

---

## 🙏 Acknowledgments

- Next.js - React framework
- Supabase - Open source Firebase alternative
- Tailwind CSS - Utility-first CSS
- Lucide Icons - Beautiful icons
- Vercel - Deployment platform

---

**Built with ❤️ by the Personal Academy Team**

⭐ Star us on GitHub if this project helped you!

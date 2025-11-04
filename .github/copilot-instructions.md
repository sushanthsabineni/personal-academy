# AI Coding Agent Instructions

Welcome to the Personal Academy codebase! This document provides essential guidelines for AI coding agents to be productive and aligned with the project's architecture, workflows, and conventions.

---

## 📂 Project Overview

Personal Academy is an AI-powered e-learning platform built with the following stack:
- **Framework:** Next.js 15 (App Router) + React 19
- **Language:** TypeScript 5
- **Styling:** Tailwind CSS 4
- **Database:** Supabase (PostgreSQL)
- **Authentication:** Supabase Auth
- **Analytics:** Google Analytics 4

Key features include:
- AI-powered course generation
- Multi-step course creation wizard
- Admin dashboard for user and financial management
- Internationalization (English, Spanish)
- WCAG 2.1 AA accessibility compliance

---

## 🛠 Developer Workflows

### Development
- Start the development server:
  ```bash
  npm run dev
  ```
- Build for production:
  ```bash
  npm run build
  ```
- Run ESLint:
  ```bash
  npm run lint
  ```

### Database Setup
- Use Supabase for database management.
- Run migrations from `DATABASE_SCHEMA.md`.
- Create storage buckets: `user-uploads`, `course-exports`.
- Add credentials to `.env.local`.

### Deployment
- Recommended platform: **Vercel**.
- Steps:
  1. Push to GitHub.
  2. Import to Vercel.
  3. Add environment variables.
  4. Deploy.

---

## 📁 Codebase Structure

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

## 📏 Conventions and Patterns

### TypeScript
- Use strict typing for all components and utilities.
- Shared types are located in `types/` (if applicable).

### Styling
- Use Tailwind CSS for all styling.
- Follow the utility-first approach.

### API Integration
- Use `lib/supabase/` for database interactions.
- Authentication logic resides in `lib/auth.ts`.

### Internationalization
- Implement i18n using utilities in `lib/i18n/`.
- Ensure all user-facing text is translatable.

### Testing
- Use Playwright for end-to-end tests.
- Test files are located in `tests/`.

---

## 🔗 Key Files and Directories

- `DATABASE_SCHEMA.md`: Supabase schema and migrations.
- `GOOGLE_ANALYTICS_SETUP.md`: GA4 setup guide.
- `ACCESSIBILITY.md`: Accessibility compliance details.
- `I18N_IMPLEMENTATION.md`: Internationalization setup.
- `SECURITY_AUDIT.md`: Security best practices.

---

## 🤖 Tips for AI Agents

1. **Understand the architecture**: Familiarize yourself with the `app/` and `components/` directories.
2. **Follow conventions**: Adhere to the project's TypeScript and Tailwind CSS patterns.
3. **Leverage utilities**: Use existing functions in `lib/` for database, auth, and analytics.
4. **Document changes**: Update relevant markdown files in `docs/` for any new features or fixes.
5. **Test thoroughly**: Ensure all changes are covered by Playwright tests.

---

For any questions, refer to the comprehensive documentation in the `docs/` directory.
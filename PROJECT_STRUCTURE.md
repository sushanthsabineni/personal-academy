# Personal Academy - Complete Project Structure

## Root Directory

```
personal-academy/
├── 📄 Configuration Files
│   ├── .env.example                          # Environment variables template
│   ├── .env.local.example                    # Local environment variables example
│   ├── .gitignore                            # Git ignore rules
│   ├── eslint.config.mjs                     # ESLint configuration
│   ├── next.config.ts                        # Next.js configuration
│   ├── next-env.d.ts                         # Next.js TypeScript declarations
│   ├── package.json                          # Project dependencies and scripts
│   ├── package-lock.json                     # Locked dependency versions
│   ├── playwright.config.ts                  # Playwright test configuration
│   ├── postcss.config.mjs                    # PostCSS configuration
│   ├── tailwind.config.ts                    # Tailwind CSS configuration
│   ├── tsconfig.json                         # TypeScript configuration
│   └── middleware.ts                         # Next.js middleware (auth protection)
│
├── 📚 Documentation Files
│   ├── README.md                             # Project overview and setup
│   ├── 404_VALIDATION_SUMMARY.md             # 404 error validation report
│   ├── ACCESSIBILITY.md                      # Accessibility compliance report
│   ├── ADMIN_DASHBOARD.md                    # Admin dashboard documentation
│   ├── AUDIT_QUICK_SUMMARY.md                # Quick audit summary
│   ├── AUTHENTICATION_SECURITY_REPORT.md     # Auth security analysis
│   ├── BUNDLE_ANALYSIS_REPORT.md             # Bundle size analysis
│   ├── CODE_CLEANUP_REPORT.md                # Code cleanup documentation
│   ├── CONTACT_FORM_COMPLETE.md              # Contact form implementation summary
│   ├── CONTACT_FORM_SETUP.md                 # Contact form setup guide
│   ├── DATABASE_SCHEMA.md                    # Database structure documentation
│   ├── GOOGLE_ANALYTICS_SETUP.md             # Google Analytics setup guide
│   ├── GOOGLE_SSO_SETUP.md                   # Google SSO integration guide
│   ├── I18N_IMPLEMENTATION.md                # Internationalization documentation
│   ├── IMAGE_OPTIMIZATION_REPORT.md          # Image optimization analysis
│   ├── IMPORT_OPTIMIZATION_REPORT.md         # Import optimization report
│   ├── LINK_TESTS_REFERENCE.md               # Link testing documentation
│   ├── LINK_VALIDATION_COMPLETE.md           # Link validation report
│   ├── MULTI_LANGUAGE_SETUP.md               # Multi-language setup guide
│   ├── PRODUCTION_CHECKLIST.md               # Production deployment checklist
│   ├── ROUTE_VALIDATION_REPORT.md            # Route validation analysis
│   ├── SECURITY_HEADERS_CSP_REPORT.md        # Security headers report
│   ├── SECURITY_VALIDATION_REPORT.md         # Security validation analysis
│   ├── SITE_AUDIT_REPORT.md                  # Complete site audit
│   ├── STORYBOARD_BUILD_FIX.md               # Storyboard build fix documentation
│   ├── SUPABASE_SETUP_COMPLETE.md            # Supabase integration guide
│   ├── TESTING_CHECKLIST.md                  # Testing procedures checklist
│   ├── TRANSLATION_SUMMARY.md                # Translation implementation summary
│   └── TRUST_CENTER_IMPLEMENTATION.md        # Trust center documentation
│
├── 📁 app/                                   # Next.js App Router directory
│   ├── globals.css                           # Global styles
│   ├── layout.tsx                            # Root layout component
│   ├── page.tsx                              # Landing page (/)
│   ├── loading.tsx                           # Loading state component
│   ├── error.tsx                             # Error boundary component
│   ├── global-error.tsx                      # Global error handler
│   ├── robots.ts                             # Robots.txt configuration
│   ├── sitemap.ts                            # Sitemap generation
│   │
│   ├── 📁 account/                           # User account pages
│   │   ├── credits/                          # Credit management
│   │   │   └── page.tsx
│   │   ├── pricing/                          # Pricing plans
│   │   │   └── page.tsx
│   │   ├── purchases/                        # Purchase history
│   │   │   └── page.tsx
│   │   ├── referrals/                        # Referral program
│   │   │   └── page.tsx
│   │   └── settings/                         # User settings
│   │       └── page.tsx
│   │
│   ├── 📁 admin/                             # Admin dashboard pages
│   │   ├── config/                           # Admin configuration
│   │   │   ├── ai-credits/
│   │   │   │   └── page.tsx
│   │   │   └── pricing/
│   │   │       └── page.tsx
│   │   ├── dashboard/                        # Admin overview
│   │   │   └── page.tsx
│   │   ├── expenses/                         # Expense tracking
│   │   │   └── page.tsx
│   │   ├── login/                            # Admin login
│   │   │   └── page.tsx
│   │   ├── settings/                         # Admin settings
│   │   │   └── page.tsx
│   │   └── users/                            # User management
│   │       └── page.tsx
│   │
│   ├── 📁 api/                               # API Routes
│   │   ├── contact/                          # Contact form endpoint
│   │   │   └── route.ts                      # POST - Send contact email
│   │   └── courses/                          # Course management API
│   │       ├── route.ts                      # GET (list), POST (create)
│   │       └── [id]/
│   │           └── route.ts                  # GET, PUT, DELETE (single course)
│   │
│   ├── 📁 api-docs/                          # API documentation page
│   │   └── page.tsx
│   │
│   ├── 📁 coming-soon/                       # Coming soon placeholder
│   │   └── page.tsx
│   │
│   ├── 📁 create/                            # Course creation flow
│   │   ├── loading.tsx                       # Loading state
│   │   ├── page.tsx                          # Course creation hub
│   │   ├── essentials/                       # Step 1: Course essentials
│   │   │   └── page.tsx
│   │   ├── modules/                          # Step 2: Modules
│   │   │   └── page.tsx
│   │   ├── multimedia/                       # Step 3: Multimedia
│   │   │   └── page.tsx
│   │   └── storyboard/                       # Step 4: Storyboard
│   │       └── page.tsx
│   │
│   ├── 📁 dashboard/                         # User dashboard
│   │   ├── loading.tsx
│   │   └── page.tsx
│   │
│   ├── 📁 faq/                               # FAQ page
│   │   └── page.tsx
│   │
│   ├── 📁 help/                              # Help center
│   │   └── page.tsx
│   │
│   ├── 📁 login/                             # Login page
│   │   └── page.tsx
│   │
│   ├── 📁 padmin/                            # Platform admin
│   │   └── page.tsx
│   │
│   ├── 📁 pricing/                           # Pricing page
│   │   └── page.tsx
│   │
│   ├── 📁 refer/                             # Referral program page
│   │   └── page.tsx
│   │
│   ├── 📁 support/                           # Support page
│   │   └── page.tsx
│   │
│   ├── 📁 terms-of-service/                  # Terms of service
│   │   └── page.tsx
│   │
│   ├── 📁 terms-of-use/                      # Terms of use
│   │   └── page.tsx
│   │
│   ├── 📁 trust/                             # Trust center
│   │   ├── page.tsx                          # Trust center hub
│   │   ├── cookies/                          # Cookie policy
│   │   │   └── page.tsx
│   │   ├── gdpr/                             # GDPR compliance
│   │   │   └── page.tsx
│   │   ├── privacy/                          # Privacy policy
│   │   │   └── page.tsx
│   │   ├── terms-of-service/                 # Terms of service
│   │   │   └── page.tsx
│   │   └── terms-of-use/                     # Terms of use
│   │       └── page.tsx
│   │
│   └── 📁 tutorials/                         # Tutorials page
│       └── page.tsx
│
├── 📁 components/                            # React components
│   ├── ContactForm.tsx                       # Reusable contact form modal
│   │
│   ├── 📁 course/                            # Course-related components
│   │   └── UnsavedChangesModal.tsx           # Unsaved changes warning
│   │
│   ├── 📁 layout/                            # Layout components
│   │   ├── ConditionalFooter.tsx             # Conditional footer display
│   │   ├── CookieConsent.tsx                 # Cookie consent banner
│   │   ├── Footer.tsx                        # Site footer
│   │   ├── Header.tsx                        # Site header/nav
│   │   └── ... (other layout components)
│   │
│   └── 📁 ui/                                # UI components
│       └── ... (buttons, cards, modals, etc.)
│
├── 📁 hooks/                                 # Custom React hooks
│   ├── useUnsavedChanges.ts                  # Unsaved changes detection
│   └── ... (other custom hooks)
│
├── 📁 lib/                                   # Utility libraries
│   ├── adminAuth.ts                          # Admin authentication
│   ├── adminConfig.ts                        # Admin configuration
│   ├── adminData.ts                          # Admin data management
│   ├── analytics.ts                          # Google Analytics integration
│   ├── auth.ts                               # Authentication utilities
│   ├── courseStorage.ts                      # Course data storage
│   ├── creditManagement.ts                   # Credit system
│   ├── expenses.ts                           # Expense tracking
│   ├── exportUtils.ts                        # Export functionality
│   ├── google-auth.ts                        # Google OAuth
│   ├── icons.ts                              # Icon imports/exports
│   ├── index.ts                              # Library exports
│   ├── legalContent.ts                       # Legal content/terms
│   ├── platformConfig.ts                     # Platform configuration
│   │
│   ├── 📁 i18n/                              # Internationalization
│   │   └── ... (translation files)
│   │
│   └── 📁 supabase/                          # Supabase integration
│       ├── client.ts                         # Browser-side Supabase client
│       ├── server.ts                         # Server-side Supabase client
│       └── database.types.ts                 # Database TypeScript types
│
├── 📁 public/                                # Static assets
│   ├── images/                               # Image assets
│   ├── icons/                                # Icon files
│   └── ... (other static files)
│
├── 📁 tests/                                 # Test files
│   ├── links.test.ts                         # Link validation tests
│   ├── run-tests.js                          # Test runner script
│   ├── IMPLEMENTATION_SUMMARY.md             # Test implementation docs
│   ├── QUICKSTART.md                         # Test quickstart guide
│   └── README.md                             # Test documentation
│
├── 📁 playwright-report/                     # Playwright test reports
│   └── index.html                            # Test report viewer
│
└── 📁 test-results/                          # Test result artifacts
    └── ... (test output files)
```

## Key Features by Directory

### `/app` - Next.js App Router
- **Core Pages**: Landing, Dashboard, Login, Pricing
- **Account Management**: Credits, Settings, Purchases, Referrals
- **Course Creation**: 4-step wizard (Essentials → Modules → Multimedia → Storyboard)
- **Admin Panel**: User management, expenses, configuration
- **Legal/Trust**: Privacy, Terms, GDPR, Cookie policies
- **Support**: Help center, FAQ, Tutorials, Contact

### `/app/api` - API Routes
- **Contact API** (`/api/contact`): Email contact form submissions
- **Courses API** (`/api/courses`): RESTful CRUD operations
  - `GET /api/courses` - List all courses
  - `POST /api/courses` - Create course (requires 100 credits)
  - `GET /api/courses/[id]` - Get single course
  - `PUT /api/courses/[id]` - Update course
  - `DELETE /api/courses/[id]` - Soft delete course

### `/components` - React Components
- **ContactForm**: Reusable modal contact form with email integration
- **Course Components**: Unsaved changes detection, course cards
- **Layout Components**: Header, Footer, Cookie consent
- **UI Components**: Buttons, cards, modals, form elements

### `/lib` - Business Logic
- **Authentication**: Google OAuth, session management
- **Supabase Integration**: Client/server helpers, type-safe database access
- **Credit System**: Purchase, validation, transaction tracking
- **Storage**: Course data persistence
- **Analytics**: Google Analytics tracking
- **Exports**: PDF, DOCX, SCORM generation

### `/lib/supabase` - Database Layer
- **client.ts**: Browser-side client for Client Components
- **server.ts**: Server-side client for API routes & Server Components
- **database.types.ts**: Complete TypeScript types for all 10 tables

## Database Tables (Supabase/PostgreSQL)

1. **profiles** - User profiles and settings
2. **courses** - Course metadata and content
3. **modules** - Course modules
4. **lessons** - Individual lessons within modules
5. **slides** - Lesson slides/content
6. **credits_transactions** - Credit purchase/usage history
7. **referrals** - Referral program tracking
8. **payments** - Payment processing records
9. **file_uploads** - Uploaded media files
10. **ai_generations** - AI-generated content logs

## Build Output (`.next/`)
- Optimized production build
- Server-side rendered pages
- Static assets and chunks
- Build manifest and metadata

## Configuration Files

| File | Purpose |
|------|---------|
| `middleware.ts` | Route protection & authentication |
| `next.config.ts` | Next.js configuration (Turbopack, images, etc.) |
| `tailwind.config.ts` | Tailwind CSS theme & plugins |
| `tsconfig.json` | TypeScript compiler options |
| `eslint.config.mjs` | Code linting rules |
| `playwright.config.ts` | E2E test configuration |
| `.env.local.example` | Environment variables template |

## Tech Stack

- **Framework**: Next.js 16.0.0 (App Router, Turbopack)
- **UI**: React 19.2.0, Tailwind CSS
- **Database**: Supabase (PostgreSQL with RLS)
- **Authentication**: Supabase Auth, Google OAuth
- **Email**: Resend API (contact form)
- **Analytics**: Google Analytics 4
- **Testing**: Playwright (E2E), Jest (unit)
- **Deployment**: Vercel (recommended)

## Entry Points

- **Landing Page**: `app/page.tsx`
- **API Routes**: `app/api/**/*.ts`
- **Middleware**: `middleware.ts`
- **Root Layout**: `app/layout.tsx`
- **Global Styles**: `app/globals.css`

## Recent Additions

### Contact Form System ✅
- **Component**: `components/ContactForm.tsx`
- **API**: `app/api/contact/route.ts`
- **Integrations**: Landing page, Help center, Support page
- **Email**: Sends to support@personalacademy.app via Resend

### Supabase Integration ✅
- **Client Setup**: Browser and server-side clients
- **Type Safety**: Complete database type definitions
- **API Routes**: RESTful courses API with authentication
- **Middleware**: Route protection for authenticated pages

## Notes

- All `.tsx` files use TypeScript with strict mode
- Components follow React 19 best practices
- API routes use Next.js App Router conventions
- Authentication uses Supabase middleware
- All routes are protected via `middleware.ts`
- Build output is optimized for production deployment

---

**Last Updated**: January 2025  
**Version**: 1.0.0  
**Status**: Production Ready

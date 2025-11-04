# Admin Portal - Quick Reference Guide

## 🎯 At a Glance

**What:** Professional admin sidebar navigation system  
**Where:** All `/admin/*` pages (except login)  
**Pages:** 17 connected admin pages  
**Status:** ✅ Production Ready  

---

## 📍 All Admin Pages

### Core Pages
| Page | URL | Purpose |
|------|-----|---------|
| Dashboard | `/admin/dashboard` | Main overview |
| Analytics | `/admin/analytics` | Revenue & usage |

### Management Pages
| Page | URL | Purpose |
|------|-----|---------|
| Users | `/admin/users` | Manage users |
| Expenses | `/admin/expenses` | Financial tracking |
| Announcements | `/admin/announcements` | Platform notifications |
| Support | `/admin/support` | Support tickets |

### Configuration Pages
| Page | URL | Purpose |
|------|-----|---------|
| Settings Hub | `/admin/settings` | AI config hub |
| Platform | `/admin/config/platform` | General config |
| Pricing | `/admin/config/pricing` | Pricing plans |
| AI Credits | `/admin/config/ai-credits` | Credits config |
| OpenRouter | `/admin/config/openrouter` | API setup |
| AI Prompts | `/admin/config/ai-prompts` | Prompts config |

### Logging & System Pages
| Page | URL | Purpose |
|------|-----|---------|
| Logs | `/admin/logs` | Activity logs |
| Notifications | `/admin/notifications` | Alert settings |
| Content | `/admin/content` | Content management |
| System | `/admin/system` | System info |

---

## 🧭 Menu Structure

```
┌─ CORE ─────────────────────┐
│ ▸ Dashboard                │
│ ▸ Analytics                │
├─ MANAGEMENT ───────────────┤
│ ▸ Users                    │
│ ▸ Expenses                 │
│ ▸ Announcements            │
│ ▸ Support Tickets          │
├─ CONFIGURATION ────────────┤
│ ▸ Platform Settings        │
│ ▸ AI Configuration         │
│ ▸ Pricing Plans            │
│ ▸ AI Credits               │
│ ▸ OpenRouter Setup         │
│ ▸ AI Prompts               │
├─ CONTENT & SYSTEM ─────────┤
│ ▸ Content Management       │
│ ▸ Activity Logs            │
│ ▸ Notifications            │
│ ▸ System Status            │
└─────────────────────────────┘
        [Logout]
```

---

## 🚀 Quick Start

### Step 1: Access Admin
```
→ Go to /admin/login
→ Enter credentials
→ Dashboard loads with sidebar
```

### Step 2: Navigate
```
→ Click menu item to go to page
→ Section headers expand/collapse
→ Click logo to return to dashboard
→ Logout button always visible at bottom
```

### Step 3: From Any Page
```
→ Sidebar always visible on desktop
→ Mobile menu accessible via hamburger
→ All pages have same menu structure
→ Quick access to all 17 pages
```

---

## 📱 Mobile vs Desktop

### Desktop (md+)
- Sidebar always visible on left
- 64px wide (collapsible in future)
- Main content takes remaining space
- No scroll issues

### Mobile (small)
- Hamburger menu at top-left
- Full-screen overlay when open
- Click item or backdrop to close
- Smooth animations

---

## 🔗 Navigation Shortcuts

**From Dashboard:**
- Users → Quick action button
- Analytics → Metrics link
- Settings → Config button
- Support → Quick access

**From Any Page:**
- Logo → Back to dashboard
- Logout → Exit to login
- Sidebar → Any page in one click

---

## 📝 Component Files

### Sidebar Component
**File:** `components/admin/AdminSidebar.tsx`

**Key Features:**
- Dynamic menu generation
- Mobile toggle support
- Active page highlighting
- Expandable sections
- Logout integration

**Usage:**
```tsx
<AdminSidebar />
```

### Admin Layout
**File:** `app/admin/layout.tsx`

**What It Does:**
- Auth check on all pages
- Renders sidebar globally
- Responsive grid layout
- Login exemption

**Applied To:** All `/admin/*` routes

---

## ✅ Features

| Feature | Status |
|---------|--------|
| All pages connected | ✅ |
| Mobile responsive | ✅ |
| Active highlighting | ✅ |
| One-click navigation | ✅ |
| Logout from anywhere | ✅ |
| Authentication protected | ✅ |
| Expandable sections | ✅ |
| Dark theme | ✅ |

---

## 🎯 Common Tasks

### View User List
`Dashboard` → Click Users → View/manage users

### Configure AI
`Dashboard` → Settings → Click service → Configure

### Check Analytics
`Dashboard` → Click Analytics → View charts

### Send Announcement
`Management` → Announcements → Create new

### View Logs
`Core` → Logs (or Dashboard → View All) → Search activities

---

## 🐛 Troubleshooting

### Sidebar not showing?
- Check if authenticated (login required)
- Clear browser cache
- Try different page

### Menu items not working?
- Check network connection
- Verify routes exist
- Check browser console for errors

### Mobile menu not opening?
- Tap hamburger icon (top-left)
- Check for JavaScript errors
- Try different browser

---

## 📚 Learn More

**Full Documentation:**
→ `ADMIN_PORTAL_COMPREHENSIVE.md`

**Integration Details:**
→ `ADMIN_PORTAL_INTEGRATION_SUMMARY.md`

**Component Code:**
→ `components/admin/AdminSidebar.tsx`

---

## 🚀 Ready to Deploy!

All admin pages are connected and ready for production.

**Next Step:** `npm run build && npm start`

---

*Quick Reference - November 2, 2025*

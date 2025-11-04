// Route visibility helpers shared across the app.
// Only publishes route metadata and helpers that do not touch client storage.

export const publicRoutes = [
  '/',
  '/login',
  '/pricing',
  '/refer',
  '/coming-soon',
  '/faq',
  '/support',
  '/trust',
]

export const protectedRoutes = [
  '/dashboard',
  '/create',
  '/account',
]

export const isPublicRoute = (pathname: string): boolean => {
  if (publicRoutes.includes(pathname)) return true
  if (pathname.startsWith('/trust')) return true
  if (pathname.startsWith('/terms')) return true
  return false
}

export const isProtectedRoute = (pathname: string): boolean => {
  return protectedRoutes.some(route => pathname.startsWith(route))
}

// This file is a migration helper to reinitialize admin config
// Call this function once in browser console or on first page load

export function migrateAdminConfig() {
  if (typeof window === 'undefined') return;
  
  try {
    // Clear old corrupted config
    localStorage.removeItem('adminConfig');
    console.log('✅ Cleared old admin config from localStorage');
  } catch (error) {
    console.error('Failed to clear old config:', error);
  }
}

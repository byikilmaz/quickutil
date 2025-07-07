// Admin Authentication & Authorization

// Admin kullanıcı email'leri - environment variable'dan da okunabilir
const ADMIN_EMAILS = [
  'hello@quickutil.app',
  'admin@quickutil.app',
  // Buraya admin email'lerini ekleyebilirsiniz
];

export interface AdminUser {
  email: string;
  role: 'admin' | 'super_admin';
  permissions: string[];
}

/**
 * Kullanıcının admin olup olmadığını kontrol eder
 */
export function isAdminUser(email: string | null | undefined): boolean {
  if (!email) return false;
  return ADMIN_EMAILS.includes(email.toLowerCase());
}

/**
 * Admin yetkilerini getirir
 */
export function getAdminPermissions(email: string): string[] {
  if (!isAdminUser(email)) return [];
  
  // Şimdilik tüm admin'lere full yetki
  return [
    'view_analytics',
    'view_users',
    'view_activities',
    'export_data',
    'manage_users',
    'view_system_logs'
  ];
}

/**
 * Belirli bir yetki kontrolü
 */
export function hasAdminPermission(email: string, permission: string): boolean {
  const permissions = getAdminPermissions(email);
  return permissions.includes(permission);
}

/**
 * Admin middleware kontrolü
 */
export function requireAdminAuth(userEmail: string | null | undefined): boolean {
  return isAdminUser(userEmail);
} 
/**
 * Decode JWT token without verification (client-side)
 * Note: This does NOT verify the token - only decodes the payload
 */
export const decodeToken = (token: string): any => {
  try {
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split('')
        .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join('')
    );
    return JSON.parse(jsonPayload);
  } catch (error) {
    console.error('Error decoding token:', error);
    return null;
  }
};

/**
 * Get user role from token
 */
export const getRoleFromToken = (token: string): string | null => {
  const decoded = decodeToken(token);
  return decoded?.role || null;
};

/**
 * Check if token is expired
 */
export const isTokenExpired = (token: string): boolean => {
  const decoded = decodeToken(token);
  if (!decoded || !decoded.exp) return true;

  const currentTime = Date.now() / 1000;
  return decoded.exp < currentTime;
};

/**
 * Get redirect path based on user role
 */
export const getRedirectPathByRole = (role: string): string => {
  const roleRedirects: Record<string, string> = {
    admin: '/admin/dashboard',
    partner: '/partner/dashboard',
    agent: '/agent/dashboard',
    user: '/',
    customer: '/',
  };

  return roleRedirects[role.toLowerCase()] || '/';
};

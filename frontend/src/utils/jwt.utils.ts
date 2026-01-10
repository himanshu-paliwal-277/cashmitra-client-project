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
        .map(c => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
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

/**
 * Detect role based on current URL path
 */
export const getRoleFromPath = (pathname: string): 'admin' | 'partner' | 'agent' | 'customer' => {
  if (pathname.startsWith('/admin')) {
    return 'admin';
  }
  if (pathname.startsWith('/partner')) {
    return 'partner';
  }
  if (pathname.startsWith('/agent')) {
    return 'agent';
  }
  return 'customer';
};

/**
 * Get storage keys for a specific role
 */
export const getStorageKeys = (role: 'admin' | 'partner' | 'agent' | 'customer') => {
  return {
    token: `${role}Token`,
    userData: `${role}UserData`,
  };
};

/**
 * Get login path based on user role
 */
export const getLoginPathByRole = (role: 'admin' | 'partner' | 'agent' | 'customer'): string => {
  const roleLoginPaths: Record<string, string> = {
    admin: '/admin/login',
    partner: '/partner/login',
    agent: '/agent/login',
    customer: '/login',
  };

  return roleLoginPaths[role.toLowerCase()] || '/login';
};

/**
 * Check if current user's token is expired and clear if necessary
 * Returns true if token was cleared, false otherwise
 */
export const checkAndClearExpiredToken = (role: 'admin' | 'partner' | 'agent' | 'customer'): boolean => {
  const storageKeys = getStorageKeys(role);
  const token = localStorage.getItem(storageKeys.token);

  if (token && isTokenExpired(token)) {
    console.log(`${role} token expired - clearing auth data`);
    localStorage.removeItem(storageKeys.token);
    localStorage.removeItem(storageKeys.userData);
    return true;
  }

  return false;
};

/**
 * Validate and redirect if token is expired
 * Should be called on protected route entry
 */
export const validateTokenAndRedirect = (role: 'admin' | 'partner' | 'agent' | 'customer'): boolean => {
  const wasCleared = checkAndClearExpiredToken(role);

  if (wasCleared) {
    const loginPath = getLoginPathByRole(role);
    window.location.href = loginPath;
    return true;
  }

  return false;
};

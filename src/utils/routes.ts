export const isUserLogoutRoute = (url: string) => ['/auth/logout/user', '/auth/logout/user/all'].includes(url);
export const isAdminLogoutRoute = (url: string) => ['/auth/logout/admin', '/auth/logout/admin/all'].includes(url);
export const isAdminRefreshRoute = (url: string) => url.startsWith('/auth/refresh/admin');
export const isUserRefreshRoute = (url: string) => url.startsWith('/auth/refresh/user');
export const isAdminProtectedRoute = (url: string) => url.startsWith('/protected/admin/');
export const isUserProtectedRoute = (url: string) => url.startsWith('/protected/');
export const adminPrefix = '/protected/admin';
export const userPrefix = '/protected';

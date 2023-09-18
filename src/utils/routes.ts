export const isAdminLoginRoute = (url: string) => url.startsWith('/auth/login/admin');
export const isUserLoginRoute = (url: string) => url.startsWith('/auth/login/user');
export const isUserLogoutRoute = (url: string) => ['/auth/logout/user', '/auth/logout/user/all'].includes(url);
export const isRefreshRoute = (url: string) => ['/auth/refresh/user', '/auth/refresh/admin'].includes(url);
export const isAdminLogoutRoute = (url: string) => ['/auth/logout/admin', '/auth/logout/admin/all'].includes(url);
export const isAdminProtectedRoute = (url: string) => url.startsWith('/protected/admin/');
export const isUserProtectedRoute = (url: string) => url.startsWith('/protected/');
export const adminPrefix = '/protected/admin';
export const userPrefix = '/protected';

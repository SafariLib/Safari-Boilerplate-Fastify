export type RouteEntityCheck = () => boolean;
export type SetUrl = (requestUrl: string) => void;

export interface RequestService {
    isProtectedRoute: RouteEntityCheck;
    isRefreshRoute: RouteEntityCheck;
    isLoginRoute: RouteEntityCheck;
    isLogoutRoute: RouteEntityCheck;
    setUrl: SetUrl;
    protectedPrefix: string;
}

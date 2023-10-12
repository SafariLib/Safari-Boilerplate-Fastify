export type GetOrSetSecret = (userId: number) => Promise<string>;
export type SetUserToken = (token: string, userId: number) => Promise<void>;
export type GetUserSecret = (token: string) => Promise<string | null>;
export type DeleteUserCache = (userId: number) => Promise<void>;
export type DeleteUserToken = (token: string) => Promise<void>;

export interface CacheService {
    getOrSetUserSecret: GetOrSetSecret;
    setUserToken: SetUserToken;
    getUserSecret: GetUserSecret;
    deleteUserCache: DeleteUserCache;
    deleteUserToken: DeleteUserToken;
}

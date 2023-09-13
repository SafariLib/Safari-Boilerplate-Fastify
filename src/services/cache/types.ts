export type Kid = string | number;

export type SetValue = (kid: Kid | number, value: string) => Promise<'OK'>;

export type GetValue = (kid: Kid) => Promise<string | null>;

export type DeleteValue = (kid: Kid) => Promise<number>;

export type SetTokenToBlacklist = (token: string) => Promise<'OK'>;

export type GetTokenFromBlacklist = (token: string) => Promise<string | null>;

export interface CacheService {
    setUserSecret: SetValue;
    deleteUserSecret: DeleteValue;
    getUserSecret: GetValue;
    setCustomerSecret: SetValue;
    deleteCustomerSecret: DeleteValue;
    getCustomerSecret: GetValue;
    setUserTokenBlacklist: SetTokenToBlacklist;
    getUserTokenBlacklist: GetTokenFromBlacklist;
    setCustomerTokenBlacklist: SetTokenToBlacklist;
    getCustomerTokenBlacklist: GetTokenFromBlacklist;
}

export type Kid = string | number;

export type SetValue = (kid: Kid | number, value: string) => Promise<'OK'>;

export type GetValue = (kid: Kid) => Promise<string | null>;

export interface CacheService {
    setUserSecret: SetValue;
    getUserSecret: GetValue;
    setCustomerSecret: SetValue;
    getCustomerSecret: GetValue;
    setUserTokenBlacklist: SetValue;
    getUserTokenBlacklist: GetValue;
    setCustomerTokenBlacklist: SetValue;
    getCustomerTokenBlacklist: GetValue;
}

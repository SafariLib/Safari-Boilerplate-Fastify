import { TokenContent } from '../../types';

export type VerifyCredentials<T> = (payload: { username: string; password: string }) => Promise<{
    tokenContent: TokenContent;
    user: Omit<T, 'password'>;
}>;

export type LogUser<T> = (
    username: string,
    password: string,
    ip: string,
    userAgent: string,
) => Promise<{
    user: Omit<T, 'password'>;
    refreshToken: string;
    accessToken: string;
}>;

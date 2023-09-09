import { CookieSerializeOptions } from '@fastify/cookie';
import { Token, TokenContent } from '@types';
import { VerifyOptions } from 'jsonwebtoken';

export type SignAccessToken = (payload: TokenContent) => string;

export type SignRefreshToken = (payload: TokenContent) => string;

export type VerifyToken = (token: string, verifyOpts: VerifyOptions) => Token;

export type CacheUserRefreshToken = (token: string, userId: number, ip: string, userAgent: string) => Promise<void>;

export type CacheCustomerRefreshToken = (
    token: string,
    customerId: number,
    ip: string,
    userAgent: string,
) => Promise<void>;

export type RevokeToken = (token: string) => Promise<void>;

export interface JsonWebToken {
    signAccessToken: SignAccessToken;
    signRefreshToken: SignRefreshToken;
    verifyAccessToken: (token: string) => Token;
    verifyRefreshToken: (token: string) => Token;
    cacheUserRefreshToken: CacheUserRefreshToken;
    cacheCustomerRefreshToken: CacheCustomerRefreshToken;
    revokeUserRefreshToken: RevokeToken;
    revokeCustomerRefreshToken: RevokeToken;
    cookieOpts: CookieSerializeOptions;
    tokens: {
        access: Token | null;
        refresh: Token | null;
    };
}

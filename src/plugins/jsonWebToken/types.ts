import { CookieSerializeOptions } from '@fastify/cookie';
import { Token, TokenContent } from '@types';
import { VerifyOptions } from 'jsonwebtoken';

export type SignAccessToken = (payload: TokenContent) => string;

export type SignRefreshToken = (payload: TokenContent) => string;

export type VerifyToken = (token: string, verifyOpts: VerifyOptions) => Token;

export type CacheUserRefreshToken = (token: string, userId: number, ip: string, userAgent: string) => void;

export type CacheCustomerRefreshToken = (token: string, customerId: number, ip: string, userAgent: string) => void;
export interface JsonWebToken {
    signAccessToken: (payload: TokenContent) => string;
    signRefreshToken: (payload: TokenContent) => string;
    verifyAccessToken: (token: string) => Token;
    verifyRefreshToken: (token: string) => Token;
    cacheUserRefreshToken: (token: string, userId: number, ip: string, userAgent: string) => void;
    cacheCustomerRefreshToken: (token: string, customerId: number, ip: string, userAgent: string) => void;
    cookieOpts: CookieSerializeOptions;
    tokens: {
        access: Token | null;
        refresh: Token | null;
    };
}

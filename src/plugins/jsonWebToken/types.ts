import { CookieSerializeOptions } from '@fastify/cookie';
import { Token, TokenContent } from '../../types';

export type TokenState = 'INVALID' | 'EXPIRED' | 'VALID';

export type SignAccessToken = (payload: TokenContent) => string;

export type SignRefreshToken = (payload: TokenContent) => string;

export type VerifyAccessToken = (token: string) => { token: Token; state: TokenState };

export type VerifyRefreshToken = (token: string) => { token: Token; state: TokenState };

export interface JsonWebToken {
    signAccessToken: (payload: TokenContent) => string;
    signRefreshToken: (payload: TokenContent) => string;
    verifyAccessToken: (token: string) => { token: Token; state: TokenState };
    verifyRefreshToken: (token: string) => { token: Token; state: TokenState };
    cookieOpts: CookieSerializeOptions;
    tokens: {
        access: Token | null;
        refresh: Token | null;
    };
}

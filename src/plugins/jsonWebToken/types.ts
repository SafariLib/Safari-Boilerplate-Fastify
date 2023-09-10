import { CookieSerializeOptions } from '@fastify/cookie';
import { Token, TokenContent } from '@types';
import { SignOptions, VerifyOptions } from 'jsonwebtoken';

export type SignAccessToken = (payload: TokenContent) => string;

export type SignRefreshToken = (payload: TokenContent) => string;

export type VerifyToken = (token: string, verifyOpts: VerifyOptions) => Token;

export interface JsonWebToken {
    signAccessToken: SignAccessToken;
    signRefreshToken: SignRefreshToken;
    verifyAccessToken: (token: string) => Token;
    verifyRefreshToken: (token: string) => Token;
    cookieOpts: CookieSerializeOptions;
    refreshSignOpts: SignOptions;
    tokens: {
        access: Token | null;
        refresh: Token | null;
    };
}

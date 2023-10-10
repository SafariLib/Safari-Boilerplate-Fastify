import type { CookieSerializeOptions } from '@fastify/cookie';
import type { FastifyRequest } from 'fastify';
import type { SignOptions, VerifyOptions } from 'jsonwebtoken';
import type { defaultOpts } from './utils';

export interface TokenContent {
    userId: number;
    uuid: string;
    role: number;
}

export interface DecodedToken extends TokenContent {
    iat: number;
    exp: number;
}

export interface FastifyToken {
    token?: string;
    content?: DecodedToken;
}

export interface VerifyedToken {
    decoded: DecodedToken;
    token: string;
}

export type SignToken = (payload: TokenContent, opts: SignOptions, secret: string) => string;
export type VerifyToken = (token: string, opts: VerifyOptions, secret: string) => VerifyedToken;
export type GetToken = (request: FastifyRequest) => string;

export interface JsonWebTokenPlugin {
    getAccessToken: GetToken;
    getRefreshToken: GetToken;
    generateCookieOpts: () => CookieSerializeOptions;
    signAccessToken: (token: TokenContent, secret: string) => string;
    signRefreshToken: (token: TokenContent, secret: string) => string;
    verifyAccessToken: (token: string, secret: string) => VerifyedToken;
    verifyRefreshToken: (token: string, secret: string) => VerifyedToken;
    tokens: {
        access: FastifyToken | null;
        refresh: FastifyToken | null;
        cleanState: () => void;
    };
    defaultOpts: typeof defaultOpts;
}

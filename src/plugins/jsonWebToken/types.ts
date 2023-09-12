import { CookieSerializeOptions } from '@fastify/cookie';
import { Token, TokenContent } from '@types';
import { FastifyRequest } from 'fastify';
import { SignOptions, VerifyOptions } from 'jsonwebtoken';

export type SignAccessToken = (payload: TokenContent, userSecret?: string) => string;

export type SignRefreshToken = (payload: TokenContent) => string;

export type VerifyToken = (token: string, verifyOpts: VerifyOptions, secret?: string) => Token;

export type GetAccessToken = (request: FastifyRequest) => string;

export interface JsonWebToken {
    getAccessToken: GetAccessToken;
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

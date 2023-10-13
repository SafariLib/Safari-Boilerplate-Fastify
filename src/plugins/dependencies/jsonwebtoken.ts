import type { CookieSerializeOptions, UnsignResult } from '@fastify/cookie';
import type { FastifyPluginCallback, FastifyRequest } from 'fastify';
import plugin from 'fastify-plugin';
import type { Algorithm, SignOptions, VerifyOptions } from 'jsonwebtoken';
import { sign, verify } from 'jsonwebtoken';

export interface JsonWebTokenPluginOpts {
    algorithm: Algorithm;
    bearerToken: {
        name: string;
        expiresIn: number;
    };
    refreshToken: {
        name: string;
        expiresIn: number;
    };
}

export interface TokenState {
    bearerToken: string;
    refreshToken: string;
    userId: number;
    bearerValidity: Date;
    refreshValidity: Date;
}

export interface TokenContent {
    userId: number;
    uuid: string;
    role: number;
}

export interface DecodedToken extends TokenContent {
    iat: number;
    exp: number;
}

export type SignToken = (payload: TokenContent, opts: SignOptions, secret: string) => string;
export type VerifyToken = (token: string, opts: VerifyOptions, secret: string) => DecodedToken;
export type GetBearerTokenFromRequest = (request: FastifyRequest) => string;
export type GetRefreshTokenFromRequest = (request: FastifyRequest) => UnsignResult;
export type GetUserTokens = (userId: number, token: string) => TokenState;
export type RevokeUserTokens = (userId: number, token: string) => void;
export type SetUserTokens = (userId: number, bearerToken: string, refreshToken: string) => void;
export type GenerateCookieOpts = () => CookieSerializeOptions;

/**
 * @package jsonwebtoken
 * @see https://github.com/auth0/node-jsonwebtoken
 */
export default plugin((async (fastify, opts: JsonWebTokenPluginOpts, done) => {
    if (fastify.hasDecorator('jwt')) return done();
    const { cookieSerializeOpts } = fastify;

    const tokens = new Array<TokenState>();

    const getUserTokensByBearer: GetUserTokens = (userId, token) =>
        tokens.find(tk => tk.userId === userId && tk.bearerToken === token);

    const getUserTokensByRefresh: GetUserTokens = (userId, token) =>
        tokens.find(tk => tk.userId === userId && tk.refreshToken === token);

    const revokeUserTokensByBearer: RevokeUserTokens = (userId, token) => {
        const index = tokens.findIndex(tk => tk.userId === userId && tk.bearerToken === token);
        if (index === -1) return;
        tokens.splice(index, 1);
    };

    const revokeUserTokensByRefresh: RevokeUserTokens = (userId, token) => {
        const index = tokens.findIndex(tk => tk.userId === userId && tk.refreshToken === token);
        if (index === -1) return;
        tokens.splice(index, 1);
    };

    const setUserTokens: SetUserTokens = (userId, bearerToken, refreshToken) => {
        const bearerValidity = new Date(Date.now() + opts.bearerToken.expiresIn);
        const refreshValidity = new Date(Date.now() + opts.refreshToken.expiresIn);
        tokens.push({ bearerToken, refreshToken, userId, bearerValidity, refreshValidity });
    };

    const generateCookieOpts: GenerateCookieOpts = () => ({
        ...cookieSerializeOpts,
        expires: new Date(Date.now() + opts.refreshToken.expiresIn),
    });

    const signToken: SignToken = (payload, opts, secret) => sign(payload, secret, opts);

    const verifyToken: VerifyToken = (token, verifyOpts, secret) => verify(token, secret, verifyOpts) as DecodedToken;

    const getBearerTokenFromRequest: GetBearerTokenFromRequest = request =>
        (request.headers.authorization as string).split(' ')[1];

    const getRefreshTokenFromRequest: GetRefreshTokenFromRequest = request =>
        fastify.unsignCookie(request.cookies[opts.refreshToken.name]);

    fastify.decorate('jwt', {
        getUserTokensByBearer,
        getUserTokensByRefresh,
        revokeUserTokensByBearer,
        revokeUserTokensByRefresh,
        setUserTokens,
        generateCookieOpts,
        signToken,
        verifyToken,
        getBearerTokenFromRequest,
        getRefreshTokenFromRequest,
    });
    done();
}) as FastifyPluginCallback);

declare module 'fastify' {
    interface FastifyInstance {
        jwt: {
            getUserTokensByBearer: GetUserTokens;
            getUserTokensByRefresh: GetUserTokens;
            revokeUserTokensByBearer: RevokeUserTokens;
            revokeUserTokensByRefresh: RevokeUserTokens;
            setUserTokens: SetUserTokens;
            generateCookieOpts: GenerateCookieOpts;
            signToken: SignToken;
            verifyToken: VerifyToken;
            getBearerTokenFromRequest: GetBearerTokenFromRequest;
            getRefreshTokenFromRequest: GetRefreshTokenFromRequest;
        };
    }
}

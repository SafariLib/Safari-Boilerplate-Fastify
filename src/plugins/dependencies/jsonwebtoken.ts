import type { CookieSerializeOptions, UnsignResult } from '@fastify/cookie';
import type { FastifyPluginCallback, FastifyRequest } from 'fastify';
import plugin from 'fastify-plugin';
import type { Algorithm, SignOptions, VerifyOptions } from 'jsonwebtoken';
import { sign, verify } from 'jsonwebtoken';

export interface JsonWebTokenPluginOpts {
    algorithm: Algorithm;
    bearerToken: {
        name: string;
        secret?: string;
        expiresIn: number;
    };
    refreshToken: {
        name: string;
        secret?: string;
        expiresIn: number;
    };
}

export interface Session {
    bearer: {
        token: string;
        validity: Date;
    };
    refresh: {
        token: string;
        validity: Date;
    };
    userId: number;
}

export interface TokenContent {
    userId: number;
    uuid: string;
    roleId: number;
}

export interface DecodedToken extends TokenContent {
    iat: number;
    exp: number;
}

export interface VerifiedToken {
    content: DecodedToken;
    string: string;
    isRegistered: () => boolean;
    isValid: () => boolean;
    isExpired: () => boolean;
    revoke: () => void;
}

export type SignToken = (payload: TokenContent, opts: SignOptions, secret: string) => string;
export type VerifyToken = (
    token: string,
    opts: VerifyOptions,
    secret: string,
    type: 'Bearer' | 'Refresh',
) => VerifiedToken;
export type GetBearerTokenFromRequest = (request: FastifyRequest) => string;
export type GetRefreshTokenFromRequest = (request: FastifyRequest) => UnsignResult;
export type RevokeSession = (userId: number | string) => void;
export type RegisterTokens = (userId: number, bearerToken: string, refreshToken: string) => void;
export type GenerateCookieOpts = () => CookieSerializeOptions;

/**
 * @package jsonwebtoken
 * @see https://github.com/auth0/node-jsonwebtoken
 */
export default plugin((async (fastify, opts: JsonWebTokenPluginOpts, done) => {
    if (fastify.hasDecorator('jwt')) return done();
    const { cookieSerializeOpts } = fastify;

    const bearerSecret = opts.bearerToken.secret ?? Math.random().toString(36).slice(2);
    const refreshSecret = opts.refreshToken.secret ?? Math.random().toString(36).slice(2);
    const signBearerOpts = { algorithm: opts.algorithm, expiresIn: opts.bearerToken.expiresIn };
    const signRefreshOpts = { algorithm: opts.algorithm, expiresIn: opts.refreshToken.expiresIn };
    const verifyBearerOpts = { algorithms: [opts.algorithm], maxAge: opts.bearerToken.expiresIn };
    const verifyRefreshOpts = { algorithms: [opts.algorithm], maxAge: opts.refreshToken.expiresIn };

    const sessions = new Array<Session>();

    const revokeSession: RevokeSession = payload => {
        if (typeof payload === 'string') {
            const index = sessions.findIndex(({ bearer }) => bearer.token === payload);
            sessions.splice(index, 1);
        } else if (typeof payload === 'number') {
            const userTokens = sessions.filter(({ userId: id }) => id === payload);
            for (const { bearer, refresh, userId: id } of userTokens) {
                const index = sessions.findIndex(
                    ({ bearer: b, refresh: r, userId: i }) =>
                        i === id && b.token === bearer.token && r.token === refresh.token,
                );
                sessions.splice(index, 1);
            }
        }
    };

    const registerTokens: RegisterTokens = (userId, bearerToken, refreshToken) => {
        const bearerValidity = new Date(Date.now() + opts.bearerToken.expiresIn);
        const refreshValidity = new Date(Date.now() + opts.refreshToken.expiresIn);
        sessions.push({
            bearer: { token: bearerToken, validity: bearerValidity },
            refresh: { token: refreshToken, validity: refreshValidity },
            userId,
        });
    };

    const generateCookieOpts: GenerateCookieOpts = () => ({
        ...cookieSerializeOpts,
        expires: new Date(Date.now() + opts.refreshToken.expiresIn),
    });

    const verifyToken: VerifyToken = (token, opts, secret, type) => {
        const decoded = verify(token, secret, opts) as DecodedToken;
        const isRegistered = () => {
            if (type === 'Bearer') return sessions.find(({ bearer }) => bearer.token === token) !== undefined;
            if (type === 'Refresh') return sessions.find(({ refresh }) => refresh.token === token) !== undefined;
        };
        const isValid = () => decoded && typeof decoded === 'object';
        const isExpired = () => decoded && decoded.exp * 1000 < Date.now();
        const revoke = () => {
            const index = (() => {
                if (type === 'Bearer') return sessions.findIndex(({ bearer }) => bearer.token === token);
                if (type === 'Refresh') return sessions.findIndex(({ refresh }) => refresh.token === token);
            })();
            if (index === -1) return;
            sessions.splice(index, 1);
        };
        return {
            content: decoded,
            string: token,
            isRegistered,
            isValid,
            isExpired,
            revoke,
        };
    };

    const signToken: SignToken = (payload, opts, secret) => sign(payload, secret, opts);

    const getBearerTokenFromRequest: GetBearerTokenFromRequest = request =>
        request.headers.authorization?.split(' ')?.[1];

    const getRefreshTokenFromRequest: GetRefreshTokenFromRequest = request =>
        fastify.unsignCookie(request.cookies?.[opts.refreshToken.name] ?? '');

    fastify.decorate('jwt', {
        revokeSession,
        registerTokens,
        generateCookieOpts,
        signBearerToken: token => signToken(token, signBearerOpts, bearerSecret),
        signRefreshToken: token => signToken(token, signRefreshOpts, refreshSecret),
        verifyBearerToken: token => verifyToken(token, verifyBearerOpts, bearerSecret, 'Bearer'),
        verifyRefreshToken: token => verifyToken(token, verifyRefreshOpts, refreshSecret, 'Refresh'),
        getBearerTokenFromRequest,
        getRefreshTokenFromRequest,
    });
    done();
}) as FastifyPluginCallback);

declare module 'fastify' {
    interface FastifyInstance {
        jwt: {
            revokeSession: RevokeSession;
            registerTokens: RegisterTokens;
            generateCookieOpts: GenerateCookieOpts;
            signBearerToken: (token: TokenContent) => string;
            signRefreshToken: (token: TokenContent) => string;
            verifyBearerToken: (token: string) => VerifiedToken;
            verifyRefreshToken: (token: string) => VerifiedToken;
            getBearerTokenFromRequest: GetBearerTokenFromRequest;
            getRefreshTokenFromRequest: GetRefreshTokenFromRequest;
        };
    }
}

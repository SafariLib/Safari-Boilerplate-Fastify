import type { UnsignResult } from '@fastify/cookie';
import type { FastifyPluginCallback, FastifyRequest } from 'fastify';
import plugin from 'fastify-plugin';
import type { SignOptions, VerifyOptions } from 'jsonwebtoken';
import { sign, verify } from 'jsonwebtoken';

export interface JsonWebTokenPluginOpts {
    algorithm: Algorithm;
    accessToken: {
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
    revoke: () => void;
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
export type GetBearerToken = (request: FastifyRequest) => string;
export type GetRefreshToken = (request: FastifyRequest) => UnsignResult;

/**
 * @package jsonwebtoken
 * @see https://github.com/auth0/node-jsonwebtoken
 */
export default plugin((async (fastify, opts: JsonWebTokenPluginOpts, done) => {
    if (fastify.hasDecorator('jwt')) return done();
    const { cookieSerializeOpts } = fastify;

    const tokens = new Array<TokenState>();

    const generateCookieOpts = () => ({
        ...cookieSerializeOpts,
        expires: new Date(Date.now() + opts.refreshToken.expiresIn),
    });

    const signToken: SignToken = (payload, opts, secret) => sign(payload, secret, opts);

    const verifyToken: VerifyToken = (token, verifyOpts, secret) => verify(token, secret, verifyOpts) as DecodedToken;

    const getBearerToken: GetBearerToken = request => (request.headers.authorization as string).split(' ')[1];
    const getRefreshToken: GetRefreshToken = request => fastify.unsignCookie(request.cookies[opts.refreshToken.name]);

    fastify.decorate('jwt', {});
    done();
}) as FastifyPluginCallback);

declare module 'fastify' {
    interface FastifyInstance {
        // jwt: {};
    }
}

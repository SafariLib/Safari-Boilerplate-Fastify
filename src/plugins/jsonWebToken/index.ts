import { CookieSerializeOptions } from '@fastify/cookie';
import type { Token } from '@types';
import type { FastifyPluginCallback } from 'fastify';
import plugin from 'fastify-plugin';
import jsonwebtoken, { Algorithm, SignOptions, VerifyOptions } from 'jsonwebtoken';
import type { GetAccessToken, JsonWebToken, SignAccessToken, SignRefreshToken, VerifyToken } from './types';

declare module 'fastify' {
    interface FastifyInstance {
        jsonWebToken: JsonWebToken;
    }
}

/**
 * @package jsonwebtoken
 * @see https://github.com/auth0/node-jsonwebtoken
 *
 * - HS256: HMAC using SHA-256 hash algorithm (default)
 * - Secret:
 *  - Private global secret key for signing Refresh JWT
 *  - Private per user secret key for signing Access JWT (stored in Redis)
 */
export default plugin((async (fastify, opts, done) => {
    if (fastify.hasDecorator('jsonWebToken')) return done();

    const algorithm: Algorithm = 'HS256'; // length: 256 bits;
    const accessExpiresIn = 900000; // 15 minutes
    const refreshExpiresIn = 17600000; // 5 hours
    const cookieOpts: CookieSerializeOptions = {
        signed: true,
        httpOnly: false,
        secure: true,
        sameSite: 'strict',
        expires: new Date(Date.now() + 36000000),
    };
    const jwtSignOptions: SignOptions = {
        algorithm,
        expiresIn: accessExpiresIn,
    };
    const jwtVerifyOptions: VerifyOptions = {
        algorithms: [algorithm],
        maxAge: accessExpiresIn,
    };
    const jwtRefreshSignOpts: SignOptions = {
        algorithm,
        expiresIn: refreshExpiresIn,
    };
    const jwtRefreshVerifyOpts: VerifyOptions = {
        algorithms: [algorithm],
        maxAge: refreshExpiresIn,
    };

    const tokens = {
        access: null as Token | null,
        refresh: null as Token | null,
    };

    const signAccessToken: SignAccessToken = payload =>
        jsonwebtoken.sign(payload, process.env.SECRET_JWT, jwtSignOptions);

    const signRefreshToken: SignRefreshToken = payload =>
        jsonwebtoken.sign(payload, process.env.SECRET_JWT, jwtRefreshSignOpts);

    const verifyToken: VerifyToken = (token, verifyOpts, secret) => {
        const decoded = jsonwebtoken.verify(token, secret ?? process.env.SECRET_JWT, verifyOpts) as Token;

        if (!decoded || typeof decoded !== 'object') {
            throw { errorCode: 'AUTH_TOKEN_INVALID', status: 401 };
        } else if (decoded.exp * 1000 < Date.now()) {
            throw { errorCode: 'AUTH_TOKEN_EXPIRED', status: 401 };
        } else {
            return decoded;
        }
    };

    const getAccessToken: GetAccessToken = request => {
        const { authorization } = request.headers;
        if (!authorization) throw { errorCode: 'AUTH_HEADERS_EMPTY', status: 401 };
        return (authorization as string).split(' ')[1];
    };

    fastify.decorate('jsonWebToken', {
        getAccessToken,
        signAccessToken,
        signRefreshToken,
        verifyAccessToken: (token: string, userSecret?: string) => verifyToken(token, jwtVerifyOptions),
        verifyRefreshToken: (token: string) => verifyToken(token, jwtRefreshVerifyOpts),
        cookieOpts,
        refreshSignOpts: jwtRefreshSignOpts,
        tokens,
    });
    done();
}) as FastifyPluginCallback);

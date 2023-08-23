import { CookieSerializeOptions } from '@fastify/cookie';
import type { Token } from '@types';
import type { FastifyPluginCallback } from 'fastify';
import plugin from 'fastify-plugin';
import jsonwebtoken, { Algorithm, SignOptions, VerifyOptions } from 'jsonwebtoken';
import { JsonWebToken, SignAccessToken, SignRefreshToken, TokenState } from './types';

declare module 'fastify' {
    interface FastifyInstance {
        jsonWebToken: JsonWebToken;
    }
}

/**
 * @package jsonwebtoken
 * @see https://github.com/auth0/node-jsonwebtoken
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
    const jwtSignOpts: SignOptions = {
        algorithm,
        expiresIn: accessExpiresIn,
    };
    const jwtVerifyOpts: VerifyOptions = {
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

    const signAccessToken: SignAccessToken = payload => {
        return jsonwebtoken.sign(payload, process.env.SECRET_JWT, jwtSignOpts);
    };

    const signRefreshToken: SignRefreshToken = payload => {
        return jsonwebtoken.sign(payload, process.env.SECRET_JWT, jwtRefreshSignOpts);
    };

    const verifyToken = (token: string, verifyOpts: VerifyOptions): { token: Token; state: TokenState } => {
        const decoded = jsonwebtoken.verify(token, process.env.SECRET_JWT, verifyOpts) as Token;
        if (!decoded || typeof decoded !== 'object') {
            return { token: null, state: 'INVALID' };
        }
        if (decoded.exp * 1000 < Date.now()) {
            return { token: null, state: 'EXPIRED' };
        }

        return { token: decoded, state: 'VALID' };
    };

    fastify.decorate('jsonWebToken', {
        signAccessToken,
        signRefreshToken,
        verifyAccessToken: (token: string) => verifyToken(token, jwtVerifyOpts),
        verifyRefreshToken: (token: string) => verifyToken(token, jwtRefreshVerifyOpts),
        cookieOpts,
        tokens,
    });
    done();
}) as FastifyPluginCallback);

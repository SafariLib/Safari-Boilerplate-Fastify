import type { FastifyPluginCallback } from 'fastify';
import plugin from 'fastify-plugin';
import { sign, verify } from 'jsonwebtoken';
import type { DecodedToken, FastifyToken, GetToken, JsonWebTokenPlugin, SignToken, VerifyToken } from './types';
import { defaultOpts } from './utils';

/**
 * @package jsonwebtoken
 * @see https://github.com/auth0/node-jsonwebtoken
 */
export default plugin((async (fastify, opts, done) => {
    if (fastify.hasDecorator('jsonWebToken')) return done();
    const { unauthorized } = fastify.errorService;

    const tokens = {
        access: null as FastifyToken | null,
        refresh: null as FastifyToken | null,
        cleanState: () => {
            tokens.access = null;
            tokens.refresh = null;
        },
    };

    const generateCookieOpts = () => ({
        ...defaultOpts.cookieOpts,
        expires: new Date(Date.now() + defaultOpts.signRefreshOpts.expiresIn),
    });

    const signToken: SignToken = (payload, opts, secret) => sign(payload, secret, opts);

    const verifyToken: VerifyToken = (token, verifyOpts, secret) => {
        const decoded = verify(token, secret, verifyOpts) as DecodedToken;
        if (!decoded || typeof decoded !== 'object') unauthorized('AUTH_TOKEN_INVALID');
        else if (decoded.exp * 1000 < Date.now()) unauthorized('AUTH_TOKEN_EXPIRED');
        else return { token, decoded };
    };

    const getAccessToken: GetToken = request => {
        const { authorization } = request.headers;
        if (!authorization) unauthorized('AUTH_HEADERS_EMPTY');
        return (authorization as string).split(' ')[1];
    };

    const getRefreshToken: GetToken = request => {
        const { refreshToken: refreshTokenCookie } = request.cookies;
        if (!refreshTokenCookie) unauthorized('AUTH_COOKIE_EMPTY');
        const { value: refreshToken, valid: isValid } = fastify.unsignCookie(refreshTokenCookie);
        if (!isValid) unauthorized('AUTH_COOKIE_INVALID');
        return refreshToken;
    };

    fastify.decorate('jsonWebToken', {
        getAccessToken,
        getRefreshToken,
        generateCookieOpts,
        signAccessToken: (token, secret) => signToken(token, defaultOpts.signAccessOpts, secret),
        signRefreshToken: (token, secret) => signToken(token, defaultOpts.signRefreshOpts, secret),
        verifyAccessToken: (token, secret) => verifyToken(token, defaultOpts.verifyAccessOpts, secret),
        verifyRefreshToken: (token, secret) => verifyToken(token, defaultOpts.verifyRefreshOpts, secret),
        tokens,
        defaultOpts,
    });
    done();
}) as FastifyPluginCallback);

declare module 'fastify' {
    interface FastifyInstance {
        jsonWebToken: JsonWebTokenPlugin;
    }
}

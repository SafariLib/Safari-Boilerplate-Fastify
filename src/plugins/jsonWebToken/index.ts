import { CookieSerializeOptions } from '@fastify/cookie';
import type { FastifyPluginCallback, FastifyRequest } from 'fastify';
import plugin from 'fastify-plugin';
import jsonwebtoken, { Algorithm, SignOptions, VerifyOptions } from 'jsonwebtoken';

export type SignToken<T> = (payload: T, opts: SignOptions, secret: string) => string;
export type VerifyToken<T> = (token: string, opts: VerifyOptions, secret: string) => T;
export type GetAccessToken = (request: FastifyRequest) => string;
export type GetRefreshToken = (request: FastifyRequest) => string;
export interface FastifyToken {
    entity: 'USER' | 'ADMIN';
    token: string;
    content: DecodedToken;
}
export interface DecodedToken extends TokenContent {
    iat: number;
    exp: number;
}
export interface TokenContent {
    userId: number;
    uuid: string;
    role?: number;
}

const algorithm = 'HS256' as Algorithm;
const adminRefreshExpiresIn = 17600000; // 5 hours
const adminAccessExpiresIn = 900000; // 15 minutes
const userRefreshExpiresIn = 86400000; // 24 hours
const userAccessExpiresIn = 1800000; // 30 minutes

const defaultOpts = {
    cookieOpts: {
        signed: true,
        httpOnly: false,
        secure: true,
        sameSite: 'strict',
    } as CookieSerializeOptions,
    signAdminAccessOpts: { algorithm, expiresIn: adminAccessExpiresIn },
    signAdminRefreshOpts: { algorithm, expiresIn: adminRefreshExpiresIn },
    signUserAccessOpts: { algorithm, expiresIn: userAccessExpiresIn },
    signUserRefreshOpts: { algorithm, expiresIn: userRefreshExpiresIn },
    verifyAdminAccessOpts: { algorithms: [algorithm], maxAge: adminAccessExpiresIn },
    verifyAdminRefreshOpts: { algorithms: [algorithm], maxAge: adminRefreshExpiresIn },
    verifyUserAccessOpts: { algorithms: [algorithm], maxAge: userAccessExpiresIn },
    verifyUserRefreshOpts: { algorithms: [algorithm], maxAge: userRefreshExpiresIn },
};

/**
 * @package jsonwebtoken
 * @see https://github.com/auth0/node-jsonwebtoken
 */
export default plugin((async (fastify, opts, done) => {
    if (fastify.hasDecorator('jsonWebToken')) return done();

    const tokens = {
        access: null as FastifyToken | null,
        refresh: null as FastifyToken | null,
    };

    const generateUserCookieOpts = () => ({
        ...defaultOpts.cookieOpts,
        expires: new Date(Date.now() + defaultOpts.signUserRefreshOpts.expiresIn),
    });

    const generateAdminCookieOpts = () => ({
        ...defaultOpts.cookieOpts,
        expires: new Date(Date.now() + defaultOpts.signAdminRefreshOpts.expiresIn),
    });

    const signToken: SignToken<TokenContent> = (payload, opts, secret) => jsonwebtoken.sign(payload, secret, opts);

    const verifyToken: VerifyToken<DecodedToken> = (token, verifyOpts, secret) => {
        const decoded = jsonwebtoken.verify(token, secret, verifyOpts) as DecodedToken;
        if (!decoded || typeof decoded !== 'object') throw { errorCode: 'AUTH_TOKEN_INVALID', status: 401 };
        else if (decoded.exp * 1000 < Date.now()) throw { errorCode: 'AUTH_TOKEN_EXPIRED', status: 401 };
        else return decoded;
    };

    const getAccessToken: GetAccessToken = request => {
        const { authorization } = request.headers;

        // TODO: Test me
        // const authKeys = authorization?.split(' ');
        // if (!authKeys) throw { errorCode: 'AUTH_HEADERS_EMPTY', status: 401 };
        // const bearer = authKeys?.find(auth => auth === 'Bearer');

        if (!authorization) throw { errorCode: 'AUTH_HEADERS_EMPTY', status: 401 };
        return (authorization as string).split(' ')[1];
    };

    fastify.decorate('jsonWebToken', {
        getAccessToken,
        generateUserCookieOpts,
        generateAdminCookieOpts,
        signUserAccessToken: (token, secret) => signToken(token, defaultOpts.signUserAccessOpts, secret),
        signUserRefreshToken: (token, secret) => signToken(token, defaultOpts.signUserRefreshOpts, secret),
        signAdminAccessToken: (token, secret) => signToken(token, defaultOpts.signAdminAccessOpts, secret),
        signAdminRefreshToken: (token, secret) => signToken(token, defaultOpts.signAdminRefreshOpts, secret),
        verifyUserAccessToken: (token, secret) => verifyToken(token, defaultOpts.verifyUserAccessOpts, secret),
        verifyUserRefreshToken: (token, secret) => verifyToken(token, defaultOpts.verifyUserRefreshOpts, secret),
        verifyAdminAccessToken: (token, secret) => verifyToken(token, defaultOpts.verifyAdminAccessOpts, secret),
        verifyAdminRefreshToken: (token, secret) => verifyToken(token, defaultOpts.verifyAdminRefreshOpts, secret),
        tokens,
        defaultOpts,
    });
    done();
}) as FastifyPluginCallback);

interface JsonWebTokenPlugin {
    getAccessToken: GetAccessToken;
    generateUserCookieOpts: () => CookieSerializeOptions;
    generateAdminCookieOpts: () => CookieSerializeOptions;
    signUserAccessToken: (token: TokenContent, secret: string) => string;
    signUserRefreshToken: (token: TokenContent, secret: string) => string;
    signAdminAccessToken: (token: TokenContent, secret: string) => string;
    signAdminRefreshToken: (token: TokenContent, secret: string) => string;
    verifyUserAccessToken: (token: string, secret: string) => DecodedToken;
    verifyUserRefreshToken: (token: string, secret: string) => DecodedToken;
    verifyAdminAccessToken: (token: string, secret: string) => DecodedToken;
    verifyAdminRefreshToken: (token: string, secret: string) => DecodedToken;
    tokens: {
        access: FastifyToken | null;
        refresh: FastifyToken | null;
    };
    defaultOpts: typeof defaultOpts;
}

declare module 'fastify' {
    interface FastifyInstance {
        jsonWebToken: JsonWebTokenPlugin;
    }
}

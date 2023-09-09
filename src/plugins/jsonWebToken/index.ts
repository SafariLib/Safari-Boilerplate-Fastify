import { CookieSerializeOptions } from '@fastify/cookie';
import type { Token } from '@types';
import type { FastifyPluginCallback } from 'fastify';
import plugin from 'fastify-plugin';
import jsonwebtoken, { Algorithm, SignOptions, VerifyOptions } from 'jsonwebtoken';
import type {
    CacheCustomerRefreshToken,
    CacheUserRefreshToken,
    JsonWebToken,
    SignAccessToken,
    SignRefreshToken,
    VerifyToken,
} from './types';

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

    const verifyToken: VerifyToken = (token, verifyOpts) => {
        const decoded = jsonwebtoken.verify(token, process.env.SECRET_JWT, verifyOpts) as Token;

        if (!decoded || typeof decoded !== 'object') {
            throw { errorCode: 'AUTH_TOKEN_INVALID', status: 401 };
        } else if (decoded.exp * 1000 < Date.now()) {
            throw { errorCode: 'AUTH_TOKEN_EXPIRED', status: 401 };
        } else {
            return decoded;
        }
    };

    const cacheUserRefreshToken: CacheUserRefreshToken = async (
        token: string,
        userId: number,
        ip: string,
        userAgent: string,
    ) =>
        await fastify.prisma.userRefreshTokenCache.create({
            data: {
                user_id: userId,
                token,
                ip,
                user_agent: userAgent,
                expires_at: new Date(Date.now() + refreshExpiresIn),
            },
        });

    const cacheCustomerRefreshToken: CacheCustomerRefreshToken = async (
        token: string,
        customerId: number,
        ip: string,
        userAgent: string,
    ) =>
        await fastify.prisma.customerRefreshTokenCache.create({
            data: {
                customer_id: customerId,
                token,
                ip,
                user_agent: userAgent,
                expires_at: new Date(Date.now() + refreshExpiresIn),
            },
        });

    fastify.decorate('jsonWebToken', {
        signAccessToken,
        signRefreshToken,
        verifyAccessToken: (token: string) => verifyToken(token, jwtVerifyOptions),
        verifyRefreshToken: (token: string) => verifyToken(token, jwtRefreshVerifyOpts),
        cacheUserRefreshToken,
        cacheCustomerRefreshToken,
        cookieOpts,
        tokens,
    });
    done();
}) as FastifyPluginCallback);

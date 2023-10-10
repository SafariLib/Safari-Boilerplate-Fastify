import type { CookieSerializeOptions } from '@fastify/cookie';
import type { Algorithm } from 'jsonwebtoken';

export const accessTokenName = 'accessToken';
export const refreshTokenName = 'refreshToken';
export const algorithm = 'HS256' as Algorithm;
export const refreshExpiresIn = 86400000; // 24 hours
export const accessExpiresIn = 1800000; // 30 minutes

export const defaultOpts = {
    cookieOpts: {
        signed: true,
        httpOnly: false,
        secure: true,
        sameSite: 'strict',
    } as CookieSerializeOptions,
    signAccessOpts: { algorithm, expiresIn: accessExpiresIn },
    signRefreshOpts: { algorithm, expiresIn: refreshExpiresIn },
    verifyAccessOpts: { algorithms: [algorithm], maxAge: accessExpiresIn },
    verifyRefreshOpts: { algorithms: [algorithm], maxAge: refreshExpiresIn },
};

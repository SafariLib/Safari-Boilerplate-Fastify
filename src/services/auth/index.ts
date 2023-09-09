import { Customer, User } from '@prisma/client';
import { TokenContent } from '@types';
import { retry } from '@utils';
import { randomUUID } from 'crypto';
import type { FastifyPluginCallback } from 'fastify';
import plugin from 'fastify-plugin';
import { LogUser, VerifyCredentials } from './types';

declare module 'fastify' {
    interface FastifyInstance {
        authService: {
            logUser: LogUser<User>;
            logCustomer: LogUser<Customer>;
            verifyUserCredentials: VerifyCredentials<User>;
            verifyCustomerCredentials: VerifyCredentials<Customer>;
        };
    }
}

export default plugin((async (fastify, opts, done) => {
    if (fastify.hasDecorator('authService')) return fastify.log.warn('authService already registered');

    const verifyUserCredentials: VerifyCredentials<Customer> = async ({ username, password }) => {
        const { prisma } = fastify;
        const user = await prisma.user.findUnique({ where: { username } });
        return await verifyCredentials(user, password);
    };

    const verifyCustomerCredentials: VerifyCredentials<User> = async ({ username, password }) => {
        const { prisma } = fastify;
        const customer = await prisma.customer.findUnique({ where: { username } });
        return await verifyCredentials(customer, password);
    };

    const logUser: LogUser<User> = async (username, password, ip, userAgent) => {
        const { user, tokenContent } = await verifyUserCredentials({ username, password });
        return retry(async () => {
            const { refreshToken, accessToken } = await generateTokens(tokenContent);
            await fastify.jsonWebToken.cacheUserRefreshToken(refreshToken, user.id, ip, userAgent);
            return { user, refreshToken, accessToken };
        }, 2);
    };

    const logCustomer: LogUser<Customer> = async (username, password, ip, userAgent) => {
        const { user, tokenContent } = await verifyCustomerCredentials({ username, password });
        return retry(async () => {
            const { refreshToken, accessToken } = await generateTokens(tokenContent);
            await fastify.jsonWebToken.cacheCustomerRefreshToken(refreshToken, user.id, ip, userAgent);
            return { user, refreshToken, accessToken };
        }, 2);
    };

    interface RefreshQueryResult {
        userId: number;
        username: string;
        userRole: number;
        revoked: boolean;
        lastUserAgent: string;
        lastIp: string;
    }
    const refreshUserToken = async (refreshToken: string, ip: string, userAgent: string) => {
        const { prisma, jsonWebToken } = fastify;

        const { userId, username, userRole, revoked, lastUserAgent, lastIp } = await prisma.$queryRaw<{
            userId: number;
            username: string;
            userRole: number;
            revoked: boolean;
            lastUserAgent: string;
            lastIp: string;
        }>`
            SELECT
                U.id AS userId,
                U.username,
                U.role AS userRole,
                U.revoked,
                R.user_agent AS lastUserAgent,
                R.ip AS lastIp
            FROM User AS U
            LEFT JOIN
            (
                SELECT user_id, user_agent, ip
                FROM UserRefreshTokenCache
                WHERE refresh_token = ${refreshToken}
            ) AS R ON U.id = R.user_id;
        `;

        if (revoked) {
            throw { errorCode: 'USER_TOKEN_REVOKED', status: 401 };
        } else if (lastUserAgent !== userAgent) {
            throw { errorCode: 'USER_TOKEN_USER_AGENT_MISMATCH', status: 401 };
        } else if (lastIp !== ip) {
            throw { errorCode: 'USER_TOKEN_IP_MISMATCH', status: 401 };
        }
    };

    const generateTokens = async (tokenContent: TokenContent) => {
        const { signAccessToken, signRefreshToken } = fastify.jsonWebToken;
        const uuid = randomUUID();
        const accessToken = signAccessToken(tokenContent);
        const refreshToken = signRefreshToken({ ...tokenContent, uuid });
        return { refreshToken, accessToken };
    };

    const verifyCredentials = async (entity: Customer | User, password: string) => {
        const { bcrypt } = fastify;

        if (!entity) {
            throw { errorCode: 'USER_NOT_FOUND', status: 404 };
        }
        if (entity.revoked) {
            throw { errorCode: 'USER_REVOKED', status: 401 };
        }
        if (!(await bcrypt.compareStrings(password, entity.password))) {
            throw { errorCode: 'USER_INCORRECT_PASSWORD', status: 401 };
        }

        delete entity.password;

        return {
            tokenContent: {
                id: entity.id,
                username: entity.username,
                role: entity?.role,
            },
            user: entity,
        };
    };

    fastify.decorate('authService', {
        logUser,
        logCustomer,
        verifyUserCredentials,
        verifyCustomerCredentials,
    });
    done();
}) as FastifyPluginCallback);

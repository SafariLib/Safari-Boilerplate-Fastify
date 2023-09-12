import { Prisma } from '@prisma/client';
import { TokenContent } from '@types';
import { retry } from '@utils';
import { randomUUID } from 'crypto';
import type { FastifyPluginCallback } from 'fastify';
import plugin from 'fastify-plugin';
import { AuthService, LogUser, LogedUser, UserToConnect } from './types';

declare module 'fastify' {
    interface FastifyInstance {
        authService: AuthService;
    }
}

export default plugin((async (fastify, opts, done) => {
    if (fastify.hasDecorator('authService')) return done();

    const login: LogUser = async (username, password, ip, userAgent, entity = 'USER') => {
        const user = await getUser(username, entity);
        const { tokenContent } = await verifyCredentials(user, password);
        const { refreshToken, accessToken } = await generateTokens(tokenContent, ip, userAgent, entity);
        return { user, refreshToken, accessToken };
    };

    const revokeRefreshToken = async (token: string, entity: 'USER' | 'CUSTOMER' = 'USER') => {
        await fastify.prisma.$executeRaw`
            UPDATE ${entity === 'USER' ? Prisma.sql`"UserRefreshTokenCache"` : Prisma.sql`"CustomerRefreshTokenCache"`}
            SET revoked = true
            WHERE token = ${token};
        `;
    };

    const revokeUser = async (userId: number, entity: 'USER' | 'CUSTOMER') => {
        await fastify.prisma.$executeRaw`
            UPDATE ${entity === 'USER' ? Prisma.sql`"User"` : Prisma.sql`"Customer"`}
            SET revoked = true
            WHERE id = ${userId};
        `;
    };

    // interface RefreshQueryResult {
    //     userId: number;
    //     username: string;
    //     userRole: number;
    //     revoked: boolean;
    //     lastUserAgent: string;
    //     lastIp: string;
    // }
    // const refreshUserToken = async (refreshToken: string, ip: string, userAgent: string) => {
    //     const { prisma, jsonWebToken } = fastify;
    //     const { userId, username, userRole, revoked, lastUserAgent, lastIp } = await prisma.$queryRaw<{
    //         userId: number;
    //         username: string;
    //         userRole: number;
    //         revoked: boolean;
    //         lastUserAgent: string;
    //         lastIp: string;
    //     }>`
    //         SELECT
    //             U.id AS userId,
    //             U.username,
    //             U.role AS userRole,
    //             U.revoked,
    //             R.user_agent AS lastUserAgent,
    //             R.ip AS lastIp
    //         FROM User AS U
    //         LEFT JOIN
    //         (
    //             SELECT user_id, user_agent, ip
    //             FROM UserRefreshTokenCache
    //             WHERE refresh_token = ${refreshToken}
    //         ) AS R ON U.id = R.user_id;
    //     `;

    //     if (revoked) {
    //         throw { errorCode: 'USER_TOKEN_REVOKED', status: 401 };
    //     } else if (lastUserAgent !== userAgent) {
    //         throw { errorCode: 'USER_TOKEN_USER_AGENT_MISMATCH', status: 401 };
    //     } else if (lastIp !== ip) {
    //         throw { errorCode: 'USER_TOKEN_IP_MISMATCH', status: 401 };
    //     }
    // };

    const generateTokens = async (
        tokenContent: TokenContent,
        ip: string,
        userAgent: string,
        entity: 'USER' | 'CUSTOMER' = 'USER',
    ) => {
        return retry(async () => {
            const { signAccessToken, signRefreshToken } = fastify.jsonWebToken;
            const secret = await getOrCreateCachedSecret(tokenContent.id, entity);
            const uuid = randomUUID();

            // TODO: Ensure that the token verification uses the same secret as the one used to sign the token
            const accessToken = signAccessToken(tokenContent, secret);
            const refreshToken = signRefreshToken({ ...tokenContent, uuid });
            await cacheRefreshToken(refreshToken, tokenContent.id, ip, userAgent, entity);
            return { refreshToken, accessToken };
        }, 2);
    };

    /**
     * Check if the user exists and if the password is correct
     * @param user The user to check
     * @param password The password to check
     * @returns The user and the token content
     * @throws USER_INCORRECT_PASSWORD
     * @throws USER_REVOKED
     */
    const verifyCredentials = async (user: UserToConnect, password: string) => {
        const { bcrypt } = fastify;
        const passwordMatch = await bcrypt.compareStrings(password, user.password);

        if (user.revoked) throw { errorCode: 'USER_REVOKED', status: 401 };
        if (!passwordMatch) throw { errorCode: 'USER_INCORRECT_PASSWORD', status: 401 };

        delete user.password;

        return {
            tokenContent: {
                id: user.id,
                username: user.username,
                role: user?.role,
            },
            user: user,
        };
    };

    const getUser = async (username: string, entity: 'USER' | 'CUSTOMER'): Promise<UserToConnect> => {
        const user = (
            await fastify.prisma.$queryRaw<Array<UserToConnect>>`
            SELECT * FROM ${entity === 'USER' ? Prisma.sql`"User"` : Prisma.sql`"Customer"`}
            WHERE username = ${username};
        `
        )[0];
        if (!user) throw { errorCode: 'USER_NOT_FOUND', status: 404 };
        return user;
    };

    const getUserFromToken = async (entity: 'USER' | 'CUSTOMER'): Promise<LogedUser> => {
        const { prisma, jsonWebToken } = fastify;
        const { id } = jsonWebToken.tokens.access;

        const user = await prisma.$queryRaw<Array<LogedUser>>`
            SELECT id, username, email, avatar_url, role, revoked, created_at, updated_at
            FROM ${entity === 'USER' ? Prisma.sql`"User"` : Prisma.sql`"Customer"`}
            WHERE id = ${id};
        `;

        if (!user) throw { errorCode: 'USER_NOT_FOUND', status: 404 };
        return user[0];
    };

    /**
     * Get or create a cached secret for a user (redis)
     * @param userId The user id
     * @param entity The entity type
     * @returns The secret
     */
    const getOrCreateCachedSecret = async (userId: number, entity: 'USER' | 'CUSTOMER') => {
        const { getUserSecret, setUserSecret, getCustomerSecret, setCustomerSecret } = fastify.cacheService;
        let secret: string;

        if (entity === 'USER') secret = await getUserSecret(userId);
        else if (entity === 'CUSTOMER') secret = await getCustomerSecret(userId);

        if (!secret) secret = randomUUID();

        if (entity === 'USER') await setUserSecret(userId, secret);
        else if (entity === 'CUSTOMER') await setCustomerSecret(userId, secret);

        return secret;
    };

    /**
     * Cache the refresh token in database
     * @param token The refresh token to cache
     * @param userId The user id
     * @param ip The user ip
     * @param userAgent The user agent
     * @param entity The entity type
     * @returns The cached refresh token
     */
    const cacheRefreshToken = async (
        token: string,
        userId: number,
        ip: string,
        userAgent: string,
        entity: 'USER' | 'CUSTOMER' = 'USER',
    ) => {
        const { refreshSignOpts } = fastify.jsonWebToken;
        const table = entity === 'USER' ? Prisma.sql`"UserRefreshTokenCache"` : Prisma.sql`"CustomerRefreshTokenCache"`;
        const idColumn = entity === 'USER' ? Prisma.sql`user_id` : Prisma.sql`customer_id`;
        const expirationDate = new Date(Date.now() + Number(refreshSignOpts.expiresIn));

        await fastify.prisma.$executeRaw`
            INSERT INTO ${table}
                (${idColumn}, token, ip, user_agent, expires_at)
            VALUES (${userId}, ${token}, ${ip}, ${userAgent}, ${expirationDate});
        `;
    };

    fastify.decorate('authService', {
        getConnectedUser: async () => await getUserFromToken('USER'),
        getConnectedCustomer: async () => await getUserFromToken('CUSTOMER'),
        logUser: async (username, password, ip, userAgent) => await login(username, password, ip, userAgent, 'USER'),
        logCustomer: async (username, password, ip, userAgent) =>
            await login(username, password, ip, userAgent, 'CUSTOMER'),
        revokeUserRefreshToken: async token => await revokeRefreshToken(token, 'USER'),
        revokeCustomerRefreshToken: async token => await revokeRefreshToken(token, 'CUSTOMER'),
        revokeUser: async userId => await revokeUser(userId, 'USER'),
        revokeCustomer: async customerId => await revokeUser(customerId, 'CUSTOMER'),
    });
    done();
}) as FastifyPluginCallback);

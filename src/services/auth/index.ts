import { TokenContent } from '@plugins/jsonWebToken';
import { Prisma } from '@prisma/client';
import { retry } from '@utils';
import { randomUUID } from 'crypto';
import type { FastifyPluginCallback } from 'fastify';
import plugin from 'fastify-plugin';

export interface UserToConnect {
    id: number;
    username: string;
    email: string;
    password: string;
    avatarUrl?: string;
    roleId: number;
    roleName: string;
    isRevoked: boolean;
    createdAt: Date;
    updatedAt: Date;
}
export type ConnectedUser = Omit<UserToConnect, 'password' | 'isRevoked'>;
export interface UserClient {
    ip: string;
    userAgent: string;
}

type Login = (
    username: string,
    password: string,
) => Promise<{ user: ConnectedUser; refreshToken: string; accessToken: string }>;

type Entity = 'ADMIN' | 'USER';

export default plugin((async (fastify, opts, done) => {
    if (fastify.hasDecorator('authService')) return done();

    const isAdmin = () => fastify.jsonWebToken.tokens.access.entity === 'ADMIN';
    const isUser = () => fastify.jsonWebToken.tokens.access.entity === 'USER';
    const getAdminId = () =>
        fastify.jsonWebToken.tokens.access?.content?.userId ?? fastify.jsonWebToken.tokens.refresh?.content?.userId;
    const getUserId = () =>
        fastify.jsonWebToken.tokens.access?.content?.userId ?? fastify.jsonWebToken.tokens.refresh?.content?.userId;
    const getAccessToken = () => fastify.jsonWebToken.tokens.access.token;
    const getRefreshToken = () => fastify.jsonWebToken.tokens.refresh.token;

    /**
     * Log a user
     * @param username The username to check
     * @param password The password to check
     * @param entity The entity type
     * @returns The user, the refresh token and the access token
     * @throws USER_INCORRECT_PASSWORD
     * @throws USER_REVOKED
     * @throws USER_NOT_FOUND
     */
    const login = async (username: string, password: string, entity: Entity) => {
        const { tokenContent, user } = await verifyCredentials(username, password, entity);
        const { refreshToken, accessToken } = await generateTokens(tokenContent, entity);
        return { user, refreshToken, accessToken };
    };

    /**
     * Generate a new refresh token and a new access token
     * @param entity The entity type
     * @returns The user, the refresh token and the access token
     */
    const refreshTokens = async (entity: Entity) => {
        const { tokenContent, user } = await getUserToConnect(getUserId(), entity);
        const { refreshToken, accessToken } = await generateTokens(tokenContent, entity);
        // Remove previous token from cache
        if (entity === 'ADMIN') await fastify.cacheService.deleteAdminToken(getRefreshToken());
        if (entity === 'USER') await fastify.cacheService.deleteUserToken(getRefreshToken());
        return { user, refreshToken, accessToken };
    };

    /**
     * Revoke a token
     * @param entity The entity type
     */
    const logout = async (entity: Entity) => {
        const { cacheService } = fastify;
        if (entity === 'ADMIN') await cacheService.deleteAdminToken(getAccessToken());
        if (entity === 'USER') await cacheService.deleteUserToken(getAccessToken());
    };

    /**
     * Remove all user's cached tokens
     * @param entity The entity type
     */
    const logoutAll = async (entity: Entity) => {
        const { cacheService } = fastify;
        if (entity === 'ADMIN') await cacheService.deleteAdminCache(getAdminId());
        if (entity === 'USER') await cacheService.deleteUserCache(getUserId());
    };

    /**
     * Revoke a user state in database
     * @param userId The user id to revoke
     * @param entity The entity type
     */
    const revokeUser = async (userId: number, entity: 'ADMIN' | 'USER') => {
        await fastify.prisma.$executeRaw`
            UPDATE ${entity === 'ADMIN' ? Prisma.sql`"User"` : Prisma.sql`"Customer"`}
            SET revoked = true
            WHERE id = ${userId};
        `;
    };

    /**
     * Generate a refresh token and an access token
     * @param tokenContent The token content
     * @param ip The user ip
     * @param userAgent The user agent
     * @param entity The entity type USER or CUSTOMER
     * @returns The refresh token and the access token
     */
    const generateTokens = async (tokenContent: TokenContent, entity: Entity) => {
        return retry(async () => {
            const { jsonWebToken, cacheService } = fastify;
            if (entity === 'ADMIN') {
                const secret = await cacheService.getOrSetAdminSecret(tokenContent.userId);
                const accessToken = jsonWebToken.signAdminAccessToken({ ...tokenContent }, secret);
                const refreshToken = jsonWebToken.signAdminRefreshToken({ ...tokenContent }, secret);
                await cacheService.setAdminToken(accessToken, tokenContent.userId);
                await cacheService.setAdminToken(refreshToken, tokenContent.userId);
                return { refreshToken, accessToken };
            }
            if (entity === 'USER') {
                const secret = await cacheService.getOrSetUserSecret(tokenContent.userId);
                const accessToken = jsonWebToken.signUserAccessToken({ ...tokenContent }, secret);
                const refreshToken = jsonWebToken.signUserRefreshToken({ ...tokenContent }, secret);
                await cacheService.setUserToken(refreshToken, tokenContent.userId);
                await cacheService.setUserToken(accessToken, tokenContent.userId);
                return { refreshToken, accessToken };
            }
        }, 2);
    };

    /**
     * Check if the user exists and if the password is correct then return the user and the token content
     * @param username The username to check
     * @param password The password to check
     * @param entity The entity type
     * @returns The user and the token content
     * @throws USER_INCORRECT_PASSWORD
     * @throws USER_REVOKED
     */
    const verifyCredentials = async (username: string, password: string, entity: Entity) => {
        const { bcrypt } = fastify;

        const entityTable = entity === 'ADMIN' ? Prisma.sql`"Admin"` : Prisma.sql`"User"`;
        const roleTable = entity === 'ADMIN' ? Prisma.sql`"AdminRole"` : Prisma.sql`"UserRole"`;

        const {
            password: passwordFromDb,
            isRevoked,
            ...user
        } = (
            await fastify.prisma.$queryRaw<Array<UserToConnect>>`
            SELECT
                en."id",
                en."username",
                en."password",
                en."revoked" AS "isRevoked",
                en."email",
                en."role_id" AS "roleId",
                rl."name" AS "roleName",
                en."avatar_url" AS "avatarUrl",
                en."created_at" AS "createdAt",
                en."updated_at" AS "updatedAt"
            FROM
                ${entityTable} en
            LEFT JOIN
                ${roleTable} rl
            ON en.role_id = rl.id
            WHERE en."username" = ${username};
        `
        )[0];

        const doesPasswordMatch = await bcrypt.compareStrings(password, passwordFromDb);

        if (isRevoked) throw { errorCode: 'USER_REVOKED', status: 401 };
        if (!doesPasswordMatch) throw { errorCode: 'USER_INCORRECT_PASSWORD', status: 401 };

        return {
            tokenContent: {
                userId: user.id,
                uuid: randomUUID(),
                role: user?.roleId,
            },
            user,
        };
    };

    /**
     * Retrive the user to connect and create the token content
     * @param userId The user id to connect
     * @param entity The entity type
     * @returns The user and the token content
     * @throws USER_REVOKED
     */
    const getUserToConnect = async (userId: number, entity: Entity) => {
        const entityTable = entity === 'ADMIN' ? Prisma.sql`"Admin"` : Prisma.sql`"User"`;
        const roleTable = entity === 'ADMIN' ? Prisma.sql`"AdminRole"` : Prisma.sql`"UserRole"`;

        const { isRevoked, ...user } = (
            await fastify.prisma.$queryRaw<Array<UserToConnect>>`
            SELECT
                en."id",
                en."username",
                en."revoked" AS "isRevoked",
                en."email",
                en."role_id" AS "roleId",
                rl."name" AS "roleName",
                en."avatar_url" AS "avatarUrl",
                en."created_at" AS "createdAt",
                en."updated_at" AS "updatedAt"
            FROM
                ${entityTable} en
            LEFT JOIN
                ${roleTable} rl
            ON en."role_id" = rl."id"
            WHERE en."id" = ${userId};
            `
        )[0];

        if (isRevoked) throw { errorCode: 'USER_REVOKED', status: 401 };

        return {
            tokenContent: {
                userId: user.id,
                uuid: randomUUID(),
                role: user?.roleId,
            },
            user,
        };
    };

    fastify.decorate('authService', {
        logUser: async (username: string, password: string) => login(username, password, 'USER'),
        logAdmin: async (username: string, password: string) => login(username, password, 'ADMIN'),
        logoutUser: async () => logout('USER'),
        logoutAdmin: async () => logout('ADMIN'),
        logoutAllUser: async () => logoutAll('USER'),
        logoutAllAdmin: async () => logoutAll('ADMIN'),
        revokeUser: async (userId: number) => revokeUser(userId, 'USER'),
        revokeAdmin: async (userId: number) => revokeUser(userId, 'ADMIN'),
        refreshUserTokens: async () => refreshTokens('USER'),
        refreshAdminTokens: async () => refreshTokens('ADMIN'),
        isAdmin,
        isUser,
        getAdminId,
        getUserId,
        getAccessToken,
        getRefreshToken,
    });
    done();
}) as FastifyPluginCallback);

interface AuthService {
    logUser: Login;
    logAdmin: Login;
    logoutUser: () => Promise<void>;
    logoutAdmin: () => Promise<void>;
    logoutAllUser: () => Promise<void>;
    logoutAllAdmin: () => Promise<void>;
    refreshUserTokens: () => Promise<{ user: ConnectedUser; refreshToken: string; accessToken: string }>;
    refreshAdminTokens: () => Promise<{ user: ConnectedUser; refreshToken: string; accessToken: string }>;
    revokeUser: (userId: number) => Promise<void>;
    revokeAdmin: (userId: number) => Promise<void>;
    isAdmin: () => boolean;
    isUser: () => boolean;
    getAdminId: () => number;
    getUserId: () => number;
    getAccessToken: () => string;
    getRefreshToken: () => string;
}

declare module 'fastify' {
    interface FastifyInstance {
        authService: AuthService;
    }
}

import type { TokenContent } from '@plugins/jsonWebToken';
import { Prisma } from '@prisma/client';
import { retry } from '@utils';
import { randomUUID } from 'crypto';
import type { FastifyPluginCallback, FastifyRequest as Request } from 'fastify';
import plugin from 'fastify-plugin';
import type {
    AccessRights,
    CheckAdminAccessRights,
    ConnectedUser,
    Entity,
    HasTooManyAttemps,
    LogAttempt,
    Login,
    LoginAttemptState,
    UserToConnect,
} from './types';

export default plugin((async (fastify, opts, done) => {
    if (fastify.hasDecorator('authService')) return done();

    const isAdmin = () => fastify.jsonWebToken.tokens.access?.entity === 'ADMIN';
    const isUser = () => fastify.jsonWebToken.tokens.access?.entity === 'USER';
    const getUserId = () =>
        fastify.jsonWebToken.tokens.access?.content?.userId ?? fastify.jsonWebToken.tokens.refresh?.content?.userId;
    const getAccessToken = () => fastify.jsonWebToken.tokens.access?.token;
    const getRefreshToken = () => fastify.jsonWebToken.tokens.refresh?.token;
    const getUserIp = (request: Request) => request.headers.ip as string;

    const getAdminAccessRights = async () => {
        const { jsonWebToken, prisma } = fastify;
        const { rights } = await prisma.adminRole.findUnique({
            where: { id: jsonWebToken.tokens.access.content.role },
            select: { rights: true },
        });
        return rights as Array<AccessRights>;
    };

    const checkAdminAccessRights: CheckAdminAccessRights = async rights => {
        const adminRights = await getAdminAccessRights();
        if (!rights.every(right => adminRights.includes(right))) throw { errorCode: 'ACCESS_DENIED', status: 403 };
    };

    /**
     * The login attempt state
     *  - attempts: The login attempts
     *  - hasTooManyAttemps: Check if the user is blocked
     * The user is blocked if he has 5 login attempts in the last 15 minutes
     */
    const attemptState: LoginAttemptState = {
        adminAttempts: [],
        userAttempts: [],
        cleanState: () => {
            attemptState.adminAttempts = attemptState.adminAttempts.filter(
                attempt => attempt.createdAt.getTime() > Date.now() - 15 * 60 * 1000,
            );
            attemptState.userAttempts = attemptState.userAttempts.filter(
                attempt => attempt.createdAt.getTime() > Date.now() - 15 * 60 * 1000,
            );
        },
    };

    /**
     * Check if the authentification is blocked due to too many failed login attempts
     * @param userId The user id
     * @param userAgent The user agent
     * @param ip The user ip
     * @param entity The entity type
     */
    const hasTooManyAttemps: HasTooManyAttemps = (userId, ip, entity) =>
        (entity === 'ADMIN' ? attemptState.adminAttempts : attemptState.userAttempts).filter(
            attempt =>
                attempt.userId === userId &&
                attempt.ip === ip &&
                attempt.createdAt.getTime() > Date.now() - 15 * 60 * 1000,
        ).length >= 5;

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
    const login = async (username: string, password: string, ip: string, entity: Entity) => {
        const { tokenContent, user } = await verifyCredentials(username, password, ip, entity);
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
        const userId = getUserId();
        if (entity === 'ADMIN') await cacheService.deleteAdminCache(userId);
        if (entity === 'USER') await cacheService.deleteUserCache(userId);
    };

    /**
     * Sets revoke state of a user/admin in database
     * @param userId The user id to revoke/activate
     * @param revoke The revoke state
     * @param entity The entity type
     */
    const setUserRevokeState = async (userId: number, revoke: boolean, entity: 'ADMIN' | 'USER') => {
        await fastify.prisma.$executeRaw`
            UPDATE ${entity === 'ADMIN' ? Prisma.sql`"Admin"` : Prisma.sql`"User"`}
            SET revoked = ${revoke}
            WHERE id = ${userId};
        `;
    };

    /**
     * Log a failed login attempt
     * @param userId The user id
     * @param userAgent The user agent
     * @param ip The user ip
     * @param entity The entity type
     */
    const LogAttempt: LogAttempt = (userId, ip, entity) => {
        (entity === 'ADMIN' ? attemptState.adminAttempts : attemptState.userAttempts).push({
            userId,
            ip,
            createdAt: new Date(),
        });
    };

    /**
     * Generate a refresh token and an access token
     * @param tokenContent The token content
     * @param ip The user ip
     * @param userAgent The user agent
     * @param entity The entity type USER or ADMIN
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
    const verifyCredentials = async (username: string, password: string, ip: string, entity: Entity) => {
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

        if (hasTooManyAttemps(user.id, ip, entity)) throw { errorCode: 'USER_TOO_MANY_ATTEMPTS', status: 401 };

        const doesPasswordMatch = await bcrypt.compareStrings(password, passwordFromDb);

        if (isRevoked) throw { errorCode: 'USER_REVOKED', status: 401 };
        if (!doesPasswordMatch) {
            LogAttempt(user.id, ip, entity);
            attemptState.cleanState();
            throw { errorCode: 'USER_INCORRECT_PASSWORD', status: 401 };
        }

        return {
            tokenContent: {
                userId: user.id,
                uuid: randomUUID(),
                role: user?.roleId,
            },
            user,
        };
    };

    const verifyRefreshToken = async (request: Request, entity: Entity) => {
        const { jsonWebToken, cacheService } = fastify;
        if (entity === 'ADMIN') {
            const token = jsonWebToken.getRefreshToken(request);
            const secret = await cacheService.getAdminSecret(token);
            if (!secret) throw { status: 401, errorCode: 'AUTH_TOKEN_REVOKED' };
            jsonWebToken.tokens.refresh = {
                entity: 'ADMIN',
                content: jsonWebToken.verifyAdminRefreshToken(token, secret),
                token,
            };
        } else if (entity === 'USER') {
            const token = jsonWebToken.getRefreshToken(request);
            const secret = await cacheService.getUserSecret(token);
            if (!secret) throw { status: 401, errorCode: 'AUTH_TOKEN_REVOKED' };
            jsonWebToken.tokens.refresh = {
                entity: 'USER',
                content: jsonWebToken.verifyUserRefreshToken(token, secret),
                token,
            };
        }
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
        logUser: async (username: string, password: string, ip: string) => await login(username, password, ip, 'USER'),
        logAdmin: async (username: string, password: string, ip: string) =>
            await login(username, password, ip, 'ADMIN'),
        logoutUser: async () => await logout('USER'),
        logoutAdmin: async () => await logout('ADMIN'),
        logoutAllUser: async () => await logoutAll('USER'),
        logoutAllAdmin: async () => await logoutAll('ADMIN'),
        revokeUser: async (userId: number) => await setUserRevokeState(userId, true, 'USER'),
        revokeAdmin: async (userId: number) => await setUserRevokeState(userId, true, 'ADMIN'),
        activateUser: async (userId: number) => await setUserRevokeState(userId, false, 'USER'),
        activateAdmin: async (userId: number) => await setUserRevokeState(userId, false, 'ADMIN'),
        verifyUserRefreshToken: async (request: Request) => await verifyRefreshToken(request, 'USER'),
        verifyAdminRefreshToken: async (request: Request) => await verifyRefreshToken(request, 'ADMIN'),
        refreshUserTokens: async () => await refreshTokens('USER'),
        refreshAdminTokens: async () => await refreshTokens('ADMIN'),
        isAdmin,
        isUser,
        checkAdminAccessRights,
        getUserId,
        getAccessToken,
        getRefreshToken,
        getUserIp,
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
    verifyUserRefreshToken: (request: Request) => Promise<void>;
    verifyAdminRefreshToken: (request: Request) => Promise<void>;
    refreshUserTokens: () => Promise<{ user: ConnectedUser; refreshToken: string; accessToken: string }>;
    refreshAdminTokens: () => Promise<{ user: ConnectedUser; refreshToken: string; accessToken: string }>;
    revokeUser: (userId: number) => Promise<void>;
    revokeAdmin: (userId: number) => Promise<void>;
    activateUser: (userId: number) => Promise<void>;
    activateAdmin: (userId: number) => Promise<void>;
    isAdmin: () => boolean;
    isUser: () => boolean;
    checkAdminAccessRights: CheckAdminAccessRights;
    getUserId: () => number;
    getAccessToken: () => string;
    getRefreshToken: () => string;
    getUserIp: (request: Request) => string;
}

declare module 'fastify' {
    interface FastifyInstance {
        authService: AuthService;
    }
}

import type { TokenContent } from '@plugins/jsonWebToken/types';
import { retry } from '@utils';
import { randomUUID } from 'crypto';
import type { FastifyPluginCallback, FastifyRequest as Request } from 'fastify';
import plugin from 'fastify-plugin';
import type { AccessRights, CheckAccessRights, GetAccessRights, GetUserToLogin, LoggedUser, Login, UserToLogin } from './types';
import { buildLoginAttemptLogger } from './utils';

export default plugin((async (fastify, opts, done) => {
    if (fastify.hasDecorator('authService')) return done();
    const { cacheService, errorService, jsonWebToken, bcrypt, prisma } = fastify;
    const { unauthorized, tooManyRequests, forbidden } = errorService;

    // ------------------------------
    //        Getters
    // ------------------------------
    const getUserId = () => jsonWebToken.tokens.access?.content?.userId ?? jsonWebToken.tokens.refresh?.content?.userId;
    const getUserIp = (request: Request) => request.headers.ip as string;
    const getUserRoleId = () => jsonWebToken.tokens.access?.content?.role ?? jsonWebToken.tokens.refresh?.content?.role;
    const getAccessToken = () => jsonWebToken.tokens.access?.token;
    const getRefreshToken = () => jsonWebToken.tokens.refresh?.token;

    // ------------------------------
    //        public functions
    // ------------------------------
    const logout = async () => await cacheService.deleteUserToken(getAccessToken());
    const logoutAll = async () => await cacheService.deleteUserCache(getUserId());
    const login: Login = async (username, password, ip) => {
        const { tokenContent, user } = await verifyCredentials(username, password, ip);
        const { refreshToken, accessToken } = await generateTokens(tokenContent);
        return { user, refreshToken, accessToken };
    };
    const refreshTokens = async () => {
        const { isRevoked: _, password: __, ...user } = await getUserToLoginById(getUserId());
        const tokenContent = generateTokenContent(user);
        const { refreshToken, accessToken } = await generateTokens(tokenContent);
        cacheService.deleteUserToken(getRefreshToken());
        return { user, refreshToken, accessToken };
    };
    const verifyRefreshToken = async (request: Request) => {
        const { tokens, verifyRefreshToken, getRefreshToken } = jsonWebToken;
        const token = getRefreshToken(request);
        const secret = await cacheService.getUserSecret(token);
        if (!secret) throw unauthorized('AUTH_TOKEN_REVOKED');
        tokens.refresh = verifyRefreshToken(token, secret);
    };
    const toggleRevokeState = async (userId: number, revoke: boolean) => {
        // TODO: Check if user is admin and if he has the rights to revoke/activate the user
        // The user entity should be checked too, maybe check with prisma hooks?
        await prisma.user.update({ where: { id: userId }, data: { isRevoked: revoke } });
    };
    const checkAccessRights: CheckAccessRights = async rights => {
        const adminRights = await getAccessRights(getUserRoleId());
        if (!rights.every(right => adminRights.includes(right))) forbidden('ACCESS_DENIED');
    };

    // ------------------------------
    //        private functions
    // ------------------------------

    const attemptState = buildLoginAttemptLogger(15);
    const hasTooManyAttemps = (userId: number, ip: string) => attemptState.getUserAttempts(userId, ip).length >= 5;
    const LogAttempt = (userId: number, ip: string) => {
        attemptState.attempts.push({ userId, ip, createdAt: new Date() });
        attemptState.cleanState();
    };

    const generateTokenContent = (user: LoggedUser): TokenContent => ({
        userId: user.id,
        uuid: randomUUID(),
        role: user.role.id,
    });

    const generateTokens = async (tokenContent: TokenContent) => {
        return retry(async () => {
            const secret = await cacheService.getOrSetUserSecret(tokenContent.userId);
            const accessToken = jsonWebToken.signAccessToken({ ...tokenContent }, secret);
            const refreshToken = jsonWebToken.signRefreshToken({ ...tokenContent }, secret);
            await cacheService.setUserToken(refreshToken, tokenContent.userId);
            await cacheService.setUserToken(accessToken, tokenContent.userId);
            return { refreshToken, accessToken };
        }, 2);
    };

    const verifyCredentials = async (username: string, password: string, ip: string) => {
        const userToLogin = await getUserToLoginByName(username);
        if (!userToLogin) unauthorized('AUTH_INVALID_CREDENTIALS');

        const { isRevoked, password: passwordFromDb, ...user } = userToLogin;
        const tokenContent = {
            userId: user.id,
            uuid: randomUUID(),
            role: user.role.id,
        };

        if (hasTooManyAttemps(userToLogin.id, ip)) tooManyRequests('AUTH_TOO_MANY_ATTEMPTS');
        const passwordMatch = await bcrypt.compareStrings(password, passwordFromDb);

        if (!isRevoked || passwordMatch) return { tokenContent, user };

        LogAttempt(user.id, ip);
        unauthorized('AUTH_INVALID_CREDENTIALS');
    };

        const getUserToLoginByName: GetUserToLogin = async username => {
            const { prisma } = fastify;
            const user = await prisma.$queryRaw<Array<UserToLogin>>`
                SELECT  
                    u."id", u."username", u."password", u."email",
                    json_build_object('id', u.role_id, 'name', r.name) AS role,
                    u."revoked" AS "isRevoked"
                FROM
                    "User" u LEFT JOIN "Role" r ON u.role_id = r.id
                WHERE
                    u."username" = ${username};
            `;
            return user?.[0] ?? undefined;
        };
    
        const getUserToLoginById: GetUserToLogin = async id => {
            const { prisma } = fastify;
            const user = await prisma.$queryRaw<Array<UserToLogin>>`
                SELECT  
                    u."id", u."username", u."password", u."email",
                    json_build_object('id', u.role_id, 'name', r.name) AS role,
                    u."revoked" AS "isRevoked"
                FROM
                    "User" u LEFT JOIN "Role" r ON u.role_id = r.id
                WHERE
                    u."id" = ${id};
            `;
            return user?.[0] ?? undefined;
        };
    
        const getAccessRights: GetAccessRights = async userId => {
            const { prisma } = fastify;
            const { rights } = await prisma.role.findUnique({
                where: { id: userId },
                select: { rights: true },
            });
            return rights as Array<AccessRights>;
        };

    fastify.decorate('authService', {
        login,
        logout,
        logoutAll,
        refreshTokens,
        verifyRefreshToken,
        checkAccessRights,
        revokeUser: (userId: number) => toggleRevokeState(userId, true),
        activateUser: (userId: number) => toggleRevokeState(userId, false),
        getUserId,
        getUserIp,
        getUserRoleId,
        getAccessToken,
        getRefreshToken,
    });
    done();
}) as FastifyPluginCallback);

interface AuthService {
    login: Login;
    logout: () => Promise<void>;
    logoutAll: () => Promise<void>;
    refreshTokens: () => Promise<{ user: LoggedUser; refreshToken: string; accessToken: string }>;
    verifyRefreshToken: (request: Request) => Promise<void>;
    checkAccessRights: CheckAccessRights;
    revokeUser: (userId: number) => Promise<void>;
    activateUser: (userId: number) => Promise<void>;
    getUserId: () => number | undefined;
    getUserIp: (request: Request) => string;
    getUserRoleId: () => number | undefined;
    getAccessToken: () => string | undefined;
    getRefreshToken: () => string | undefined;
}

declare module 'fastify' {
    interface FastifyInstance {
        authService: AuthService;
    }
}

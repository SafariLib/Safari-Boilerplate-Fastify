import type { VerifiedToken } from '@dependencies/jsonwebtoken';
import type { FastifyPluginCallback } from 'fastify';
import plugin from 'fastify-plugin';
import serverConfig from '../config/serverConfig';

export interface AuthorizationPluginOpts {
    maxAttempts: number;
    min: number;
}

export interface UserState {
    id: number;
    ip: string;
    isVisitor: boolean;
    bearerToken?: VerifiedToken;
}

export interface LoginAttempt {
    userId: number;
    ip: string;
    createdAt: Date;
}

export interface LoginAttemps {
    attempts: Array<LoginAttempt>;
    clean: () => void;
    get: (userId: number, ip: string) => Array<LoginAttempt>;
    log: (userId: number, ip: string) => void;
}

export type Logout = (user: UserState) => void;

/**
 * Authorization plugin
 * @description Decorate fastify instance with authorization methods and user state.
 */
export default plugin((async (fastify, _, done) => {
    const { verifyBearerToken, getBearerTokenFromRequest } = fastify.jwt;
    const attemptsTimeWindow = serverConfig.authorization.min;

    const logout: Logout = user => fastify.jwt.revokeSession(user.bearerToken.string);
    const logoutAllDevices: Logout = user => fastify.jwt.revokeSession(user.id);

    /**
     * @description
     * Build login attempt logger.
     * Uses attemptsTimeWindow as minutes before an attempt is considered expired.
     */
    let loginAttemps = new Array<LoginAttempt>();
    const cleanLoginAttempts = () =>
        (loginAttemps = loginAttemps.filter(
            attempt => attempt.createdAt.getTime() > Date.now() - attemptsTimeWindow * 60 * 1000,
        ));
    const getUserAttempts = (userId: number, ip: string) =>
        loginAttemps.filter(
            attempt =>
                attempt.userId === userId &&
                attempt.ip === ip &&
                attempt.createdAt.getTime() > Date.now() - attemptsTimeWindow * 60 * 1000,
        );
    const logAttempt = (userId: number, ip: string) => {
        loginAttemps.push({
            userId,
            ip,
            createdAt: new Date(),
        });
    };

    /**
     * @description
     * Decorate request with user state at the beginning of the request lifecycle.
     * User state dies at the end of the request lifecycle.
     */
    fastify.addHook('preParsing', async (request, _) => {
        const bearerToken = getBearerTokenFromRequest(request);
        const ip = request.headers.ip as string;

        if (!bearerToken)
            return (request.user = {
                id: 0,
                ip,
                isVisitor: true,
            });

        const verifiedToken = verifyBearerToken(bearerToken);

        return (request.user = {
            id: verifiedToken.content?.userId ?? 0,
            ip,
            isVisitor: false,
            bearerToken: verifiedToken,
        });
    });

    fastify.decorateRequest('user', {
        id: 0,
        ip: '',
        isVisitor: true,
    });

    fastify.decorate('auth', {
        logout,
        logoutAllDevices,
        loginAttempts: {
            attempts: loginAttemps,
            clean: cleanLoginAttempts,
            get: getUserAttempts,
            log: logAttempt,
        },
    });

    done();
}) as FastifyPluginCallback);

declare module 'fastify' {
    interface FastifyInstance {
        auth: {
            logout: Logout;
            logoutAllDevices: Logout;
            loginAttempts: LoginAttemps;
        };
    }
    interface FastifyRequest {
        user: UserState;
    }
}

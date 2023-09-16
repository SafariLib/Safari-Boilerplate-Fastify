import type { FastifyPluginCallback } from 'fastify';
import plugin from 'fastify-plugin';

export type GetOrSetSecret = (userId: number) => Promise<string>;
export type SetUserToken = (token: string, userId: number) => Promise<void>;
export type GetUserSecret = (token: string) => Promise<string | null>;
export type DeleteUserCache = (userId: number) => Promise<void>;
export type DeleteUserToken = (token: string) => Promise<void>;

export default plugin((async (fastify, opts, done) => {
    if (fastify.hasDecorator('cacheService')) return done();

    const getOrSetUserSecret: GetOrSetSecret = async userId => {
        const { redis } = fastify;
        const secretFromCache = await redis.user_secret.get(userId.toString());
        const secret =
            secretFromCache ??
            Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);

        !secretFromCache && (await redis.user_secret.set(userId.toString(), secret));
        return secret;
    };

    const setUserToken: SetUserToken = async (token, userId) => {
        const { redis } = fastify;
        await redis.user_token_id.set(token, userId.toString());
    };

    const getUserSecret: GetUserSecret = async token => {
        const { redis } = fastify;
        const userId = await redis.user_token_id.get(token);
        if (!userId) return null;
        return await redis.user_secret.get(userId);
    };

    const deleteUserCache: DeleteUserCache = async userId => {
        const { redis } = fastify;
        await redis.user_secret.del(userId.toString());
        await redis.user_token_id.del(userId.toString());
    };

    const deleteUserToken: DeleteUserToken = async token => {
        const { redis } = fastify;
        await redis.user_token_id.del(token);
    };

    const getOrSetAdminSecret: GetOrSetSecret = async userId => {
        const { redis } = fastify;
        const secretFromCache = await redis.admin_secret.get(userId.toString());
        const secret =
            secretFromCache ??
            Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);

        !secretFromCache && (await redis.admin_secret.set(userId.toString(), secret));
        return secret;
    };

    const setAdminToken: SetUserToken = async (token, userId) => {
        const { redis } = fastify;
        await redis.admin_token_id.set(token, userId.toString());
    };

    const getAdminSecret: GetUserSecret = async token => {
        const { redis } = fastify;
        const userId = await redis.admin_token_id.get(token);
        if (!userId) return null;
        return await redis.admin_secret.get(userId);
    };

    const deleteAdminCache: DeleteUserCache = async userId => {
        const { redis } = fastify;
        await redis.admin_secret.del(userId.toString());
        await redis.admin_token_id.del(userId.toString());
    };

    const deleteAdminToken: DeleteUserToken = async token => {
        const { redis } = fastify;
        await redis.admin_token_id.del(token);
    };

    fastify.decorate('cacheService', {
        getOrSetAdminSecret,
        getOrSetUserSecret,
        setAdminToken,
        setUserToken,
        getAdminSecret,
        getUserSecret,
        deleteAdminCache,
        deleteUserCache,
        deleteAdminToken,
        deleteUserToken,
    } as CacheService);
    done();
}) as FastifyPluginCallback);

export interface CacheService {
    getOrSetUserSecret: GetOrSetSecret;
    setUserToken: SetUserToken;
    getOrSetAdminSecret: GetOrSetSecret;
    setAdminToken: SetUserToken;
    getAdminSecret: GetUserSecret;
    getUserSecret: GetUserSecret;
    deleteAdminCache: DeleteUserCache;
    deleteUserCache: DeleteUserCache;
    deleteAdminToken: DeleteUserToken;
    deleteUserToken: DeleteUserToken;
}

declare module 'fastify' {
    interface FastifyInstance {
        cacheService: CacheService;
    }
}

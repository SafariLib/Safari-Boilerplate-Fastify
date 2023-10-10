import type { FastifyPluginCallback } from 'fastify';
import plugin from 'fastify-plugin';
import type { CacheService, DeleteUserCache, DeleteUserToken, GetOrSetSecret, GetUserSecret, SetUserToken } from './types';

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

    fastify.decorate('cacheService', {
        getOrSetUserSecret,
        setUserToken,
        getUserSecret,
        deleteUserCache,
        deleteUserToken,
    } as CacheService);
    done();
}) as FastifyPluginCallback);

declare module 'fastify' {
    interface FastifyInstance {
        cacheService: CacheService;
    }
}

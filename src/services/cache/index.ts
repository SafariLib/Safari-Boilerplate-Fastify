import type { FastifyPluginCallback } from 'fastify';
import plugin from 'fastify-plugin';
import { CacheService, DeleteValue, GetTokenFromBlacklist, GetValue, SetTokenToBlacklist, SetValue } from './types';

declare module 'fastify' {
    interface FastifyInstance {
        cacheService: CacheService;
    }
}

export default plugin((async (fastify, opts, done) => {
    if (fastify.hasDecorator('cacheService')) return done();

    const setUserSecret: SetValue = async (userId, secret) =>
        await fastify.redis.user_secret.set(userId.toString(), secret);

    const deleteUserSecret: DeleteValue = async userId => await fastify.redis.user_secret.del(userId.toString());

    const getUserSecret: GetValue = async userId => await fastify.redis.user_secret.get(userId.toString());

    const setCustomerSecret: SetValue = async (customerId, secret) =>
        await fastify.redis.customer_secret.set(customerId.toString(), secret);

    const deleteCustomerSecret: DeleteValue = async customerId =>
        await fastify.redis.customer_secret.del(customerId.toString());

    const getCustomerSecret: GetValue = async customerId =>
        await fastify.redis.customer_secret.get(customerId.toString());

    const setUserTokenBlacklist: SetTokenToBlacklist = async token =>
        await fastify.redis.user_token_blacklist.set(token, token);

    const getUserTokenBlacklist: GetTokenFromBlacklist = async token =>
        await fastify.redis.user_token_blacklist.get(token);

    const setCustomerTokenBlacklist: SetTokenToBlacklist = async token =>
        await fastify.redis.customer_token_blacklist.set(token, token);

    const getCustomerTokenBlacklist: GetTokenFromBlacklist = async token =>
        await fastify.redis.customer_token_blacklist.get(token);

    fastify.decorate('cacheService', {
        setUserSecret,
        deleteUserSecret,
        getUserSecret,
        setCustomerSecret,
        deleteCustomerSecret,
        getCustomerSecret,
        setUserTokenBlacklist,
        getUserTokenBlacklist,
        setCustomerTokenBlacklist,
        getCustomerTokenBlacklist,
    } as CacheService);
    done();
}) as FastifyPluginCallback);

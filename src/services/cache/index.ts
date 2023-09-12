import type { FastifyPluginCallback } from 'fastify';
import plugin from 'fastify-plugin';
import { CacheService, SetValue } from './types';

declare module 'fastify' {
    interface FastifyInstance {
        cacheService: CacheService;
    }
}

export default plugin((async (fastify, opts, done) => {
    if (fastify.hasDecorator('cacheService')) return done();

    const setUserSecret: SetValue = async (userId, secret) =>
        await fastify.redis.user_secret.set(userId.toString(), secret);

    const getUserSecret = async (userId: number) => await fastify.redis.user_secret.get(userId.toString());

    const setCustomerSecret: SetValue = async (customerId, secret) =>
        await fastify.redis.customer_secret.set(customerId.toString(), secret);

    const getCustomerSecret = async (customerId: number) =>
        await fastify.redis.customer_secret.get(customerId.toString());

    const setUserTokenBlacklist: SetValue = async (userId, token) =>
        await fastify.redis.user_token_blacklist.set(userId.toString(), token);

    const getUserTokenBlacklist = async (userId: number) =>
        await fastify.redis.user_token_blacklist.get(userId.toString());

    const setCustomerTokenBlacklist: SetValue = async (customerId, token) =>
        await fastify.redis.customer_token_blacklist.set(customerId.toString(), token);

    const getCustomerTokenBlacklist = async (customerId: number) =>
        await fastify.redis.customer_token_blacklist.get(customerId.toString());

    fastify.decorate('cacheService', {
        setUserSecret,
        getUserSecret,
        setCustomerSecret,
        getCustomerSecret,
        setUserTokenBlacklist,
        getUserTokenBlacklist,
        setCustomerTokenBlacklist,
        getCustomerTokenBlacklist,
    } as CacheService);
    done();
}) as FastifyPluginCallback);

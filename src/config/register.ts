import { authController } from '@controllers';
import { authService, bcrypt, fastifyCookie, fastifyRateLimit, jsonWebToken, prisma } from '@plugins';
import type { FastifyInstance } from 'fastify';

/**
 * Register plugins.
 * - Modules
 * - Services
 * - Controllers
 *
 * Order matters. Be careful when changing the order/adding new plugins.
 */
export const registerPlugins = async (fastify: FastifyInstance) => {
    console.log('> Registering plugins...');
    [prisma, fastifyCookie, fastifyRateLimit, jsonWebToken, bcrypt].forEach(plugin => fastify.register(plugin));
    [authService].forEach(service => fastify.register(service));
    [authController].forEach(controller => fastify.register(controller));
    console.log('Plugins successfully registered');
};

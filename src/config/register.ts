import { authController } from '@controllers';
import { bcrypt, fastifyCookie, fastifyRateLimit, jsonWebToken, prisma } from '@plugins';
import { authService } from '@services';
import type { FastifyInstance } from 'fastify';

/**
 * Register plugins.
 * - Modules
 * - Services
 * - Controllers
 *
 * Order matters. Be careful when changing the order/adding new plugins.
 * Loads the plugins in the following order:
 * - Plugins (DB Connector should come first)
 * - Services
 * - Controllers
 */
export const registerPlugins = async (fastify: FastifyInstance) => {
    console.log('> Registering plugins...');
    [prisma, fastifyCookie, fastifyRateLimit, jsonWebToken, bcrypt].forEach(plugin => fastify.register(plugin));
    [authService].forEach(service => fastify.register(service));
    [authController].forEach(controller => fastify.register(controller));
    console.log('Plugins successfully registered');
};

import { authController, debugController } from '@controllers';
import { bcrypt, dbConnector, fastifyCookie, fastifyRateLimit, jsonWebToken } from '@plugins';
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
 * - Plugins (dbConnector should come first)
 * - Services
 * - Controllers
 */
export const registerPlugins = async (fastify: FastifyInstance) => {
    console.log();
    console.log('> Registering plugins...');

    [dbConnector, fastifyCookie, fastifyRateLimit, jsonWebToken, bcrypt].forEach(plugin => fastify.register(plugin));
    [debugController, authService].forEach(service => fastify.register(service));
    [authController].forEach(controller => fastify.register(controller));

    console.log('Plugins successfully registered');

    fastify.ready(() => {
        console.log();
        console.log('> Plugins Tree:');
        console.log(fastify.printPlugins());
        console.log('> Routes Tree:');
        console.log(fastify.printRoutes());
    });
};

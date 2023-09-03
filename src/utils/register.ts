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
 * - Hooks
 */
export const registerPlugins = async (fastify: FastifyInstance) => {
    console.log('');
    console.log('> Registering plugins...');

    [
        import('@plugins/dbConnector'),
        import('@plugins/fastifyCookie'),
        import('@plugins/fastifyRateLimit'),
        import('@plugins/jsonWebToken'),
        import('@plugins/bcrypt'),
        import('@plugins/fastifySwagger'),
    ].forEach(plugin => fastify.register(plugin));

    [import('@services/auth')].forEach(service => fastify.register(service));

    [import('@controllers/debug'), import('@controllers/auth'), import('@controllers/user')].forEach(controller =>
        fastify.register(controller),
    );

    [import('@hooks/onRequest/verifyToken')].forEach(hook => fastify.register(hook));

    console.log('Plugins successfully registered');

    fastify.ready(() => {
        console.log('');
        console.log('> Plugins Tree:');
        console.log(fastify.printPlugins());
        console.log('> Routes Tree:');
        console.log(fastify.printRoutes());
    });
};

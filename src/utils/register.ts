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
export const registerPlugins = async (fastify: FastifyInstance, silent?: boolean) => {
    !silent && console.log();
    !silent && console.log('> Registering plugins...');

    [
        import('@plugins/dbConnector'),
        import('@plugins/fastifyRedis'),
        import('@plugins/fastifyCookie'),
        import('@plugins/fastifyRateLimit'),
        import('@plugins/jsonWebToken'),
        import('@plugins/bcrypt'),
        import('@plugins/fastifySwagger'),
    ].forEach(plugin => fastify.register(plugin));

    [import('@services/cache'), import('@services/auth'), import('@services/user')].forEach(service =>
        fastify.register(service),
    );

    [import('@controllers/debug'), import('@controllers/auth'), import('@controllers/user')].forEach(controller =>
        fastify.register(controller),
    );

    [import('@hooks/onRequest/verifyAccessToken'), import('@hooks/onResponse/cleanUserState')].forEach(hook =>
        fastify.register(hook),
    );

    !silent && console.log('Plugins successfully registered');

    fastify.ready(() => {
        !silent && console.log();
        !silent && console.log('> Plugins Tree:');
        !silent && console.log(fastify.printPlugins());
        !silent && console.log('> Routes Tree:');
        !silent && console.log(fastify.printRoutes());
    });
};

import type { FastifyInstance } from 'fastify';

/**
 * Register plugins.
 * Order matters. Be careful when changing the order/adding new plugins.
 */
export const registerPlugins = async (fastify: FastifyInstance, silent?: boolean) => {
    !silent && console.log();
    !silent && console.log('> Registering plugins...');

    [
        import('@plugins/dbConnector'),
        import('@plugins/fastifyRedis'),
        import('@plugins/fastifyCookie'),
        import('@plugins/fastifySwagger'),
        import('@services/error'),
        import('@services/request'),
        import('@plugins/fastifyRateLimit'),
        import('@plugins/jsonWebToken'),
        import('@plugins/bcrypt'),
        import('@services/query'),
        import('@services/cache'),
        import('@services/log'),
        import('@services/auth'),
        import('@services/user'),
        import('@hooks/onRequest'),
        import('@hooks/onResponse'),
        import('@controllers/debug'),
        import('@controllers/auth'),
        import('@controllers/user'),
    ].forEach(async plugin => await fastify.register(plugin));

    !silent && console.log('Plugins successfully registered');

    fastify.ready(() => {
        !silent && console.log();
        !silent && console.log('> Plugins Tree:');
        !silent && console.log(fastify.printPlugins());
        !silent && console.log('> Routes Tree:');
        !silent && console.log(fastify.printRoutes());
    });
};

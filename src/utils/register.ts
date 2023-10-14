import type { FastifyInstance } from 'fastify';

/**
 * Register plugins.
 * Order matters. Be careful when changing the order/adding new plugins.
 */
export const registerPlugins = async (fastify: FastifyInstance, silent?: boolean) => {
    !silent && console.log();
    !silent && console.log('> Registering plugins...');

    [import('@config/registerDependencies'), import('@plugins/error'), import('@plugins/authorization')].forEach(
        async plugin => await fastify.register(plugin),
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

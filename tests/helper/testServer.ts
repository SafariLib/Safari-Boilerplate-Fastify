import { registerPlugins } from '@utils';
import Fastify from 'fastify';
import qs from 'qs';

export const buildServer = async () => {
    const server = Fastify({
        querystringParser: str => qs.parse(str),
    });
    registerPlugins(server);
    await server.ready();
    return server;
};

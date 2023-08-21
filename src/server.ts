import { envCheck, isProduction, registerPlugins } from '@config';
import Fastify from 'fastify';
import qs from 'qs';

export default (() => {
    try {
        envCheck();

        const server = Fastify({
            logger: !isProduction,
            querystringParser: str => qs.parse(str),
        });

        registerPlugins(server);

        return server;
    } catch (e) {
        console.error('> Error building server');
        console.error(e);
        process.exit(1);
    }
})();

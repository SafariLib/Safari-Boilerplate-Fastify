import type { FastifyPluginCallback } from 'fastify';
import plugin from 'fastify-plugin';

export default plugin((async (fastify, opts, done) => {
    if (fastify.hasDecorator('logService')) return done();

    const logEntityEdition = async (entity: string, entityId: number, userId: number, action: string) => {
        // await fastify.prisma.editLog.create({
        //     data: {
        //         entity,
        //         entityId,
        //         userId,
        //         action,
        //     },
        // });
    };

    fastify.decorate('logService', {});
    done();
}) as FastifyPluginCallback);

interface LogService {}

declare module 'fastify' {
    interface FastifyInstance {
        logService: LogService;
    }
}

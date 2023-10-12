import type { Prisma } from '@prisma/client';
import { PrismaClient } from '@prisma/client';
import type { FastifyPluginCallback } from 'fastify';
import plugin from 'fastify-plugin';

/**
 * @package PrismaClient
 * @see https://www.prisma.io/docs
 * @see https://www.prisma.io/fastify#fastify-tabs
 */
export default plugin((async (fastify, opts, done) => {
    if (fastify.hasDecorator('prisma')) return done();

    const prisma = new PrismaClient({
        log: [{ level: 'query', emit: 'event' }],
    });

    prisma.$on('query', (e: Prisma.QueryEvent) => {
        fastify.log.info(e);
    });

    await prisma.$connect();

    fastify.decorate('prisma', prisma);
    fastify.addHook('onClose', async fastify => {
        await fastify.prisma.$disconnect();
    });

    done();
}) as FastifyPluginCallback);

declare module 'fastify' {
    interface FastifyInstance {
        prisma: PrismaClient;
    }
}

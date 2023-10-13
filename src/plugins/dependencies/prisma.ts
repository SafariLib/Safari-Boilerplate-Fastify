import type { Prisma } from '@prisma/client';
import { PrismaClient } from '@prisma/client';
import type { PrismaClientOptions } from '@prisma/client/runtime/library';
import type { FastifyPluginCallback } from 'fastify';
import plugin from 'fastify-plugin';

export interface PrismaPluginOpts {
    clientOpts: Prisma.Subset<PrismaClientOptions, PrismaClientOptions>;
}

/**
 * PrismaClient
 * @see https://www.prisma.io/docs
 * @see https://www.prisma.io/fastify#fastify-tabs
 */
export default plugin((async (fastify, opts: PrismaPluginOpts, done) => {
    const prisma = new PrismaClient(opts.clientOpts);
    await prisma.$connect();

    fastify.decorate('prisma', prisma);
    fastify.addHook('onClose', async fastify => await fastify.prisma.$disconnect());

    done();
}) as FastifyPluginCallback);

declare module 'fastify' {
    interface FastifyInstance {
        prisma: PrismaClient;
    }
}

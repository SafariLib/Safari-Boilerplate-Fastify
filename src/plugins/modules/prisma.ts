import { PrismaClient } from '@prisma/client';
import type { FastifyPluginCallback } from 'fastify';
import plugin from 'fastify-plugin';

declare module 'fastify' {
    interface FastifyInstance {
        prisma: PrismaClient;
    }
}

/**
 * @package PrismaClient
 * @see https://www.prisma.io/docs
 * @see https://www.prisma.io/fastify#fastify-tabs
 */
export default plugin((async (fastify, opts, done) => {
    if (fastify.hasDecorator('prisma')) return done();

    const prisma = new PrismaClient();
    await prisma.$connect();

    fastify.decorate('prisma', prisma);
    fastify.addHook('onClose', async fastify => {
        await fastify.prisma.$disconnect();
    });

    done();
}) as FastifyPluginCallback);

import type { FastifySchema } from 'fastify';

export const getUsers: FastifySchema = {
    tags: ['Admin - users'],
};

export const getUserById: FastifySchema = {
    tags: ['Admin - users'],
};

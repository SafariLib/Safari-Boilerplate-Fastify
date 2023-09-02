import type { FastifySchema } from 'fastify';

export const loginSchema: FastifySchema = {
    tags: ['Authentication'],
    body: {
        type: 'object',
        required: ['password', 'username'],
        properties: {
            username: {
                type: 'string',
                minLength: 5,
                maxLength: 32,
            },
            password: {
                type: 'string',
                minLength: 12,
                maxLength: 64,
            },
        },
    },
};

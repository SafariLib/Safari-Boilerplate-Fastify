import type { FastifySchema } from 'fastify';

export const loginSchema: FastifySchema = {
    body: {
        type: 'object',
        required: ['password'],
        maxProperties: 2,
        minProperties: 2,
        properties: {
            username: {
                type: 'string',
                maxLength: 32,
            },
            email: {
                type: 'string',
                maxLength: 64,
            },
            password: {
                type: 'string',
                maxLength: 64,
            },
        },
    },
    params: {
        type: 'object',
        required: ['entity'],
        properties: {
            entity: {
                type: 'string',
                enum: ['user', 'customer'],
            },
        },
    },
};

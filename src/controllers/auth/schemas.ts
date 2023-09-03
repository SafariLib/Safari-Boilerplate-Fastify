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
    response: {
        200: {
            type: 'object',
            properties: {
                user: {
                    type: 'object',
                    properties: {
                        id: { type: 'number' },
                        username: { type: 'string' },
                        email: { type: 'string' },
                        role: { type: 'number' },
                        avatar_url: { type: 'string' },
                        revoked: { type: 'boolean' },
                        created_at: { type: 'string' },
                        updated_at: { type: 'string' },
                    },
                },
                accessToken: {
                    type: 'string',
                },
            },
        },
    },
};

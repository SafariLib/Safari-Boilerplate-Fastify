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
                        avatarUrl: { type: 'string' },
                        createdAt: { type: 'string' },
                        updatedAt: { type: 'string' },
                    },
                },
                accessToken: {
                    type: 'string',
                },
            },
        },
    },
};

export const logoutSchema: FastifySchema = {
    tags: ['Authentication'],
    headers: {
        type: 'object',
        properties: {
            authorization: { type: 'string' },
        },
    },
};

export const refreshSchema: FastifySchema = {
    tags: ['Authentication'],
    headers: {
        type: 'object',
        properties: {
            authorization: { type: 'string' },
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
                        avatarUrl: { type: 'string' },
                        createdAt: { type: 'string' },
                        updatedAt: { type: 'string' },
                    },
                },
                accessToken: {
                    type: 'string',
                },
            },
        },
    },
};

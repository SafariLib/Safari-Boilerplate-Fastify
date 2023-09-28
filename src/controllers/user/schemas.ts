import type { FastifySchema } from 'fastify';

export const getUsers: FastifySchema = {
    tags: ['Admin - users'],
    headers: {
        type: 'object',
        properties: {
            authorization: { type: 'string' },
        },
    },
    response: {
        200: {
            type: 'array',
            items: {
                type: 'object',
                properties: {
                    id: { type: 'number' },
                    username: { type: 'string' },
                    email: { type: 'string' },
                    role: { type: 'string' },
                    avatarUrl: { type: 'string' },
                    revoked: { type: 'boolean' },
                    createdAt: { type: 'string' },
                    updatedAt: { type: 'string' },
                },
            },
        },
    },
};

export const getUserById: FastifySchema = {
    tags: ['Admin - users'],
    headers: {
        type: 'object',
        properties: {
            authorization: { type: 'string' },
        },
    },
    params: {
        type: 'object',
        properties: {
            id: { type: 'number' },
        },
    },
    response: {
        200: {
            type: 'object',
            properties: {
                id: { type: 'number' },
                username: { type: 'string' },
                email: { type: 'string' },
                role: { type: 'string' },
                avatarUrl: { type: 'string' },
                revoked: { type: 'boolean' },
                createdAt: { type: 'string' },
                updatedAt: { type: 'string' },
            },
        },
    },
};

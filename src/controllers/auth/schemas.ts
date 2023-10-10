import type { FastifySchema } from 'fastify';
import { authorizationSchema } from '../../schemas';

const loggedUser = {
    user: {
        type: 'object',
        properties: {
            id: { type: 'number' },
            username: { type: 'string' },
            email: { type: 'string' },
            avatarUrl: { type: 'string' },
            role: {
                type: 'object',
                property: {
                    id: { type: 'number' },
                    name: { type: 'string' },
                },
            },
        },
    },
    accessToken: {
        type: 'string',
    },
};

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
            properties: loggedUser,
        },
    },
};

export const logoutSchema: FastifySchema = {
    tags: ['Authentication'],
    headers: authorizationSchema,
};

export const refreshSchema: FastifySchema = {
    tags: ['Authentication'],
    headers: authorizationSchema,
    response: {
        200: {
            type: 'object',
            properties: loggedUser,
        },
    },
};

import { authorizationSchema, paginatedQuerySchema, selectByIdSchema } from '@schemas';
import type { FastifySchema } from 'fastify';

const roleSchema = {
    type: 'object',
    properties: {
        id: { type: 'number' },
        name: { type: 'string' },
    },
};

const userSchema = {
    type: 'object',
    properties: {
        id: { type: 'number' },
        username: { type: 'string' },
        email: { type: 'string' },
        role: roleSchema,
        avatarUrl: { type: 'string' },
        revoked: { type: 'boolean' },
        createdAt: { type: 'string' },
        updatedAt: { type: 'string' },
    },
};

export const getUsers: FastifySchema = {
    tags: ['Admin - users'],
    description: 'Get a paginated list of users, default limit is 10, default page is 0.',
    headers: authorizationSchema,
    querystring: {
        type: 'object',
        properties: {
            ...paginatedQuerySchema,
            username: { type: 'string' },
            email: { type: 'string' },
            role: { type: 'string' },
            revoked: { type: 'boolean' },
            created_after: { type: 'string' },
            created_before: { type: 'string' },
            updated_after: { type: 'string' },
            updated_before: { type: 'string' },
        },
    },
    response: {
        200: {
            type: 'array',
            items: userSchema,
        },
    },
};

export const getUserById: FastifySchema = {
    tags: ['Admin - users'],
    headers: authorizationSchema,
    params: selectByIdSchema,
    response: {
        200: userSchema,
    },
};

export const revokeUser: FastifySchema = {
    tags: ['Admin - users'],
    description: 'Revoke a user/admin.',
    headers: authorizationSchema,
    params: selectByIdSchema,
    response: {
        200: userSchema,
    },
};

export const activateUser: FastifySchema = {
    tags: ['Admin - users'],
    description: 'Activate a user/admin.',
    headers: authorizationSchema,
    params: selectByIdSchema,
    response: {
        200: userSchema,
    },
};

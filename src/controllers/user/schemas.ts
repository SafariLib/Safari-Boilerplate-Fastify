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
    headers: {
        type: 'object',
        properties: {
            authorization: { type: 'string' },
        },
    },
    querystring: {
        type: 'object',
        properties: {
            page: { type: 'number' },
            limit: { type: 'number' },
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
        200: userSchema,
    },
};

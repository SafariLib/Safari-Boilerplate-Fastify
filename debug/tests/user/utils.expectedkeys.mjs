export const userKeys = [
    { key: 'id', type: 'number' },
    { key: 'username', type: 'string' },
    { key: 'email', type: 'string' },
    {
        key: 'role',
        type: 'object',
        content: [
            { key: 'id', type: 'number' },
            { key: 'name', type: 'string' },
        ],
    },
    { key: 'avatarUrl', type: 'string' },
    { key: 'revoked', type: 'boolean' },
    { key: 'createdAt', type: 'string' },
    { key: 'updatedAt', type: 'string' },
];

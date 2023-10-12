export const authorizationSchema = {
    type: 'object',
    properties: {
        authorization: { type: 'string' },
    },
};

export const selectByIdSchema = {
    type: 'object',
    properties: {
        id: { type: 'number' },
    },
};

export const paginatedQuerySchema = {
    orderby: { type: 'string' },
    orderdir: { type: 'string' },
    page: { type: 'number' },
    limit: { type: 'number' },
};

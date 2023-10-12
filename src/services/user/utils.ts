import type { Prisma } from '@prisma/client';
import type { GetPaginatedUsersPayload } from '../../controllers/user/types';

type PaginatedPayload = GetPaginatedUsersPayload['Querystring'];

export const orderColumns = ['id', 'username', 'email', 'isRevoked', 'createdAt'];

export const resolvePayloadValidity = (payload: PaginatedPayload) => {
    if (payload.created_after?.toString() === 'Invalid Date') return 'FILTER_MALFORMED_DATE';
    if (payload.created_before?.toString() === 'Invalid Date') return 'FILTER_MALFORMED_DATE';
    if (payload.updated_after?.toString() === 'Invalid Date') return 'FILTER_MALFORMED_DATE';
    if (payload.updated_before?.toString() === 'Invalid Date') return 'FILTER_MALFORMED_DATE';
    if (payload.page && payload.page < 1) return 'PAGINATION_MALFORMED';
    if (payload.limit && (payload.limit < 0 || payload.limit > 100)) return 'PAGINATION_MALFORMED';
    if (payload.orderby && orderColumns.includes(payload.orderby)) return 'ORDERBY_MALFORMED';
    if (payload.orderdir && (!payload.orderdir.match('ASC') || !payload.orderdir.match('DESC')))
        return 'ORDERBY_MALFORMED';

    return false;
};

const selectReducedUser = {
    id: true,
    username: true,
    email: true,
    avatarUrl: true,
    isRevoked: true,
    role: { select: { id: true, name: true } },
    createdAt: true,
};

export const resolveSelectUser = (select?: 'default' | 'reduced') => {
    if (select === 'reduced') return selectReducedUser;
    return selectReducedUser;
};

export const resolveOrderByUser = (
    orderby?: GetPaginatedUsersPayload['Querystring']['orderby'],
    orderdir?: GetPaginatedUsersPayload['Querystring']['orderdir'],
): Prisma.UserOrderByWithRelationInput | undefined => {
    if (!orderby || !orderdir) return undefined;
    if (!orderColumns.includes(orderby)) return undefined;
    const orderBy = {
        [orderby]: orderdir.toLowerCase() as 'asc' | 'desc',
    };
    return orderBy;
};

export const resolveWhereUser = (
    filters?: GetPaginatedUsersPayload['Querystring'],
): Prisma.UserWhereInput | undefined => {
    if (!filters) return undefined;
    const { username, email, role, revoked, created_after, created_before, updated_after, updated_before } = filters;
    const where = (() => ({
        username: {
            contains: username,
            mode: 'insensitive' as Prisma.QueryMode,
        },
        email: email
            ? {
                  contains: email,
                  mode: 'insensitive' as Prisma.QueryMode,
              }
            : undefined,
        role: role
            ? {
                  name: {
                      contains: role,
                      mode: 'insensitive' as Prisma.QueryMode,
                  },
              }
            : undefined,
        revoked: revoked,
        createdAt: (() => {
            if (!created_after && !created_before) return undefined;
            return {
                ...(created_after ? { gte: new Date(created_after) } : {}),
                ...(created_before ? { lte: new Date(created_before) } : {}),
            };
        })(),
        updatedAt: (() => {
            if (!updated_after && !updated_before) return undefined;
            return {
                ...(updated_after ? { gte: new Date(updated_after) } : {}),
                ...(updated_before ? { lte: new Date(updated_before) } : {}),
            };
        })(),
    }))();

    return where;
};

import type { PaginatedQuery } from '@services/query/types';

export interface GetUserByIdPayload {
    Params: {
        id: string;
    };
}

export interface GetPaginatedUsersPayload {
    Querystring: PaginatedQuery & {
        username: string;
        email: string;
        role: string;
        revoked: boolean;
        created_after: Date;
        created_before: Date;
        updated_after: Date;
        updated_before: Date;
    };
}

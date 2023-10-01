export interface GetUserByIdPayload {
    Params: {
        id: string;
    };
}

export interface GetPaginatedUsersPayload {
    Querystring: {
        page: number;
        limit: number;
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

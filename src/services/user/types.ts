import type { GetPaginatedUsersPayload } from '../../controllers/user/types';

export interface GetUser {
    id: number;
    username: string;
    email: string;
    role: {
        id: number;
        name: string;
    };
    avatarUrl: string;
    revoked: boolean;
    createdAt: string;
    updatedAt: string;
}

export interface GetAdmin extends GetUser {}

export type GetUserById = (id: number) => Promise<GetUser>;

export type GetPaginatedUsers = (payload: GetPaginatedUsersPayload['Querystring']) => Promise<Array<GetUser>>;

export type GetAdminRoles = () => Promise<Array<{ id: number; name: string }>>;

export type CreateAdmin = (payload: { username: string; email: string; roleId: number }) => Promise<GetAdmin>;

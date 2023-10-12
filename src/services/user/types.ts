import type { GetPaginatedUsersPayload } from '@controllers/user/types';

export interface ReducedUser {
    id: number;
    username: string;
    email: string;
    avatarUrl: string;
    isRevoked: boolean;
    role: {
        id: number;
        name: string;
    };
    createdAt: Date;
}

export type GetUserById = (id: number) => Promise<ReducedUser>;

export type GetPaginatedUsers = (payload: GetPaginatedUsersPayload['Querystring']) => Promise<Array<ReducedUser>>;

export type GetRoles = () => Promise<Array<{ id: number; name: string }>>;

export type CreateUser = (payload: { username: string; email: string; roleId: number }) => Promise<ReducedUser>;

export interface UserService {
    getUserById: GetUserById;
    getPaginatedUsers: GetPaginatedUsers;
}

import type { AccessRights, LoggedUser } from '../auth/types';

export type GetUserToLogin = (getter: string | number) => Promise<UserToLogin | undefined>;
export type GetAccessRights = (userId: number) => Promise<Array<AccessRights>>;

export interface UserToLogin extends LoggedUser {
    password: string;
    isRevoked: boolean;
}

export interface PrismaService {
    getUserToLogin: GetUserToLogin;
    getAccessRights: GetAccessRights;
}

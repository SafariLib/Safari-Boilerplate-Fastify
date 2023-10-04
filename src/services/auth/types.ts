export interface UserToConnect {
    id: number;
    username: string;
    email: string;
    password: string;
    avatarUrl?: string;
    roleId: number;
    roleName: string;
    isRevoked: boolean;
    createdAt: Date;
    updatedAt: Date;
}
export type ConnectedUser = Omit<UserToConnect, 'password' | 'isRevoked'>;
export interface LoginAttempt {
    userId: number;
    ip: string;
    createdAt: Date;
}
export interface LoginAttemptState {
    userAttempts: Array<LoginAttempt>;
    adminAttempts: Array<LoginAttempt>;
    cleanState: () => void;
}

export type CheckAdminAccessRights = (rights: Array<AccessRights>) => Promise<void>;
export type HasTooManyAttemps = (userId: number, ip: string, entity: Entity) => boolean;
export type LogAttempt = (userId: number, ip: string, entity: Entity) => void;
export type Login = (
    username: string,
    password: string,
    ip: string,
) => Promise<{ user: ConnectedUser; refreshToken: string; accessToken: string }>;

export type Entity = 'ADMIN' | 'USER';

export enum AccessRights {
    RevokeUser = 1,
    RevokeAdmin = 2,
    CreateUser = 3,
    CreateAdmin = 4,
}

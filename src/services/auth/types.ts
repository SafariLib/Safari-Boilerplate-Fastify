export interface LoggedUser {
    id: number;
    username: string;
    email: string;
    avatarUrl?: string;
    role: {
        id: number;
        name: string;
    };
}

export interface LoginAttempt {
    userId: number;
    ip: string;
    createdAt: Date;
}

export type CheckAccessRights = (rights: Array<AccessRights>) => Promise<void>;

export type Login = (
    username: string,
    password: string,
    ip: string,
) => Promise<{ user: LoggedUser; refreshToken: string; accessToken: string }>;

export enum AccessRights {
    RevokeUser = 1,
    RevokeAdmin = 2,
    CreateUser = 3,
    CreateAdmin = 4,
}

export interface UserToConnect {
    id: number;
    username: string;
    email: string;
    password?: string;
    avatar_url?: string;
    role: number;
    revoked: boolean;
    created_at: Date;
}

export type LogedUser = Omit<UserToConnect, 'password'>;

export type LogUser = (
    username: string,
    password: string,
    ip: string,
    userAgent: string,
    entity?: 'USER' | 'CUSTOMER',
) => Promise<{
    user: Omit<UserToConnect, 'password'>;
    refreshToken: string;
    accessToken: string;
}>;

export type GetUserFromToken = () => Promise<LogedUser>;

export type RevokeRefreshToken = (token: string) => Promise<void>;

export type RevokeUser = (userId: number, entity: 'USER' | 'CUSTOMER') => Promise<void>;

export interface AuthService {
    getConnectedUser: GetUserFromToken;
    getConnectedCustomer: GetUserFromToken;
    logUser: LogUser;
    logCustomer: LogUser;
    revokeUserRefreshToken: RevokeRefreshToken;
    revokeCustomerRefreshToken: RevokeRefreshToken;
    revokeUser: RevokeUser;
    revokeCustomer: RevokeUser;
}

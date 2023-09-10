export interface ConnectedUser {
    id: number;
    username: string;
    email: string;
    password?: string;
    avatar_url?: string;
    role: number;
    revoked: boolean;
    created_at: Date;
}

export type LogUser = (
    username: string,
    password: string,
    ip: string,
    userAgent: string,
    entity?: 'USER' | 'CUSTOMER',
) => Promise<{
    user: Omit<ConnectedUser, 'password'>;
    refreshToken: string;
    accessToken: string;
}>;

export type RevokeToken = (token: string) => Promise<void>;

export type RevokeUser = (userId: number, entity: 'USER' | 'CUSTOMER') => Promise<void>;

export interface AuthService {
    logUser: LogUser;
    logCustomer: LogUser;
    revokeUserToken: RevokeToken;
    revokeCustomerToken: RevokeToken;
    revokeUser: RevokeUser;
    revokeCustomer: RevokeUser;
}

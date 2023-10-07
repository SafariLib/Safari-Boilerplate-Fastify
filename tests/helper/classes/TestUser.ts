import type { PrismaClient } from '@prisma/client';
import type { FastifyInstance } from 'fastify';
import { generateHashedDefaultPassword, hashPassword } from '../password';

export interface UserState {
    id?: number;
    username: string;
    email: string;
    password: string;
    avatar_url: string;
    revoked: boolean;
    role_id: number;
    created_at: Date;
    updated_at: Date;
}

export default class TestUser {
    private server: FastifyInstance;
    private prismaClient: PrismaClient;
    private entity: 'admin' | 'user';
    private userState: UserState;

    private HttpClientHeaders: {
        Authorization?: string;
        Cookie?: string;
    } = {};

    public id: number;
    public username: string;
    public email: string;
    public password: string;
    public avatar_url: string;
    public revoked: boolean;
    public role_id: number;
    public created_at: Date;
    public updated_at: Date;

    constructor(constructor: {
        server: FastifyInstance;
        prismaClient: PrismaClient;
        entity: 'admin' | 'user';
        role?: 'ADMIN' | 'SUPER_ADMIN';
        userObject?: {
            username?: string;
            email?: string;
            password?: string;
            avatar_url?: string;
            revoked?: boolean;
            role_id?: number;
            created_at?: Date;
            updated_at?: Date;
        };
    }) {
        const { userObject, prismaClient, entity, server } = constructor;
        const uuid = Math.floor(Math.random() * 1000);
        const { password, hashedPassword } = userObject.password
            ? { password: userObject.password, hashedPassword: hashPassword(userObject.password) }
            : generateHashedDefaultPassword();

        this.prismaClient = prismaClient;
        this.entity = entity;
        this.server = server;

        this.role_id = (() => {
            if (userObject.role_id) return userObject.role_id;
            else if (constructor.role === 'ADMIN' && this.entity === 'admin') return 2;
            else if (constructor.role === 'SUPER_ADMIN' && this.entity === 'admin') return 1;
            else if (this.entity === 'admin') return 2;
            else if (this.entity === 'user') return 1;
        })();

        this.username = userObject.username ?? `test_${this.entity}${uuid}`;
        this.email = userObject.email ?? `${this.username}${uuid}@test.test`.replace(/\s/g, '');
        this.password = password;
        this.avatar_url = userObject.avatar_url ?? '';
        this.revoked = userObject.revoked ?? false;
        this.created_at = userObject.created_at ?? new Date();
        this.userState = {
            username: this.username,
            email: this.email,
            password: hashedPassword,
            avatar_url: this.avatar_url,
            revoked: this.revoked,
            role_id: this.role_id,
            created_at: this.created_at,
            updated_at: userObject.updated_at,
        };
    }

    private setCookieToken = (token: string) => {
        this.HttpClientHeaders.Cookie = `refreshToken=${token}`;
    };

    private setAuthorizationToken = (token: string) => {
        this.HttpClientHeaders.Authorization = `Bearer ${token}`;
    };

    /**
     * Clone the user
     */
    public cloneUser = () => {
        const clone = { ...this };
        clone.HttpClientHeaders = {};
        delete clone.prismaClient;
        delete clone.saveUserState;
        return clone;
    };

    /**
     * Get the hashed password
     */
    public getHashedPassword = () => hashPassword(this.password);

    /**
     * Gets the user role name
     */
    public getUserRoleName = async () => {
        if (this.entity === 'admin') {
            const role = await this.prismaClient.adminRole.findFirst({ where: { id: this.role_id } });
            return role?.name;
        } else if (this.entity === 'user') {
            const role = await this.prismaClient.userRole.findFirst({ where: { id: this.role_id } });
            return role?.name;
        }
    };

    /**
     * Saves the user state in database
     */
    public saveUserState = async () => {
        if (this.entity === 'admin') return await this.prismaClient.admin.create({ data: this.userState });
        else if (this.entity === 'user') return await this.prismaClient.user.create({ data: this.userState });
    };

    /**
     * testAdminProtectRoute
     */
    public testAdminProtectRoute = async () => {
        const { statusCode } = await this.server.inject({
            method: 'GET',
            url: '/protected/admin/ping',
            headers: this.HttpClientHeaders,
        });
        return statusCode === 200;
    };

    /**
     * testUserProtectRoute
     */
    public testUserProtectRoute = async () => {
        const { statusCode } = await this.server.inject({
            method: 'GET',
            url: '/protected/ping',
            headers: this.HttpClientHeaders,
        });
        return statusCode === 200;
    };

    /**
     * Log the user in
     */
    public login = async () => {
        const { statusCode, cookies, json } = await this.server.inject({
            method: 'POST',
            url: this.entity === 'admin' ? '/auth/login/admin' : '/auth/login/user',
            payload: {
                email: this.email,
                password: this.password,
            },
        });
        if (statusCode !== 200) return false;
        const refreshToken = cookies.find(cookie => cookie.name === 'refreshToken').value;
        const accessToken = json().accessToken;
        this.setCookieToken(refreshToken);
        this.setAuthorizationToken(accessToken);
        return true;
    };

    /**
     * Log the user out
     */
    public logout = async () => {
        const { statusCode } = await this.server.inject({
            method: 'GET',
            url: this.entity === 'admin' ? '/auth/logout/admin' : '/auth/logout/user',
            headers: this.HttpClientHeaders,
        });
        this.HttpClientHeaders = {};
        return statusCode === 200;
    };

    /**
     * Logout all user sessions
     */
    public logoutAllSessions = async () => {
        const { statusCode } = await this.server.inject({
            method: 'GET',
            url: this.entity === 'admin' ? '/auth/logout/admin/all' : '/auth/logout/user/all',
            headers: this.HttpClientHeaders,
        });
        this.HttpClientHeaders = {};
        return statusCode === 200;
    };
}

import type { FastifyInstance } from 'fastify';
import type { IncomingHttpHeaders, OutgoingHttpHeaders } from 'http';
import { generateHashedDefaultPassword, hashPassword } from './password';

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

export interface UserObject {
    username: string;
    email: string;
    role_id: number;
    revoked: boolean;
    created_at: Date;
    password?: string;
    avatar_url?: string;
    updated_at?: Date;
}

export interface TestUserConstructor {
    server: FastifyInstance;
    entity: 'admin' | 'user';
    userObject: UserObject;
}

export interface TestUser {
    id: number;
    username: string;
    email: string;
    password: string;
    avatar_url: string;
    revoked: boolean;
    role_id: number;
    created_at: Date;
    updated_at: Date;
    HttpClientHeaders: OutgoingHttpHeaders | IncomingHttpHeaders;
    getUserState: () => UserState;
    setUserState: (userState: UserState) => UserState;
    getHashedPassword: () => string;
    setAuthorizationToken: (token?: string) => void;
    setCookieToken: (token?: string) => void;
    testAdminProtectRoute: () => Promise<boolean>;
    testUserProtectRoute: () => Promise<boolean>;
    login: (payload?: { password: string; username: string }) => Promise<{
        statusCode: number;
        message?: string;
    }>;
    logout: () => Promise<boolean>;
    logoutAllSessions: () => Promise<boolean>;
    refreshTokens: () => Promise<{
        statusCode: number;
        message?: string;
        cookies?: { name: string; value: string }[];
        json?: () => { accessToken: string };
    }>;
    makeGetRequest: (url: string) => Promise<{
        statusCode: number;
        message?: string;
        cookies?: { name: string; value: string }[];
        json?: Record<string, unknown>;
    }>;
    makePatchRequest: (
        url: string,
        payload?: Record<string, unknown>,
    ) => Promise<{
        statusCode: number;
        message?: string;
        cookies?: { name: string; value: string }[];
        json?: Record<string, unknown>;
    }>;
}

export const buildUserObject = (constructor: TestUserConstructor): TestUser => {
    const { userObject, entity, server } = constructor;
    const {
        id,
        username,
        email,
        avatar_url,
        revoked,
        role_id,
        created_at,
        updated_at,
        HttpClientHeaders,
        password,
        userState,
    } = constructorHandler(userObject);

    const setCookieToken = (token?: string) => {
        HttpClientHeaders.Cookie = token ? `refreshToken=${token}` : '';
    };

    const setAuthorizationToken = (token?: string) => {
        HttpClientHeaders.Authorization = token ? `Bearer ${token}` : '';
    };

    const getUserState = () => userState;

    const setUserState = (newUserState: UserState) => {
        userState.id = newUserState.id;
        userState.username = newUserState.username;
        userState.email = newUserState.email;
        userState.password = newUserState.password;
        userState.avatar_url = newUserState.avatar_url;
        userState.revoked = newUserState.revoked;
        userState.role_id = newUserState.role_id;
        userState.created_at = newUserState.created_at;
        userState.updated_at = newUserState.updated_at;
        return userState;
    };

    const getHashedPassword = () => hashPassword(password);

    const testAdminProtectRoute = async () => {
        const { statusCode } = await server.inject({
            method: 'GET',
            url: '/protected/admin/ping',
            headers: HttpClientHeaders,
        });
        return statusCode === 200;
    };

    const testUserProtectRoute = async () => {
        const { statusCode } = await server.inject({
            method: 'GET',
            url: '/protected/ping',
            headers: HttpClientHeaders,
        });
        return statusCode === 200;
    };

    const login = async (payload?: { password: string; username: string }) => {
        const { statusCode, cookies, json } = await server.inject({
            method: 'POST',
            url: entity === 'admin' ? '/auth/login/admin' : '/auth/login/user',
            payload: payload ?? {
                username: username,
                password: password,
            },
        });
        if (statusCode !== 200)
            return {
                statusCode,
                message: json().message,
            };
        const refreshToken = cookies.find(cookie => cookie.name === 'refreshToken').value;
        const accessToken = json().accessToken;
        setCookieToken(refreshToken);
        setAuthorizationToken(accessToken);
        return {
            statusCode,
        };
    };

    const logout = async () => {
        const { statusCode } = await server.inject({
            method: 'GET',
            url: entity === 'admin' ? '/auth/logout/admin' : '/auth/logout/user',
            headers: HttpClientHeaders,
        });
        HttpClientHeaders.Cookie = '';
        return statusCode === 200;
    };

    const logoutAllSessions = async () => {
        const { statusCode } = await server.inject({
            method: 'GET',
            url: entity === 'admin' ? '/auth/logout/admin/all' : '/auth/logout/user/all',
            headers: HttpClientHeaders,
        });
        HttpClientHeaders.Cookie = '';
        return statusCode === 200;
    };

    const refreshTokens = async () => {
        const { statusCode, cookies, json } = await server.inject({
            method: 'GET',
            url: entity === 'admin' ? '/auth/refresh/admin' : '/auth/refresh/user',
            headers: HttpClientHeaders,
        });
        if (statusCode !== 200)
            return {
                statusCode,
                message: json().message,
            };

        const refreshToken = cookies.find(cookie => cookie.name === 'refreshToken').value;
        const accessToken = json().accessToken;
        setCookieToken(refreshToken);
        setAuthorizationToken(accessToken);
        return {
            statusCode,
            cookies,
            json: json(),
        };
    };

    const makeGetRequest = async (url: string) => {
        const { json, ...res } = await server.inject({
            method: 'GET',
            url,
            headers: HttpClientHeaders,
        });
        const jsonRes = await json();
        return {
            ...res,
            json: jsonRes,
        };
    };

    const makePatchRequest = async (url: string, payload?: Record<string, unknown>) => {
        const { json, ...res } = await server.inject({
            method: 'PATCH',
            url,
            headers: HttpClientHeaders,
            payload: payload ?? {},
        });
        const jsonRes = await json();
        return {
            ...res,
            json: jsonRes,
        };
    };

    return {
        id,
        username,
        email,
        password,
        avatar_url,
        revoked,
        role_id,
        created_at,
        updated_at,
        HttpClientHeaders,
        getUserState,
        setUserState,
        getHashedPassword,
        setAuthorizationToken,
        setCookieToken,
        testAdminProtectRoute,
        testUserProtectRoute,
        login,
        logout,
        logoutAllSessions,
        refreshTokens,
        makeGetRequest,
        makePatchRequest,
    };
};

const constructorHandler = (userObject: UserObject) => {
    let password: string;
    let hashedPassword: string;

    if (userObject.password) {
        password = userObject.password;
        hashedPassword = hashPassword(userObject.password);
    } else {
        const generated = generateHashedDefaultPassword();
        password = generated.password;
        hashedPassword = generated.hashedPassword;
    }

    const userState: UserState = {
        username: userObject.username,
        email: userObject.email,
        password: hashedPassword,
        avatar_url: userObject.avatar_url ?? '',
        revoked: userObject.revoked,
        role_id: userObject.role_id,
        created_at: userObject.created_at,
        updated_at: userObject.updated_at,
    };

    return {
        id: 0,
        ...userState,
        password,
        userState,
        HttpClientHeaders: {} as OutgoingHttpHeaders,
    };
};

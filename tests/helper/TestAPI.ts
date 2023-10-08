import { PrismaClient } from '@prisma/client';
import { registerPlugins } from '@utils';
import type { FastifyInstance } from 'fastify';
import Fastify from 'fastify';
import qs from 'qs';
import { buildUserObject, type TestUser, type UserState } from './buildUserObject';

type UserConstructor = Omit<UserState, 'id'>;
type SuperAdminConstructor = Omit<UserState, 'id' | 'role_id'>;
type CreateManyUserPayload = Omit<UserConstructor, 'username' | 'email' | 'password'>;

export interface TestApiInstance {
    prismaClient: PrismaClient;
    server: FastifyInstance;
    admins: Array<UserState>;
    superAdmins: Array<UserState>;
    users: Array<UserState>;
    getUserByName: (username: string) => UserState | undefined;
    getUserById: (id: number) => UserState | undefined;
    getUserByEmail: (email: string) => UserState | undefined;
    getAdminByName: (username: string) => UserState | undefined;
    getAdminById: (id: number) => UserState | undefined;
    getAdminByEmail: (email: string) => UserState | undefined;
    getUserRoleName: (user: UserState) => Promise<string | undefined>;
    getAdminRoleName: (admin: UserState) => Promise<string | undefined>;
    saveUserState: (data: UserState) => Promise<UserState>;
    saveAdminState: (data: UserState) => Promise<UserState>;
    createAdmin: (userObject?: UserConstructor) => Promise<TestUser>;
    createSuperAdmin: (userObject?: SuperAdminConstructor) => Promise<TestUser>;
    createUser: (userObject?: UserConstructor) => Promise<TestUser>;
    createManyAdmins: (nbAdmins: number, userObject?: CreateManyUserPayload) => Promise<Array<UserState>>;
    createManyUsers: (nbUsers: number, userObject?: CreateManyUserPayload) => Promise<Array<UserState>>;
    init: () => Promise<void>;
    close: () => Promise<void>;
}

const fastifyOpts = {
    querystringParser: (str: string) => qs.parse(str),
    logger: false,
};

export default class TestAPI {
    public prismaClient = new PrismaClient();
    public server = Fastify(fastifyOpts);

    public admins = new Array<TestUser>();
    public superAdmins = new Array<TestUser>();
    public users = new Array<TestUser>();

    constructor() {
        this.prismaClient = new PrismaClient();
    }

    public getUserByName = (username: string) => this.users.find(user => user.username === username);

    public getUserById = (id: number) => this.users.find(user => user.id === id);

    public getUserByEmail = (email: string) => this.users.find(user => user.email === email);

    public getAdminByName = (username: string) => this.admins.find(admin => admin.username === username);

    public getAdminById = (id: number) => this.admins.find(admin => admin.id === id);

    public getAdminByEmail = (email: string) => this.admins.find(admin => admin.email === email);

    public getUserRoleName = async (user: UserState) => {
        const role = await this.prismaClient.userRole.findFirst({ where: { id: user.role_id } });
        return role?.name;
    };
    public getAdminRoleName = async (admin: UserState) => {
        const role = await this.prismaClient.adminRole.findFirst({ where: { id: admin.role_id } });
        return role?.name;
    };

    /**
     * Saves the user state in database
     */
    public saveUserState = async (data: UserState) =>
        data.id
            ? await this.prismaClient.user.update({ where: { id: data.id }, data })
            : await this.prismaClient.user.create({ data });

    /**
     * Saves the admin state in database
     */
    public saveAdminState = async (data: UserState) =>
        data.id
            ? await this.prismaClient.admin.update({ where: { id: data.id }, data })
            : await this.prismaClient.admin.create({ data });

    /**
     * Creates a new Admin and saves it in database
     */
    public createAdmin = async (userObject?: UserConstructor) => {
        const uuid = this.generateUuid();
        const username = userObject?.username ?? `test_admin_${uuid}`;
        const admin = buildUserObject({
            server: this.server,
            entity: 'admin',
            userObject: {
                username: username,
                email: userObject?.email ?? `${username}@test.test`,
                role_id: userObject?.role_id ?? 2,
                revoked: userObject?.revoked ?? false,
                created_at: userObject?.created_at ?? new Date(),
                ...userObject,
            },
        });
        const state = await (async () => {
            const currentState = admin.getUserState();
            const { id } = await this.saveAdminState(currentState);
            return admin.setUserState({ ...currentState, id });
        })();
        this.admins.push({ ...admin, ...state });
        return admin;
    };

    /**
     * Creates a new Super Admin and saves it in database
     */
    public createSuperAdmin = async (userObject?: SuperAdminConstructor) => {
        const uuid = this.generateUuid();
        const username = userObject?.username ?? `test_super_admin_${uuid}`;
        const superAdmin = buildUserObject({
            server: this.server,
            entity: 'admin',
            userObject: {
                username: username,
                email: userObject?.email ?? `${username}@test.test`,
                role_id: 1,
                revoked: userObject?.revoked ?? false,
                created_at: userObject?.created_at ?? new Date(),
                ...userObject,
            },
        });
        const state = await (async () => {
            const currentState = superAdmin.getUserState();
            const { id } = await this.saveAdminState(currentState);
            return superAdmin.setUserState({ ...currentState, id });
        })();
        this.superAdmins.push({ ...superAdmin, ...state });
        return superAdmin;
    };

    /**
     * Creates a new User and saves it in database
     */
    public createUser = async (userObject?: UserConstructor) => {
        const uuid = this.generateUuid();
        const username = userObject?.username ?? `test_user_${uuid}`;
        const user = buildUserObject({
            server: this.server,
            entity: 'user',
            userObject: {
                username: username,
                email: userObject?.email ?? `${username}@test.test`,
                role_id: 1,
                revoked: userObject?.revoked ?? false,
                created_at: userObject?.created_at ?? new Date(),
                ...userObject,
            },
        });
        const state = await (async () => {
            const currentState = user.getUserState();
            const { id } = await this.saveUserState(currentState);
            return user.setUserState({ ...currentState, id });
        })();
        this.users.push({ ...user, ...state });
        return user;
    };

    /**
     * Creates many new Admins and saves them in database
     */
    public createManyAdmins = async (nbAdmins: number, userObject?: CreateManyUserPayload) => {
        const admins = new Array<TestUser>();
        for (let i = 0; i < nbAdmins; i++) {
            const uuid = this.generateUuid();
            const admin = buildUserObject({
                server: this.server,
                entity: 'admin',
                userObject: {
                    username: `test_admin_${uuid}`,
                    email: `test_admin_${uuid}@test.test`,
                    role_id: userObject?.role_id ?? 2,
                    created_at: userObject?.created_at ?? new Date(),
                    ...userObject,
                },
            });
            const state = await (async () => {
                const currentState = admin.getUserState();
                const { id } = await this.saveAdminState(currentState);
                return admin.setUserState({ ...currentState, id });
            })();
            admins.push({ ...admin, ...state });
        }
        this.admins.push(...admins);
        return admins;
    };

    /**
     * Creates many new Users and saves them in database
     */
    public createManyUsers = async (nbUsers: number, userObject?: CreateManyUserPayload) => {
        const users = new Array<TestUser>();
        for (let i = 0; i < nbUsers; i++) {
            const uuid = this.generateUuid();
            const user = buildUserObject({
                server: this.server,
                entity: 'user',
                userObject: {
                    username: `test_user_${uuid}`,
                    email: `test_user_${uuid}@test.test`,
                    role_id: 1,
                    created_at: new Date(),
                    ...userObject,
                },
            });
            const state = await (async () => {
                const currentState = user.getUserState();
                const { id } = await this.saveUserState(currentState);
                return user.setUserState({ ...currentState, id });
            })();
            users.push({ ...user, ...state });
        }
        this.users.push(...users);
        return users;
    };

    public cloneUser = (user: TestUser) => {
        const clone = { ...user };
        clone.HttpClientHeaders = {};
        return clone;
    };

    /**
     * Initialize the server and connect to the database. Use this method before running any tests.
     */
    public init = async () => {
        registerPlugins(this.server, true);
        await this.server.ready();
        await this.prismaClient.$connect();
    };

    /**
     * Close the server and disconnect from the database. Use this method after all tests have finished.
     */
    public close = async () => {
        await this.deleteTestData();
        await this.prismaClient.$disconnect();
        await this.server.close();
    };

    private resetDatabaseIndexes = async () => {
        await this.prismaClient.$executeRaw`
            SELECT setval('"User_id_seq"', COALESCE((SELECT MAX(id) FROM "User"), 1));
        `;
        await this.prismaClient.$executeRaw`
            SELECT setval('"Admin_id_seq"', COALESCE((SELECT MAX(id) FROM "Admin"), 1));
        `;
    };

    private deleteTestData = async () => {
        this.admins.length &&
            (await this.prismaClient.admin.deleteMany({ where: { id: { in: this.admins.map(a => a.id) } } }));
        this.users.length &&
            (await this.prismaClient.user.deleteMany({ where: { id: { in: this.users.map(u => u.id) } } }));

        await this.resetDatabaseIndexes();
    };

    private generateUuid = () => Math.floor(Math.random() * 1000);
}

import type { PrismaClient } from '@prisma/client';
import type { FastifyInstance } from 'fastify';
import type { UserState } from './TestUser';
import TestUser from './TestUser';

type CreateManyUserPayload = Omit<UserState, 'username' | 'email' | 'password'>;

export default class UserFactory {
    private prismaClient: PrismaClient;
    private server: FastifyInstance;

    public admins = new Array<UserState>();
    public superAdmins = new Array<UserState>();
    public users = new Array<UserState>();

    constructor(prismaClient: PrismaClient, server: FastifyInstance) {
        this.prismaClient = prismaClient;
        this.server = server;
    }

    public getUserByName = async (username: string) => this.users.find(user => user.username === username);
    public getUserById = async (id: number) => this.users.find(user => user.id === id);
    public getUserByEmail = async (email: string) => this.users.find(user => user.email === email);
    public getAdminByName = async (username: string) => this.admins.find(admin => admin.username === username);
    public getAdminById = async (id: number) => this.admins.find(admin => admin.id === id);
    public getAdminByEmail = async (email: string) => this.admins.find(admin => admin.email === email);

    public createAdmin = async (userObject?: Partial<UserState>) => {
        const admin = new TestUser({
            server: this.server,
            prismaClient: this.prismaClient,
            entity: 'admin',
            role: 'ADMIN',
            userObject: {
                ...userObject,
            },
        });
        const created = await admin.saveUserState();
        this.admins.push(created);
        return created;
    };

    public createSuperAdmin = async (userObject?: Partial<UserState>) => {
        const admin = new TestUser({
            server: this.server,
            prismaClient: this.prismaClient,
            entity: 'admin',
            role: 'SUPER_ADMIN',
            userObject: {
                ...userObject,
            },
        });
        const created = await admin.saveUserState();
        this.superAdmins.push(created);
        return created;
    };

    public createUser = async (userObject?: Partial<UserState>) => {
        const user = new TestUser({
            server: this.server,
            prismaClient: this.prismaClient,
            entity: 'user',
            userObject: {
                ...userObject,
            },
        });
        const created = await user.saveUserState();
        this.users.push(created);
        return created;
    };

    public createManyAdmins = async (nbAdmins: number, userObject?: CreateManyUserPayload) => {
        const admins = new Array<UserState>();
        for (let i = 0; i < nbAdmins; i++) {
            const admin = new TestUser({
                server: this.server,
                prismaClient: this.prismaClient,
                entity: 'admin',
                role: 'ADMIN',
                userObject: {
                    ...userObject,
                },
            });
            const created = await admin.saveUserState();
            admins.push(created);
        }
        this.admins.push(...admins);
        return admins;
    };

    public createManyUsers = async (nbUsers: number, userObject?: CreateManyUserPayload) => {
        const users = new Array<UserState>();
        for (let i = 0; i < nbUsers; i++) {
            const user = new TestUser({
                server: this.server,
                prismaClient: this.prismaClient,
                entity: 'user',
                userObject: {
                    ...userObject,
                },
            });
            const created = await user.saveUserState();
            users.push(created);
        }
        this.users.push(...users);
        return users;
    };

    public deleteTestData = async () => {
        await this.prismaClient.admin.deleteMany({ where: { id: { in: this.admins.map(a => a.id) } } });
        await this.prismaClient.user.deleteMany({ where: { id: { in: this.users.map(u => u.id) } } });
    };
}

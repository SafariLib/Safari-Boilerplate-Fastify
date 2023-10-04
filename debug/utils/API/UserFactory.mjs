import { generateDefaultPassword } from '../../utils/password.mjs';

export default class UserFactory {
    constructor(constructor) {
        this.prismaClient = constructor;
        this.defaultPassword = generateDefaultPassword().password;
        this.adminsIds = [];
        this.adminsRolesIds = [];
        this.usersIds = [];
        this.userRolesIds = [];
    }

    getAllUsers = async () => await this.prismaClient.user.findMany();
    getAllAdmins = async () => await this.prismaClient.admin.findMany();

    /**
     * Creates an admin
     * @param {object} payload - { username, email, password, role_id, avatar_url, revoked, created_at, updated_at }
     * @param {string} role - 'ADMIN' or 'SUPER_ADMIN'
     * @returns {Promise<{
     *      id: number;
     *      username: string;
     *      email: string;
     *      role_id: number;
     *      avatar_url: string;
     *      password: string;
     *      revoked: boolean;
     *      created_at: Date;
     *      updated_at: Date;
     * }>}
     */
    createAdmin = async (payload, role) => {
        const { password, hashedPassword } = generateDefaultPassword();
        const uuid = Math.floor(Math.random() * 1000);
        await this.prismaClient.admin.create({
            data: {
                username: payload?.username ?? `test_admin${uuid}`,
                email: payload?.email ?? `test_admin${uuid}@test.test`,
                role_id:
                    payload?.role_id ??
                    (() => {
                        if (role === 'ADMIN') return 2;
                        if (role === 'SUPER_ADMIN') return 1;
                        return 2;
                    })(),
                password: hashedPassword,
                avatar_url: payload?.avatar_url,
                revoked: payload?.revoked,
                created_at: payload?.created_at,
                updated_at: payload?.updated_at,
            },
        });

        const created = await this.prismaClient.admin.findFirst({
            where: { username: payload?.username ?? `test_admin${uuid}` },
        });

        this.adminsIds.push(created.id);

        return { ...created, password };
    };

    /**
     * Creates many admins
     * @param {number} amount - Amount of admins to create
     * @param {string} role - 'ADMIN' or 'SUPER_ADMIN'
     * @param {object} payload - { password, revoked, created_at, updated_at }
     * @returns {Promise<{
     *      id: number;
     *      username: string;
     *      email: string;
     *      role_id: number;
     *      avatar_url: string;
     *      password: string;
     *      revoked: boolean;
     *      created_at: Date;
     *      updated_at: Date;
     * }>}
     */
    createManyAdmins = async (amount, role, payload) => {
        const uuid = Math.floor(Math.random() * 1000);
        const { password, hashedPassword } = generateDefaultPassword();
        const admins = Array.from({ length: amount }, (_, i) => ({
            username: `test_admin${i}-${uuid}`,
            email: `test_admin${i}-${uuid}@test.test`,
            role_id: (() => {
                if (role === 'ADMIN') return 2;
                if (role === 'SUPER_ADMIN') return 1;
                return 2;
            })(),
            revoked: payload?.revoked,
            created_at: payload?.created_at,
            updated_at: payload?.updated_at,
        }));

        await this.prismaClient.admin.createMany({
            data: admins.map(admin => ({
                ...admin,
                password: hashedPassword,
            })),
        });

        const created = await this.prismaClient.admin.findMany({
            where: { username: { in: admins.map(admin => admin.username) } },
        });

        return created.map(admin => {
            this.adminsIds.push(admin.id);
            return { ...admin, password };
        });
    };

    /**
     * Creates a user
     * @param {object} payload - { username, email, password, role_id }
     * @returns {Promise<{
     *      id: number;
     *      username: string;
     *      email: string;
     *      role_id: number;
     *      avatar_url: string;
     *      password: string;
     *      revoked: boolean;
     *      created_at: Date;
     *      updated_at: Date;
     * }>}
     */
    createUser = async payload => {
        const { password, hashedPassword } = generateDefaultPassword();
        const uuid = Math.floor(Math.random() * 9999);
        await this.prismaClient.user.create({
            data: {
                username: payload?.username ?? `test_user${uuid}`,
                email: payload?.email ?? `test_user${uuid}@test.test`,
                role_id: payload?.role_id ?? 1,
                password: hashedPassword,
                avatar_url: payload?.avatar_url,
                revoked: payload?.revoked,
                created_at: payload?.created_at,
                updated_at: payload?.updated_at,
            },
        });

        const created = await this.prismaClient.user.findFirst({
            where: { username: payload?.username ?? `test_user${uuid}` },
        });

        this.usersIds.push(created.id);

        return { ...created, password };
    };

    /**
     * Creates many users
     * @param {number} amount - Amount of users to create
     * @param {object} payload - { password, revoked, created_at, updated_at }
     * @returns {Promise<{
     *      id: number;
     *      username: string;
     *      email: string;
     *      role_id: number;
     *      avatar_url: string;
     *      password: string;
     *      revoked: boolean;
     *      created_at: Date;
     *      updated_at: Date;
     * }>}
     */
    createManyUsers = async (amount, payload) => {
        const uuid = Math.floor(Math.random() * 9999);
        const { password, hashedPassword } = generateDefaultPassword();
        const users = Array.from({ length: amount }, (_, i) => ({
            username: `test_user${i}-${uuid}`,
            email: `test_user${i}-${uuid}@test.test`,
            role_id: 1,
            password: hashedPassword,
            revoked: payload?.revoked,
            created_at: payload?.created_at,
            updated_at: payload?.updated_at,
        }));

        await this.prismaClient.user.createMany({
            data: users,
        });

        const created = await this.prismaClient.user.findMany({
            where: { username: { in: users.map(user => user.username) } },
        });

        return created.map(user => {
            this.usersIds.push(user.id);
            return { ...user, password };
        });
    };

    /**
     * Creates one admin role
     * @param {string} roleName - role name
     * @returns {Promise<{
     *      id: number;
     *      name: string;
     *      is_default: boolean;
     *      created_at: Date;
     *      updated_at: Date;
     *      rights: Array<number>
     * }>}
     */
    createAdminRole = async roleName => {
        const created = await this.prismaClient.adminRole.create({ data: { name: roleName } });
        this.adminsRolesIds.push(created.id);
        return created;
    };

    /**
     * Creates one user role
     * @param {string} roleName - role name
     * @returns {Promise<{
     *      id: number;
     *      name: string;
     *      is_default: boolean;
     *      created_at: Date;
     *      updated_at: Date;
     * }>}
     */
    createUserRole = async roleName => {
        const created = await this.prismaClient.userRole.create({ data: { name: roleName } });
        this.userRolesIds.push(created.id);
        return created;
    };

    deleteTestData = async () => {
        await this.prismaClient.admin.deleteMany({ where: { id: { in: this.adminsIds } } });
        await this.prismaClient.adminRole.deleteMany({ where: { id: { in: this.adminsRolesIds } } });
        await this.prismaClient.user.deleteMany({ where: { id: { in: this.usersIds } } });
        await this.prismaClient.userRole.deleteMany({ where: { id: { in: this.userRolesIds } } });
    };
}

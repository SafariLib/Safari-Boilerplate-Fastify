import type { TapInstance, TestApiInstance } from '../../helper';
import { buildQuerystring } from '../../helper/buildQueryString';
import { objectMatcher, type ObjectModel } from '../../helper/verifyObjectValidity';

export default async (t: TapInstance, testApi: TestApiInstance) => {
    const users = await testApi.createManyUsers(5);
    const admins = await testApi.createManyAdmins(5);
    const getRandomUserId = () => users[Math.floor(Math.random() * users.length)].id;
    const getRandomAdminId = () => admins[Math.floor(Math.random() * admins.length)].id;

    const admin = await testApi.createAdmin();
    await admin.login();

    t.test('Get user by id as Admin', async t => {
        const { json, statusCode } = await admin.makeGetRequest(`/protected/admin/user/${getRandomUserId()}`);
        t.match(statusCode, 200, 'Successfull get user by id');
        t.ok(objectMatcher(json, userKeys), 'Successfull get user by id');
    });

    t.test('Get Admin by id as Admin', async t => {
        const { json, statusCode } = await admin.makeGetRequest(`/protected/admin/admin/${getRandomAdminId()}`);
        t.match(statusCode, 200, 'Successfull get admin by id');
        t.ok(objectMatcher(json, userKeys), 'Successfull get admin by id');
    });

    t.test('Get users using filters', async t => {
        const query = buildQuerystring({ page: 1, limit: 3 });
        const { json, statusCode } = await admin.makeGetRequest(`/protected/admin/user${query}`);
        t.match(statusCode, 200, 'Successfull get users');
        t.ok(json.length === 3, 'Successfull get users');
    });

    t.test('Get admins using name filter', async t => {
        const string = admins[0].username.slice(10, 15);
        const query = buildQuerystring({ username: string });
        const { json, statusCode } = await admin.makeGetRequest(`/protected/admin/admin${query}`);
        const allMatch = (json as unknown as Array<{ username: string }>).every(({ username }) =>
            username.includes(string),
        );

        t.match(statusCode, 200, 'Successfull get admins');
        t.ok(allMatch, 'Successfull get admins');
    });
};

export const userKeys: ObjectModel[] = [
    { key: 'id', type: 'number' },
    { key: 'username', type: 'string' },
    { key: 'email', type: 'string' },
    {
        key: 'role',
        type: 'object',
        content: [
            { key: 'id', type: 'number' },
            { key: 'name', type: 'string' },
        ],
    },
    { key: 'avatarUrl', type: 'string' },
    { key: 'revoked', type: 'boolean' },
    { key: 'createdAt', type: 'string' },
    { key: 'updatedAt', type: 'string' },
];

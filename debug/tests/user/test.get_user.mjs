import ApiCaller from '../../utils/ApiCaller.mjs';
import { buildQuerystring } from '../../utils/Querystring.mjs';
import logger from '../../utils/logger.mjs';
import { userKeys } from './utils.expectedkeys.mjs';
import { cleanTestData, getUsersIds, initData, verifyObjectValidity, tomorrow, yesterday, lastWeek, nextWeek, getAdminsIds } from './utils.mjs';

const TESTS_NAME = 'Get user as Admin (protected route)';

export default async prisma => {
    logger.startTest(TESTS_NAME);
    const { testAdmin } = await initData(prisma);

    {
        /*
            Get user by ID as admin
        */

        const admin_client = new ApiCaller();
        await admin_client.ConnectAsAdmin(testAdmin.username);

        const userId = await (async () => {
            const usersIds = await getUsersIds(prisma);
            return usersIds[Math.floor(Math.random() * usersIds.length)];
        })();
        const { res, json } = await admin_client.GET(`/protected/admin/user/${userId}`);

        if (res.status !== 200) {
            logger.error(`FAILED: Get user by ID as admin, invalid status`, res);
        } else if (!verifyObjectValidity(json, userKeys)) {
            logger.error(`FAILED: Get user by ID as admin, invalid object`, json);
        } else {
            logger.success(`SUCCESS: Get user by ID as admin with valid response`);
        }
    }

    {
        /*
            Get admin by id as admin
        */

        const admin_client = new ApiCaller();
        await admin_client.ConnectAsAdmin(testAdmin.username);

        const adminId = await (async () => {
            const adminsIds = await getAdminsIds(prisma);
            return adminsIds[Math.floor(Math.random() * adminsIds.length)];
        })();

        const { res, json } = await admin_client.GET(`/protected/admin/admin/${adminId}`);

        if (res.status !== 200) {
            logger.error(`FAILED: Get admin by ID as admin, invalid status`, res);
        } else if (json.username !== 'test_admin') {
            logger.error(`FAILED: Get admin by ID as admin, wrong admin returned`, json);
        } else {
            logger.success(`SUCCESS: Get admin by ID as admin with valid response`);
        }
    }

    {
        /*
            Get many users as admin with pagination
        */

        const admin_client = new ApiCaller();
        await admin_client.ConnectAsAdmin(testAdmin.username);

        let query = buildQuerystring({
            page: 0,
            limit: 10,
        });
        let { res, json } = await admin_client.GET(`/protected/admin/user${query}`);

        if (res.status !== 200) {
            logger.error(`FAILED: Get many users as admin, invalid status`, res);
        } else if (!Array.isArray(json)) {
            logger.error(`FAILED: Get many users as admin, invalid object`, json);
        } else if (json.length > 10) {
            logger.error(`FAILED: Get many users as admin, array lenght not limited to 10`, json.length);
        } else if (!verifyObjectValidity(json[0], userKeys)) {
            logger.error(`FAILED: Get many users as admin, invalid object`, json[0]);
        } else {
            logger.success(`SUCCESS: Get many users as admin with valid response`);
        }

        /*
            Get many admins as admin with pagination
        */

        ({ res, json } = await admin_client.GET(`/protected/admin/admin`));
        if (res.status !== 200) {
            logger.error(`FAILED: Get many admins as admin, invalid status`, res);
        } else if (!Array.isArray(json)) {
            logger.error(`FAILED: Get many admins as admin, invalid object`, json);
        } else if (json[0].username !== 'test_admin') {
            logger.error(`FAILED: Get many admins as admin, wrong admin returned`, json);
        } else {
            logger.success(`SUCCESS: Get many admins as admin with valid response`);
        }

        /*
            Get many users by username
        */

        query = buildQuerystring({ username: 'teSt_User6' });
        ({ res, json } = await admin_client.GET(`/protected/admin/user${query}`));

        if (res.status !== 200) {
            logger.error(`FAILED: Get many users by username as admin, invalid status`, res);
        } else if (!json.length) {
            logger.error(`FAILED: Get many users by username as admin, username search failed`, json);
        } else if (json[0].username !== 'test_user6') {
            logger.error(`FAILED: Get many users by username as admin, wrong user returned search failed`, json);
        } else {
            logger.success(`SUCCESS: Get many users by username as admin with valid response`);
        }

        /*
            Get many users by email
        */

        query = buildQuerystring({ email: 'test_USer1' });
        ({ res, json } = await admin_client.GET(`/protected/admin/user${query}`));

        if (res.status !== 200) {
            logger.error(`FAILED: Get many users by email as admin, invalid status`, res);
        } else if (!json.length) {
            logger.error(`FAILED: Get many users by email as admin, email search failed`, json);
        } else if (!json[0].email.toLowerCase().startsWith('test_user1')) {
            logger.error(`FAILED: Get many users by email as admin, wrong user returned search failed`, json);
        } else {
            logger.success(`SUCCESS: Get many users by email as admin with valid response`);
        }

        /*
            Get many revoked users that are assigned to a specific role
        */

        query = buildQuerystring({ revoked: true, role: 'TEST_ROLE_1' });
        ({ res, json } = await admin_client.GET(`/protected/admin/user${query}`));

        if (res.status !== 200) {
            logger.error(`FAILED: Get many revoked users as admin, invalid status`, res);
        } else if (!json.length) {
            logger.error(`FAILED: Get many revoked users as admin, revoked search failed`, json);
        } else if (!json.every(({ revoked, role }) => revoked && role.name === 'TEST_ROLE_1')) {
            logger.error(`FAILED: Get many revoked users as admin, wrong user returned search failed`, json);
        } else {
            logger.success(`SUCCESS: Get many revoked users as admin with valid response`);
        }

        /*
            Get many users that have been created before a specific date
        */

        query = buildQuerystring({ created_before: tomorrow.toISOString() });
        ({ res, json } = await admin_client.GET(`/protected/admin/user${query}`));

        if (res.status !== 200) {
            logger.error(`FAILED: Get many users created before a specific date as admin, invalid status`, res);
        } else if (!json.length) {
            logger.error(`FAILED: Get many users created before a specific date as admin, created_before search failed`, json);
        } else if (!json.every(({ createdAt }) => new Date(createdAt) <= tomorrow)) {
            logger.error(`FAILED: Get many users created before a specific date as admin, wrong user returned search failed`, json);
        } else {
            logger.success(`SUCCESS: Get many users created before a specific date as admin with valid response`);
        }

        /*
            Get many users that have been created after a specific date
        */

        query = buildQuerystring({ created_after: yesterday.toISOString() });
        ({ res, json } = await admin_client.GET(`/protected/admin/user${query}`));

        if (res.status !== 200) {
            logger.error(`FAILED: Get many users created after a specific date as admin, invalid status`, res);
        } else if (!json.length) {
            logger.error(`FAILED: Get many users created after a specific date as admin, created_after search failed`, json);
        } else if (!json.every(({ createdAt }) => new Date(createdAt) >= yesterday)) {
            logger.error(`FAILED: Get many users created after a specific date as admin, wrong user returned search failed`, json);
        } else {
            logger.success(`SUCCESS: Get many users created after a specific date as admin with valid response`);
        }

        /*
            Get many users that have been updated before a specific date
        */

        query = buildQuerystring({ updated_before: nextWeek.toISOString() });
        ({ res, json } = await admin_client.GET(`/protected/admin/user${query}`));

        if (res.status !== 200) {
            logger.error(`FAILED: Get many users updated before a specific date as admin, invalid status`, res);
        } else if (!json.length) {
            logger.error(`FAILED: Get many users updated before a specific date as admin, updated_before search failed`, json);
        } else if (!json.every(({ updatedAt }) => new Date(updatedAt) <= nextWeek)) {
            logger.error(`FAILED: Get many users updated before a specific date as admin, wrong user returned search failed`, json);
        } else {
            logger.success(`SUCCESS: Get many users updated before a specific date as admin with valid response`);
        }

        /*
            Get many users that have been updated after a specific date
        */

        query = buildQuerystring({ updated_after: lastWeek.toISOString() });
        ({ res, json } = await admin_client.GET(`/protected/admin/user${query}`));

        if (res.status !== 200) {
            logger.error(`FAILED: Get many users updated after a specific date as admin, invalid status`, res);
        } else if (!json.length) {
            logger.error(`FAILED: Get many users updated after a specific date as admin, updated_after search failed`, json);
        } else if (!json.every(({ updatedAt }) => new Date(updatedAt) >= lastWeek)) {
            logger.error(`FAILED: Get many users updated after a specific date as admin, wrong user returned search failed`, json);
        } else {
            logger.success(`SUCCESS: Get many users updated after a specific date as admin with valid response`);
        }

        /*
            Get many users that have been created a specific range of dates
        */

        query = buildQuerystring({
            created_before: tomorrow.toISOString(),
            created_after: yesterday.toISOString(),
        });
        ({ res, json } = await admin_client.GET(`/protected/admin/user${query}`));

        if (res.status !== 200) {
            logger.error(`FAILED: Get many users created between two dates as admin, invalid status`, res);
        } else if (!json.length) {
            logger.error(`FAILED: Get many users created between two dates as admin, created_before and created_after search failed`, json);
        } else if (!json.every(({ createdAt }) => new Date(createdAt) <= tomorrow && new Date(createdAt) >= yesterday)) {
            logger.error(`FAILED: Get many users created between two dates as admin, wrong user returned search failed`, json);
        } else {
            logger.success(`SUCCESS: Get many users created between two dates as admin with valid response`);
        }

        /*
            Get many users that have been updated a specific range of dates
        */

        query = buildQuerystring({
            updated_before: nextWeek.toISOString(),
            updated_after: lastWeek.toISOString(),
        });
        ({ res, json } = await admin_client.GET(`/protected/admin/user${query}`));

        if (res.status !== 200) {
            logger.error(`FAILED: Get many users updated between two dates as admin, invalid status`, res);
        } else if (!json.length) {
            logger.error(`FAILED: Get many users updated between two dates as admin, updated_before and updated_after search failed`, json);
        } else if (!json.every(({ updatedAt }) => new Date(updatedAt) <= nextWeek && new Date(updatedAt) >= lastWeek)) {
            logger.error(`FAILED: Get many users updated between two dates as admin, wrong user returned search failed`, json);
        } else {
            logger.success(`SUCCESS: Get many users updated between two dates as admin with valid response`);
        }

        /*
            Get many users that have been created and updated a specific range of dates and are revoked
        */

        query = buildQuerystring({
            created_before: tomorrow.toISOString(),
            created_after: yesterday.toISOString(),
            updated_before: nextWeek.toISOString(),
            updated_after: lastWeek.toISOString(),
            revoked: true,
        });
        ({ res, json } = await admin_client.GET(`/protected/admin/user${query}`));

        if (res.status !== 200) {
            logger.error(`FAILED: Get many revoked users created and updated between two dates as admin, invalid status`, res);
        } else if (!json.length) {
            logger.error(`FAILED: Get many revoked users created and updated between two dates as admin, created_before, created_after, updated_before, updated_after and revoked search failed`, json);
        } else if (!json.every(({ createdAt, updatedAt, revoked }) => new Date(createdAt) <= tomorrow && new Date(createdAt) >= yesterday && new Date(updatedAt) <= nextWeek && new Date(updatedAt) >= lastWeek && revoked)) {
            logger.error(`FAILED: Get many revoked users created and updated between two dates as admin, wrong user returned search failed`, json);
        } else {
            logger.success(`SUCCESS: Get many revoked users created and updated between two dates as admin with valid response`);
        }

        /*
            Fail to insert sql injection in query
        */

        query = buildQuerystring({
            username: 'DROP TABLE users',
        });
        ({ res, json } = await admin_client.GET(`/protected/admin/user${query}`));

        if (res.status !== 200) {
            logger.error(`FAILED: Fail to insert sql injection in query as admin using username, invalid status`, res);
        } else {
            logger.success(`SUCCESS: Fail to insert sql injection in query as admin using username with valid response`);
        }
        
        query = buildQuerystring({
            role: 'DROP TABLE users',
        });

        ({ res, json } = await admin_client.GET(`/protected/admin/user${query}`));

        if (res.status !== 200) {
            logger.error(`FAILED: Fail to insert sql injection in query as admin using role, invalid status`, res);
        } else {
            logger.success(`SUCCESS: Fail to insert sql injection in query as admin using role with valid response`);
        }
    }

    await cleanTestData(prisma);
    logger.finishTest(TESTS_NAME);
};

import HTTPClient from '../../utils/API/HTTPClient.mjs';
import UserFactory from '../../utils/API/UserFactory.mjs';
import { buildQuerystring } from '../../utils/Querystring.mjs';
import logger from '../../utils/logger.mjs';
import { verifyObjectValidity } from '../../utils/verifyObjectValidity.mjs';
import { userKeys } from './utils.expectedkeys.mjs';

const TESTS_NAME = 'Get user as Admin (protected route)';

export default async prisma => {
    logger.startTest(TESTS_NAME);
    const factory = new UserFactory(prisma);

    const tomorrow = new Date(Date.now() + 1000 * 60 * 60 * 24);
    const yesterday = new Date(Date.now() - 1000 * 60 * 60 * 24);
    const nextWeek = new Date(Date.now() + 1000 * 60 * 60 * 24 * 7);
    const lastWeek = new Date(Date.now() - 1000 * 60 * 60 * 24 * 7);

    const createUsers = [
        { created_at: tomorrow, updated_at: nextWeek },
        { created_at: lastWeek, updated_at: yesterday },
        { created_at: yesterday },
        { created_at: nextWeek },
        { revoked: true },
    ].map(payload => factory.createManyUsers(2, payload));

    await factory.createUser({
        username: 'test_user_jambon',
        email: 'test_user_jambon@jambon.test',
    });

    await Promise.all(createUsers);

    const { username: superAdminUsername } = await factory.createAdmin(undefined, 'SUPER_ADMIN');
    const admins = await factory.createManyAdmins(2, 'ADMIN');
    const users = await factory.getAllUsers();

    try {
        /*
            Get user by ID as admin
        */

        const admin_client = new HTTPClient();
        await admin_client.ConnectAsAdmin(superAdminUsername);

        let { res, json } = await admin_client.GET(`/protected/admin/user/${users[0].id}`);

        if (res.status !== 200) {
            logger.error(`FAILED: Get user by ID as admin, invalid status`, res);
        } else if (!verifyObjectValidity(json, userKeys)) {
            logger.error(`FAILED: Get user by ID as admin, invalid object`, json);
        } else {
            logger.success(`SUCCESS: Get user by ID as admin with valid response`);
        }

        /*
            Get admin by id as admin
        */

        ({ res, json } = await admin_client.GET(`/protected/admin/admin/${admins[0].id}`));

        if (res.status !== 200) {
            logger.error(`FAILED: Get admin by ID as admin, invalid status`, res);
        } else if (!json.username.startsWith('test_admin')) {
            logger.error(`FAILED: Get admin by ID as admin, wrong admin returned`, json);
        } else {
            logger.success(`SUCCESS: Get admin by ID as admin with valid response`);
        }

        /*
            Get many users as admin with pagination
        */

        let query = buildQuerystring({ page: 0, limit: 10 });
        ({ res, json } = await admin_client.GET(`/protected/admin/user${query}`));

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
        } else if (!json[0].username.startsWith('test_admin')) {
            logger.error(`FAILED: Get many admins as admin, wrong admin returned`, json);
        } else {
            logger.success(`SUCCESS: Get many admins as admin with valid response`);
        }

        /*
            Get many users by username
        */

        query = buildQuerystring({ username: 'teSt_User_ja' });
        ({ res, json } = await admin_client.GET(`/protected/admin/user${query}`));

        if (res.status !== 200) {
            logger.error(`FAILED: Get many users by username as admin, invalid status`, res);
        } else if (!json.length) {
            logger.error(`FAILED: Get many users by username as admin, username search failed`, json);
        } else if (!json[0].username.startsWith('test_user_jambon')) {
            logger.error(`FAILED: Get many users by username as admin, wrong user returned search failed`, json);
        } else {
            logger.success(`SUCCESS: Get many users by username as admin with valid response`);
        }

        /*
            Get many users by email
        */

        query = buildQuerystring({ email: 'teSt_User_ja' });
        ({ res, json } = await admin_client.GET(`/protected/admin/user${query}`));

        if (res.status !== 200) {
            logger.error(`FAILED: Get many users by email as admin, invalid status`, res);
        } else if (!json.length) {
            logger.error(`FAILED: Get many users by email as admin, email search failed`, json);
        } else if (!json[0].email.toLowerCase().startsWith('test_user_jambon')) {
            logger.error(`FAILED: Get many users by email as admin, wrong user returned search failed`, json);
        } else {
            logger.success(`SUCCESS: Get many users by email as admin with valid response`);
        }

        /*
            Get many revoked users that are assigned to a specific role
        */

        query = buildQuerystring({ revoked: true });
        ({ res, json } = await admin_client.GET(`/protected/admin/user${query}`));

        if (res.status !== 200) {
            logger.error(`FAILED: Get many revoked users as admin, invalid status`, res);
        } else if (!json.length) {
            logger.error(`FAILED: Get many revoked users as admin, revoked search failed`, json);
        } else if (!json.every(({ revoked }) => revoked)) {
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
            logger.error(
                `FAILED: Get many users created before a specific date as admin, created_before search failed`,
                json,
            );
        } else if (!json.every(({ createdAt }) => new Date(createdAt) <= tomorrow)) {
            logger.error(
                `FAILED: Get many users created before a specific date as admin, wrong user returned search failed`,
                json,
            );
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
            logger.error(
                `FAILED: Get many users created after a specific date as admin, created_after search failed`,
                json,
            );
        } else if (!json.every(({ createdAt }) => new Date(createdAt) >= yesterday)) {
            logger.error(
                `FAILED: Get many users created after a specific date as admin, wrong user returned search failed`,
                json,
            );
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
            logger.error(
                `FAILED: Get many users updated before a specific date as admin, updated_before search failed`,
                json,
            );
        } else if (!json.every(({ updatedAt }) => new Date(updatedAt) <= nextWeek)) {
            logger.error(
                `FAILED: Get many users updated before a specific date as admin, wrong user returned search failed`,
                json,
            );
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
            logger.error(
                `FAILED: Get many users updated after a specific date as admin, updated_after search failed`,
                json,
            );
        } else if (!json.every(({ updatedAt }) => new Date(updatedAt) >= lastWeek)) {
            logger.error(
                `FAILED: Get many users updated after a specific date as admin, wrong user returned search failed`,
                json,
            );
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
            logger.error(
                `FAILED: Get many users created between two dates as admin, created_before and created_after search failed`,
                json,
            );
        } else if (
            !json.every(({ createdAt }) => new Date(createdAt) <= tomorrow && new Date(createdAt) >= yesterday)
        ) {
            logger.error(
                `FAILED: Get many users created between two dates as admin, wrong user returned search failed`,
                json,
            );
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
            logger.error(
                `FAILED: Get many users updated between two dates as admin, updated_before and updated_after search failed`,
                json,
            );
        } else if (!json.every(({ updatedAt }) => new Date(updatedAt) <= nextWeek && new Date(updatedAt) >= lastWeek)) {
            logger.error(
                `FAILED: Get many users updated between two dates as admin, wrong user returned search failed`,
                json,
            );
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
        });
        ({ res, json } = await admin_client.GET(`/protected/admin/user${query}`));

        if (res.status !== 200) {
            logger.error(
                `FAILED: Get many revoked users created and updated between two dates as admin, invalid status`,
                res,
            );
        } else if (!json.length) {
            logger.error(
                `FAILED: Get many revoked users created and updated between two dates as admin, created_before, created_after, updated_before, updated_after search failed`,
                json,
            );
        } else if (
            !json.every(
                ({ createdAt, updatedAt }) =>
                    new Date(createdAt) <= tomorrow &&
                    new Date(createdAt) >= yesterday &&
                    new Date(updatedAt) <= nextWeek &&
                    new Date(updatedAt) >= lastWeek,
            )
        ) {
            logger.error(
                `FAILED: Get many revoked users created and updated between two dates as admin, wrong user returned search failed`,
                json,
            );
        } else {
            logger.success(
                `SUCCESS: Get many revoked users created and updated between two dates as admin with valid response`,
            );
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
            logger.success(
                `SUCCESS: Fail to insert sql injection in query as admin using username with valid response`,
            );
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
    } catch (err) {
        logger.error(`FAILED: ${TESTS_NAME}`, err);
    } finally {
        await factory.deleteTestData();
        logger.finishTest(TESTS_NAME);
    }
};

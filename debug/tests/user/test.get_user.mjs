import ApiCaller from '../../utils/ApiCaller.mjs';
import { buildQuerystring } from '../../utils/Querystring.mjs';
import logger from '../../utils/logger.mjs';
import { userKeys } from './utils.expectedkeys.mjs';
import { cleanTestData, getUsersIds, initData, verifyObjectValidity } from './utils.mjs';

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
            Get many users by username
        */

        query = buildQuerystring({ username: 'teSt_User6' });
        ({ res, json } = await admin_client.GET(`/protected/admin/user${query}`));

        if (res.status !== 200) {
            logger.error(`FAILED: Get many users by username as admin, invalid status`, res);
        } else if (!json.length) {
            logger.error(`FAILED: Get many users by username as admin, username search failed`, json);
        } else {
            logger.success(`SUCCESS: Get many users by username as admin with valid response`);
        }
    }

    await cleanTestData(prisma);
    logger.finishTest(TESTS_NAME);
};

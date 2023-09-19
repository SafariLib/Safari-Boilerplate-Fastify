import ApiCaller from '../../utils/ApiCaller.mjs';
import logger from '../../utils/logger.mjs';
import { cleanTestData, initData } from './utils.mjs';

const TESTS_NAME = 'Get protected user list';

export default async prisma => {
    logger.startTest(TESTS_NAME);
    const { testUsers, testAdmins } = await initData(prisma);

    {
        /*
            Get user and admin list from protected route
        */

        const admin_client = new ApiCaller();
        const user_client = new ApiCaller();
        await admin_client.ConnectAsAdmin(testAdmins[0].username);
        await user_client.ConnectAsUser(testUsers[0].username);
    }

    await cleanTestData(prisma);
    logger.finishTest(TESTS_NAME);
};

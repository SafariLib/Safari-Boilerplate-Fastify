import logger from '../../utils/logger.mjs';
import { cleanTestData, connectAdmin, connectUser, initData } from './utils.mjs';

const TESTS_NAME = 'Get protected user list';

export default async () => {
    logger.startTest(TESTS_NAME);
    const { testUsers, testAdmins } = await initData();

    {
        /*
            Get user and admin list from protected route
        */

        const admin_client = await connectAdmin(testAdmins[0].username);
        const user_client = await connectUser(testUsers[0].username);
    }

    await cleanTestData();
    logger.finishTest(TESTS_NAME);
};

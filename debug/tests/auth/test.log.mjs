import { isIPv4 } from 'net';
import apiCaller, { HEADERS } from '../../utils/apiCaller.mjs';
import logger from '../../utils/logger.mjs';
import { PASSWORD, cleanTestData, getCustomerConnectionLogs, getUserConnectionLogs, initData } from './utils.mjs';

const TESTS_NAME = 'connection logs';

export default async () => {
    logger.startTest(TESTS_NAME);
    const { testUsers, testCustomers } = await initData();

    {
        /*
            Login should generate connection log
        */

        await apiCaller.POST('/auth/login/user', {
            username: testUsers[0].username,
            password: PASSWORD,
        });

        await apiCaller.POST('/auth/login/customer', {
            username: testCustomers[0].username,
            password: PASSWORD,
        });

        const userLogs = await getUserConnectionLogs(testUsers[0].email);
        const customerLogs = await getCustomerConnectionLogs(testCustomers[0].email);

        if (userLogs.length !== 1) {
            logger.error(`FAILED: Got ${userLogs.length} log entries for only one connection.`, userLogs);
        } else if (!isIPv4(userLogs[0].ip)) {
            logger.error(`FAILED: Got invalid IP address: ${userLogs[0].ip}`);
        } else if (userLogs[0].user_agent !== HEADERS['User-Agent']) {
            logger.error(`FAILED: Got invalid user agent: "${userLogs[0].user_agent}" != ${HEADERS['User-Agent']}`);
        } else if (userLogs[0].created_at > Date.now() || userLogs[0].created_at < Date.now() - 1000) {
            logger.error(`FAILED: Got invalid timestamp: ${userLogs[0].created_at}`);
        } else {
            logger.success(`SUCCESS: User log formated and created with success`);
        }

        if (customerLogs.length !== 1) {
            logger.error(`FAILED: Got ${customerLogs.length} log entries for only one connection.`, customerLogs);
        } else if (!isIPv4(customerLogs[0].ip)) {
            logger.error(`FAILED: Got invalid IP address: ${customerLogs[0].ip}`);
        } else if (customerLogs[0].user_agent !== HEADERS['User-Agent']) {
            logger.error(
                `FAILED: Got invalid user agent: "${customerLogs[0].user_agent}" != "${HEADERS['User-Agent']}"`,
            );
        } else if (customerLogs[0].created_at > Date.now() || customerLogs[0].created_at < Date.now() - 1000) {
            logger.error(`FAILED: Got invalid timestamp: ${customerLogs[0].created_at}`);
        } else {
            logger.success(`SUCCESS: Customer log formated and created with success`);
        }
    }

    await cleanTestData();
    logger.finishTest(TESTS_NAME);
};

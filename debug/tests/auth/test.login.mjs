import apiCaller from '../../utils/apiCaller.mjs';
import logger from '../../utils/logger.mjs';
import { PASSWORD, cleanTestData, initData } from './utils.mjs';

const TESTS_NAME = 'login';

export default async () => {
    logger.startTest(TESTS_NAME);
    const { testUsers, testCustomers } = await initData();

    {
        /*
            Login should be successfull
        */

        for (const user of testUsers) {
            const response = await apiCaller.POST('/auth/login/user', {
                username: user.username,
                password: PASSWORD,
            });

            if (response.status !== 200) {
                logger.error(`FAILED: Log user ${user.username} with success`, response);
            } else {
                logger.success(`SUCCESS: Log user ${user.username} with success`);
            }
        }
        for (const customer of testCustomers) {
            const response = await apiCaller.POST('/auth/login/customer', {
                username: customer.username,
                password: PASSWORD,
            });

            if (response.status !== 200) {
                logger.error(`FAILED: Log customer ${customer.username} with success`, response);
            } else {
                logger.success(`SUCCESS: Log customer ${customer.username} with success`);
            }
        }
    }

    {
        /*
            Login should fail
        */

        for (const user of testUsers) {
            const response = await apiCaller.POST('/auth/login/user', {
                username: user.username,
                password: 'wrong password',
            });

            if (response.status !== 401) {
                logger.error(`FAILED: Fail to log user with wrong password`, response);
            } else {
                logger.success(`SUCCESS: Fail to log user with wrong password`);
            }
        }
        for (const customer of testCustomers) {
            const response = await apiCaller.POST('/auth/login/customer', {
                username: customer.username,
                password: 'wrong password',
            });

            if (response.status !== 401) {
                logger.error(`FAILED: Fail to log customer with wrong password`, response);
            } else {
                logger.success(`SUCCESS: Fail to log customer with wrong password`);
            }
        }
        for (const user of testUsers) {
            const response = await apiCaller.POST('/auth/login/user', {
                username:
                    'wrongUsernameThatIsTooLong_____IMeanReallyTooLongLikeSoLongItCanTouchTheSky____EvenLongerThanThat',
                password: PASSWORD,
            });

            if (response.status !== 400) {
                logger.error(`FAILED: Fail to reach login controller with malformed payload`, response);
            } else {
                logger.success(`SUCCESS: Fail to reach login controller with malformed payload`);
            }
        }
    }

    {
        /*
            Login should return user object and tokens
        */

        const userResponse = await apiCaller.POST('/auth/login/user', {
            username: testUsers[0].username,
            password: PASSWORD,
        });

        const userJsonContent = await userResponse.json();

        if (userJsonContent.user?.password !== undefined) {
            logger.error(`FAILED: User Login does return password`, userResponse);
        } else {
            logger.success(`SUCCESS: User Login does not return password`);
        }

        if (userJsonContent.accessToken === undefined) {
            logger.error(`FAILED: User Login does not return accessToken`, userResponse);
        } else {
            logger.success(`SUCCESS: User Login does return accessToken`);
        }

        const userRefreshToken = userResponse.headers.get('set-cookie').split(';')[0].split('=')[1];

        if (userRefreshToken === undefined) {
            logger.error(`FAILED: User Login does not return refreshToken`, userResponse);
        } else {
            logger.success(`SUCCESS: User Login does return refreshToken`);
        }

        // For customer

        const customerResponse = await apiCaller.POST('/auth/login/customer', {
            username: testCustomers[0].username,
            password: PASSWORD,
        });

        const customerJsonContent = await customerResponse.json();

        if (customerJsonContent.user?.password !== undefined) {
            logger.error(`FAILED: Customer Login does return password`, customerResponse);
        } else {
            logger.success(`SUCCESS: Customer Login does not return password`);
        }

        if (customerJsonContent.accessToken === undefined) {
            logger.error(`FAILED: Customer Login does not return accessToken`, customerResponse);
        } else {
            logger.success(`SUCCESS: Customer Login does return accessToken`);
        }

        const customerRefreshToken = customerResponse.headers.get('set-cookie').split(';')[0].split('=')[1];

        if (customerRefreshToken === undefined) {
            logger.error(`FAILED: Customer Login does not return refreshToken`, customerResponse);
        } else {
            logger.success(`SUCCESS: Customer Login does return refreshToken`);
        }
    }

    await cleanTestData();
    logger.finishTest(TESTS_NAME);
};

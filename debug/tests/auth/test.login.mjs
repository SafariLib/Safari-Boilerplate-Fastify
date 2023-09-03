import apiCaller from '../../utils/apiCaller.mjs';
import logger from '../../utils/logger.mjs';
import { PASSWORD, cleanTestData, initData } from './utils.mjs';

export default async () => {
    logger.startTest('login');
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

            // NOTE: Schema validation is shared between users and customers.
            Tests aren't duplicated for customers
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

        const response = await apiCaller.POST('/auth/login/user', {
            username: testUsers[0].username,
            password: PASSWORD,
        });

        const jsonContent = await response.json();

        if (jsonContent.user.password !== undefined) {
            logger.error(`FAILED: Login does not return password`, response);
        } else {
            logger.success(`SUCCESS: Login does not return password`);
        }

        if (jsonContent.accessToken === undefined) {
            logger.error(`FAILED: Login does return accessToken`, response);
        } else {
            logger.success(`SUCCESS: Login does return accessToken`);
        }

        const refreshToken = response.headers.get('set-cookie').split(';')[0].split('=')[1];

        if (refreshToken === undefined) {
            logger.error(`FAILED: Login does return refreshToken`, response);
        } else {
            logger.success(`SUCCESS: Login does return refreshToken`);
        }
    }

    await cleanTestData();
    logger.finishTest('login');
};

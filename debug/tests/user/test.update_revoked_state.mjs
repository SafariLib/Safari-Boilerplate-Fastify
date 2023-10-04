import HTTPClient from '../../utils/API/HTTPClient.mjs';
import UserFactory from '../../utils/API/UserFactory.mjs';
import logger from '../../utils/logger.mjs';

const TESTS_NAME = 'Update a User/Admin revoked state (protected route)';

export default async prisma => {
    logger.startTest(TESTS_NAME);
    const factory = new UserFactory(prisma);
    const superAdmin = await factory.createAdmin(undefined, 'SUPER_ADMIN');
    const users = await factory.createManyUsers(1);
    const super_admin_client = new HTTPClient();

    try {
        /*
            Revoke a user as admin
        */
        await super_admin_client.ConnectAsAdmin(superAdmin.username);

        const { hasAccessBeforeRevoke, hasAccessAfterRevoke, revokeCallRes, revokeCallStatus } = await (async () => {
            const user_client = new HTTPClient();
            await user_client.ConnectAsUser(users[0].username);
            const hasAccessBeforeRevoke = await user_client.testUserRevokedState();
            const { res } = await super_admin_client.PUT(`/protected/admin/user/${users[0].id}/revoke`);
            const hasAccessAfterRevoke = await user_client.testUserRevokedState();
            return {
                hasAccessBeforeRevoke,
                hasAccessAfterRevoke,
                revokeCallStatus: res.status,
                revokeCallRes: res,
            };
        })();

        if (!hasAccessBeforeRevoke) {
            logger.error('User access should be granted');
        } else if (revokeCallStatus !== 200) {
            logger.error('User revocation should be successful', revokeCallRes);
        } else if (hasAccessAfterRevoke) {
            logger.error('User access should be denied');
        } else {
            logger.success('User revocation successful');
        }
    } catch (err) {
        logger.error(`FAILED: ${TESTS_NAME}`, err);
    } finally {
        await factory.deleteTestData();
        logger.finishTest(TESTS_NAME);
    }
};

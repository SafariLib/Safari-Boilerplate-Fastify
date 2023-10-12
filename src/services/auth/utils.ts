import type { LoginAttempt } from './types';

export const buildLoginAttemptLogger = (min?: number) => {
    const attemptState = {
        attempts: [] as Array<LoginAttempt>,
        cleanState: () =>
            (attemptState.attempts = attemptState.attempts.filter(
                attempt => attempt.createdAt.getTime() > Date.now() - (min ?? 15) * 60 * 1000,
            )),
        getUserAttempts: (userId: number, ip: string) =>
            attemptState.attempts.filter(
                attempt =>
                    attempt.userId === userId &&
                    attempt.ip === ip &&
                    attempt.createdAt.getTime() > Date.now() - (min ?? 15) * 60 * 1000,
            ),
        logAttempt: (userId: number, ip: string) => {
            attemptState.attempts.push({
                userId,
                ip,
                createdAt: new Date(),
            });
        },
    };

    return attemptState;
};

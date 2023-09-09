/**
 * Retry a promise function a number of times
 * @param fn - Promise function to retry
 * @param retriesLeft - Number of retries
 */
const retry = async <T>(fn: () => Promise<T>, retriesLeft = 5): Promise<T> => {
    try {
        return await fn();
    } catch (error) {
        if (retriesLeft) {
            return await retry(fn, retriesLeft - 1);
        }
        throw error;
    }
};

export default retry;

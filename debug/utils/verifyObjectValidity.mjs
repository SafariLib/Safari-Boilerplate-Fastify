export const verifyObjectValidity = (object, expectedKeys) => {
    const keys = Object.keys(object);
    if (keys.length !== expectedKeys.length) {
        console.log('Object keys length mismatch');
        return false;
    }
    for (const key of keys) {
        const expectedKey = expectedKeys.find(({ key: k }) => k === key);
        if (!expectedKey) {
            console.log(`Unexpected key ${key}`);
            return false;
        }
        if (expectedKey.type === 'object') {
            if (!verifyObjectValidity(object[key], expectedKey.content)) {
                console.log(`Invalid object for key ${key}`);
                return false;
            }
        }
        if (typeof object[key] !== expectedKey.type) {
            console.log(`Unexpected type for key ${key}`);
            return false;
        }
    }
    return true;
};

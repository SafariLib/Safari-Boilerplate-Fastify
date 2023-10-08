export interface ObjectModel {
    key: string;
    type: string;
    content?: ObjectModel[];
}

export const objectMatcher = (object: Record<string, unknown>, model: ObjectModel[]): boolean => {
    if (Object.keys(object).length !== model.length) {
        return false;
    }

    for (const userKey of model) {
        const objectKey = object[userKey.key];
        if (objectKey === undefined || typeof objectKey !== userKey.type) {
            return false;
        }

        if (userKey.type === 'object') {
            if (!objectMatcher(objectKey as Record<string, unknown>, userKey.content)) {
                return false;
            }
        }
    }

    return true;
};

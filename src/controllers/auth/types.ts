export interface LoginPayload {
    Body: {
        username: string;
        password: string;
    };
    Params: {
        entity: 'user' | 'customer';
    };
}

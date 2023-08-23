interface ConstructorOpts {
    status?: number;
}

export type ServerErrorInstance = InstanceType<typeof ServerError>;

export default class ServerError extends Error {
    public status: number;

    constructor(message: string, opts?: ConstructorOpts) {
        super(message);
        this.status = opts?.status ?? 500;
    }
}

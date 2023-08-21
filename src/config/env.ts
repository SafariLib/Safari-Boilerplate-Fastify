const environmentVariables = ['NODE_ENV', 'POSTGRES_URI', 'SECRET_COOKIE', 'SECRET_JWT', 'SERVER_PORT'];

export const envCheck = () => {
    console.log('> Checking environment variables...');

    const missingVariables = environmentVariables.filter(env => !process.env[env]);
    if (missingVariables.length === 0) {
        // SERVER_PORT exceptions
        if (Number(process.env.SERVER_PORT) < 0 || Number(process.env.SERVER_PORT) > 65535) {
            throw new Error('SERVER_PORT must be a valid port number');
        }

        return console.log('Environment variables are all set');
    } else {
        console.log('Missing environment variables:');
        missingVariables.forEach(env => {
            console.log(`- ${env}`);
        });
        console.log();
        throw new Error(
            'You are missing one or more environment variables, please check the readme for more information.',
        );
    }
};

export const isProduction = (() => process.env.NODE_ENV === 'production')();
export const isDevelopment = (() => process.env.NODE_ENV === 'development')();

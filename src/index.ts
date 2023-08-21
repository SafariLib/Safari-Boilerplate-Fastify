import server from './server';

try {
    server.listen({
        port: Number(process.env.SERVER_PORT),
        host: '0.0.0.0',
    });
} catch (e) {
    console.error('> Error starting server');
    console.error(e);
    process.exit(1);
}

import { fetch } from 'undici';

jest.setTimeout(3 * 60 * 1000);

type endpoint = `/${string}`;

const BASE_URL = 'http://localhost:8080';

const GET = async (endpoint: endpoint) => {
    return await fetch(`${BASE_URL}${endpoint}`, {
        method: 'GET',
    });
};

const POST = async (endpoint: endpoint, body: any) => {
    return await fetch(`${BASE_URL}${endpoint}`, {
        method: 'POST',
        body: JSON.stringify(body),
    });
};

export default {
    GET,
    POST,
};

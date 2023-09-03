import { fetch } from 'undici';
import consoleColors from './consoleColors.mjs';

const BASE_URL = 'http://localhost:8080';

/**
 * @typedef {string} endpoint
 */

/**
 * Makes a GET request to the API
 * @param {endpoint} endpoint
 * @param {boolean} verbose
 * @returns {Promise<Response>}
 */
const GET = async (endpoint, verbose = false) => {
    const res = await fetch(`${BASE_URL}${endpoint}`, {
        method: 'GET',
    });

    verbose && (await logResponse(res, 'GET', endpoint));
    return res;
};

/**
 * Makes a POST request to the API
 * @param {endpoint} endpoint
 * @param {any} body
 * @param {boolean} verbose
 * @returns {Promise<Response>}
 **/
const POST = async (endpoint, body, verbose = false) => {
    const res = await fetch(`${BASE_URL}${endpoint}`, {
        method: 'POST',
        body: JSON.stringify(body),
        headers: { 'Content-Type': 'application/json' },
    });

    verbose && (await logResponse(res, 'POST', endpoint));
    return res;
};

const logResponse = async (res, method, endpoint) => {
    console.log(consoleColors.title, `API Caller: ${method} Request => ${endpoint}`, consoleColors.Reset);
    console.log();

    const statusColor = (() => {
        if (res.status >= 400) return consoleColors.error;
        if (res.status >= 300) return consoleColors.warning;
        if (res.status >= 200) return consoleColors.success;
        else return consoleColors.info;
    })();

    console.log(statusColor, `RESPONSE => ${res.status} - ${res.statusText}`, consoleColors.Reset);
    console.log(await res.json());
    console.log();
    console.log('-'.repeat(25));
};

export default {
    GET,
    POST,
};

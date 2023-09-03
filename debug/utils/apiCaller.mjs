import { fetch } from 'undici';

const BASE_URL = 'http://localhost:8080';

/**
 * @typedef {string} endpoint
 */

/**
 * Makes a GET request to the API
 * @param {endpoint} endpoint
 * @returns {Promise<Response>}
 */
const GET = async (endpoint, verbose = false) =>
    await fetch(`${BASE_URL}${endpoint}`, {
        method: 'GET',
    });

/**
 * Makes a POST request to the API
 * @param {endpoint} endpoint
 * @param {any} body
 * @returns {Promise<Response>}
 **/
const POST = async (endpoint, body, verbose = false) =>
    await fetch(`${BASE_URL}${endpoint}`, {
        method: 'POST',
        body: JSON.stringify(body),
        headers: { 'Content-Type': 'application/json' },
    });

export default {
    GET,
    POST,
};

import { fetch } from 'undici';

export const BASE_URL = 'http://localhost:8080';
export const HEADERS = {
    'Content-Type': 'application/json',
    'User-Agent': 'SAFARI TEST AGENT',
};

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
        headers: HEADERS,
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
        headers: HEADERS,
    });

export default {
    GET,
    POST,
};

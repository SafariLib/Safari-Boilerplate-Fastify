import { fetch } from 'undici';
import { DEFAULT_PASSWORD } from '../password.mjs';

export default class HTTPClient {
    constructor(constructor) {
        this.BASE_URL = constructor?.targetUrl ?? 'http://localhost:8080';
        this.HEADERS = {
            'Content-Type': constructor?.contentType ?? 'application/json',
            'User-Agent': constructor?.userAgent ?? 'SAFARI TEST',
        };
        this.DefaultPassword = constructor?.defaultPassword ?? DEFAULT_PASSWORD;
    }

    getBearerToken() {
        return this.HEADERS['Authorization']?.split(' ')[1];
    }

    setBearerToken(token) {
        this.HEADERS['Authorization'] = `Bearer ${token}`;
    }

    removeBearerToken() {
        delete this.HEADERS['Authorization'];
    }

    getCookieToken() {
        return this.HEADERS['Cookie']?.split(';')[0].split('=')[1];
    }

    setCookieToken(token) {
        this.HEADERS['Cookie'] = `refreshToken=${token}`;
    }

    removeCookieToken() {
        delete this.HEADERS['Cookie'];
    }

    setContentType(contentType) {
        this.HEADERS['Content-Type'] = contentType;
    }

    setUserAgent(userAgent) {
        this.HEADERS['User-Agent'] = userAgent;
    }

    testProtectedRouteAccess = async () => {
        const { res } = await this.GET(`/protected/ping`);
        return res.status === 200;
    };

    /**
     * Connects to the API
     * @param {string} username
     * @param {string} password
     * @returns {Promise<void>}
     **/
    async ConnectAsUser(username, password) {
        const { res, json } = await this.POST('/auth/login', {
            username,
            password: password ?? this.DefaultPassword,
        });
        try {
            this.setCookieToken(res.headers.get('set-cookie').split(';')[0].split('=')[1]);
            this.setBearerToken(json.accessToken);
        } catch {}
        return { res, json };
    }

    /**
     * Disconnects from the API
     * @returns {Promise<void>}
     **/
    async DisconnectAsUser() {
        const { res, json } = await this.GET('/auth/logout');
        this.removeCookieToken();
        this.removeBearerToken();
        return { res, json };
    }

    /**
     * Disconnects all clients from the API
     * @returns {Promise<void>}
     */
    async DisconnectAllAsUser() {
        const { res, json } = await this.GET('/auth/logout/all');
        this.removeCookieToken();
        this.removeBearerToken();
        return { res, json };
    }

    /**
     * Makes a GET request to the API
     * @param {endpoint} endpoint
     * @returns {Promise<Response>}
     * */
    async GET(endpoint, verbose = false) {
        const res = await fetch(`${this.BASE_URL}${endpoint}`, {
            method: 'GET',
            headers: this.HEADERS,
        });
        try {
            const json = await res.json();
            return { res, json };
        } catch {
            return { res, json: null };
        }
    }

    /**
     * Makes a POST request to the API
     * @param {endpoint} endpoint
     * @param {any} body
     * @returns {Promise<Response>}
     * */
    async POST(endpoint, body, verbose = false) {
        const res = await fetch(`${this.BASE_URL}${endpoint}`, {
            method: 'POST',
            body: JSON.stringify(body),
            headers: this.HEADERS,
        });
        const json = await res.json();
        return { res, json };
    }

    /**
     * Makes a PUT request to the API
     * @param {endpoint} endpoint
     * @param {any} body
     * @returns {Promise<Response>}
     */
    async PUT(endpoint, body, verbose = false) {
        const res = await fetch(`${this.BASE_URL}${endpoint}`, {
            method: 'PUT',
            body: JSON.stringify(body),
            headers: this.HEADERS,
        });
        const json = await res.json();
        return { res, json };
    }

    /**
     * Makes a PATCH request to the API
     * @param {endpoint} endpoint
     * @param {any} body
     * @returns {Promise<Response>}
     * */
    async PATCH(endpoint, body, verbose = false) {
        const res = await fetch(`${this.BASE_URL}${endpoint}`, {
            method: 'PATCH',
            body: JSON.stringify(body ?? {}),
            headers: this.HEADERS,
        });
        const json = await res.json();
        return { res, json };
    }

    /**
     * Makes a DELETE request to the API
     * @param {endpoint} endpoint
     * @returns {Promise<Response>}
     */
    async DELETE(endpoint, verbose = false) {
        const res = await fetch(`${this.BASE_URL}${endpoint}`, {
            method: 'DELETE',
            headers: this.HEADERS,
        });
        const json = await res.json();
        return { res, json };
    }
}

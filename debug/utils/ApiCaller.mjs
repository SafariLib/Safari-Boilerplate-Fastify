import { fetch } from 'undici';

export default class ApiCaller {
    constructor(constructor) {
        this.BASE_URL = constructor?.targetUrl ?? 'http://localhost:8080';
        this.HEADERS = {
            'Content-Type': constructor?.contentType ?? 'application/json',
            'User-Agent': constructor?.userAgent ?? 'SAFARI TEST',
        };
        this.DefaultPassword = constructor?.defaultPassword ?? 'P@ssw0rdTest123';
    }

    // FIXME
    getBearerToken() {
        return this.HEADERS['Authorization']?.split(' ')[1];
    }

    setBearerToken(token) {
        this.HEADERS['Authorization'] = `Bearer ${token}`;
    }

    removeBearerToken() {
        delete this.HEADERS['Authorization'];
    }

    // FIXME
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

    /**
     * Connects to the API as a user
     * @param {string} username
     * @param {string} password
     * @returns {Promise<void>}
     **/
    async ConnectAsUser(username, password) {
        const { res, json } = await this.POST('/auth/login/user', {
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
     * Connects to the API as an admin
     * @param {string} username
     * @param {string} password
     * @returns {Promise<void>}
     **/
    async ConnectAsAdmin(username, password) {
        const { res, json } = await this.POST('/auth/login/admin', {
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
     * Disconnects from the API as a user
     * @returns {Promise<void>}
     **/
    async DisconnectAsUser() {
        const { res, json } = await this.GET('/auth/logout/user');
        this.removeCookieToken();
        this.removeBearerToken();
        return { res, json };
    }

    /**
     * Disconnects from the API as an admin
     * @returns {Promise<void>}
     */
    async DisconnectAsAdmin() {
        const { res, json } = await this.GET('/auth/logout/admin');
        this.removeCookieToken();
        this.removeBearerToken();
        return { res, json };
    }

    /**
     * Disconnects all clients from the API as a user
     * @returns {Promise<void>}
     */
    async DisconnectAllAsUser() {
        const { res, json } = await this.GET('/auth/logout/user/all');
        this.removeCookieToken();
        this.removeBearerToken();
        return { res, json };
    }

    /**
     * Disconnects all clients from the API as an admin
     * @returns {Promise<void>}
     */
    async DisconnectAllAsAdmin() {
        const { res, json } = await this.GET('/auth/logout/admin/all');
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
        const json = await res.json();
        return { res, json };
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

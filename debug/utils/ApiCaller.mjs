import { fetch } from 'undici';

export default class ApiCaller {
    constructor(userAgent = 'SAFARI TEST AGENT') {
        this.BASE_URL = 'http://localhost:8080';
        this.HEADERS = {
            'Content-Type': 'application/json',
            'User-Agent': userAgent,
        };
    }

    setBearerToken(token) {
        this.HEADERS['Authorization'] = `Bearer ${token}`;
    }

    setCookieToken(token) {
        this.HEADERS['Cookie'] = `refreshToken=${token}`;
    }

    setContentType(contentType) {
        this.HEADERS['Content-Type'] = contentType;
    }

    setUserAgent(userAgent) {
        this.HEADERS['User-Agent'] = userAgent;
    }

    /**
     * Makes a GET request to the API
     * @param {endpoint} endpoint
     * @returns {Promise<Response>}
     * */
    async GET(endpoint, verbose = false) {
        return await fetch(`${this.BASE_URL}${endpoint}`, {
            method: 'GET',
            headers: this.HEADERS,
        });
    }

    /**
     * Makes a POST request to the API
     * @param {endpoint} endpoint
     * @param {any} body
     * @returns {Promise<Response>}
     * */
    async POST(endpoint, body, verbose = false) {
        return await fetch(`${this.BASE_URL}${endpoint}`, {
            method: 'POST',
            body: JSON.stringify(body),
            headers: this.HEADERS,
        });
    }
}

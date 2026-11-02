import https from 'node:https';

/**
 * Client for the Web API of RutOS and TSW firmware (`/api/...`).
 *
 * Used only for what SNMP cannot do — switching PoE: the devices expose no POWER-ETHERNET-MIB objects, and the
 * Teltonika MIB has nothing writable. HTTPS with the device's self-signed certificate, which is accepted
 * because the device generates it itself and no CA could ever have signed it.
 *
 * Every answer is wrapped as `{ success, data }` or `{ success: false, errors: [{ source, error, code }] }`.
 * A login hands out a bearer token that expires after a few minutes without use; an expired token is answered
 * with 401, upon which the client logs in again and repeats the request once.
 */

export interface ApiTarget {
    host: string;
    user: string;
    password: string;
    /** HTTPS port, 443 unless the WebUI was moved */
    port?: number;
    timeout?: number;
}

interface ApiAnswer<T> {
    success: boolean;
    data?: T;
    errors?: { source?: string; error?: string; code?: number }[];
}

export class ApiError extends Error {
    constructor(
        message: string,
        readonly status: number,
    ) {
        super(message);
        this.name = 'ApiError';
    }
}

const DEFAULT_TIMEOUT = 8000;

export default class TeltonikaApi {
    private token: string | null = null;
    private loggingIn: Promise<string> | null = null;
    private readonly agent = new https.Agent({ keepAlive: true, rejectUnauthorized: false });

    constructor(private readonly target: ApiTarget) {}

    get host(): string {
        return this.target.host;
    }

    async get<T>(path: string): Promise<T> {
        return this.call<T>('GET', path);
    }

    /** Write a configuration section, e.g. `ports_settings/config/port1`. Only the given options change. */
    async put<T>(path: string, data: unknown): Promise<T> {
        return this.call<T>('PUT', path, { data });
    }

    close(): void {
        this.token = null;
        this.agent.destroy();
    }

    private async call<T>(method: string, path: string, body?: unknown): Promise<T> {
        const token = this.token || (await this.login());
        try {
            return await this.send<T>(method, path, body, token);
        } catch (error) {
            // The token ran out between two polls. One retry with a fresh one, never a loop.
            if (error instanceof ApiError && error.status === 401) {
                this.token = null;
                return this.send<T>(method, path, body, await this.login());
            }
            throw error;
        }
    }

    /** Several requests may find the token missing at once; they share one login rather than racing. */
    private login(): Promise<string> {
        this.loggingIn ||= this.send<{ token?: string }>('POST', 'login', {
            username: this.target.user,
            password: this.target.password,
        })
            .then(data => {
                if (!data?.token) {
                    throw new ApiError('login answered without a token', 0);
                }
                this.token = data.token;
                return data.token;
            })
            .finally(() => {
                this.loggingIn = null;
            });
        return this.loggingIn;
    }

    private send<T>(method: string, path: string, body: unknown, token?: string): Promise<T> {
        const payload = body === undefined ? undefined : JSON.stringify(body);
        const headers: { [name: string]: string | number } = { Accept: 'application/json' };
        if (payload !== undefined) {
            headers['Content-Type'] = 'application/json';
            headers['Content-Length'] = Buffer.byteLength(payload);
        }
        if (token) {
            headers.Authorization = `Bearer ${token}`;
        }

        return new Promise<T>((resolve, reject) => {
            const request = https.request(
                {
                    host: this.target.host,
                    port: this.target.port || 443,
                    path: `/api/${path}`,
                    method,
                    headers,
                    agent: this.agent,
                    timeout: this.target.timeout || DEFAULT_TIMEOUT,
                },
                response => {
                    const chunks: Buffer[] = [];
                    response.on('data', (chunk: Buffer) => chunks.push(chunk));
                    response.on('end', () => {
                        const status = response.statusCode || 0;
                        let answer: ApiAnswer<T> | null = null;
                        try {
                            answer = JSON.parse(Buffer.concat(chunks).toString('utf8')) as ApiAnswer<T>;
                        } catch {
                            // An HTML error page from the web server, or nothing at all
                        }
                        if (status >= 200 && status < 300 && answer?.success) {
                            resolve(answer.data as T);
                            return;
                        }
                        const reason = answer?.errors?.map(error => error.error).join(', ') || `HTTP ${status}`;
                        reject(new ApiError(`${method} /api/${path}: ${reason}`, status));
                    });
                },
            );
            request.on('timeout', () => request.destroy(new Error(`${method} /api/${path}: timeout`)));
            request.on('error', reject);
            if (payload !== undefined) {
                request.write(payload);
            }
            request.end();
        });
    }
}

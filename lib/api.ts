const API_DEFAULT_BASE_URL = "http://localhost:5000/api/v1";

let csrfToken: string | null = null;
let csrfTokenPromise: Promise<string> | null = null;

function normalizeBaseUrl(rawBaseUrl: string) {
    const trimmed = rawBaseUrl.replace(/\/+$/, "");
    return `${trimmed}/`;
}

function getBaseUrl() {
    const configured = process.env.NEXT_PUBLIC_API_URL;
    const baseUrl = configured && configured.trim().length > 0 ? configured : API_DEFAULT_BASE_URL;
    return normalizeBaseUrl(baseUrl);
}

function resolveApiUrl(endpoint: string) {
    if (/^https?:\/\//.test(endpoint)) return endpoint;
    const baseUrl = getBaseUrl();
    const sanitizedEndpoint = endpoint.startsWith("/") ? endpoint.slice(1) : endpoint;
    return new URL(sanitizedEndpoint, baseUrl).toString();
}

async function getCsrfToken(): Promise<string> {
    if (csrfToken) return csrfToken;
    if (!csrfTokenPromise) {
        csrfTokenPromise = fetch(resolveApiUrl("/auth/csrf"), { credentials: "include" })
            .then(async (response) => {
                if (!response.ok) throw new Error(`Unable to prepare a secure request: ${response.status}`);
                const payload = await response.json() as { csrf_token?: string };
                if (!payload.csrf_token) throw new Error("The server did not provide a CSRF token.");
                csrfToken = payload.csrf_token;
                return csrfToken;
            })
            .finally(() => { csrfTokenPromise = null; });
    }
    return csrfTokenPromise;
}

function withCsrf(init: RequestInit, token: string): RequestInit {
    const headers = new Headers(init.headers);
    headers.set("X-CSRF-Token", token);
    return { ...init, headers };
}

async function errorMessage(response: Response, method: string, endpoint: string) {
    try {
        const payload = await response.json();
        const message = payload?.error?.message;
        if (typeof message === "string" && message.trim()) return message;
    } catch {
        // Use the status message when the response is not JSON.
    }
    return `API ${method} ${endpoint} failed: ${response.status}`;
}

export function clearAuthToken() {
    csrfToken = null;
    csrfTokenPromise = null;
}

// Kept as compatibility exports for existing callers. Authentication now lives in
// the HttpOnly server session; no credential is stored in browser JavaScript.
export const clearAuthTokens = clearAuthToken;
export function setAuthToken(token: string) { void token; }
export function setAuthTokens(accessToken: string, refreshToken?: string) {
    void accessToken;
    void refreshToken;
    clearAuthToken();
}

export async function apiGet<T>(endpoint: string): Promise<T> {
    const response = await fetch(resolveApiUrl(endpoint), { credentials: "include" });
    if (!response.ok) throw new Error(await errorMessage(response, "GET", endpoint));
    return response.json() as Promise<T>;
}

export async function apiPost<T>(endpoint: string, data: Record<string, unknown>): Promise<T> {
    const token = await getCsrfToken();
    const init = withCsrf({
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
    }, token);
    const response = await fetch(resolveApiUrl(endpoint), init);
    if (!response.ok) throw new Error(await errorMessage(response, "POST", endpoint));
    if (endpoint === "/auth/login" || endpoint === "/auth/logout") clearAuthToken();
    return response.json() as Promise<T>;
}

export async function apiPatch<T>(endpoint: string, data: Record<string, unknown>): Promise<T> {
    const token = await getCsrfToken();
    const init = withCsrf({
        method: "PATCH",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
    }, token);
    const response = await fetch(resolveApiUrl(endpoint), init);
    if (!response.ok) throw new Error(await errorMessage(response, "PATCH", endpoint));
    return response.json() as Promise<T>;
}

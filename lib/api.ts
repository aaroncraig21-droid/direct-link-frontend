const API_DEFAULT_BASE_URL = "http://localhost:5000/api/v1";
export const API_TOKEN_STORAGE_KEY = "direct-link-auth-token";
export const API_REFRESH_TOKEN_STORAGE_KEY = "direct-link-refresh-token";

function normalizeBaseUrl(rawBaseUrl: string) {
    const trimmed = rawBaseUrl.replace(/\/+$/, "");
    return `${trimmed}/`;
}

function getBaseUrl() {
    const configured = process.env.NEXT_PUBLIC_API_URL;
    const baseUrl = configured && configured.trim().length > 0
        ? configured
        : API_DEFAULT_BASE_URL;

    return normalizeBaseUrl(baseUrl);
}

function resolveApiUrl(endpoint: string) {
    const isAbsolute = /^https?:\/\//.test(endpoint);

    if (isAbsolute) {
        return endpoint;
    }

    const baseUrl = getBaseUrl();
    const sanitizedEndpoint = endpoint.startsWith("/")
        ? endpoint.slice(1)
        : endpoint;

    return new URL(sanitizedEndpoint, baseUrl).toString();
}

function getStoredAuthToken() {
    if (typeof window === "undefined") {
        return null;
    }

    return localStorage.getItem(API_TOKEN_STORAGE_KEY);
}

export function setAuthToken(token: string) {
    if (typeof window === "undefined") {
        return;
    }

    localStorage.setItem(API_TOKEN_STORAGE_KEY, token);
}

export function setAuthTokens(accessToken: string, refreshToken?: string) {
    setAuthToken(accessToken);

    if (typeof window !== "undefined" && refreshToken) {
        localStorage.setItem(API_REFRESH_TOKEN_STORAGE_KEY, refreshToken);
    }
}

export function clearAuthToken() {
    if (typeof window === "undefined") {
        return;
    }

    localStorage.removeItem(API_TOKEN_STORAGE_KEY);
    localStorage.removeItem(API_REFRESH_TOKEN_STORAGE_KEY);
}

export const clearAuthTokens = clearAuthToken;

function withAuth(init: RequestInit = {}) {
    const token = getStoredAuthToken();

    if (!token) {
        return init;
    }

    const headers = new Headers(init.headers);
    headers.set("Authorization", `Bearer ${token}`);

    return {
        ...init,
        headers,
    } satisfies RequestInit;
}

async function errorMessage(response: Response, method: string, endpoint: string) {
    try {
        const payload = await response.json();
        const message = payload?.error?.message;
        if (typeof message === "string" && message.trim()) {
            return message;
        }
    } catch {
        // Keep the status-based message when the server does not return JSON.
    }

    return `API ${method} ${endpoint} failed: ${response.status}`;
}

export async function apiGet<T>(endpoint: string): Promise<T> {
    const res = await fetch(resolveApiUrl(endpoint), withAuth({
        credentials: "include",
    }));

    if (!res.ok) {
        throw new Error(await errorMessage(res, "GET", endpoint));
    }

    return res.json() as Promise<T>;
}

export async function apiPost<T>(
    endpoint: string,
    data: Record<string, unknown>
): Promise<T> {
    const res = await fetch(resolveApiUrl(endpoint), withAuth({
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
    }));

    if (!res.ok) {
        throw new Error(await errorMessage(res, "POST", endpoint));
    }

    return res.json() as Promise<T>;
}

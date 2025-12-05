const API_DEFAULT_BASE_URL = "http://localhost:5000/api";
export const API_TOKEN_STORAGE_KEY = "direct-link-auth-token";

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

export function clearAuthToken() {
    if (typeof window === "undefined") {
        return;
    }

    localStorage.removeItem(API_TOKEN_STORAGE_KEY);
}

function withAuth(init: RequestInit = {}) {
    const token = getStoredAuthToken();

    if (!token) {
        return init;
    }

    return {
        ...init,
        headers: {
            ...(init.headers || {}),
            Authorization: `Bearer ${token}`,
        },
    } satisfies RequestInit;
}

export async function apiGet<T>(endpoint: string): Promise<T> {
    const res = await fetch(resolveApiUrl(endpoint), withAuth({
        credentials: "include",
    }));

    if (!res.ok) {
        throw new Error(`API GET ${endpoint} failed: ${res.status}`);
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
        throw new Error(`API POST ${endpoint} failed: ${res.status}`);
    }

    return res.json() as Promise<T>;
}

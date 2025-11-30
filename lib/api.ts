function resolveApiUrl(endpoint: string) {
    const isAbsolute = /^https?:\/\//.test(endpoint);

    if (isAbsolute) {
        return endpoint;
    }

    const baseUrl = process.env.NEXT_PUBLIC_API_URL;

    if (!baseUrl) {
        throw new Error(
            "API base URL is not configured. Please set NEXT_PUBLIC_API_URL."
        );
    }

    return new URL(endpoint, baseUrl).toString();
}

export async function apiGet<T>(endpoint: string): Promise<T> {
    const res = await fetch(resolveApiUrl(endpoint), {
        credentials: "include",
    });

    if (!res.ok) {
        throw new Error(`API GET ${endpoint} failed: ${res.status}`);
    }

    return res.json() as Promise<T>;
}

export async function apiPost<T>(
    endpoint: string,
    data: Record<string, unknown>
): Promise<T> {
    const res = await fetch(resolveApiUrl(endpoint), {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
    });

    if (!res.ok) {
        throw new Error(`API POST ${endpoint} failed: ${res.status}`);
    }

    return res.json() as Promise<T>;
}

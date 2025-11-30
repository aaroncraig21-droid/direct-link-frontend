export async function apiGet<T>(endpoint: string): Promise<T> {
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}${endpoint}`, {
        credentials: "include",
    });

    if (!res.ok) {
        throw new Error(`API GET ${endpoint} failed: ${res.status}`);
    }

    return res.json() as Promise<T>;
}

export async function apiPost<T>(
    endpoint: string,
    data: Record<string, any>
): Promise<T> {
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}${endpoint}`, {
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

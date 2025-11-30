import { apiGet } from "@/lib/api";

export default async function TestApiPage() {
    let result: unknown = null;
    let error: string | null = null;

    try {
        result = await apiGet("/surveys/feed");
    } catch (err: unknown) {
        error = err instanceof Error ? err.message : "Unknown error";
    }

    return (
        <div className="p-8">
            <h1 className="text-2xl font-bold mb-4">API Test</h1>

            {error && (
                <div className="bg-red-100 text-red-700 p-4 rounded">
                    <strong>Error:</strong> {error}
                </div>
            )}

            {result && (
                <pre className="bg-gray-100 p-4 rounded overflow-auto text-sm">
                    {JSON.stringify(result, null, 2)}
                </pre>
            )}

            {!error && !result && <p>Loading...</p>}
        </div>
    );
}

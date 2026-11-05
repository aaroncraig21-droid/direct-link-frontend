"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";

import { apiPost, clearAuthTokens } from "@/lib/api";

export default function LoginPage() {
    const router = useRouter();
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState<string | null>(null);
    const [submitting, setSubmitting] = useState(false);

    const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        setError(null);
        setSubmitting(true);

        try {
            await apiPost<Record<string, unknown>>("/auth/login", {
                email: email.trim(),
                password,
            });

            clearAuthTokens();
            router.replace("/dashboard");
        } catch (err) {
            setError(err instanceof Error ? err.message : "Unable to sign in.");
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <section className="mx-auto my-12 max-w-md rounded-xl border bg-white p-8 shadow-sm">
            <h1 className="mb-2 text-2xl font-semibold">Sign in</h1>
            <p className="mb-6 text-sm text-gray-600">
                Sign in to follow bills and share your position with your representatives.
            </p>

            <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                    <label className="block text-sm font-medium" htmlFor="email">Email</label>
                    <input
                        id="email"
                        name="email"
                        type="email"
                        autoComplete="email"
                        value={email}
                        onChange={(event) => setEmail(event.target.value)}
                        className="mt-1 block w-full rounded-md border px-3 py-2"
                        required
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium" htmlFor="password">Password</label>
                    <input
                        id="password"
                        name="password"
                        type="password"
                        autoComplete="current-password"
                        value={password}
                        onChange={(event) => setPassword(event.target.value)}
                        className="mt-1 block w-full rounded-md border px-3 py-2"
                        required
                    />
                </div>

                <button
                    type="submit"
                    disabled={submitting}
                    className="w-full rounded-md bg-blue-700 px-4 py-2 font-medium text-white hover:bg-blue-800 disabled:cursor-not-allowed disabled:opacity-60"
                >
                    {submitting ? "Signing in…" : "Sign in"}
                </button>
            </form>

            {error && (
                <p role="alert" className="mt-4 rounded-md bg-red-50 p-3 text-sm text-red-800">
                    {error}
                </p>
            )}
        </section>
    );
}

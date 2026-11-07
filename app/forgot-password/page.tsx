"use client";

import { FormEvent, useState } from "react";
import Link from "next/link";

import { apiPost } from "@/lib/api";

export default function ForgotPasswordPage() {
    const [email, setEmail] = useState("");
    const [error, setError] = useState<string | null>(null);
    const [submitted, setSubmitted] = useState(false);
    const [submitting, setSubmitting] = useState(false);

    const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        setError(null);
        setSubmitting(true);
        try {
            await apiPost("/auth/recovery/request", {
                email: email.trim(),
                role: "constituent",
            });
            setSubmitted(true);
        } catch (err) {
            setError(err instanceof Error ? err.message : "Unable to request a reset link.");
        } finally {
            setSubmitting(false);
        }
    };

    if (submitted) {
        return (
            <section className="mx-auto my-12 max-w-md rounded-xl border bg-white p-8 shadow-sm">
                <h1 className="mb-2 text-2xl font-semibold">Check your email</h1>
                <p className="text-sm text-gray-600">
                    If an account matches that email, password reset instructions will be sent.
                </p>
                <p className="mt-6 text-sm">
                    <Link href="/login" className="font-medium text-blue-700 hover:underline">
                        Return to sign in
                    </Link>
                </p>
            </section>
        );
    }

    return (
        <section className="mx-auto my-12 max-w-md rounded-xl border bg-white p-8 shadow-sm">
            <h1 className="mb-2 text-2xl font-semibold">Reset your password</h1>
            <p className="mb-6 text-sm text-gray-600">
                Enter the email address on your account. We’ll send a reset link if it matches.
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
                <button
                    type="submit"
                    disabled={submitting}
                    className="w-full rounded-md bg-blue-700 px-4 py-2 font-medium text-white hover:bg-blue-800 disabled:cursor-not-allowed disabled:opacity-60"
                >
                    {submitting ? "Sending…" : "Send reset link"}
                </button>
            </form>
            {error && (
                <p role="alert" className="mt-4 rounded-md bg-red-50 p-3 text-sm text-red-800">
                    {error}
                </p>
            )}
            <p className="mt-6 text-sm text-gray-600">
                <Link href="/login" className="font-medium text-blue-700 hover:underline">
                    Return to sign in
                </Link>
            </p>
        </section>
    );
}

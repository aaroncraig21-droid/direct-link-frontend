"use client";

import { FormEvent, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";

import { apiPost } from "@/lib/api";

export default function ResetPasswordPage() {
    const params = useParams<{ token: string }>();
    const token = params.token;
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [error, setError] = useState<string | null>(null);
    const [complete, setComplete] = useState(false);
    const [submitting, setSubmitting] = useState(false);

    const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        setError(null);
        if (password !== confirmPassword) {
            setError("The passwords do not match.");
            return;
        }
        setSubmitting(true);
        try {
            await apiPost("/auth/recovery/complete", { token, password });
            setComplete(true);
        } catch (err) {
            setError(err instanceof Error ? err.message : "Unable to reset your password.");
        } finally {
            setSubmitting(false);
        }
    };

    if (complete) {
        return (
            <section className="mx-auto my-12 max-w-md rounded-xl border bg-white p-8 shadow-sm">
                <h1 className="mb-2 text-2xl font-semibold">Password updated</h1>
                <p className="text-sm text-gray-600">
                    Your password has been reset. Sign in with your new password.
                </p>
                <p className="mt-6 text-sm">
                    <Link href="/login" className="font-medium text-blue-700 hover:underline">
                        Go to sign in
                    </Link>
                </p>
            </section>
        );
    }

    return (
        <section className="mx-auto my-12 max-w-md rounded-xl border bg-white p-8 shadow-sm">
            <h1 className="mb-2 text-2xl font-semibold">Choose a new password</h1>
            <p className="mb-6 text-sm text-gray-600">
                Your reset link is single-use and expires after four hours.
            </p>
            <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                    <label className="block text-sm font-medium" htmlFor="password">New password</label>
                    <input
                        id="password"
                        name="password"
                        type="password"
                        autoComplete="new-password"
                        value={password}
                        onChange={(event) => setPassword(event.target.value)}
                        className="mt-1 block w-full rounded-md border px-3 py-2"
                        required
                    />
                </div>
                <div>
                    <label className="block text-sm font-medium" htmlFor="confirmPassword">
                        Confirm new password
                    </label>
                    <input
                        id="confirmPassword"
                        name="confirmPassword"
                        type="password"
                        autoComplete="new-password"
                        value={confirmPassword}
                        onChange={(event) => setConfirmPassword(event.target.value)}
                        className="mt-1 block w-full rounded-md border px-3 py-2"
                        required
                    />
                </div>
                <button
                    type="submit"
                    disabled={submitting}
                    className="w-full rounded-md bg-blue-700 px-4 py-2 font-medium text-white hover:bg-blue-800 disabled:cursor-not-allowed disabled:opacity-60"
                >
                    {submitting ? "Updating…" : "Reset password"}
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

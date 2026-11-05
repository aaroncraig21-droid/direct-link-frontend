"use client";

import { FormEvent, useState } from "react";
import Link from "next/link";

import { apiPost } from "@/lib/api";

export default function SignupPage() {
    const [username, setUsername] = useState("");
    const [email, setEmail] = useState("");
    const [zipCode, setZipCode] = useState("");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [error, setError] = useState<string | null>(null);
    const [created, setCreated] = useState(false);
    const [submitting, setSubmitting] = useState(false);

    const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        setError(null);
        if (!/^\d{5}$/.test(zipCode)) {
            setError("Enter a 5-digit ZIP code.");
            return;
        }
        if (password !== confirmPassword) {
            setError("The passwords do not match.");
            return;
        }
        setSubmitting(true);
        try {
            await apiPost<{ status: string }>("/auth/register", {
                username: username.trim(),
                email: email.trim(),
                password,
                zip_code: zipCode,
            });
            setCreated(true);
        } catch (err) {
            setError(err instanceof Error ? err.message : "Unable to create your account.");
        } finally {
            setSubmitting(false);
        }
    };

    if (created) {
        return (
            <section className="mx-auto my-12 max-w-md rounded-xl border bg-white p-8 shadow-sm">
                <h1 className="mb-2 text-2xl font-semibold">Check your email</h1>
                <p className="text-sm text-gray-600">
                    Your account was created. Open the verification link sent to {email.trim()} before signing in.
                </p>
                <p className="mt-6 text-sm text-gray-600">
                    <Link href="/login" className="font-medium text-blue-700 hover:underline">Go to sign in</Link>
                </p>
            </section>
        );
    }

    return (
        <section className="mx-auto my-12 max-w-md rounded-xl border bg-white p-8 shadow-sm">
            <h1 className="mb-2 text-2xl font-semibold">Create your account</h1>
            <p className="mb-6 text-sm text-gray-600">
                Your ZIP code is saved with your account. District matching will be added separately.
            </p>
            <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                    <label className="block text-sm font-medium" htmlFor="username">Username</label>
                    <input id="username" name="username" autoComplete="username" value={username}
                        onChange={(event) => setUsername(event.target.value)}
                        className="mt-1 block w-full rounded-md border px-3 py-2" required minLength={3} maxLength={30} />
                </div>
                <div>
                    <label className="block text-sm font-medium" htmlFor="email">Email</label>
                    <input id="email" name="email" type="email" autoComplete="email" value={email}
                        onChange={(event) => setEmail(event.target.value)}
                        className="mt-1 block w-full rounded-md border px-3 py-2" required />
                </div>
                <div>
                    <label className="block text-sm font-medium" htmlFor="zipCode">ZIP code</label>
                    <input id="zipCode" name="zipCode" type="text" inputMode="numeric" autoComplete="postal-code"
                        pattern="\d{5}" maxLength={5} value={zipCode}
                        onChange={(event) => setZipCode(event.target.value.replace(/\D/g, "").slice(0, 5))}
                        className="mt-1 block w-full rounded-md border px-3 py-2" required />
                </div>
                <div>
                    <label className="block text-sm font-medium" htmlFor="password">Password</label>
                    <input id="password" name="password" type="password" autoComplete="new-password" value={password}
                        onChange={(event) => setPassword(event.target.value)}
                        className="mt-1 block w-full rounded-md border px-3 py-2" required />
                </div>
                <div>
                    <label className="block text-sm font-medium" htmlFor="confirmPassword">Confirm password</label>
                    <input id="confirmPassword" name="confirmPassword" type="password" autoComplete="new-password" value={confirmPassword}
                        onChange={(event) => setConfirmPassword(event.target.value)}
                        className="mt-1 block w-full rounded-md border px-3 py-2" required />
                </div>
                <button type="submit" disabled={submitting}
                    className="w-full rounded-md bg-blue-700 px-4 py-2 font-medium text-white hover:bg-blue-800 disabled:cursor-not-allowed disabled:opacity-60">
                    {submitting ? "Creating account…" : "Create account"}
                </button>
            </form>
            {error && <p role="alert" className="mt-4 rounded-md bg-red-50 p-3 text-sm text-red-800">{error}</p>}
            <p className="mt-6 text-sm text-gray-600">
                Already registered? <Link href="/login" className="font-medium text-blue-700 hover:underline">Sign in</Link>
            </p>
        </section>
    );
}

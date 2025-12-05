"use client";

import { FormEvent, useState } from "react";

import { apiPost, setAuthToken } from "@/lib/api";

interface LoginResponseUser {
    id?: string;
    name?: string;
    fullName?: string;
    firstName?: string;
    lastName?: string;
    first_name?: string;
    last_name?: string;
}

interface LoginResponse {
    token?: string;
    user?: LoginResponseUser;
}

function buildUserName(user?: LoginResponseUser) {
    if (!user) return "";

    if (user.name) return user.name;
    if (user.fullName) return user.fullName;

    const first = user.firstName ?? user.first_name ?? "";
    const last = user.lastName ?? user.last_name ?? "";

    return `${first} ${last}`.trim();
}

export default function LoginPage() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [status, setStatus] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);

    const handleSubmit = async (event: FormEvent) => {
        event.preventDefault();
        setError(null);
        setStatus("Logging in...");

        try {
            const response = await apiPost<LoginResponse>("/users/login", {
                email,
                password,
            });

            if (response.token) {
                setAuthToken(response.token);
            }

            const userName = buildUserName(response.user);
            const statusMessage = response.token
                ? `Login successful${userName ? ` for ${userName}` : ""}.`
                : "Logged in, but no token was returned.";

            setStatus(statusMessage);
        } catch (err) {
            const message = err instanceof Error ? err.message : "Login failed";
            setError(message);
            setStatus(null);
        }
    };

    return (
        <div className="max-w-md mx-auto p-8 bg-white rounded shadow">
            <h1 className="text-2xl font-semibold mb-4">Login</h1>
            <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                    <label className="block text-sm font-medium text-gray-700" htmlFor="email">
                        Email
                    </label>
                    <input
                        id="email"
                        type="email"
                        value={email}
                        onChange={(event) => setEmail(event.target.value)}
                        className="mt-1 block w-full rounded border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                        required
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700" htmlFor="password">
                        Password
                    </label>
                    <input
                        id="password"
                        type="password"
                        value={password}
                        onChange={(event) => setPassword(event.target.value)}
                        className="mt-1 block w-full rounded border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                        required
                    />
                </div>

                <button
                    type="submit"
                    className="w-full bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700 transition"
                >
                    Sign In
                </button>
            </form>

            {status && (
                <p className="mt-4 text-green-700 bg-green-100 p-3 rounded border border-green-200">{status}</p>
            )}
            {error && (
                <p className="mt-4 text-red-700 bg-red-100 p-3 rounded border border-red-200">{error}</p>
            )}
        </div>
    );
}

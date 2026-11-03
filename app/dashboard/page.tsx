"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

import { apiGet } from "@/lib/api";

interface OverviewResponse {
    user: {
        email: string;
        role: string;
        zip_code?: string | null;
    };
    inbox_preview: Array<{
        subject: string;
        from: string;
        created_at: string;
    }>;
}

function formatRole(role: string) {
    if (role === "citizen") return "constituent";
    if (role === "rep") return "representative";
    return role;
}

export default function DashboardOverview() {
    const [overview, setOverview] = useState<OverviewResponse | null>(null);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        let active = true;

        apiGet<OverviewResponse>("/mobile/overview")
            .then((data) => {
                if (active) setOverview(data);
            })
            .catch((err: unknown) => {
                if (active) {
                    setError(err instanceof Error ? err.message : "Unable to load your dashboard.");
                }
            });

        return () => {
            active = false;
        };
    }, []);

    if (error) {
        return (
            <section className="rounded-xl border border-red-200 bg-white p-6" role="alert">
                <h1 className="text-xl font-semibold text-red-900">Dashboard unavailable</h1>
                <p className="mt-2 text-sm text-red-800">{error}</p>
                <button
                    type="button"
                    onClick={() => window.location.reload()}
                    className="mt-4 rounded-md border px-4 py-2 text-sm font-medium hover:bg-gray-50"
                >
                    Try again
                </button>
            </section>
        );
    }

    if (!overview) {
        return <p className="p-2 text-sm text-gray-600" role="status">Loading your dashboard…</p>;
    }

    return (
        <div className="mx-auto max-w-5xl space-y-6">
            <header>
                <p className="text-sm font-semibold uppercase tracking-wide text-blue-700">
                    Constituent dashboard
                </p>
                <h1 className="mt-2 text-3xl font-bold text-gray-950">Welcome back</h1>
                <p className="mt-2 text-gray-600">
                    Signed in as {overview.user.email}
                </p>
            </header>

            <section>
                <article className="rounded-xl border bg-white p-6 shadow-sm">
                    <h2 className="font-semibold text-gray-900">Your account</h2>
                    <p className="mt-2 text-sm text-gray-600">
                        {overview.user.zip_code
                            ? `ZIP code ${overview.user.zip_code} · ${formatRole(overview.user.role)}`
                            : `No ZIP code on file · ${formatRole(overview.user.role)}`}
                    </p>
                    <Link href="/dashboard/profile" className="mt-4 inline-block text-sm font-medium text-blue-700 hover:underline">
                        Manage your profile
                    </Link>
                </article>
            </section>

            <section className="rounded-xl border bg-white p-6 shadow-sm">
                <div className="flex flex-wrap items-center justify-between gap-3">
                    <div>
                        <h2 className="font-semibold text-gray-900">Your inbox</h2>
                        <p className="mt-1 text-sm text-gray-600">Recent messages and account updates.</p>
                    </div>
                    <Link href="/dashboard/notifications" className="text-sm font-medium text-blue-700 hover:underline">
                        View notifications
                    </Link>
                </div>
                {overview.inbox_preview.length > 0 ? (
                    <ul className="mt-4 divide-y">
                        {overview.inbox_preview.map((message, index) => (
                            <li key={`${message.created_at}-${index}`} className="py-3">
                                <p className="font-medium text-gray-900">{message.subject || "Message"}</p>
                                <p className="mt-1 text-sm text-gray-600">From {message.from}</p>
                            </li>
                        ))}
                    </ul>
                ) : (
                    <p className="mt-4 rounded-md bg-gray-50 p-4 text-sm text-gray-600">
                        Your inbox is empty for now.
                    </p>
                )}
            </section>
        </div>
    );
}

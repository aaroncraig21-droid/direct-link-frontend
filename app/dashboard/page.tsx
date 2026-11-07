"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

import { apiGet } from "@/lib/api";

interface Account {
    email: string;
    role: string;
    zip_code?: string | null;
}

function formatRole(role: string) {
    if (role === "citizen") return "constituent";
    if (role === "rep") return "representative";
    return role;
}

export default function DashboardOverview() {
    const [user, setUser] = useState<Account | null>(null);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        let active = true;
        apiGet<Account>("/me")
            .then((data) => { if (active) setUser(data); })
            .catch((err: unknown) => {
                if (active) setError(err instanceof Error ? err.message : "Unable to load your dashboard.");
            });
        return () => { active = false; };
    }, []);

    if (error) {
        return (
            <section className="rounded-xl border border-red-200 bg-white p-6" role="alert">
                <h1 className="text-xl font-semibold text-red-900">Dashboard unavailable</h1>
                <p className="mt-2 text-sm text-red-800">{error}</p>
            </section>
        );
    }
    if (!user) return <p className="p-2 text-sm text-gray-600" role="status">Loading your dashboard…</p>;

    return (
        <div className="mx-auto max-w-5xl space-y-6">
            <header>
                <p className="text-sm font-semibold uppercase tracking-wide text-blue-700">Direct Link</p>
                <h1 className="mt-2 text-3xl font-bold text-gray-950">Welcome back</h1>
                <p className="mt-2 text-gray-600">Signed in as {user.email}</p>
            </header>
            <section className="rounded-xl border bg-white p-6 shadow-sm">
                <h2 className="font-semibold text-gray-900">Your account</h2>
                <p className="mt-2 text-sm text-gray-600">
                    {user.zip_code ? `ZIP code ${user.zip_code} · ${formatRole(user.role)}` : `No ZIP code on file · ${formatRole(user.role)}`}
                </p>
                <Link href="/dashboard/profile" className="mt-4 inline-block text-sm font-medium text-blue-700 hover:underline">
                    Manage your profile
                </Link>
            </section>
        </div>
    );
}

"use client";

import { FormEvent, useEffect, useState } from "react";

import { apiGet, apiPatch } from "@/lib/api";

interface ProfileResponse {
    email: string;
    role: string;
    zip_code?: string | null;
}

function formatRole(role?: string | null) {
    if (role === "citizen") return "Constituent";
    if (role === "rep") return "Representative";
    return role ?? "Unknown";
}

export default function ProfilePage() {
    const [profile, setProfile] = useState<ProfileResponse | null>(null);
    const [zipCode, setZipCode] = useState("");
    const [error, setError] = useState<string | null>(null);
    const [status, setStatus] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        let active = true;

        apiGet<ProfileResponse>("/me")
            .then((data) => {
                if (active) {
                    setProfile(data);
                    setZipCode(data.zip_code ?? "");
                }
            })
            .catch((err: unknown) => {
                if (active) {
                    setError(err instanceof Error ? err.message : "Unable to load your profile.");
                }
            })
            .finally(() => {
                if (active) setLoading(false);
            });

        return () => {
            active = false;
        };
    }, []);

    const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        setError(null);
        setStatus(null);

        if (!/^\d{5}$/.test(zipCode)) {
            setError("Enter a 5-digit ZIP code.");
            return;
        }

        setSaving(true);
        try {
            const updated = await apiPatch<ProfileResponse>("/me", { zip_code: zipCode });
            setProfile((current) => current ? { ...current, ...updated } : updated);
            setStatus("Your ZIP code was updated.");
        } catch (err) {
            setError(err instanceof Error ? err.message : "Unable to save your ZIP code.");
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return <p className="p-2 text-sm text-gray-600" role="status">Loading your profile…</p>;
    }

    if (error && !profile) {
        return <p className="rounded-md bg-red-50 p-4 text-sm text-red-800" role="alert">{error}</p>;
    }

    return (
        <div className="mx-auto max-w-3xl space-y-6">
            <header>
                <h1 className="text-3xl font-bold text-gray-950">Your profile</h1>
                <p className="mt-2 text-gray-600">Manage the location used to find your district.</p>
            </header>

            <section className="rounded-xl border bg-white p-6 shadow-sm">
                <dl className="grid gap-4 sm:grid-cols-2">
                    <div>
                        <dt className="text-sm font-medium text-gray-500">Email</dt>
                        <dd className="mt-1 text-gray-900">{profile?.email}</dd>
                    </div>
                    <div>
                        <dt className="text-sm font-medium text-gray-500">Account type</dt>
                        <dd className="mt-1 text-gray-900">{formatRole(profile?.role)}</dd>
                    </div>
                </dl>

                <form onSubmit={handleSubmit} className="mt-6 max-w-sm space-y-3">
                    <div>
                        <label className="block text-sm font-medium text-gray-800" htmlFor="zipCode">
                            ZIP code
                        </label>
                        <input
                            id="zipCode"
                            name="zipCode"
                            type="text"
                            inputMode="numeric"
                            autoComplete="postal-code"
                            pattern="\d{5}"
                            maxLength={5}
                            value={zipCode}
                            onChange={(event) => setZipCode(event.target.value.replace(/\D/g, "").slice(0, 5))}
                            className="mt-1 block w-full rounded-md border px-3 py-2"
                            required
                            aria-describedby="zip-help"
                        />
                        <p id="zip-help" className="mt-1 text-xs text-gray-500">
                            Used to connect you with the officials who represent your district.
                        </p>
                    </div>
                    <button
                        type="submit"
                        disabled={saving}
                        className="rounded-md bg-blue-700 px-4 py-2 text-sm font-medium text-white hover:bg-blue-800 disabled:cursor-not-allowed disabled:opacity-60"
                    >
                        {saving ? "Saving…" : "Save ZIP code"}
                    </button>
                </form>

                {error && <p role="alert" className="mt-4 text-sm text-red-800">{error}</p>}
                {status && <p role="status" className="mt-4 text-sm text-green-800">{status}</p>}
            </section>
        </div>
    );
}

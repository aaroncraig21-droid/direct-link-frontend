"use client";

import { FormEvent, useEffect, useState } from "react";

import { apiGet, apiPatch } from "@/lib/api";

interface Profile {
    username: string;
    email: string;
    role: string;
    name?: string | null;
    zip_code?: string | null;
}
interface ProfileUpdateResponse { user: Profile }

function formatRole(role?: string | null) {
    if (role === "constituent" || role === "citizen") return "Constituent";
    if (role === "representative" || role === "rep") return "Representative";
    return role ?? "Unknown";
}

export default function ProfilePage() {
    const [profile, setProfile] = useState<Profile | null>(null);
    const [name, setName] = useState("");
    const [error, setError] = useState<string | null>(null);
    const [status, setStatus] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        let active = true;
        apiGet<Profile>("/me")
            .then((data) => {
                if (active) {
                    setProfile(data);
                    setName(data.name ?? "");
                }
            })
            .catch((err: unknown) => {
                if (active) setError(err instanceof Error ? err.message : "Unable to load your profile.");
            })
            .finally(() => { if (active) setLoading(false); });
        return () => { active = false; };
    }, []);

    const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        setError(null);
        setStatus(null);
        setSaving(true);
        try {
            const response = await apiPatch<ProfileUpdateResponse>("/me", { name: name.trim() });
            setProfile(response.user);
            setName(response.user.name ?? "");
            setStatus("Your profile was updated.");
        } catch (err) {
            setError(err instanceof Error ? err.message : "Unable to save your profile.");
        } finally {
            setSaving(false);
        }
    };

    if (loading) return <p className="p-2 text-sm text-gray-600" role="status">Loading your profile…</p>;
    if (error && !profile) return <p className="rounded-md bg-red-50 p-4 text-sm text-red-800" role="alert">{error}</p>;

    return (
        <div className="mx-auto max-w-3xl space-y-6">
            <header>
                <h1 className="text-3xl font-bold text-gray-950">Your profile</h1>
                <p className="mt-2 text-gray-600">Update the name shown on your account.</p>
            </header>
            <section className="rounded-xl border bg-white p-6 shadow-sm">
                <dl className="grid gap-4 sm:grid-cols-2">
                    <div><dt className="text-sm font-medium text-gray-500">Email</dt><dd className="mt-1 text-gray-900">{profile?.email}</dd></div>
                    <div><dt className="text-sm font-medium text-gray-500">Account type</dt><dd className="mt-1 text-gray-900">{formatRole(profile?.role)}</dd></div>
                    <div><dt className="text-sm font-medium text-gray-500">ZIP code</dt><dd className="mt-1 text-gray-900">{profile?.zip_code || "Not provided"}</dd></div>
                </dl>
                {profile?.role === "constituent" ? (
                    <form onSubmit={(event) => void handleSubmit(event)} className="mt-6 max-w-sm space-y-3">
                        <div>
                            <label className="block text-sm font-medium text-gray-800" htmlFor="name">Display name</label>
                            <input id="name" name="name" autoComplete="name" value={name}
                                onChange={(event) => setName(event.target.value)} maxLength={120}
                                className="mt-1 block w-full rounded-md border px-3 py-2" />
                        </div>
                        <button type="submit" disabled={saving}
                            className="rounded-md bg-blue-700 px-4 py-2 text-sm font-medium text-white hover:bg-blue-800 disabled:cursor-not-allowed disabled:opacity-60">
                            {saving ? "Saving…" : "Save name"}
                        </button>
                    </form>
                ) : (
                    <p className="mt-6 text-sm text-gray-600">Representative profile editing is not available yet.</p>
                )}
                {error && <p role="alert" className="mt-4 text-sm text-red-800">{error}</p>}
                {status && <p role="status" className="mt-4 text-sm text-green-800">{status}</p>}
            </section>
        </div>
    );
}

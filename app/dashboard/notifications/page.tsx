"use client";

import { useEffect, useState } from "react";

import { apiDelete, apiGet, apiPost } from "@/lib/api";

const PUSH_ENDPOINT = "/notifications/push-subscription";
const VAPID_PUBLIC_KEY = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY ?? "";

function decodeVapidKey(value: string): Uint8Array {
    const padding = "=".repeat((4 - value.length % 4) % 4);
    const base64 = (value + padding).replace(/-/g, "+").replace(/_/g, "/");
    const raw = window.atob(base64);
    return Uint8Array.from(raw, (character) => character.charCodeAt(0));
}

interface PushStatus {
    subscribed: boolean;
}

export default function NotificationsPage() {
    const [subscribed, setSubscribed] = useState(false);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [status, setStatus] = useState<string | null>(null);
    const supported = typeof window !== "undefined"
        && "serviceWorker" in navigator
        && "PushManager" in window
        && "Notification" in window;

    useEffect(() => {
        let active = true;
        apiGet<PushStatus>(PUSH_ENDPOINT)
            .then((result) => { if (active) setSubscribed(result.subscribed); })
            .catch((err: unknown) => {
                if (active) setError(err instanceof Error ? err.message : "Unable to load notification settings.");
            })
            .finally(() => { if (active) setLoading(false); });
        return () => { active = false; };
    }, []);

    const changeSubscription = async () => {
        setError(null);
        setStatus(null);
        setSaving(true);
        try {
            const registration = await navigator.serviceWorker.register("/sw.js");
            const existing = await registration.pushManager.getSubscription();
            if (subscribed) {
                if (existing) {
                    await apiDelete(PUSH_ENDPOINT, { endpoint: existing.endpoint });
                    await existing.unsubscribe();
                }
                setSubscribed(false);
                setStatus("Push alerts are turned off for this device.");
                return;
            }
            if (!VAPID_PUBLIC_KEY) throw new Error("Push alerts are not configured for this deployment yet.");
            const permission = Notification.permission === "granted"
                ? "granted"
                : await Notification.requestPermission();
            if (permission !== "granted") throw new Error("Allow notifications in your browser to turn on push alerts.");
            const subscription = existing ?? await registration.pushManager.subscribe({
                userVisibleOnly: true,
                applicationServerKey: decodeVapidKey(VAPID_PUBLIC_KEY) as BufferSource,
            });
            await apiPost(PUSH_ENDPOINT, { subscription: subscription.toJSON() });
            setSubscribed(true);
            setStatus("Push alerts are enabled for this device.");
        } catch (err) {
            setError(err instanceof Error ? err.message : "Unable to update push alert settings.");
        } finally {
            setSaving(false);
        }
    };

    return (
        <div className="mx-auto max-w-3xl space-y-6">
            <header>
                <h1 className="text-3xl font-bold text-gray-950">Notification settings</h1>
                <p className="mt-2 text-gray-600">
                    Choose whether this device can receive high priority federal civic alerts.
                </p>
            </header>
            <section className="rounded-xl border bg-white p-6 shadow-sm">
                <h2 className="text-xl font-semibold text-gray-900">Browser push alerts</h2>
                <p className="mt-2 text-gray-600">
                    Alerts are intended for time sensitive public actions. Your browser may ask you to allow notifications.
                    You can turn them off here or in your browser settings.
                </p>
                {!supported && (
                    <p className="mt-4 text-sm text-amber-800" role="status">
                        This browser does not support web push notifications.
                    </p>
                )}
                {error && <p className="mt-4 text-sm text-red-800" role="alert">{error}</p>}
                {status && <p className="mt-4 text-sm text-green-800" role="status">{status}</p>}
                <button
                    type="button"
                    onClick={() => void changeSubscription()}
                    disabled={!supported || loading || saving}
                    className="mt-5 rounded-md bg-blue-700 px-4 py-2 font-medium text-white hover:bg-blue-800 disabled:cursor-not-allowed disabled:opacity-60"
                >
                    {loading ? "Loading…" : saving ? "Saving…" : subscribed ? "Turn off push alerts" : "Turn on push alerts"}
                </button>
                <p className="mt-4 text-sm text-gray-500">
                    {subscribed ? "This browser is subscribed." : "This browser is not subscribed."}
                </p>
            </section>
        </div>
    );
}

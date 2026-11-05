"use client";

import { useEffect, useState } from "react";

import { apiGet, apiPost } from "@/lib/api";

type Position = "support" | "oppose" | "neutral";
type VoteChoice = "YAY" | "NAY" | "UNDECIDED";

interface Bill {
    id: number;
    external_id: string;
    title: string;
    summary: string | null;
    status: string | null;
    introduced_at?: string | null;
}
interface BillFeedResponse { items: Bill[] }
interface UserResponse { role: string }
interface Sentiment {
    bill_external_id: string;
    total_responses: number;
    support: number;
    oppose: number;
    neutral: number;
}
const choices: Array<{ value: Position; label: string }> = [
    { value: "support", label: "Support" },
    { value: "oppose", label: "Oppose" },
    { value: "neutral", label: "Undecided" },
];
const voteFor: Record<Position, VoteChoice> = {
    support: "YAY",
    oppose: "NAY",
    neutral: "UNDECIDED",
};
function formatDate(value?: string | null) {
    if (!value) return null;
    const date = new Date(value);
    return Number.isNaN(date.getTime()) ? null : date.toLocaleDateString();
}

export default function BillsPage() {
    const [bills, setBills] = useState<Bill[]>([]);
    const [role, setRole] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [expanded, setExpanded] = useState<string | null>(null);
    const [sentiment, setSentiment] = useState<Record<string, Sentiment>>({});
    const [mine, setMine] = useState<Record<string, Position>>({});
    const [selected, setSelected] = useState<Record<string, Position | undefined>>({});
    const [saving, setSaving] = useState<string | null>(null);
    const [messages, setMessages] = useState<Record<string, string>>({});

    useEffect(() => {
        let active = true;
        Promise.all([apiGet<BillFeedResponse>("/bills?limit=20"), apiGet<UserResponse>("/me")])
            .then(([feed, user]) => {
                if (active) { setBills(feed.items); setRole(user.role); }
            })
            .catch((err: unknown) => {
                if (active) setError(err instanceof Error ? err.message : "Unable to load bills.");
            })
            .finally(() => { if (active) setLoading(false); });
        return () => { active = false; };
    }, []);

    const loadSentiment = async (bill: Bill) => {
        const data = await apiGet<Sentiment>(`/bills/${encodeURIComponent(bill.external_id)}/positions`);
        setSentiment((current) => ({ ...current, [bill.external_id]: data }));
    };
    const toggle = async (bill: Bill) => {
        if (expanded === bill.external_id) { setExpanded(null); return; }
        setExpanded(bill.external_id);
        if (sentiment[bill.external_id]) return;
        try { await loadSentiment(bill); }
        catch (err) {
            setMessages((current) => ({ ...current, [bill.external_id]: err instanceof Error ? err.message : "Unable to load positions." }));
        }
    };
    const submitVote = async (bill: Bill) => {
        const position = selected[bill.external_id];
        if (!position) return;
        setSaving(bill.external_id);
        setMessages((current) => ({ ...current, [bill.external_id]: "" }));
        try {
            await apiPost(`/bills/${encodeURIComponent(bill.external_id)}/votes`, { choice: voteFor[position] });
            setMine((current) => ({ ...current, [bill.external_id]: position }));
            await loadSentiment(bill);
            setMessages((current) => ({ ...current, [bill.external_id]: "Your position was saved." }));
        } catch (err) {
            setMessages((current) => ({ ...current, [bill.external_id]: err instanceof Error ? err.message : "Unable to save your position." }));
        } finally { setSaving(null); }
    };

    if (loading) return <p className="p-2 text-sm text-gray-600" role="status">Loading bills…</p>;
    if (error) return <p className="rounded-md bg-red-50 p-4 text-sm text-red-800" role="alert">{error}</p>;

    return (
        <div className="mx-auto max-w-5xl space-y-6">
            <header>
                <p className="text-sm font-semibold uppercase tracking-wide text-blue-700">Legislation</p>
                <h1 className="mt-2 text-3xl font-bold text-gray-950">Bills</h1>
                <p className="mt-2 text-gray-600">Review legislation and share your position.</p>
            </header>
            {bills.length === 0 ? (
                <section className="rounded-xl border bg-white p-6 text-sm text-gray-600">No bills are available right now.</section>
            ) : (
                <ul className="space-y-4">
                    {bills.map((bill) => {
                        const id = bill.external_id;
                        const totals = sentiment[id];
                        const date = formatDate(bill.introduced_at);
                        return (
                            <li key={id} className="rounded-xl border bg-white p-5 shadow-sm sm:p-6">
                                <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">{id} · {bill.status || "Status unavailable"}</p>
                                <h2 className="mt-2 text-xl font-semibold text-gray-950">{bill.title}</h2>
                                {date && <p className="mt-1 text-xs text-gray-500">Introduced {date}</p>}
                                {bill.summary && <p className="mt-4 whitespace-pre-line text-sm leading-6 text-gray-700">{bill.summary}</p>}
                                <button type="button" onClick={() => void toggle(bill)} aria-expanded={expanded === id}
                                    className="mt-4 text-sm font-medium text-blue-700 hover:underline">
                                    {expanded === id ? "Hide positions" : "View positions and respond"}
                                </button>
                                {expanded === id && (
                                    <div className="mt-4 border-t pt-4">
                                        {messages[id] && !messages[id].includes("saved") && <p role="alert" className="mb-3 text-sm text-red-800">{messages[id]}</p>}
                                        {totals && (
                                            <section aria-label="Constituent positions" className="rounded-lg bg-gray-50 p-4">
                                                <h3 className="font-medium text-gray-900">Constituent positions</h3>
                                                <p className="mt-2 text-sm text-gray-700">
                                                    {totals.total_responses} responses · {totals.support} support · {totals.oppose} oppose · {totals.neutral} undecided
                                                </p>
                                            </section>
                                        )}
                                        {role === "constituent" ? (
                                            <div className="mt-4 space-y-3">
                                                <fieldset>
                                                    <legend className="text-sm font-medium text-gray-900">What is your position?</legend>
                                                    <div className="mt-2 flex flex-wrap gap-2">
                                                        {choices.map((choice) => (
                                                            <button key={choice.value} type="button" aria-pressed={selected[id] === choice.value}
                                                                onClick={() => setSelected((current) => ({ ...current, [id]: choice.value }))}
                                                                className={`rounded-md border px-3 py-2 text-sm font-medium ${selected[id] === choice.value ? "border-blue-700 bg-blue-50 text-blue-900" : "bg-white text-gray-700 hover:bg-gray-50"}`}>
                                                                {choice.label}
                                                            </button>
                                                        ))}
                                                    </div>
                                                </fieldset>
                                                <button type="button" disabled={!selected[id] || saving === id} onClick={() => void submitVote(bill)}
                                                    className="rounded-md bg-blue-700 px-4 py-2 text-sm font-medium text-white hover:bg-blue-800 disabled:cursor-not-allowed disabled:opacity-50">
                                                    {saving === id ? "Saving…" : mine[id] ? "Update my position" : "Save my position"}
                                                </button>
                                                {messages[id]?.includes("saved") && <p className="text-sm text-green-800" role="status">{messages[id]}</p>}
                                                {mine[id] && <p className="text-sm text-gray-600">Your position this session: {mine[id]}.</p>}
                                            </div>
                                        ) : <p className="mt-4 text-sm text-gray-600">Position responses are available to constituent accounts.</p>}
                                    </div>
                                )}
                            </li>
                        );
                    })}
                </ul>
            )}
        </div>
    );
}

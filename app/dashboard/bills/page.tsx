"use client";

import { FormEvent, useEffect, useState } from "react";

import { apiGet, apiPost } from "@/lib/api";

type Position = "support" | "oppose" | "neutral";

interface Bill {
    id: number;
    external_id: string;
    title: string;
    summary: string;
    status: string;
    introduced_at?: string | null;
}

interface BillFeedResponse {
    items: Bill[];
    pagination: {
        count: number;
        limit: number;
        offset: number;
    };
}

interface UserResponse {
    role: string;
}

interface BillPosition {
    bill_id: number;
    position: Position | null;
    comment?: string | null;
    updated_at?: string | null;
}

interface BillSentiment {
    bill_id: number;
    total_responses: number;
    support: number;
    oppose: number;
    neutral: number;
    support_pct: number;
    oppose_pct: number;
    neutral_pct: number;
}

const positionOptions: Array<{ value: Position; label: string }> = [
    { value: "support", label: "Support" },
    { value: "oppose", label: "Oppose" },
    { value: "neutral", label: "Undecided" },
];

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
    const [expandedBillId, setExpandedBillId] = useState<number | null>(null);
    const [contextLoadingId, setContextLoadingId] = useState<number | null>(null);
    const [contextErrors, setContextErrors] = useState<Record<number, string>>({});
    const [sentiment, setSentiment] = useState<Record<number, BillSentiment>>({});
    const [myPositions, setMyPositions] = useState<Record<number, BillPosition>>({});
    const [selectedPositions, setSelectedPositions] = useState<Record<number, Position | undefined>>({});
    const [comments, setComments] = useState<Record<number, string>>({});
    const [savingBillId, setSavingBillId] = useState<number | null>(null);
    const [saveMessages, setSaveMessages] = useState<Record<number, string>>({});

    useEffect(() => {
        let active = true;

        Promise.all([
            apiGet<BillFeedResponse>("/bills?limit=20"),
            apiGet<UserResponse>("/me"),
        ])
            .then(([feed, user]) => {
                if (!active) return;
                setBills(feed.items);
                setRole(user.role);
            })
            .catch((err: unknown) => {
                if (active) {
                    setError(err instanceof Error ? err.message : "Unable to load the bill feed.");
                }
            })
            .finally(() => {
                if (active) setLoading(false);
            });

        return () => {
            active = false;
        };
    }, []);

    const toggleContext = async (billId: number) => {
        if (expandedBillId === billId) {
            setExpandedBillId(null);
            return;
        }

        setExpandedBillId(billId);
        setContextErrors((current) => ({ ...current, [billId]: "" }));
        if (sentiment[billId] && myPositions[billId]) return;

        setContextLoadingId(billId);
        try {
            const [summary, ownPosition] = await Promise.all([
                apiGet<BillSentiment>(`/bills/${billId}/positions`),
                apiGet<BillPosition>(`/bills/${billId}/positions/mine`),
            ]);
            setSentiment((current) => ({ ...current, [billId]: summary }));
            setMyPositions((current) => ({ ...current, [billId]: ownPosition }));
            setSelectedPositions((current) => ({
                ...current,
                [billId]: current[billId] ?? ownPosition.position ?? undefined,
            }));
            setComments((current) => ({
                ...current,
                [billId]: current[billId] ?? ownPosition.comment ?? "",
            }));
        } catch (err) {
            setContextErrors((current) => ({
                ...current,
                [billId]: err instanceof Error ? err.message : "Unable to load bill positions.",
            }));
        } finally {
            setContextLoadingId(null);
        }
    };

    const savePosition = async (event: FormEvent<HTMLFormElement>, billId: number) => {
        event.preventDefault();
        const position = selectedPositions[billId];
        if (!position) {
            setSaveMessages((current) => ({ ...current, [billId]: "Choose a position before saving." }));
            return;
        }

        setSavingBillId(billId);
        setSaveMessages((current) => ({ ...current, [billId]: "" }));
        try {
            const saved = await apiPost<BillPosition>(`/bills/${billId}/positions`, {
                position,
                comment: comments[billId] ?? "",
            });
            setMyPositions((current) => ({ ...current, [billId]: saved }));
            setSaveMessages((current) => ({ ...current, [billId]: "Your position was saved." }));

            const updatedSentiment = await apiGet<BillSentiment>(`/bills/${billId}/positions`);
            setSentiment((current) => ({ ...current, [billId]: updatedSentiment }));
        } catch (err) {
            setSaveMessages((current) => ({
                ...current,
                [billId]: err instanceof Error ? err.message : "Unable to save your position.",
            }));
        } finally {
            setSavingBillId(null);
        }
    };

    if (loading) {
        return <p className="p-2 text-sm text-gray-600" role="status">Loading bills…</p>;
    }

    if (error) {
        return <p className="rounded-md bg-red-50 p-4 text-sm text-red-800" role="alert">{error}</p>;
    }

    return (
        <div className="mx-auto max-w-5xl space-y-6">
            <header>
                <p className="text-sm font-semibold uppercase tracking-wide text-blue-700">Legislation</p>
                <h1 className="mt-2 text-3xl font-bold text-gray-950">Bills</h1>
                <p className="mt-2 text-gray-600">Review legislation and share your position.</p>
            </header>

            {bills.length === 0 ? (
                <section className="rounded-xl border bg-white p-6 text-sm text-gray-600">
                    No bills are available right now.
                </section>
            ) : (
                <ul className="space-y-4">
                    {bills.map((bill) => {
                        const isExpanded = expandedBillId === bill.id;
                        const ownPosition = myPositions[bill.id];
                        const totals = sentiment[bill.id];
                        const introduced = formatDate(bill.introduced_at);

                        return (
                            <li key={bill.id} className="rounded-xl border bg-white p-5 shadow-sm sm:p-6">
                                <div className="flex flex-wrap items-start justify-between gap-3">
                                    <div className="min-w-0 flex-1">
                                        <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">
                                            {bill.external_id || "Bill"} · {bill.status || "Status unavailable"}
                                        </p>
                                        <h2 className="mt-2 text-xl font-semibold text-gray-950">{bill.title}</h2>
                                        {introduced && <p className="mt-1 text-xs text-gray-500">Introduced {introduced}</p>}
                                    </div>
                                    {ownPosition?.position && (
                                        <span className="rounded-full bg-blue-50 px-3 py-1 text-xs font-medium capitalize text-blue-800">
                                            Your position: {ownPosition.position}
                                        </span>
                                    )}
                                </div>

                                {bill.summary && <p className="mt-4 whitespace-pre-line text-sm leading-6 text-gray-700">{bill.summary}</p>}

                                <button
                                    type="button"
                                    onClick={() => void toggleContext(bill.id)}
                                    aria-expanded={isExpanded}
                                    className="mt-4 text-sm font-medium text-blue-700 hover:underline"
                                >
                                    {isExpanded ? "Hide positions" : "View positions and respond"}
                                </button>

                                {isExpanded && (
                                    <div className="mt-4 border-t pt-4">
                                        {contextLoadingId === bill.id ? (
                                            <p className="text-sm text-gray-600" role="status">Loading positions…</p>
                                        ) : contextErrors[bill.id] ? (
                                            <p className="text-sm text-red-800" role="alert">{contextErrors[bill.id]}</p>
                                        ) : (
                                            <>
                                                {totals && (
                                                    <section aria-label="Constituent positions" className="rounded-lg bg-gray-50 p-4">
                                                        <h3 className="font-medium text-gray-900">Constituent positions</h3>
                                                        <p className="mt-2 text-sm text-gray-700">
                                                            {totals.total_responses} responses · {totals.support} support · {totals.oppose} oppose · {totals.neutral} undecided
                                                        </p>
                                                    </section>
                                                )}

                                                {role === "citizen" ? (
                                                    <form onSubmit={(event) => void savePosition(event, bill.id)} className="mt-4 space-y-3">
                                                        <fieldset>
                                                            <legend className="text-sm font-medium text-gray-900">What is your position?</legend>
                                                            <div className="mt-2 flex flex-wrap gap-2">
                                                                {positionOptions.map((option) => (
                                                                    <button
                                                                        key={option.value}
                                                                        type="button"
                                                                        aria-pressed={selectedPositions[bill.id] === option.value}
                                                                        onClick={() => setSelectedPositions((current) => ({ ...current, [bill.id]: option.value }))}
                                                                        className={`rounded-md border px-3 py-2 text-sm font-medium ${selectedPositions[bill.id] === option.value ? "border-blue-700 bg-blue-50 text-blue-900" : "bg-white text-gray-700 hover:bg-gray-50"}`}
                                                                    >
                                                                        {option.label}
                                                                    </button>
                                                                ))}
                                                            </div>
                                                        </fieldset>

                                                        <div>
                                                            <label className="block text-sm font-medium text-gray-800" htmlFor={`comment-${bill.id}`}>
                                                                Optional comment
                                                            </label>
                                                            <textarea
                                                                id={`comment-${bill.id}`}
                                                                value={comments[bill.id] ?? ""}
                                                                onChange={(event) => setComments((current) => ({ ...current, [bill.id]: event.target.value }))}
                                                                maxLength={2000}
                                                                rows={3}
                                                                className="mt-1 block w-full rounded-md border px-3 py-2 text-sm"
                                                            />
                                                        </div>

                                                        <button
                                                            type="submit"
                                                            disabled={!selectedPositions[bill.id] || savingBillId === bill.id}
                                                            className="rounded-md bg-blue-700 px-4 py-2 text-sm font-medium text-white hover:bg-blue-800 disabled:cursor-not-allowed disabled:opacity-50"
                                                        >
                                                            {savingBillId === bill.id ? "Saving…" : ownPosition?.position ? "Update my position" : "Save my position"}
                                                        </button>
                                                        {saveMessages[bill.id] && (
                                                            <p className={`text-sm ${saveMessages[bill.id].includes("saved") ? "text-green-800" : "text-red-800"}`} role="status">
                                                                {saveMessages[bill.id]}
                                                            </p>
                                                        )}
                                                    </form>
                                                ) : (
                                                    <p className="mt-4 text-sm text-gray-600">
                                                        Position responses are available to constituent accounts.
                                                    </p>
                                                )}
                                            </>
                                        )}
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

"use client";

import { FormEvent, useEffect, useState } from "react";

import { apiGet, apiPost } from "@/lib/api";

interface SurveyQuestion {
    id: string;
    question_text: string;
    question_type: string;
    options?: string[] | null;
}
interface Survey {
    id: string;
    title: string;
    description?: string | null;
    type?: string | null;
    bill_id?: string | null;
}
interface SurveyDetail { survey: Survey; questions: SurveyQuestion[] }
interface UserResponse { role: string }

export default function SurveysPage() {
    const [survey, setSurvey] = useState<SurveyDetail | null>(null);
    const [role, setRole] = useState<string | null>(null);
    const [answer, setAnswer] = useState("");
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [submitError, setSubmitError] = useState<string | null>(null);
    const [submitting, setSubmitting] = useState(false);
    const [submitted, setSubmitted] = useState(false);

    useEffect(() => {
        let active = true;
        Promise.all([apiGet<UserResponse>("/me"), apiGet<Survey[]>("/surveys/active")])
            .then(async ([user, activeSurveys]) => {
                if (!active) return;
                setRole(user.role);
                if (activeSurveys.length) {
                    const detail = await apiGet<SurveyDetail>(`/surveys/${encodeURIComponent(activeSurveys[0].id)}`);
                    if (active) setSurvey(detail);
                }
            })
            .catch((err: unknown) => {
                if (active) setError(err instanceof Error ? err.message : "Unable to load surveys.");
            })
            .finally(() => { if (active) setLoading(false); });
        return () => { active = false; };
    }, []);

    const question = survey?.questions[0];
    const submit = async (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        if (!survey || !question || !answer.trim()) return;
        setSubmitting(true);
        setSubmitError(null);
        try {
            await apiPost(`/surveys/${encodeURIComponent(survey.survey.id)}/responses`, {
                answers: [{ question_id: question.id, response: answer.trim() }],
            });
            setSubmitted(true);
        } catch (err) {
            setSubmitError(err instanceof Error ? err.message : "Unable to submit your response.");
        } finally { setSubmitting(false); }
    };

    if (loading) return <p className="p-2 text-sm text-gray-600" role="status">Loading active survey…</p>;
    if (error) return <p className="rounded-md bg-red-50 p-4 text-sm text-red-800" role="alert">{error}</p>;
    if (!survey || !question) {
        return (
            <div className="mx-auto max-w-3xl space-y-6">
                <header><p className="text-sm font-semibold uppercase tracking-wide text-blue-700">Your voice</p><h1 className="mt-2 text-3xl font-bold text-gray-950">Surveys</h1></header>
                <section className="rounded-xl border bg-white p-6 text-sm text-gray-600 shadow-sm">There is no active survey question right now. Check back when a new survey opens.</section>
            </div>
        );
    }
    if (role !== "constituent") return <section className="rounded-xl border bg-white p-6 text-sm text-gray-700 shadow-sm">Survey responses are available to constituent accounts.</section>;
    const options = question.options ?? [];

    return (
        <div className="mx-auto max-w-3xl space-y-6">
            <header><p className="text-sm font-semibold uppercase tracking-wide text-blue-700">Your voice</p><h1 className="mt-2 text-3xl font-bold text-gray-950">Surveys</h1><p className="mt-2 text-gray-600">Share your perspective on current issues and legislation.</p></header>
            <section className="rounded-xl border bg-white p-6 shadow-sm sm:p-8">
                <h2 className="text-xl font-semibold text-gray-950">{survey.survey.title}</h2>
                {survey.survey.description && <p className="mt-2 text-sm leading-6 text-gray-600">{survey.survey.description}</p>}
                {submitted ? (
                    <div className="mt-6 rounded-lg bg-green-50 p-4 text-sm text-green-900" role="status">Thanks. Your response has been recorded.</div>
                ) : (
                    <form onSubmit={(event) => void submit(event)} className="mt-6 space-y-5">
                        <fieldset>
                            <legend className="text-base font-medium text-gray-900">{question.question_text}</legend>
                            {options.length ? (
                                <div className="mt-3 space-y-2">
                                    {options.map((option) => (
                                        <label key={option} className="flex cursor-pointer items-center gap-3 rounded-lg border p-3 hover:bg-gray-50">
                                            <input type="radio" name="survey-answer" value={option} checked={answer === option}
                                                onChange={(event) => setAnswer(event.target.value)} required />
                                            <span className="text-sm text-gray-800">{option}</span>
                                        </label>
                                    ))}
                                </div>
                            ) : (
                                <textarea id="survey-answer" value={answer} onChange={(event) => setAnswer(event.target.value)}
                                    rows={5} maxLength={4000} required className="mt-3 block w-full rounded-md border px-3 py-2 text-sm" aria-label="Your response" />
                            )}
                        </fieldset>
                        <button type="submit" disabled={submitting || !answer.trim()}
                            className="rounded-md bg-blue-700 px-5 py-2.5 text-sm font-medium text-white hover:bg-blue-800 disabled:cursor-not-allowed disabled:opacity-50">
                            {submitting ? "Submitting…" : "Submit response"}
                        </button>
                    </form>
                )}
                {submitError && <p className="mt-4 rounded-md bg-red-50 p-3 text-sm text-red-800" role="alert">{submitError}</p>}
            </section>
        </div>
    );
}

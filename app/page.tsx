"use client";

import { useState, Suspense } from "react";
import posthog from "posthog-js";
import { useVariant } from "./useVariant";
import { sessions, type ResearchSession } from "./data/mock";

function SentimentDot({ sentiment }: { sentiment: ResearchSession["sentiment"] }) {
  const colors = { positive: "bg-emerald-500", neutral: "bg-stone-400", negative: "bg-rose-500" };
  return <span className={`inline-block w-2 h-2 rounded-full ${colors[sentiment]}`} />;
}

function StatusBadge({ status }: { status: ResearchSession["status"] }) {
  const styles = {
    completed: "bg-emerald-50 text-emerald-700 ring-1 ring-emerald-600/20",
    in_review: "bg-blue-50 text-blue-700 ring-1 ring-blue-600/20",
    flagged: "bg-amber-50 text-amber-700 ring-1 ring-amber-600/20",
  };
  const labels = { completed: "Completed", in_review: "In review", flagged: "Flagged" };
  return <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${styles[status]}`}>{labels[status]}</span>;
}

function SessionCard({ s, onOpen, roomy = false }: { s: ResearchSession; onOpen: (s: ResearchSession) => void; roomy?: boolean }) {
  return (
    <button onClick={() => onOpen(s)} className={`w-full text-left bg-white hover:bg-stone-50 border border-stone-200 rounded-xl shadow-sm transition-colors ${roomy ? "px-5 py-5" : "px-4 py-3"}`}>
      <div className="flex items-center justify-between gap-3">
        <span className="font-medium text-stone-900 truncate">{s.participant}</span>
        <StatusBadge status={s.status} />
      </div>
      <div className="mt-1 flex items-center gap-3 text-xs text-stone-500">
        <SentimentDot sentiment={s.sentiment} />
        <span>{s.durationMin} min</span>
        <span>{s.timestamp.toLocaleDateString()}</span>
      </div>
      {s.summary && <p className={`mt-1.5 text-sm text-stone-600 ${roomy ? "" : "line-clamp-1"}`}>{s.summary}</p>}
    </button>
  );
}

function SessionTable({ data, onOpen }: { data: ResearchSession[]; onOpen: (s: ResearchSession) => void }) {
  return (
    <div className="border border-stone-200 rounded-xl overflow-hidden bg-white shadow-sm">
      {data.map((s) => (
        <button key={s.id} onClick={() => onOpen(s)} className="w-full text-left flex items-center gap-4 px-4 py-2.5 hover:bg-stone-50 border-b border-stone-100 last:border-b-0 transition-colors">
          <SentimentDot sentiment={s.sentiment} />
          <span className="font-medium text-stone-900 truncate flex-1">{s.participant}</span>
          <span className="text-xs text-stone-500 w-16 text-right">{s.durationMin} min</span>
          <span className="text-xs text-stone-500 w-20 text-right">{s.timestamp.toLocaleDateString()}</span>
          <StatusBadge status={s.status} />
        </button>
      ))}
    </div>
  );
}

function DetailPanel({ session, onClose }: { session: ResearchSession; onClose: () => void }) {
  const [loading, setLoading] = useState(false);
  const [synthesis, setSynthesis] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const analyze = async () => {
    setLoading(true);
    setError(null);
    posthog.capture("analysis_requested", { session_id: session.id, status: session.status });
    try {
      const res = await fetch("/api/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(session),
      });
      if (!res.ok) throw new Error("Request failed");
      const data = await res.json();
      setSynthesis(data.synthesis);
    } catch {
      setError("Analysis failed. Try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-stone-900/20 backdrop-blur-sm" onClick={onClose}>
      <div className="w-full max-w-md h-full bg-white border-l border-stone-200 p-6 overflow-y-auto" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-start justify-between gap-3">
          <h2 className="text-lg font-semibold text-stone-900">{session.participant}</h2>
          <button onClick={onClose} className="text-stone-400 hover:text-stone-600 text-sm">Close</button>
        </div>
        <div className="mt-2 flex items-center gap-3 text-xs text-stone-500">
          <SentimentDot sentiment={session.sentiment} />
          <span>{session.durationMin} min</span>
          <span>{session.timestamp.toLocaleDateString()}</span>
          <StatusBadge status={session.status} />
        </div>
        <p className="mt-4 text-sm text-stone-600">{session.summary || "No notes recorded for this session."}</p>

        <button onClick={analyze} disabled={loading} className="mt-6 w-full rounded-lg bg-stone-900 hover:bg-stone-800 disabled:opacity-50 px-4 py-2.5 text-sm font-medium text-white transition-colors">
          {loading ? "Analyzing…" : "Analyze with AI"}
        </button>

        {error && <p className="mt-4 text-sm text-rose-600">{error}</p>}
        {synthesis && (
          <div className="mt-4 rounded-lg bg-stone-50 border border-stone-200 p-4">
            <p className="text-xs uppercase tracking-wide text-stone-400 mb-2">AI Synthesis</p>
            <p className="text-sm text-stone-700 leading-relaxed whitespace-pre-wrap">{synthesis}</p>
          </div>
        )}
      </div>
    </div>
  );
}

function SessionList() {
  const { key, config } = useVariant();
  const [selected, setSelected] = useState<ResearchSession | null>(null);

  const openSession = (s: ResearchSession) => {
    posthog.capture("session_opened", { session_id: s.id, status: s.status });
    setSelected(s);
  };

  return (
    <div className="min-h-screen bg-stone-100 text-stone-900 font-sans">
      <div className="max-w-3xl mx-auto px-6 py-12">
        <span className="text-xs uppercase tracking-wide text-stone-400">Variant {key.toUpperCase()} · {config.name}</span>
        <h1 className="mt-2 text-2xl font-semibold tracking-tight text-stone-900">{config.headline}</h1>
        <p className="mt-1 text-sm text-stone-500">{sessions.length} research sessions from the last 14 days.</p>

        <div className="mt-8">
          {config.layout === "table" ? (
            <SessionTable data={sessions} onOpen={openSession} />
          ) : config.layout === "cards" ? (
            <div className="grid sm:grid-cols-2 gap-3">
              {sessions.map((s) => <SessionCard key={s.id} s={s} onOpen={openSession} roomy />)}
            </div>
          ) : (
            <div className="space-y-2">
              {sessions.map((s) => <SessionCard key={s.id} s={s} onOpen={openSession} />)}
            </div>
          )}
        </div>
      </div>

      {selected && <DetailPanel session={selected} onClose={() => setSelected(null)} />}
    </div>
  );
}

export default function Home() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-stone-100" />}>
      <SessionList />
    </Suspense>
  );
}
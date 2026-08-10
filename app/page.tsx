"use client";

import { useState } from "react";
import posthog from "posthog-js";
import { useVariant } from "./useVariant";
import { sessions, type ResearchSession } from "./data/mock";

function SentimentDot({ sentiment }: { sentiment: ResearchSession["sentiment"] }) {
  const colors = { positive: "bg-emerald-500", neutral: "bg-zinc-400", negative: "bg-red-500" };
  return <span className={`inline-block w-2 h-2 rounded-full ${colors[sentiment]}`} />;
}

function StatusBadge({ status }: { status: ResearchSession["status"] }) {
  const styles = {
    completed: "bg-emerald-950 text-emerald-300",
    in_review: "bg-blue-950 text-blue-300",
    flagged: "bg-amber-950 text-amber-300",
  };
  const labels = { completed: "Completed", in_review: "In review", flagged: "Flagged" };
  return <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${styles[status]}`}>{labels[status]}</span>;
}

function SessionCard({ s, onOpen, roomy = false }: { s: ResearchSession; onOpen: (s: ResearchSession) => void; roomy?: boolean }) {
  return (
    <button onClick={() => onOpen(s)} className={`w-full text-left bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 rounded-xl transition-colors ${roomy ? "px-5 py-5" : "px-4 py-3"}`}>
      <div className="flex items-center justify-between gap-3">
        <span className="font-medium truncate">{s.participant}</span>
        <StatusBadge status={s.status} />
      </div>
      <div className="mt-1 flex items-center gap-3 text-xs text-zinc-400">
        <SentimentDot sentiment={s.sentiment} />
        <span>{s.durationMin} min</span>
        <span>{s.timestamp.toLocaleDateString()}</span>
      </div>
      {s.summary && <p className={`mt-1.5 text-sm text-zinc-400 ${roomy ? "" : "line-clamp-1"}`}>{s.summary}</p>}
    </button>
  );
}

function SessionTable({ data, onOpen }: { data: ResearchSession[]; onOpen: (s: ResearchSession) => void }) {
  return (
    <div className="border border-zinc-800 rounded-xl overflow-hidden">
      {data.map((s) => (
        <button key={s.id} onClick={() => onOpen(s)} className="w-full text-left flex items-center gap-4 px-4 py-2 hover:bg-zinc-800 border-b border-zinc-800/60 last:border-b-0 transition-colors">
          <SentimentDot sentiment={s.sentiment} />
          <span className="font-medium truncate flex-1">{s.participant}</span>
          <span className="text-xs text-zinc-400 w-16 text-right">{s.durationMin} min</span>
          <span className="text-xs text-zinc-400 w-20 text-right">{s.timestamp.toLocaleDateString()}</span>
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
    <div className="fixed inset-0 z-50 flex justify-end bg-black/60" onClick={onClose}>
      <div className="w-full max-w-md h-full bg-zinc-950 border-l border-zinc-800 p-6 overflow-y-auto" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-start justify-between gap-3">
          <h2 className="text-lg font-semibold">{session.participant}</h2>
          <button onClick={onClose} className="text-zinc-500 hover:text-zinc-300 text-sm">Close</button>
        </div>
        <div className="mt-2 flex items-center gap-3 text-xs text-zinc-400">
          <SentimentDot sentiment={session.sentiment} />
          <span>{session.durationMin} min</span>
          <span>{session.timestamp.toLocaleDateString()}</span>
          <StatusBadge status={session.status} />
        </div>
        <p className="mt-4 text-sm text-zinc-300">{session.summary || "No notes recorded for this session."}</p>

        <button onClick={analyze} disabled={loading} className="mt-6 w-full rounded-lg bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 px-4 py-2 text-sm font-medium transition-colors">
          {loading ? "Analyzing…" : "Analyze with AI"}
        </button>

        {error && <p className="mt-4 text-sm text-red-400">{error}</p>}
        {synthesis && (
          <div className="mt-4 rounded-lg bg-zinc-900 border border-zinc-800 p-4">
            <p className="text-xs uppercase tracking-wide text-zinc-500 mb-2">AI Synthesis</p>
            <p className="text-sm text-zinc-200 leading-relaxed">{synthesis}</p>
          </div>
        )}
      </div>
    </div>
  );
}

export default function Home() {
  const { key, config } = useVariant();
  const [selected, setSelected] = useState<ResearchSession | null>(null);

  const openSession = (s: ResearchSession) => {
    posthog.capture("session_opened", { session_id: s.id, status: s.status });
    setSelected(s);
  };

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 font-sans">
      <div className="max-w-3xl mx-auto px-6 py-12">
        <span className="text-xs uppercase tracking-wide text-zinc-500">Variant {key.toUpperCase()} · {config.name}</span>
        <h1 className="mt-2 text-2xl font-semibold tracking-tight">{config.headline}</h1>
        <p className="mt-1 text-sm text-zinc-400">{sessions.length} research sessions from the last 14 days.</p>

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
"use client";

import posthog from "posthog-js";
import { useVariant } from "./useVariant";
import { sessions, type ResearchSession } from "./data/mock";

function SentimentDot({ sentiment }: { sentiment: ResearchSession["sentiment"] }) {
  const colors = {
    positive: "bg-emerald-500",
    neutral: "bg-zinc-400",
    negative: "bg-red-500",
  };
  return <span className={`inline-block w-2 h-2 rounded-full ${colors[sentiment]}`} />;
}

function StatusBadge({ status }: { status: ResearchSession["status"] }) {
  const styles = {
    completed: "bg-emerald-950 text-emerald-300",
    in_review: "bg-blue-950 text-blue-300",
    flagged: "bg-amber-950 text-amber-300",
  };
  const labels = { completed: "Completed", in_review: "In review", flagged: "Flagged" };
  return (
    <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${styles[status]}`}>
      {labels[status]}
    </span>
  );
}

function SessionCard({
  s,
  onOpen,
  roomy = false,
}: {
  s: ResearchSession;
  onOpen: (s: ResearchSession) => void;
  roomy?: boolean;
}) {
  return (
    <button
      onClick={() => onOpen(s)}
      className={`w-full text-left bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 rounded-xl transition-colors ${
        roomy ? "px-5 py-5" : "px-4 py-3"
      }`}
    >
      <div className="flex items-center justify-between gap-3">
        <span className="font-medium truncate">{s.participant}</span>
        <StatusBadge status={s.status} />
      </div>
      <div className="mt-1 flex items-center gap-3 text-xs text-zinc-400">
        <SentimentDot sentiment={s.sentiment} />
        <span>{s.durationMin} min</span>
        <span>{s.timestamp.toLocaleDateString()}</span>
      </div>
      {s.summary && (
        <p className={`mt-1.5 text-sm text-zinc-400 ${roomy ? "" : "line-clamp-1"}`}>
          {s.summary}
        </p>
      )}
    </button>
  );
}

function SessionTable({
  data,
  onOpen,
}: {
  data: ResearchSession[];
  onOpen: (s: ResearchSession) => void;
}) {
  return (
    <div className="border border-zinc-800 rounded-xl overflow-hidden">
      {data.map((s) => (
        <button
          key={s.id}
          onClick={() => onOpen(s)}
          className="w-full text-left flex items-center gap-4 px-4 py-2 hover:bg-zinc-800 border-b border-zinc-800/60 last:border-b-0 transition-colors"
        >
          <SentimentDot sentiment={s.sentiment} />
          <span className="font-medium truncate flex-1">{s.participant}</span>
          <span className="text-xs text-zinc-400 w-16 text-right">{s.durationMin} min</span>
          <span className="text-xs text-zinc-400 w-20 text-right">
            {s.timestamp.toLocaleDateString()}
          </span>
          <StatusBadge status={s.status} />
        </button>
      ))}
    </div>
  );
}

export default function Home() {
  const { key, config } = useVariant();

  const openSession = (s: ResearchSession) => {
    posthog.capture("session_opened", { session_id: s.id, status: s.status });
  };

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 font-sans">
      <div className="max-w-3xl mx-auto px-6 py-12">
        <span className="text-xs uppercase tracking-wide text-zinc-500">
          Variant {key.toUpperCase()} · {config.name}
        </span>
        <h1 className="mt-2 text-2xl font-semibold tracking-tight">{config.headline}</h1>
        <p className="mt-1 text-sm text-zinc-400">
          {sessions.length} research sessions from the last 14 days.
        </p>

        <div className="mt-8">
          {config.layout === "table" ? (
            <SessionTable data={sessions} onOpen={openSession} />
          ) : config.layout === "cards" ? (
            <div className="grid sm:grid-cols-2 gap-3">
              {sessions.map((s) => (
                <SessionCard key={s.id} s={s} onOpen={openSession} roomy />
              ))}
            </div>
          ) : (
            <div className="space-y-2">
              {sessions.map((s) => (
                <SessionCard key={s.id} s={s} onOpen={openSession} />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
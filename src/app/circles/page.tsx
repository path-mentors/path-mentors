"use client";

import { useEffect, useMemo, useState } from "react";
import { CircleCard } from "@/components/CircleCard";
import { FullPageSpinner } from "@/components/ui/Spinner";
import { EmptyState } from "@/components/ui/EmptyState";
import { Alert } from "@/components/ui/Alert";
import { api } from "@/lib/api";
import type { Circle, Topic } from "@/lib/types";

export default function CirclesPage() {
  const [circles, setCircles] = useState<Circle[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [topicFilter, setTopicFilter] = useState<string>("all");

  useEffect(() => {
    let active = true;
    (async () => {
      try {
        const { circles } = await api.getCircles({ status: "scheduled" });
        if (active) setCircles(circles ?? []);
      } catch (err) {
        if (active)
          setError(err instanceof Error ? err.message : "Could not load circles.");
      } finally {
        if (active) setLoading(false);
      }
    })();
    return () => {
      active = false;
    };
  }, []);

  const topics = useMemo<Topic[]>(() => {
    const map = new Map<string, Topic>();
    for (const c of circles) {
      if (c.topics) map.set(c.topics.id, c.topics);
    }
    return Array.from(map.values()).sort((a, b) => a.name.localeCompare(b.name));
  }, [circles]);

  const filtered = useMemo(() => {
    const list = topicFilter === "all"
      ? circles
      : circles.filter((c) => c.topics?.id === topicFilter);
    return [...list].sort(
      (a, b) => new Date(a.starts_at).getTime() - new Date(b.starts_at).getTime(),
    );
  }, [circles, topicFilter]);

  return (
    <div className="mx-auto w-full max-w-6xl px-4 py-10 sm:px-6">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-zinc-900">
            Browse circles
          </h1>
          <p className="mt-1 text-sm text-zinc-600">
            Upcoming group sessions led by approved mentors.
          </p>
        </div>
        {topics.length > 0 && (
          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={() => setTopicFilter("all")}
              className={`rounded-full px-3 py-1.5 text-sm font-medium transition-colors ${
                topicFilter === "all"
                  ? "bg-indigo-600 text-white"
                  : "bg-white text-zinc-600 border border-zinc-200 hover:bg-zinc-50"
              }`}
            >
              All
            </button>
            {topics.map((t) => (
              <button
                key={t.id}
                onClick={() => setTopicFilter(t.id)}
                className={`rounded-full px-3 py-1.5 text-sm font-medium transition-colors ${
                  topicFilter === t.id
                    ? "bg-indigo-600 text-white"
                    : "bg-white text-zinc-600 border border-zinc-200 hover:bg-zinc-50"
                }`}
              >
                {t.name}
              </button>
            ))}
          </div>
        )}
      </div>

      <div className="mt-8">
        {loading ? (
          <FullPageSpinner label="Loading circles…" />
        ) : error ? (
          <Alert type="error">{error}</Alert>
        ) : filtered.length === 0 ? (
          <EmptyState
            icon="🟣"
            title="No circles scheduled right now"
            description="Check back soon — new circles are added regularly. Want to lead one? You can apply to become a mentor."
          />
        ) : (
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {filtered.map((c) => (
              <CircleCard key={c.id} circle={c} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

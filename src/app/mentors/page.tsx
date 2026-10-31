"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { Card, CardBody } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { FullPageSpinner } from "@/components/ui/Spinner";
import { EmptyState } from "@/components/ui/EmptyState";
import { Alert } from "@/components/ui/Alert";
import { api } from "@/lib/api";
import type { Mentor } from "@/lib/types";

export default function MentorsPage() {
  const [mentors, setMentors] = useState<Mentor[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");

  useEffect(() => {
    let active = true;
    (async () => {
      try {
        const { mentors } = await api.getMentors();
        if (active) setMentors(mentors ?? []);
      } catch (err) {
        if (active)
          setError(err instanceof Error ? err.message : "Could not load mentors.");
      } finally {
        if (active) setLoading(false);
      }
    })();
    return () => {
      active = false;
    };
  }, []);

  const fields = useMemo(
    () => Array.from(new Set(mentors.map((m) => m.field))).sort(),
    [mentors],
  );

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return mentors;
    return mentors.filter(
      (m) =>
        m.field.toLowerCase().includes(q) ||
        m.current_position.toLowerCase().includes(q) ||
        (m.bio ?? "").toLowerCase().includes(q) ||
        m.languages.some((l) => l.toLowerCase().includes(q)),
    );
  }, [mentors, search]);

  return (
    <div className="mx-auto w-full max-w-6xl px-4 py-10 sm:px-6">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-zinc-900">Mentors</h1>
          <p className="mt-1 text-sm text-zinc-600">
            Approved mentors with lived experience, here to support your journey.
          </p>
        </div>
        <div className="w-full sm:w-72">
          <input
            type="search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by field, role, or language…"
            className="h-11 w-full rounded-xl border border-zinc-300 bg-white px-3.5 text-sm placeholder:text-zinc-400 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
          />
        </div>
      </div>

      {fields.length > 0 && (
        <p className="mt-4 text-sm text-zinc-500">
          {fields.length} field{fields.length !== 1 ? "s" : ""} · {mentors.length} mentor
          {mentors.length !== 1 ? "s" : ""}
        </p>
      )}

      <div className="mt-8">
        {loading ? (
          <FullPageSpinner label="Loading mentors…" />
        ) : error ? (
          <Alert type="error">{error}</Alert>
        ) : filtered.length === 0 ? (
          <EmptyState
            icon="🧭"
            title="No mentors found"
            description={
              search
                ? "Try a different search term."
                : "Approved mentors will appear here once they join the platform."
            }
          />
        ) : (
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {filtered.map((m) => (
              <Link key={m.id} href={`/mentors/${m.id}`} className="block h-full">
                <Card className="h-full transition-shadow hover:shadow-md">
                  <CardBody className="flex h-full flex-col gap-3">
                    <div className="flex items-center gap-3">
                      <div className="flex h-12 w-12 items-center justify-center rounded-full bg-indigo-100 text-lg font-semibold text-indigo-700">
                        {m.users?.display_name?.[0]?.toUpperCase() ?? "?"}
                      </div>
                      <div>
                        <p className="font-semibold text-zinc-900">
                          {m.users?.display_name ?? "Mentor"}
                        </p>
                        <p className="text-sm text-zinc-500">{m.field}</p>
                      </div>
                    </div>
                    <p className="line-clamp-2 text-sm text-zinc-600">
                      {m.bio || `${m.current_position}.`}
                    </p>
                    <div className="mt-auto flex flex-wrap gap-1.5 pt-1">
                      {m.languages.slice(0, 3).map((lang) => (
                        <Badge key={lang} color="bg-zinc-100 text-zinc-600">
                          {lang}
                        </Badge>
                      ))}
                    </div>
                  </CardBody>
                </Card>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

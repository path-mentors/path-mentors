"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/components/AuthProvider";
import { Card, CardBody } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Alert } from "@/components/ui/Alert";
import { FullPageSpinner } from "@/components/ui/Spinner";
import { EmptyState } from "@/components/ui/EmptyState";
import { api } from "@/lib/api";
import { formatDate, formatTime, formatDuration, isPast } from "@/lib/format";
import {
  CIRCLE_STATUS_LABELS,
  CIRCLE_STATUS_STYLES,
  REGISTRATION_STATUS_LABELS,
} from "@/lib/constants";
import type { Circle, Registration } from "@/lib/types";

interface MentorCircle extends Circle {
  registrations?: Registration[];
}

export default function MentorDashboardPage() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const [circles, setCircles] = useState<MentorCircle[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (authLoading) return;
    if (!user) {
      router.push("/login?next=/mentor/dashboard");
      return;
    }
    let active = true;
    (async () => {
      try {
        const { circles } = await api.getMentorDashboard();
        if (active) setCircles(circles ?? []);
      } catch (err) {
        if (active)
          setError(err instanceof Error ? err.message : "Could not load your dashboard.");
      } finally {
        if (active) setLoading(false);
      }
    })();
    return () => {
      active = false;
    };
  }, [user, authLoading, router]);

  if (authLoading) return <FullPageSpinner />;

  if (!user) return null;

  if (user.role !== "mentor") {
    return (
      <div className="mx-auto w-full max-w-2xl px-4 py-16 sm:px-6">
        <Alert type="info">
          Your mentor application is still under review. Once approved, you&apos;ll see
          your assigned circles here.
        </Alert>
        <div className="mt-4">
          <Link href="/circles" className="text-sm font-medium text-indigo-600 hover:text-indigo-700">
            ← Browse circles
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto w-full max-w-5xl px-4 py-10 sm:px-6">
      <h1 className="text-2xl font-bold tracking-tight text-zinc-900">
        Mentor dashboard
      </h1>
      <p className="mt-1 text-sm text-zinc-600">
        Circles assigned to you and their registrations.
      </p>

      {loading ? (
        <FullPageSpinner label="Loading your circles…" />
      ) : error ? (
        <div className="mt-6">
          <Alert type="error">{error}</Alert>
        </div>
      ) : circles.length === 0 ? (
        <div className="mt-8">
          <EmptyState
            icon="🧑‍🏫"
            title="No circles assigned yet"
            description="When a moderator assigns you to lead a circle, it will appear here."
          />
        </div>
      ) : (
        <div className="mt-8 space-y-4">
          {circles.map((c) => {
            const upcoming = !isPast(c.ends_at);
            const regs = c.registrations ?? [];
            const active = regs.filter((r) =>
              ["registered", "attended"].includes(r.status),
            );
            return (
              <Card key={c.id}>
                <CardBody className="space-y-4">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <Link
                      href={`/circles/${c.id}`}
                      className="text-lg font-semibold text-zinc-900 hover:text-indigo-700"
                    >
                      {c.title}
                    </Link>
                    <Badge color={CIRCLE_STATUS_STYLES[c.status] ?? "bg-zinc-100 text-zinc-600"}>
                      {CIRCLE_STATUS_LABELS[c.status]}
                    </Badge>
                  </div>

                  <div className="flex flex-wrap gap-x-6 gap-y-1 text-sm text-zinc-500">
                    <span>📅 {formatDate(c.starts_at)} · {formatTime(c.starts_at)}</span>
                    <span>⏱ {formatDuration(c.starts_at, c.ends_at)}</span>
                    <span>
                      👥 {active.length}/{c.capacity} registered
                    </span>
                    {upcoming && <Badge color="bg-emerald-100 text-emerald-700">Upcoming</Badge>}
                  </div>

                  {regs.length > 0 && (
                    <div className="rounded-xl border border-zinc-100">
                      <p className="border-b border-zinc-100 px-4 py-2 text-xs font-semibold uppercase tracking-wide text-zinc-400">
                        Registrations ({regs.length})
                      </p>
                      <ul className="divide-y divide-zinc-50">
                        {regs.map((r) => (
                          <li
                            key={r.id}
                            className="flex items-center justify-between px-4 py-2.5 text-sm"
                          >
                            <span className="text-zinc-700">
                              {r.users?.display_name ?? "A student"}
                            </span>
                            <Badge color="bg-zinc-100 text-zinc-600">
                              {REGISTRATION_STATUS_LABELS[r.status] ?? r.status}
                            </Badge>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </CardBody>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}

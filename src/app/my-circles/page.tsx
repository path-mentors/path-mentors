"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/components/AuthProvider";
import { Card, CardBody } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Alert } from "@/components/ui/Alert";
import { FullPageSpinner } from "@/components/ui/Spinner";
import { EmptyState } from "@/components/ui/EmptyState";
import { api } from "@/lib/api";
import { formatDate, formatTime, formatDuration, isPast } from "@/lib/format";
import {
  REGISTRATION_STATUS_LABELS,
  REGISTRATION_STATUS_STYLES,
} from "@/lib/constants";
import type { Circle, RegistrationStatus } from "@/lib/types";

interface MyRegistration {
  id: string;
  status: RegistrationStatus;
  created_at: string;
  attended_at: string | null;
  cancelled_at: string | null;
  circles: Circle | null;
}

export default function MyCirclesPage() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const [regs, setRegs] = useState<MyRegistration[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (authLoading) return;
    if (!user) {
      router.push("/login?next=/my-circles");
      return;
    }
    let active = true;
    (async () => {
      try {
        const { registrations } = await api.getMyRegistrations();
        if (active) setRegs(registrations ?? []);
      } catch (err) {
        if (active)
          setError(err instanceof Error ? err.message : "Could not load your circles.");
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

  const upcoming = regs.filter(
    (r) => r.status === "registered" && r.circles && !isPast(r.circles.ends_at),
  );
  const past = regs.filter(
    (r) => r.status !== "registered" || (r.circles && isPast(r.circles.ends_at)),
  );

  return (
    <div className="mx-auto w-full max-w-5xl px-4 py-10 sm:px-6">
      <h1 className="text-2xl font-bold tracking-tight text-zinc-900">My circles</h1>
      <p className="mt-1 text-sm text-zinc-600">
        Sessions you&apos;ve registered for and attended.
      </p>

      {loading ? (
        <FullPageSpinner label="Loading your circles…" />
      ) : error ? (
        <div className="mt-6">
          <Alert type="error">{error}</Alert>
        </div>
      ) : regs.length === 0 ? (
        <div className="mt-8">
          <EmptyState
            icon="🗓️"
            title="You haven't joined any circles yet"
            description="Browse upcoming sessions and reserve your spot in a supportive group."
            action={
              <Link
                href="/circles"
                className="inline-flex h-11 items-center justify-center rounded-xl bg-indigo-600 px-5 text-sm font-medium text-white hover:bg-indigo-700"
              >
                Browse circles
              </Link>
            }
          />
        </div>
      ) : (
        <div className="mt-8 space-y-10">
          {/* Upcoming */}
          <section>
            <h2 className="mb-4 flex items-center gap-2 text-sm font-semibold uppercase tracking-wide text-zinc-400">
              Upcoming
              <span className="rounded-full bg-zinc-100 px-2 py-0.5 text-xs text-zinc-600">
                {upcoming.length}
              </span>
            </h2>
            {upcoming.length === 0 ? (
              <p className="text-sm text-zinc-500">No upcoming circles.</p>
            ) : (
              <div className="grid gap-4 sm:grid-cols-2">
                {upcoming.map((r) => (
                  <RegistrationCard key={r.id} reg={r} />
                ))}
              </div>
            )}
          </section>

          {/* Past */}
          <section>
            <h2 className="mb-4 flex items-center gap-2 text-sm font-semibold uppercase tracking-wide text-zinc-400">
              Past
              <span className="rounded-full bg-zinc-100 px-2 py-0.5 text-xs text-zinc-600">
                {past.length}
              </span>
            </h2>
            {past.length === 0 ? (
              <p className="text-sm text-zinc-500">No past circles.</p>
            ) : (
              <div className="grid gap-4 sm:grid-cols-2">
                {past.map((r) => (
                  <RegistrationCard key={r.id} reg={r} />
                ))}
              </div>
            )}
          </section>
        </div>
      )}
    </div>
  );
}

function RegistrationCard({ reg }: { reg: MyRegistration }) {
  const circle = reg.circles;
  if (!circle) return null;
  const attended = reg.status === "attended";

  return (
    <Card>
      <CardBody className="flex flex-col gap-3">
        <div className="flex items-center justify-between gap-2">
          <Badge color={REGISTRATION_STATUS_STYLES[reg.status] ?? "bg-zinc-100 text-zinc-600"}>
            {REGISTRATION_STATUS_LABELS[reg.status] ?? reg.status}
          </Badge>
          {circle.topics && (
            <Badge color="bg-indigo-50 text-indigo-700">{circle.topics.name}</Badge>
          )}
        </div>

        <Link href={`/circles/${circle.id}`} className="font-semibold text-zinc-900 hover:text-indigo-700">
          {circle.title}
        </Link>

        <div className="flex flex-wrap gap-x-4 gap-y-1 text-sm text-zinc-500">
          <span>{formatDate(circle.starts_at)}</span>
          <span>·</span>
          <span>{formatTime(circle.starts_at)}</span>
          <span>·</span>
          <span>{formatDuration(circle.starts_at, circle.ends_at)}</span>
        </div>

        {attended && (
          <div className="pt-1">
            <Link href={`/feedback?reg=${reg.id}`}>
              <Button variant="outline" size="sm">
                Give feedback
              </Button>
            </Link>
          </div>
        )}
      </CardBody>
    </Card>
  );
}

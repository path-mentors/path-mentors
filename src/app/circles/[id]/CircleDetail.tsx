"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Card, CardBody } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Alert } from "@/components/ui/Alert";
import { Spinner } from "@/components/ui/Spinner";
import { useAuth } from "@/components/AuthProvider";
import { api } from "@/lib/api";
import {
  formatDate,
  formatTime,
  formatDateTime,
  formatDuration,
  isPast,
} from "@/lib/format";
import {
  CIRCLE_STATUS_LABELS,
  CIRCLE_STATUS_STYLES,
  TOPIC_CATEGORY_LABELS,
} from "@/lib/constants";
import type { Circle, Registration } from "@/lib/types";

export function CircleDetail({ id }: { id: string }) {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();

  const [circle, setCircle] = useState<Circle | null>(null);
  const [registrations, setRegistrations] = useState<Registration[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [actionLoading, setActionLoading] = useState(false);
  const [actionMsg, setActionMsg] = useState<{ type: "success" | "error"; text: string } | null>(null);

  useEffect(() => {
    if (!id) return;
    let active = true;
    (async () => {
      try {
        const { circle } = await api.getCircle(id);
        if (active) setCircle(circle);
      } catch (err) {
        if (active) setError(err instanceof Error ? err.message : "Circle not found.");
      } finally {
        if (active) setLoading(false);
      }
    })();
    return () => {
      active = false;
    };
  }, [id]);

  // Fetch registrations when the user is known.
  useEffect(() => {
    if (!id || !user) return;
    let active = true;
    (async () => {
      try {
        const { registrations } = await api.getRegistrations(id);
        if (active) setRegistrations(registrations ?? []);
      } catch {
        /* non-fatal — registration state simply unknown */
      }
    })();
    return () => {
      active = false;
    };
  }, [id, user]);

  const myReg = registrations.find((r) => r.status === "registered");
  const activeCount = registrations.filter((r) =>
    ["registered", "attended"].includes(r.status),
  ).length;
  const seatsLeft = circle ? Math.max(0, circle.capacity - activeCount) : 0;
  const isFull = circle ? activeCount >= circle.capacity : false;
  const open = circle?.status === "scheduled" && !isPast(circle?.ends_at);

  async function handleRegister() {
    if (!user) {
      router.push(`/login?next=/circles/${id}`);
      return;
    }
    setActionLoading(true);
    setActionMsg(null);
    try {
      const res = await api.registerForCircle(id);
      setActionMsg({ type: "success", text: res.message || "You're registered!" });
      const { registrations } = await api.getRegistrations(id);
      setRegistrations(registrations ?? []);
    } catch (err) {
      setActionMsg({
        type: "error",
        text: err instanceof Error ? err.message : "Could not register.",
      });
    } finally {
      setActionLoading(false);
    }
  }

  async function handleCancel() {
    setActionLoading(true);
    setActionMsg(null);
    try {
      const res = await api.cancelRegistration(id);
      setActionMsg({ type: "success", text: res.message || "Registration cancelled." });
      const { registrations } = await api.getRegistrations(id);
      setRegistrations(registrations ?? []);
    } catch (err) {
      setActionMsg({
        type: "error",
        text: err instanceof Error ? err.message : "Could not cancel.",
      });
    } finally {
      setActionLoading(false);
    }
  }

  if (loading) {
    return (
      <div className="mx-auto flex w-full max-w-3xl items-center justify-center px-4 py-24">
        <Spinner />
      </div>
    );
  }

  if (error || !circle) {
    return (
      <div className="mx-auto w-full max-w-3xl px-4 py-16 sm:px-6">
        <Alert type="error">{error || "Circle not found."}</Alert>
        <div className="mt-4">
          <Link href="/circles" className="text-sm font-medium text-indigo-600 hover:text-indigo-700">
            ← Back to circles
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto w-full max-w-3xl px-4 py-10 sm:px-6">
      <Link href="/circles" className="text-sm font-medium text-indigo-600 hover:text-indigo-700">
        ← Back to circles
      </Link>

      <div className="mt-4">
        <div className="flex flex-wrap items-center gap-2">
          {circle.topics && (
            <Badge color="bg-indigo-50 text-indigo-700">{circle.topics.name}</Badge>
          )}
          <Badge color={CIRCLE_STATUS_STYLES[circle.status]}>
            {CIRCLE_STATUS_LABELS[circle.status]}
          </Badge>
          {circle.topics?.category && (
            <Badge color="bg-zinc-100 text-zinc-600">
              {TOPIC_CATEGORY_LABELS[circle.topics.category]} track
            </Badge>
          )}
        </div>

        <h1 className="mt-4 text-3xl font-bold tracking-tight text-zinc-900">
          {circle.title}
        </h1>

        <div className="mt-3 flex flex-wrap gap-x-6 gap-y-1 text-sm text-zinc-600">
          <span className="flex items-center gap-1.5">
            <svg className="h-4 w-4 text-zinc-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><rect x="3" y="4" width="18" height="18" rx="2" /><line x1="16" y1="2" x2="16" y2="6" /><line x1="8" y1="2" x2="8" y2="6" /><line x1="3" y1="10" x2="21" y2="10" /></svg>
            {formatDate(circle.starts_at)}
          </span>
          <span className="flex items-center gap-1.5">
            <svg className="h-4 w-4 text-zinc-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><circle cx="12" cy="12" r="9" /><path d="M12 7v5l3 2" /></svg>
            {formatTime(circle.starts_at)} · {formatDuration(circle.starts_at, circle.ends_at)}
          </span>
          <span className="flex items-center gap-1.5">
            <svg className="h-4 w-4 text-zinc-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M23 21v-2a4 4 0 0 0-3-3.87" /></svg>
            Mentored by {circle.mentors?.users?.display_name ?? "TBA"}
          </span>
        </div>
      </div>

      <Card className="mt-6">
        <CardBody className="space-y-4">
          <div>
            <h2 className="text-sm font-semibold uppercase tracking-wide text-zinc-400">
              About this circle
            </h2>
            <p className="mt-2 whitespace-pre-line leading-7 text-zinc-700">
              {circle.description}
            </p>
          </div>

          <div className="grid grid-cols-2 gap-4 border-t border-zinc-100 pt-4 text-sm sm:grid-cols-3">
            <div>
              <p className="text-zinc-400">Starts</p>
              <p className="font-medium text-zinc-700">{formatDateTime(circle.starts_at)}</p>
            </div>
            <div>
              <p className="text-zinc-400">Ends</p>
              <p className="font-medium text-zinc-700">{formatDateTime(circle.ends_at)}</p>
            </div>
            <div>
              <p className="text-zinc-400">Capacity</p>
              <p className="font-medium text-zinc-700">
                {activeCount} / {circle.capacity} registered
              </p>
            </div>
          </div>
        </CardBody>
      </Card>

      {/* Registration actions */}
      <Card className="mt-6">
        <CardBody className="flex flex-col gap-4">
          {actionMsg && <Alert type={actionMsg.type}>{actionMsg.text}</Alert>}

          {!open && (
            <p className="text-sm text-zinc-500">
              {isPast(circle.ends_at)
                ? "This circle has already ended."
                : "This circle is not currently open for registration."}
            </p>
          )}

          {open && authLoading && (
            <div className="flex items-center gap-2 text-sm text-zinc-500">
              <Spinner /> Checking your registration…
            </div>
          )}

          {open && !authLoading && (
            <>
              {myReg ? (
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <div className="flex items-center gap-2 text-sm font-medium text-emerald-700">
                    <span className="flex h-6 w-6 items-center justify-center rounded-full bg-emerald-100 text-emerald-700">✓</span>
                    You&apos;re registered
                  </div>
                  <Button variant="outline" onClick={handleCancel} loading={actionLoading}>
                    Cancel registration
                  </Button>
                </div>
              ) : user?.role === "student" ? (
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <p className="text-sm text-zinc-600">
                    {isFull
                      ? "This circle is full."
                      : `${seatsLeft} ${seatsLeft === 1 ? "seat" : "seats"} left`}
                  </p>
                  <Button onClick={handleRegister} loading={actionLoading} disabled={isFull}>
                    Register for this circle
                  </Button>
                </div>
              ) : user ? (
                <p className="text-sm text-zinc-500">
                  Only student accounts can register for circles.
                </p>
              ) : (
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <p className="text-sm text-zinc-600">
                    Log in to reserve your spot.
                  </p>
                  <Button onClick={() => router.push(`/login?next=/circles/${id}`)}>
                    Log in to register
                  </Button>
                </div>
              )}
            </>
          )}
        </CardBody>
      </Card>
    </div>
  );
}

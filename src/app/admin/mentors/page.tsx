"use client";

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
import { MENTOR_STATUS_STYLES, MENTOR_STATUS_LABELS } from "@/lib/constants";
import { formatDateTime } from "@/lib/format";
import type { Mentor } from "@/lib/types";

export default function AdminMentorsPage() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const [mentors, setMentors] = useState<Mentor[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [actionId, setActionId] = useState<string | null>(null);

  async function load() {
    try {
      const { mentors } = await api.getPendingMentors("pending");
      setMentors(mentors ?? []);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not load applications.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (authLoading) return;
    if (!user) {
      router.push("/login?next=/admin/mentors");
      return;
    }
    if (user.role !== "moderator") {
      router.push("/");
      return;
    }
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, authLoading, router]);

  async function handleReview(id: string, status: "approved" | "rejected") {
    setActionId(id);
    try {
      await api.reviewMentor(id, { status });
      setMentors((prev) => prev.filter((m) => m.id !== id));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not update mentor status.");
    } finally {
      setActionId(null);
    }
  }

  if (authLoading) return <FullPageSpinner />;
  if (!user || user.role !== "moderator") return null;

  return (
    <div className="mx-auto w-full max-w-4xl px-4 py-10 sm:px-6">
      <h1 className="text-2xl font-bold tracking-tight text-zinc-900">
        Mentor applications
      </h1>
      <p className="mt-1 text-sm text-zinc-600">
        Review and approve pending mentor applications.
      </p>

      <div className="mt-8">
        {loading ? (
          <FullPageSpinner label="Loading applications…" />
        ) : error ? (
          <Alert type="error">{error}</Alert>
        ) : mentors.length === 0 ? (
          <EmptyState
            icon="✅"
            title="No pending applications"
            description="All caught up — there are no mentor applications awaiting review."
          />
        ) : (
          <div className="space-y-4">
            {mentors.map((m) => (
              <Card key={m.id}>
                <CardBody className="space-y-4">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div className="flex items-center gap-3">
                      <div className="flex h-11 w-11 items-center justify-center rounded-full bg-indigo-100 font-semibold text-indigo-700">
                        {m.users?.display_name?.[0]?.toUpperCase() ?? "?"}
                      </div>
                      <div>
                        <p className="font-semibold text-zinc-900">
                          {m.users?.display_name ?? "Applicant"}
                        </p>
                        <p className="text-sm text-zinc-500">{m.users?.email}</p>
                      </div>
                    </div>
                    <Badge color={MENTOR_STATUS_STYLES[m.status] ?? "bg-amber-100 text-amber-700"}>
                      {MENTOR_STATUS_LABELS[m.status] ?? "Pending review"}
                    </Badge>
                  </div>

                  <div className="grid gap-4 sm:grid-cols-2">
                    <InfoRow label="Field" value={m.field} />
                    <InfoRow label="Current role" value={m.current_position} />
                    <InfoRow
                      label="Languages"
                      value={m.languages.join(", ")}
                    />
                    <InfoRow
                      label="Submitted"
                      value={formatDateTime(m.created_at)}
                    />
                  </div>

                  {m.bio && (
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-wide text-zinc-400">
                        Bio
                      </p>
                      <p className="mt-1 whitespace-pre-line text-sm leading-6 text-zinc-700">
                        {m.bio}
                      </p>
                    </div>
                  )}

                  {m.availability && (
                    <InfoRow label="Availability" value={m.availability} />
                  )}

                  <div className="flex gap-3 border-t border-zinc-100 pt-4">
                    <Button
                      size="sm"
                      loading={actionId === m.id}
                      onClick={() => handleReview(m.id, "approved")}
                    >
                      Approve
                    </Button>
                    <Button
                      size="sm"
                      variant="danger"
                      loading={actionId === m.id}
                      onClick={() => handleReview(m.id, "rejected")}
                    >
                      Reject
                    </Button>
                  </div>
                </CardBody>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-xs font-semibold uppercase tracking-wide text-zinc-400">{label}</p>
      <p className="mt-0.5 text-sm text-zinc-700">{value}</p>
    </div>
  );
}

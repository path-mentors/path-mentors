"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense } from "react";
import { Card, CardBody } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Label, Textarea } from "@/components/ui/Input";
import { Alert } from "@/components/ui/Alert";
import { Spinner } from "@/components/ui/Spinner";
import { useAuth } from "@/components/AuthProvider";
import { api } from "@/lib/api";
import { REPORT_REASON_OPTIONS } from "@/lib/constants";

function ReportForm() {
  const searchParams = useSearchParams();
  const circleId = searchParams.get("circle") ?? undefined;
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();

  const [reason, setReason] = useState<string>("");
  const [details, setDetails] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);

  useEffect(() => {
    if (authLoading) return;
    if (!user) router.push("/login?next=/report");
  }, [user, authLoading, router]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    if (!reason) {
      setError("Please select a reason for your report.");
      return;
    }
    setSubmitting(true);
    try {
      await api.submitReport({
        circle_id: circleId,
        reason,
        details: details.trim() || undefined,
      });
      setDone(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not submit your report.");
    } finally {
      setSubmitting(false);
    }
  }

  if (done) {
    return (
      <Card>
        <CardBody className="flex flex-col items-center gap-4 text-center">
          <div className="flex h-14 w-14 items-center justify-center rounded-full bg-emerald-100 text-2xl">
            ✓
          </div>
          <h1 className="text-xl font-bold text-zinc-900">Report received</h1>
          <p className="text-sm text-zinc-600">
            Thank you for helping keep PathMentors safe. Our moderation team will review your
            report. If you raised a crisis concern, please also reach out to a local emergency
            service or crisis line.
          </p>
          <Button onClick={() => router.push("/circles")}>Back to circles</Button>
        </CardBody>
      </Card>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {error && <Alert type="error">{error}</Alert>}

      <Card>
        <CardBody className="space-y-5">
          <div>
            <Label required>What are you reporting?</Label>
            <div className="grid gap-2 sm:grid-cols-2">
              {REPORT_REASON_OPTIONS.map((opt) => (
                <button
                  key={opt.value}
                  type="button"
                  aria-pressed={reason === opt.value}
                  onClick={() => setReason(opt.value)}
                  className={`flex items-center gap-3 rounded-xl border-2 px-4 py-3 text-left text-sm transition-all ${
                    reason === opt.value
                      ? "border-indigo-500 bg-indigo-50"
                      : "border-zinc-200 bg-white hover:border-zinc-300"
                  }`}
                >
                  <span
                    className={`flex h-4 w-4 flex-shrink-0 items-center justify-center rounded-full border-2 ${
                      reason === opt.value
                        ? "border-indigo-500 bg-indigo-500"
                        : "border-zinc-300"
                    }`}
                  >
                    {reason === opt.value && (
                      <span className="h-1.5 w-1.5 rounded-full bg-white" />
                    )}
                  </span>
                  {opt.label}
                </button>
              ))}
            </div>
          </div>

          <div>
            <Label htmlFor="details">Details (optional)</Label>
            <Textarea
              id="details"
              maxLength={2000}
              value={details}
              onChange={(e) => setDetails(e.target.value)}
              placeholder="Add any context that would help our team understand the situation."
            />
            <p className="mt-1 text-right text-xs text-zinc-400">{details.length} / 2000</p>
          </div>
        </CardBody>
      </Card>

      {reason === "crisis_concern" && (
        <Alert type="warning">
          If someone is in immediate danger, please contact your local emergency services or a
          crisis line now. This report is not a substitute for emergency help.
        </Alert>
      )}

      <Button type="submit" className="w-full" loading={submitting}>
        Submit report
      </Button>
    </form>
  );
}

export default function ReportPage() {
  return (
    <div className="mx-auto w-full max-w-2xl px-4 py-10 sm:px-6">
      <div className="mb-8 text-center">
        <h1 className="text-2xl font-bold tracking-tight text-zinc-900">
          Report a safety concern
        </h1>
        <p className="mt-2 text-sm text-zinc-600">
          Help us keep the community safe. Reports are reviewed by our moderation team.
        </p>
      </div>
      <Suspense
        fallback={
          <div className="flex items-center justify-center py-16">
            <Spinner />
          </div>
        }
      >
        <ReportForm />
      </Suspense>
    </div>
  );
}

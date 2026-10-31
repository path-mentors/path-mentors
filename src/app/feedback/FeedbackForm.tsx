"use client";

import { useState } from "react";
import Link from "next/link";
import { useSearchParams, useRouter } from "next/navigation";
import { Card, CardBody } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Label, Textarea } from "@/components/ui/Input";
import { Alert } from "@/components/ui/Alert";
import { FeelingScale, StarScale, ConfidenceScale } from "@/components/ui/RatingScale";
import { api } from "@/lib/api";

export default function FeedbackForm() {
  const searchParams = useSearchParams();
  const regId = searchParams.get("reg");
  const router = useRouter();

  const [feelingBefore, setFeelingBefore] = useState<number | null>(null);
  const [feelingAfter, setFeelingAfter] = useState<number | null>(null);
  const [connection, setConnection] = useState<number | null>(null);
  const [confidence, setConfidence] = useState<number | null>(null);
  const [nextStep, setNextStep] = useState("");
  const [comment, setComment] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (!regId) {
      setError("No registration found. Open feedback from your circles list.");
      return;
    }
    if (!feelingBefore || !feelingAfter || !connection || confidence === null) {
      setError("Please complete all the rating questions.");
      return;
    }
    if (nextStep.trim().length < 3) {
      setError("Please share at least one practical next step (3+ characters).");
      return;
    }

    setSubmitting(true);
    try {
      await api.submitFeedback({
        registration_id: regId,
        feeling_before: feelingBefore,
        feeling_after: feelingAfter,
        connection_rating: connection,
        confidence_change: confidence,
        next_step: nextStep.trim(),
        comment: comment.trim() || undefined,
      });
      setDone(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not submit feedback.");
    } finally {
      setSubmitting(false);
    }
  }

  if (!regId) {
    return (
      <Card>
        <CardBody className="flex flex-col items-center gap-4 text-center">
          <p className="text-sm text-zinc-600">
            We couldn&apos;t find which session this feedback is for. Head to your
            circles and use the “Give feedback” button on an attended session.
          </p>
          <Link
            href="/my-circles"
            className="text-sm font-medium text-indigo-600 hover:text-indigo-700"
          >
            Go to my circles
          </Link>
        </CardBody>
      </Card>
    );
  }

  if (done) {
    return (
      <Card>
        <CardBody className="flex flex-col items-center gap-4 text-center">
          <div className="flex h-14 w-14 items-center justify-center rounded-full bg-emerald-100 text-2xl">
            ✓
          </div>
          <h1 className="text-xl font-bold text-zinc-900">Thank you!</h1>
          <p className="text-sm text-zinc-600">
            Your feedback helps us improve every circle. Take that next step — you&apos;ve
            got this.
          </p>
          <Button onClick={() => router.push("/my-circles")}>Back to my circles</Button>
        </CardBody>
      </Card>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {error && <Alert type="error">{error}</Alert>}

      <Card>
        <CardBody className="space-y-6">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-zinc-400">
            How were you feeling?
          </h2>

          <div>
            <Label required>Before the circle</Label>
            <FeelingScale
              value={feelingBefore}
              onChange={setFeelingBefore}
              name="Feeling before"
            />
          </div>
          <div>
            <Label required>After the circle</Label>
            <FeelingScale
              value={feelingAfter}
              onChange={setFeelingAfter}
              name="Feeling after"
            />
          </div>
        </CardBody>
      </Card>

      <Card>
        <CardBody className="space-y-6">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-zinc-400">
            Your experience
          </h2>

          <div>
            <Label required>How connected did you feel to the group?</Label>
            <StarScale
              value={connection}
              onChange={setConnection}
              label="Connection"
            />
          </div>

          <div>
            <Label required>How did your confidence change?</Label>
            <ConfidenceScale value={confidence} onChange={setConfidence} />
          </div>
        </CardBody>
      </Card>

      <Card>
        <CardBody className="space-y-5">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-zinc-400">
            Your next step
          </h2>

          <div>
            <Label htmlFor="next_step" required>
              One practical next step you&apos;ll take
            </Label>
            <Textarea
              id="next_step"
              maxLength={280}
              value={nextStep}
              onChange={(e) => setNextStep(e.target.value)}
              placeholder="e.g. I'll reach out to one person from today's circle this week."
            />
            <p className="mt-1 text-right text-xs text-zinc-400">{nextStep.length} / 280</p>
          </div>

          <div>
            <Label htmlFor="comment">Anything else? (optional)</Label>
            <Textarea
              id="comment"
              maxLength={1000}
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="Share what worked or what could be better."
            />
            <p className="mt-1 text-right text-xs text-zinc-400">{comment.length} / 1000</p>
          </div>
        </CardBody>
      </Card>

      <Button type="submit" className="w-full" loading={submitting}>
        Submit feedback
      </Button>
    </form>
  );
}

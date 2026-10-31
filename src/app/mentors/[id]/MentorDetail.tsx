"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Card, CardBody } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Spinner } from "@/components/ui/Spinner";
import { Alert } from "@/components/ui/Alert";
import { Button } from "@/components/ui/Button";
import { api } from "@/lib/api";
import type { Mentor } from "@/lib/types";

export function MentorDetail({ id }: { id: string }) {
  const [mentor, setMentor] = useState<Mentor | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;
    let active = true;
    (async () => {
      try {
        const { mentor } = await api.getMentor(id);
        if (active) setMentor(mentor);
      } catch (err) {
        if (active) setError(err instanceof Error ? err.message : "Mentor not found.");
      } finally {
        if (active) setLoading(false);
      }
    })();
    return () => {
      active = false;
    };
  }, [id]);

  if (loading) {
    return (
      <div className="mx-auto flex w-full max-w-3xl items-center justify-center px-4 py-24">
        <Spinner />
      </div>
    );
  }

  if (error || !mentor) {
    return (
      <div className="mx-auto w-full max-w-3xl px-4 py-16 sm:px-6">
        <Alert type="error">{error || "Mentor not found."}</Alert>
        <div className="mt-4">
          <Link href="/mentors" className="text-sm font-medium text-indigo-600 hover:text-indigo-700">
            ← Back to mentors
          </Link>
        </div>
      </div>
    );
  }

  const name = mentor.users?.display_name ?? "Mentor";

  return (
    <div className="mx-auto w-full max-w-3xl px-4 py-10 sm:px-6">
      <Link href="/mentors" className="text-sm font-medium text-indigo-600 hover:text-indigo-700">
        ← Back to mentors
      </Link>

      {/* Header */}
      <div className="mt-6 flex flex-col gap-4 sm:flex-row sm:items-center">
        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-indigo-100 text-2xl font-semibold text-indigo-700">
          {name[0]?.toUpperCase()}
        </div>
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-zinc-900">{name}</h1>
          <p className="text-zinc-600">{mentor.field}</p>
          <p className="text-sm text-zinc-500">{mentor.current_position}</p>
        </div>
      </div>

      <Card className="mt-6">
        <CardBody className="space-y-5">
          {mentor.bio && (
            <div>
              <h2 className="text-sm font-semibold uppercase tracking-wide text-zinc-400">
                About
              </h2>
              <p className="mt-2 whitespace-pre-line leading-7 text-zinc-700">{mentor.bio}</p>
            </div>
          )}

          {mentor.availability && (
            <div>
              <h2 className="text-sm font-semibold uppercase tracking-wide text-zinc-400">
                Availability
              </h2>
              <p className="mt-2 leading-7 text-zinc-700">{mentor.availability}</p>
            </div>
          )}

          <div>
            <h2 className="text-sm font-semibold uppercase tracking-wide text-zinc-400">
              Languages
            </h2>
            <div className="mt-2 flex flex-wrap gap-2">
              {mentor.languages.map((lang) => (
                <Badge key={lang} color="bg-zinc-100 text-zinc-600">
                  {lang}
                </Badge>
              ))}
            </div>
          </div>
        </CardBody>
      </Card>

      <div className="mt-6 flex flex-col gap-3 sm:flex-row">
        <Link href="/circles">
          <Button>Browse their circles</Button>
        </Link>
        <Link href="/report">
          <Button variant="outline">Report a concern</Button>
        </Link>
      </div>
    </div>
  );
}

"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/components/AuthProvider";
import { Card, CardBody } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input, Label, Textarea } from "@/components/ui/Input";
import { Alert } from "@/components/ui/Alert";
import { Spinner } from "@/components/ui/Spinner";
import { Badge } from "@/components/ui/Badge";
import { api } from "@/lib/api";

const COMMON_LANGUAGES = ["English", "Spanish", "French", "Arabic", "Hindi", "Mandarin", "Portuguese"];

export default function BecomeMentorPage() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();

  const [field, setField] = useState("");
  const [position, setPosition] = useState("");
  const [languages, setLanguages] = useState<string[]>(["English"]);
  const [bio, setBio] = useState("");
  const [availability, setAvailability] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);

  useEffect(() => {
    if (authLoading) return;
    if (!user) router.push("/login?next=/become-mentor");
    if (user?.role === "mentor") router.push("/mentor/dashboard");
  }, [user, authLoading, router]);

  function toggleLanguage(lang: string) {
    setLanguages((prev) =>
      prev.includes(lang) ? prev.filter((l) => l !== lang) : [...prev, lang],
    );
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (field.trim().length < 2) {
      setError("Please enter your field (at least 2 characters).");
      return;
    }
    if (position.trim().length < 2) {
      setError("Please enter your current role/position.");
      return;
    }
    if (languages.length === 0) {
      setError("Select at least one language.");
      return;
    }
    if (bio && bio.trim().length > 0 && bio.trim().length < 20) {
      setError("Bio should be at least 20 characters if provided.");
      return;
    }

    setSubmitting(true);
    try {
      await api.applyMentor({
        field: field.trim(),
        current_position: position.trim(),
        languages,
        bio: bio.trim() || undefined,
        availability: availability.trim() || undefined,
      });
      setDone(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not submit your application.");
    } finally {
      setSubmitting(false);
    }
  }

  if (authLoading) {
    return (
      <div className="mx-auto flex w-full max-w-2xl items-center justify-center px-4 py-24">
        <Spinner />
      </div>
    );
  }
  if (!user) return null;

  if (done) {
    return (
      <div className="mx-auto w-full max-w-xl px-4 py-16 sm:px-6">
        <Card>
          <CardBody className="flex flex-col items-center gap-4 text-center">
            <div className="flex h-14 w-14 items-center justify-center rounded-full bg-emerald-100 text-2xl">
              ✓
            </div>
            <h1 className="text-xl font-bold text-zinc-900">Application submitted!</h1>
            <p className="text-sm text-zinc-600">
              Thanks for applying to become a mentor. Our moderation team will review your
              application and get back to you. You&apos;ll see a mentor dashboard link in the
              navigation once approved.
            </p>
            <Link href="/circles">
              <Button>Browse circles in the meantime</Button>
            </Link>
          </CardBody>
        </Card>
      </div>
    );
  }

  return (
    <div className="mx-auto w-full max-w-2xl px-4 py-10 sm:px-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-zinc-900">
          Become a mentor
        </h1>
        <p className="mt-1 text-sm text-zinc-600">
          Share your lived experience and support peers through group circles.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="mt-8 space-y-5">
        {error && <Alert type="error">{error}</Alert>}

        <div>
          <Label htmlFor="field" required>Field / industry</Label>
          <Input
            id="field"
            required
            maxLength={100}
            value={field}
            onChange={(e) => setField(e.target.value)}
            placeholder="e.g. Software Engineering, Public Health"
          />
        </div>

        <div>
          <Label htmlFor="position" required>Current role / position</Label>
          <Input
            id="position"
            required
            maxLength={120}
            value={position}
            onChange={(e) => setPosition(e.target.value)}
            placeholder="e.g. Senior Engineer, Graduate Researcher"
          />
        </div>

        <div>
          <Label required>Languages you can mentor in</Label>
          <div className="flex flex-wrap gap-2">
            {COMMON_LANGUAGES.map((lang) => (
              <button
                key={lang}
                type="button"
                onClick={() => toggleLanguage(lang)}
                className={`rounded-full px-3 py-1.5 text-sm font-medium transition-colors ${
                  languages.includes(lang)
                    ? "bg-indigo-600 text-white"
                    : "border border-zinc-300 bg-white text-zinc-600 hover:bg-zinc-50"
                }`}
              >
                {lang}
              </button>
            ))}
          </div>
          {languages.length > 0 && (
            <div className="mt-2 flex flex-wrap items-center gap-1.5">
              <span className="text-xs text-zinc-400">Selected:</span>
              {languages.map((l) => (
                <Badge key={l} color="bg-indigo-50 text-indigo-700">{l}</Badge>
              ))}
            </div>
          )}
        </div>

        <div>
          <Label htmlFor="bio">Bio</Label>
          <Textarea
            id="bio"
            maxLength={1500}
            value={bio}
            onChange={(e) => setBio(e.target.value)}
            placeholder="Tell students about your journey, what you've overcome, and how you can help. (20–1500 characters)"
          />
          <p className="mt-1 text-right text-xs text-zinc-400">{bio.length} / 1500</p>
        </div>

        <div>
          <Label htmlFor="availability">Availability</Label>
          <Input
            id="availability"
            value={availability}
            onChange={(e) => setAvailability(e.target.value)}
            placeholder="e.g. Weekday evenings, weekends"
          />
        </div>

        <div className="rounded-xl bg-zinc-50 p-4 text-sm text-zinc-600">
          <p className="font-medium text-zinc-700">Code of conduct</p>
          <p className="mt-1">
            By applying, you agree to uphold PathMentors&apos; community guidelines and
            maintain a safe, supportive environment for all members.
          </p>
        </div>

        <Button type="submit" className="w-full" loading={submitting}>
          Submit application
        </Button>
      </form>
    </div>
  );
}

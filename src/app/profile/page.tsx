"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/components/AuthProvider";
import { Card, CardBody } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input, Label, Select } from "@/components/ui/Input";
import { Alert } from "@/components/ui/Alert";
import { Badge } from "@/components/ui/Badge";
import { Spinner } from "@/components/ui/Spinner";
import { api } from "@/lib/api";
import { STUDENT_STATUS_OPTIONS, CHALLENGE_OPTIONS } from "@/lib/constants";

export default function ProfilePage() {
  const router = useRouter();
  const { user, loading, refresh } = useAuth();

  const [displayName, setDisplayName] = useState("");
  const [currentStatus, setCurrentStatus] = useState<string>("");
  const [mainChallenge, setMainChallenge] = useState<string>("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    if (loading) return;
    if (!user) {
      router.push("/login?next=/profile");
      return;
    }
    // Initialise form fields from the auth profile once it has loaded.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setDisplayName(user.display_name ?? "");
    setCurrentStatus(user.current_status ?? "");
    setMainChallenge(user.main_challenge ?? "");
  }, [user, loading, router]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSuccess(false);
    if (displayName.trim().length < 2) {
      setError("Display name must be at least 2 characters.");
      return;
    }
    setSaving(true);
    try {
      await api.updateMe({
        display_name: displayName.trim(),
        main_challenge: mainChallenge || undefined,
      });
      await refresh();
      setSuccess(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not save your profile.");
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <div className="mx-auto flex w-full max-w-2xl items-center justify-center px-4 py-24">
        <Spinner />
      </div>
    );
  }
  if (!user) return null;

  return (
    <div className="mx-auto w-full max-w-2xl px-4 py-10 sm:px-6">
      <h1 className="text-2xl font-bold tracking-tight text-zinc-900">Your profile</h1>
      <p className="mt-1 text-sm text-zinc-600">
        Keep your details up to date so we can match you with the right circles.
      </p>

      <div className="mt-6 flex items-center gap-3">
        <div className="flex h-14 w-14 items-center justify-center rounded-full bg-indigo-100 text-xl font-semibold text-indigo-700">
          {user.display_name?.[0]?.toUpperCase() ?? "U"}
        </div>
        <div>
          <p className="font-semibold text-zinc-900">{user.display_name}</p>
          <p className="text-sm text-zinc-500">{user.email}</p>
          <Badge
            className="mt-1"
            color="bg-zinc-100 text-zinc-600"
          >
            {user.role}
          </Badge>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="mt-8">
        <Card>
          <CardBody className="space-y-5">
            {error && <Alert type="error">{error}</Alert>}
            {success && <Alert type="success">Profile saved.</Alert>}

            <div>
              <Label htmlFor="display_name" required>Display name</Label>
              <Input
                id="display_name"
                required
                minLength={2}
                maxLength={40}
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
              />
              <p className="mt-1 text-xs text-zinc-400">
                How you appear in circles. 2–40 characters, no email addresses.
              </p>
            </div>

            <div>
              <Label htmlFor="current_status">Current status</Label>
              <Select
                id="current_status"
                value={currentStatus}
                onChange={(e) => setCurrentStatus(e.target.value)}
              >
                <option value="">Prefer not to say</option>
                {STUDENT_STATUS_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </Select>
            </div>

            <div>
              <Label htmlFor="main_challenge">Main challenge</Label>
              <Select
                id="main_challenge"
                value={mainChallenge}
                onChange={(e) => setMainChallenge(e.target.value)}
              >
                <option value="">Prefer not to say</option>
                {CHALLENGE_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </Select>
              <p className="mt-1 text-xs text-zinc-400">
                This helps us suggest relevant circles for you.
              </p>
            </div>

            <Button type="submit" loading={saving} className="w-full">
              Save changes
            </Button>
          </CardBody>
        </Card>
      </form>
    </div>
  );
}

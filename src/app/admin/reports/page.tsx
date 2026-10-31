"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/components/AuthProvider";
import { Card, CardBody } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Select } from "@/components/ui/Input";
import { Alert } from "@/components/ui/Alert";
import { FullPageSpinner } from "@/components/ui/Spinner";
import { EmptyState } from "@/components/ui/EmptyState";
import { api } from "@/lib/api";
import {
  REPORT_REASON_OPTIONS,
  REPORT_STATUS_LABELS,
  REPORT_STATUS_STYLES,
  REPORT_SEVERITY_STYLES,
} from "@/lib/constants";
import { formatDateTime } from "@/lib/format";
import type { Report, ReportStatus } from "@/lib/types";

const STATUS_OPTIONS: ReportStatus[] = ["open", "in_review", "resolved", "dismissed"];

const reasonLabel = (reason: string) =>
  REPORT_REASON_OPTIONS.find((o) => o.value === reason)?.label ?? reason;

export default function AdminReportsPage() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const [reports, setReports] = useState<Report[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  async function load() {
    try {
      const { reports } = await api.getAdminReports();
      setReports(reports ?? []);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not load reports.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (authLoading) return;
    if (!user) {
      router.push("/login?next=/admin/reports");
      return;
    }
    if (user.role !== "moderator") {
      router.push("/");
      return;
    }
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, authLoading, router]);

  async function handleStatusChange(report: Report, status: ReportStatus) {
    setUpdatingId(report.id);
    try {
      const body: Record<string, unknown> = { status };
      if (status === "resolved") {
        body.resolved_at = new Date().toISOString();
      }
      const { report: updated } = await api.updateReport(report.id, body);
      setReports((prev) =>
        prev.map((r) => (r.id === report.id ? { ...r, ...updated } : r)),
      );
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not update report.");
    } finally {
      setUpdatingId(null);
    }
  }

  if (authLoading) return <FullPageSpinner />;
  if (!user || user.role !== "moderator") return null;

  return (
    <div className="mx-auto w-full max-w-4xl px-4 py-10 sm:px-6">
      <h1 className="text-2xl font-bold tracking-tight text-zinc-900">
        Safety reports
      </h1>
      <p className="mt-1 text-sm text-zinc-600">
        Review and manage reports submitted by the community.
      </p>

      <div className="mt-8">
        {loading ? (
          <FullPageSpinner label="Loading reports…" />
        ) : error ? (
          <Alert type="error">{error}</Alert>
        ) : reports.length === 0 ? (
          <EmptyState
            icon="🛡️"
            title="No reports"
            description="There are no safety reports to review right now."
          />
        ) : (
          <div className="space-y-4">
            {reports.map((r) => (
              <Card key={r.id}>
                <CardBody className="space-y-4">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div className="flex flex-wrap items-center gap-2">
                      <Badge color={REPORT_SEVERITY_STYLES[r.severity] ?? "bg-zinc-100 text-zinc-600"}>
                        {r.severity}
                      </Badge>
                      <Badge color={REPORT_STATUS_STYLES[r.status] ?? "bg-red-100 text-red-700"}>
                        {REPORT_STATUS_LABELS[r.status] ?? r.status}
                      </Badge>
                      <span className="text-sm font-medium text-zinc-700">
                        {reasonLabel(r.reason)}
                      </span>
                    </div>
                    <span className="text-xs text-zinc-400">
                      {formatDateTime(r.created_at)}
                    </span>
                  </div>

                  <div className="text-sm">
                    <p className="text-zinc-500">Reported by</p>
                    <p className="font-medium text-zinc-700">
                      {r.users?.display_name ?? "Unknown user"}
                    </p>
                  </div>

                  {r.details && (
                    <div className="rounded-xl bg-zinc-50 p-3">
                      <p className="whitespace-pre-line text-sm leading-6 text-zinc-700">
                        {r.details}
                      </p>
                    </div>
                  )}

                  <div className="flex flex-wrap items-center gap-3 border-t border-zinc-100 pt-4">
                    <label className="text-sm font-medium text-zinc-600">Update status</label>
                    <Select
                      value={r.status}
                      disabled={updatingId === r.id}
                      onChange={(e) =>
                        handleStatusChange(r, e.target.value as ReportStatus)
                      }
                      className="h-9 w-auto"
                    >
                      {STATUS_OPTIONS.map((s) => (
                        <option key={s} value={s}>
                          {REPORT_STATUS_LABELS[s]}
                        </option>
                      ))}
                    </Select>
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

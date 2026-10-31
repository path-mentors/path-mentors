// Human-readable labels and option lists for the various enums used across the app.

import type {
  ChallengeType,
  CircleStatus,
  MentorStatus,
  RegistrationStatus,
  ReportReason,
  ReportSeverity,
  ReportStatus,
  StudentStatus,
  TopicCategory,
} from "./types";

export const STUDENT_STATUS_OPTIONS: { value: StudentStatus; label: string }[] = [
  { value: "undergraduate", label: "Undergraduate" },
  { value: "postgraduate", label: "Postgraduate" },
  { value: "recent_graduate", label: "Recent Graduate" },
  { value: "other", label: "Other" },
];

export const CHALLENGE_OPTIONS: { value: ChallengeType; label: string }[] = [
  { value: "career_uncertainty", label: "Career uncertainty" },
  { value: "financial_pressure", label: "Financial pressure" },
  { value: "fear_of_rejection", label: "Fear of rejection" },
  { value: "feeling_behind_peers", label: "Feeling behind peers" },
  { value: "no_mentors_or_network", label: "No mentors or network" },
  { value: "isolation", label: "Isolation / loneliness" },
  { value: "academic_stress", label: "Academic stress" },
  { value: "other", label: "Other" },
];

export const TOPIC_CATEGORY_LABELS: Record<TopicCategory, string> = {
  wellbeing: "Wellbeing",
  career: "Career",
};

export const CIRCLE_STATUS_LABELS: Record<CircleStatus, string> = {
  draft: "Draft",
  proposed: "Proposed",
  scheduled: "Scheduled",
  completed: "Completed",
  cancelled: "Cancelled",
};

export const CIRCLE_STATUS_STYLES: Record<CircleStatus, string> = {
  draft: "bg-zinc-100 text-zinc-600",
  proposed: "bg-blue-100 text-blue-700",
  scheduled: "bg-emerald-100 text-emerald-700",
  completed: "bg-zinc-100 text-zinc-500",
  cancelled: "bg-red-100 text-red-700",
};

export const MENTOR_STATUS_LABELS: Record<MentorStatus, string> = {
  pending: "Pending review",
  approved: "Approved",
  rejected: "Rejected",
  suspended: "Suspended",
};

export const MENTOR_STATUS_STYLES: Record<MentorStatus, string> = {
  pending: "bg-amber-100 text-amber-700",
  approved: "bg-emerald-100 text-emerald-700",
  rejected: "bg-red-100 text-red-700",
  suspended: "bg-zinc-100 text-zinc-500",
};

export const REGISTRATION_STATUS_LABELS: Record<RegistrationStatus, string> = {
  registered: "Registered",
  cancelled: "Cancelled",
  attended: "Attended",
  no_show: "No-show",
};

export const REGISTRATION_STATUS_STYLES: Record<RegistrationStatus, string> = {
  registered: "bg-emerald-100 text-emerald-700",
  cancelled: "bg-red-100 text-red-700",
  attended: "bg-blue-100 text-blue-700",
  no_show: "bg-zinc-100 text-zinc-500",
};

export const REPORT_REASON_OPTIONS: { value: ReportReason; label: string }[] = [
  { value: "inappropriate_content", label: "Inappropriate content" },
  { value: "harassment", label: "Harassment" },
  { value: "unsafe_advice", label: "Unsafe advice" },
  { value: "impersonation", label: "Impersonation" },
  { value: "privacy_concern", label: "Privacy concern" },
  { value: "crisis_concern", label: "Crisis concern" },
  { value: "other", label: "Other" },
];

export const REPORT_SEVERITY_OPTIONS: { value: ReportSeverity; label: string }[] = [
  { value: "low", label: "Low" },
  { value: "medium", label: "Medium" },
  { value: "high", label: "High" },
  { value: "crisis", label: "Crisis" },
];

export const REPORT_STATUS_LABELS: Record<ReportStatus, string> = {
  open: "Open",
  in_review: "In review",
  resolved: "Resolved",
  dismissed: "Dismissed",
};

export const REPORT_STATUS_STYLES: Record<ReportStatus, string> = {
  open: "bg-red-100 text-red-700",
  in_review: "bg-amber-100 text-amber-700",
  resolved: "bg-emerald-100 text-emerald-700",
  dismissed: "bg-zinc-100 text-zinc-500",
};

export const REPORT_SEVERITY_STYLES: Record<ReportSeverity, string> = {
  low: "bg-zinc-100 text-zinc-600",
  medium: "bg-amber-100 text-amber-700",
  high: "bg-orange-100 text-orange-700",
  crisis: "bg-red-600 text-white",
};

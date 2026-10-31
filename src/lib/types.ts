// Shared TypeScript types for the PathMentors frontend.
// These mirror the database schema and API response shapes.

export type UserRole = "student" | "mentor" | "moderator";
export type UserStatus = "active" | "suspended";
export type StudentStatus =
  | "undergraduate"
  | "postgraduate"
  | "recent_graduate"
  | "other";
export type ChallengeType =
  | "career_uncertainty"
  | "financial_pressure"
  | "fear_of_rejection"
  | "feeling_behind_peers"
  | "no_mentors_or_network"
  | "isolation"
  | "academic_stress"
  | "other";
export type TopicCategory = "wellbeing" | "career";
export type MentorStatus = "pending" | "approved" | "rejected" | "suspended";
export type CircleStatus =
  | "draft"
  | "proposed"
  | "scheduled"
  | "completed"
  | "cancelled";
export type RegistrationStatus =
  | "registered"
  | "cancelled"
  | "attended"
  | "no_show";
export type ReportReason =
  | "inappropriate_content"
  | "harassment"
  | "unsafe_advice"
  | "impersonation"
  | "privacy_concern"
  | "crisis_concern"
  | "other";
export type ReportSeverity = "low" | "medium" | "high" | "crisis";
export type ReportStatus = "open" | "in_review" | "resolved" | "dismissed";

export interface Profile {
  id: string;
  email: string | null;
  role: UserRole;
  status: UserStatus;
  display_name: string;
  current_status?: StudentStatus | null;
  main_challenge?: ChallengeType | null;
  disclaimer_accepted_at?: string | null;
  guidelines_accepted_at?: string | null;
  onboarding_completed_at?: string | null;
  created_at?: string;
  updated_at?: string;
}

export interface Topic {
  id: string;
  slug: string;
  name: string;
  description?: string | null;
  category: TopicCategory;
  is_active: boolean;
  sort_order: number;
}

export interface Mentor {
  id: string;
  user_id: string;
  field: string;
  current_position: string;
  languages: string[];
  bio: string | null;
  availability: string | null;
  lived_experience?: string | null;
  motivation?: string | null;
  status: MentorStatus;
  rejection_reason?: string | null;
  reviewed_by?: string | null;
  reviewed_at?: string | null;
  training_completed_at?: string | null;
  code_of_conduct_accepted_at?: string | null;
  created_at?: string;
  updated_at?: string;
  // joined from users table
  users?: { display_name: string; email?: string } | null;
}

export interface Circle {
  id: string;
  title: string;
  description: string;
  topic_id: string;
  starts_at: string;
  ends_at: string;
  capacity: number;
  mentor_id: string | null;
  status: CircleStatus;
  cancellation_reason?: string | null;
  created_at?: string;
  updated_at?: string;
  topics?: Topic | null;
  mentors?: (Mentor & { users?: { display_name: string } | null }) | null;
  circle_meeting_links?: { meeting_link: string } | null;
}

export interface Registration {
  id: string;
  user_id: string;
  circle_id: string;
  status: RegistrationStatus;
  cancelled_at?: string | null;
  attended_at?: string | null;
  created_at?: string;
  updated_at?: string;
  users?: { display_name: string } | null;
}

export interface Feedback {
  id: string;
  registration_id: string;
  feeling_before: number;
  feeling_after: number;
  connection_rating: number;
  confidence_change: number;
  next_step: string;
  next_step_completed: boolean;
  next_step_completed_at?: string | null;
  comment?: string | null;
  created_at?: string;
  updated_at?: string;
}

export interface Report {
  id: string;
  user_id: string | null;
  circle_id?: string | null;
  reported_user_id?: string | null;
  reason: ReportReason;
  details?: string | null;
  severity: ReportSeverity;
  status: ReportStatus;
  assigned_to?: string | null;
  first_response_at?: string | null;
  resolved_at?: string | null;
  resolved_by?: string | null;
  resolution_notes?: string | null;
  created_at?: string;
  updated_at?: string;
  users?: { display_name: string } | null;
}

export interface ReferralResource {
  id: string;
  name: string;
  description?: string | null;
  resource_link?: string | null;
  phone?: string | null;
  country_code?: string | null;
  is_emergency: boolean;
  is_active: boolean;
  sort_order: number;
}

// Lightweight typed fetch helpers for calling the existing API routes.
// All helpers throw an Error with a human-readable message on failure.

async function request<T>(
  url: string,
  options?: RequestInit,
): Promise<T> {
  const res = await fetch(url, {
    headers: { "Content-Type": "application/json" },
    ...options,
  });

  let payload: unknown;
  try {
    payload = await res.json();
  } catch {
    payload = null;
  }

  if (!res.ok) {
    const message =
      (payload && typeof payload === "object" && "error" in payload
        ? String((payload as Record<string, unknown>).error)
        : null) ?? `Request failed (${res.status})`;
    throw new Error(message);
  }

  return payload as T;
}

// ---------------------------------------------------------------------------
// Auth
// ---------------------------------------------------------------------------

export const api = {
  signup: (body: { email: string; password: string; display_name: string }) =>
    request<{ user: { id: string; email?: string } | null }>(
      "/api/auth/signup",
      { method: "POST", body: JSON.stringify(body) },
    ),

  login: (body: { email: string; password: string }) =>
    request<{ session: unknown; user: { id: string; email?: string } }>(
      "/api/auth/login",
      { method: "POST", body: JSON.stringify(body) },
    ),

  logout: () =>
    request<{ message: string }>("/api/auth/logout", { method: "POST" }),

  getMe: () =>
    request<{ user: import("./types").Profile }>("/api/auth/me"),

  updateMe: (body: Partial<{ display_name: string; interests: string[]; main_challenge: string }>) =>
    request<{ user: import("./types").Profile }>("/api/auth/me", {
      method: "PATCH",
      body: JSON.stringify(body),
    }),

  // Circles
  getCircles: (params?: { topic?: string; status?: string }) => {
    const qs = new URLSearchParams();
    if (params?.topic) qs.set("topic", params.topic);
    if (params?.status) qs.set("status", params.status);
    const suffix = qs.toString() ? `?${qs.toString()}` : "";
    return request<{ circles: import("./types").Circle[] }>(`/api/circles${suffix}`);
  },

  getCircle: (id: string) =>
    request<{ circle: import("./types").Circle }>(`/api/circles/${id}`),

  registerForCircle: (id: string) =>
    request<{ success: boolean; message: string }>(`/api/circles/${id}/register`, {
      method: "POST",
    }),

  cancelRegistration: (id: string) =>
    request<{ success: boolean; message: string }>(`/api/circles/${id}/register`, {
      method: "DELETE",
    }),

  getRegistrations: (id: string) =>
    request<{ registrations: import("./types").Registration[] }>(
      `/api/circles/${id}/registrations`,
    ),

  // Mentors
  getMentors: (params?: { field?: string; language?: string }) => {
    const qs = new URLSearchParams();
    if (params?.field) qs.set("field", params.field);
    if (params?.language) qs.set("language", params.language);
    const suffix = qs.toString() ? `?${qs.toString()}` : "";
    return request<{ mentors: import("./types").Mentor[] }>(`/api/mentors${suffix}`);
  },

  getMentor: (id: string) =>
    request<{ mentor: import("./types").Mentor }>(`/api/mentors/${id}`),

  applyMentor: (body: {
    field: string;
    current_position: string;
    languages: string[];
    bio?: string;
    availability?: string;
  }) =>
    request<{ application: import("./types").Mentor }>("/api/mentors/apply", {
      method: "POST",
      body: JSON.stringify(body),
    }),

  // Mentor dashboard
  getMentorDashboard: () =>
    request<{ circles: (import("./types").Circle & { registrations?: import("./types").Registration[] })[] }>(
      "/api/mentor/dashboard",
    ),

  // My circles (registrations aligned with the real schema)
  getMyRegistrations: () =>
    request<{
      registrations: Array<{
        id: string;
        status: import("./types").RegistrationStatus;
        created_at: string;
        attended_at: string | null;
        cancelled_at: string | null;
        circles: import("./types").Circle | null;
      }>;
    }>("/api/users/me/registrations"),

  // Topics derived list (no dedicated endpoint; fetched via circles join)

  // Feedback
  submitFeedback: (body: {
    registration_id: string;
    feeling_before: number;
    feeling_after: number;
    connection_rating: number;
    confidence_change: number;
    next_step: string;
    comment?: string;
  }) =>
    request<{ success: boolean; feedback: import("./types").Feedback }>(
      "/api/feedback",
      { method: "POST", body: JSON.stringify(body) },
    ),

  // Reports
  submitReport: (body: {
    circle_id?: string;
    reported_user_id?: string;
    reason: string;
    details?: string;
    severity?: string;
  }) =>
    request<{ success: boolean; message: string; report: import("./types").Report }>(
      "/api/reports",
      { method: "POST", body: JSON.stringify(body) },
    ),

  // Admin
  getAdminReports: () =>
    request<{ reports: import("./types").Report[] }>("/api/admin/reports"),

  getPendingMentors: (status?: string) => {
    const qs = status ? `?status=${encodeURIComponent(status)}` : "";
    return request<{ mentors: import("./types").Mentor[] }>(`/api/admin/mentors${qs}`);
  },

  reviewMentor: (id: string, body: { status: "approved" | "rejected"; rejection_reason?: string }) =>
    request<{ mentor: import("./types").Mentor }>(`/api/admin/mentors/${id}`, {
      method: "PATCH",
      body: JSON.stringify(body),
    }),

  updateReport: (id: string, body: Record<string, unknown>) =>
    request<{ report: import("./types").Report }>(`/api/reports/${id}`, {
      method: "PATCH",
      body: JSON.stringify(body),
    }),
};

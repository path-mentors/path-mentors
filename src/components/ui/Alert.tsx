import { type ReactNode } from "react";

type AlertType = "error" | "success" | "info" | "warning";

const styles: Record<AlertType, string> = {
  error: "bg-red-50 border-red-200 text-red-800",
  success: "bg-emerald-50 border-emerald-200 text-emerald-800",
  info: "bg-blue-50 border-blue-200 text-blue-800",
  warning: "bg-amber-50 border-amber-200 text-amber-800",
};

export function Alert({
  type = "info",
  children,
  className = "",
}: {
  type?: AlertType;
  children: ReactNode;
  className?: string;
}) {
  return (
    <div
      className={`rounded-xl border px-4 py-3 text-sm ${styles[type]} ${className}`}
      role={type === "error" ? "alert" : "status"}
    >
      {children}
    </div>
  );
}

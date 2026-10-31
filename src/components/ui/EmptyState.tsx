import { type ReactNode } from "react";

export function EmptyState({
  icon,
  title,
  description,
  action,
}: {
  icon?: ReactNode;
  title: string;
  description?: string;
  action?: ReactNode;
}) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 rounded-2xl border border-dashed border-zinc-300 bg-zinc-50/50 px-6 py-16 text-center">
      {icon && <div className="text-3xl text-zinc-300">{icon}</div>}
      <div>
        <p className="text-sm font-semibold text-zinc-700">{title}</p>
        {description && (
          <p className="mx-auto mt-1 max-w-sm text-sm text-zinc-500">{description}</p>
        )}
      </div>
      {action && <div className="mt-2">{action}</div>}
    </div>
  );
}

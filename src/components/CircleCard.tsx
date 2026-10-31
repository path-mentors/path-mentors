import Link from "next/link";
import { Card, CardBody } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { formatDate, formatTime, formatDuration, isPast } from "@/lib/format";
import { CIRCLE_STATUS_STYLES, CIRCLE_STATUS_LABELS, TOPIC_CATEGORY_LABELS } from "@/lib/constants";
import type { Circle } from "@/lib/types";

export function CircleCard({ circle }: { circle: Circle }) {
  const topic = circle.topics;
  const mentorName = circle.mentors?.users?.display_name ?? "TBA";
  const ended = isPast(circle.ends_at);
  const statusStyle = CIRCLE_STATUS_STYLES[circle.status] ?? "bg-zinc-100 text-zinc-600";

  return (
    <Link href={`/circles/${circle.id}`} className="block h-full">
      <Card className="h-full transition-shadow hover:shadow-md">
        <CardBody className="flex h-full flex-col gap-3">
          <div className="flex items-center justify-between gap-2">
            <div className="flex flex-wrap items-center gap-2">
              {topic && (
                <Badge color="bg-indigo-50 text-indigo-700">
                  {topic.name}
                </Badge>
              )}
              <Badge color={statusStyle}>
                {CIRCLE_STATUS_LABELS[circle.status]}
              </Badge>
            </div>
            {ended && (
              <span className="text-xs text-zinc-400">Ended</span>
            )}
          </div>

          <h3 className="text-lg font-semibold leading-snug text-zinc-900">
            {circle.title}
          </h3>
          <p className="line-clamp-2 text-sm leading-6 text-zinc-600">
            {circle.description}
          </p>

          <div className="mt-auto flex flex-col gap-2 pt-2 text-sm text-zinc-500">
            <div className="flex items-center gap-2">
              <svg className="h-4 w-4 text-zinc-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><rect x="3" y="4" width="18" height="18" rx="2" /><line x1="16" y1="2" x2="16" y2="6" /><line x1="8" y1="2" x2="8" y2="6" /><line x1="3" y1="10" x2="21" y2="10" /></svg>
              <span>{formatDate(circle.starts_at)}</span>
              <span className="text-zinc-300">·</span>
              <span>{formatTime(circle.starts_at)}</span>
              <span className="text-zinc-300">·</span>
              <span>{formatDuration(circle.starts_at, circle.ends_at)}</span>
            </div>
            <div className="flex items-center gap-2">
              <svg className="h-4 w-4 text-zinc-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><circle cx="12" cy="8" r="4" /><path d="M4 21a8 8 0 0 1 16 0" /></svg>
              <span>Mentored by {mentorName}</span>
            </div>
            {topic?.category && (
              <div className="flex items-center gap-2">
                <svg className="h-4 w-4 text-zinc-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M7 17h10M7 7h10M7 12h6" /></svg>
                <span>{TOPIC_CATEGORY_LABELS[topic.category]} track</span>
              </div>
            )}
          </div>
        </CardBody>
      </Card>
    </Link>
  );
}

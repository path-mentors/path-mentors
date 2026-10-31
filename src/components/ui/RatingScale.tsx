"use client";

// A simple accessible 1–N rating scale rendered as selectable buttons.
const FEELING_EMOJI = ["😟", "😕", "😐", "🙂", "😄"];
const FEELING_LABELS = ["Struggling", "Low", "Neutral", "Good", "Great"];

export function FeelingScale({
  value,
  onChange,
  name,
}: {
  value: number | null;
  onChange: (v: number) => void;
  name: string;
}) {
  return (
    <div className="flex flex-wrap gap-2">
      {[1, 2, 3, 4, 5].map((n) => (
        <button
          key={n}
          type="button"
          aria-label={`${name}: ${FEELING_LABELS[n - 1]}`}
          aria-pressed={value === n}
          onClick={() => onChange(n)}
          className={`flex h-16 w-16 flex-col items-center justify-center gap-0.5 rounded-xl border-2 text-2xl transition-all ${
            value === n
              ? "border-indigo-500 bg-indigo-50 scale-105"
              : "border-zinc-200 bg-white hover:border-zinc-300"
          }`}
        >
          <span>{FEELING_EMOJI[n - 1]}</span>
          <span className="text-[10px] font-medium text-zinc-500">
            {FEELING_LABELS[n - 1]}
          </span>
        </button>
      ))}
    </div>
  );
}

export function StarScale({
  value,
  onChange,
  label,
}: {
  value: number | null;
  onChange: (v: number) => void;
  label: string;
}) {
  return (
    <div className="flex flex-wrap items-center gap-1.5">
      {[1, 2, 3, 4, 5].map((n) => (
        <button
          key={n}
          type="button"
          aria-label={`${label}: ${n}`}
          aria-pressed={value === n}
          onClick={() => onChange(n)}
          className={`flex h-11 w-11 items-center justify-center rounded-lg border-2 text-xl transition-all ${
            value && value >= n
              ? "border-amber-400 bg-amber-50"
              : "border-zinc-200 bg-white hover:border-zinc-300"
          }`}
        >
          ★
        </button>
      ))}
      {value ? (
        <span className="ml-2 text-sm font-medium text-zinc-600">{value}/5</span>
      ) : null}
    </div>
  );
}

const CONFIDENCE_LABELS: Record<number, string> = {
  [-2]: "Much lower",
  [-1]: "A bit lower",
  0: "Same",
  1: "A bit higher",
  2: "Much higher",
};

export function ConfidenceScale({
  value,
  onChange,
}: {
  value: number | null;
  onChange: (v: number) => void;
}) {
  return (
    <div className="flex flex-wrap gap-2">
      {[-2, -1, 0, 1, 2].map((n) => (
        <button
          key={n}
          type="button"
          aria-label={`Confidence change: ${CONFIDENCE_LABELS[n]}`}
          aria-pressed={value === n}
          onClick={() => onChange(n)}
          className={`flex h-12 items-center justify-center rounded-lg border-2 px-3 text-sm font-medium transition-all ${
            value === n
              ? "border-indigo-500 bg-indigo-50 text-indigo-700"
              : "border-zinc-200 bg-white text-zinc-600 hover:border-zinc-300"
          }`}
        >
          {n > 0 ? `+${n}` : n}
        </button>
      ))}
    </div>
  );
}

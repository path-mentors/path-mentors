import { Suspense } from "react";
import { Spinner } from "@/components/ui/Spinner";
import FeedbackForm from "./FeedbackForm";

export default function FeedbackPage() {
  return (
    <div className="mx-auto w-full max-w-2xl px-4 py-10 sm:px-6">
      <div className="mb-8 text-center">
        <h1 className="text-2xl font-bold tracking-tight text-zinc-900">
          Share your feedback
        </h1>
        <p className="mt-2 text-sm text-zinc-600">
          Your reflections help improve every circle — and help you grow.
        </p>
      </div>
      <Suspense
        fallback={
          <div className="flex items-center justify-center py-16">
            <Spinner />
          </div>
        }
      >
        <FeedbackForm />
      </Suspense>
    </div>
  );
}

import { Suspense } from "react";
import { Spinner } from "@/components/ui/Spinner";
import { MentorDetail } from "./MentorDetail";

export default async function MentorDetailPage({
  params,
}: PageProps<"/mentors/[id]">) {
  const { id } = await params;
  return (
    <Suspense
      fallback={
        <div className="mx-auto flex w-full max-w-3xl items-center justify-center px-4 py-24">
          <Spinner />
        </div>
      }
    >
      <MentorDetail id={id} />
    </Suspense>
  );
}

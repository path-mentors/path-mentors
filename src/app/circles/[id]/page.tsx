import { Suspense } from "react";
import { Spinner } from "@/components/ui/Spinner";
import { CircleDetail } from "./CircleDetail";

export default async function CircleDetailPage({
  params,
}: PageProps<"/circles/[id]">) {
  const { id } = await params;
  return (
    <Suspense
      fallback={
        <div className="mx-auto flex w-full max-w-3xl items-center justify-center px-4 py-24">
          <Spinner />
        </div>
      }
    >
      <CircleDetail id={id} />
    </Suspense>
  );
}

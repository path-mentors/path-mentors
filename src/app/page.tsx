import Link from "next/link";
import { Card, CardBody } from "@/components/ui/Card";

const FEATURES = [
  {
    title: "Small group circles",
    description:
      "Join intimate sessions of peers and a vetted mentor — never a crowded lecture or a cold 1:1.",
    icon: "🫂",
  },
  {
    title: "Mentors with lived experience",
    description:
      "Every mentor has been there. They share real stories, not textbook advice.",
    icon: "🧭",
  },
  {
    title: "Wellbeing & career tracks",
    description:
      "Pick topics that match where you are — from academic stress to navigating your first role.",
    icon: "🌱",
  },
  {
    title: "Safe & moderated",
    description:
      "Guidelines, code of conduct, and human moderation keep every circle supportive.",
    icon: "🛡️",
  },
];

const STEPS = [
  {
    step: "1",
    title: "Create your account",
    description: "Sign up in seconds and tell us where you are in your journey.",
  },
  {
    step: "2",
    title: "Browse circles",
    description: "Find a group session on a topic that resonates with you.",
  },
  {
    step: "3",
    title: "Register & attend",
    description: "Reserve your spot, join the call, and connect with your circle.",
  },
  {
    step: "4",
    title: "Reflect & grow",
    description: "Share quick feedback and commit to one practical next step.",
  },
];

export default function Home() {
  return (
    <div className="flex flex-col">
      {/* Hero */}
      <section className="relative overflow-hidden bg-gradient-to-b from-indigo-50 via-white to-white">
        <div className="mx-auto max-w-6xl px-4 py-20 sm:px-6 sm:py-28">
          <div className="mx-auto max-w-3xl text-center">
            <span className="inline-flex items-center rounded-full border border-indigo-100 bg-indigo-50 px-3 py-1 text-xs font-medium text-indigo-700">
              Peer support, one circle at a time
            </span>
            <h1 className="mt-6 text-4xl font-bold tracking-tight text-zinc-900 sm:text-5xl">
              You don&apos;t have to figure it out alone.
            </h1>
            <p className="mx-auto mt-6 max-w-2xl text-lg leading-8 text-zinc-600">
              PathMentors connects students with mentors who&apos;ve been there.
              Join small, supportive group circles on the things that actually
              matter — wellbeing, career, and everything in between.
            </p>
            <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
              <Link
                href="/signup"
                className="inline-flex h-12 items-center justify-center rounded-xl bg-indigo-600 px-6 text-base font-medium text-white shadow-sm transition-colors hover:bg-indigo-700"
              >
                Get started — it&apos;s free
              </Link>
              <Link
                href="/circles"
                className="inline-flex h-12 items-center justify-center rounded-xl border border-zinc-300 bg-white px-6 text-base font-medium text-zinc-700 transition-colors hover:bg-zinc-50"
              >
                Browse circles
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="mx-auto w-full max-w-6xl px-4 py-16 sm:px-6">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-3xl font-bold tracking-tight text-zinc-900">
            Built around real connection
          </h2>
          <p className="mt-3 text-zinc-600">
            Not another forum. Not another course. Just honest, small-group
            conversations led by people who understand.
          </p>
        </div>
        <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {FEATURES.map((f) => (
            <Card key={f.title} className="h-full transition-shadow hover:shadow-md">
              <CardBody className="flex h-full flex-col gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-indigo-50 text-xl">
                  {f.icon}
                </div>
                <h3 className="font-semibold text-zinc-900">{f.title}</h3>
                <p className="text-sm leading-6 text-zinc-600">{f.description}</p>
              </CardBody>
            </Card>
          ))}
        </div>
      </section>

      {/* How it works */}
      <section className="bg-white py-16">
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="text-3xl font-bold tracking-tight text-zinc-900">
              How it works
            </h2>
            <p className="mt-3 text-zinc-600">
              Four simple steps from sign-up to growth.
            </p>
          </div>
          <ol className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {STEPS.map((s) => (
              <li key={s.step} className="relative">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-indigo-600 text-sm font-bold text-white">
                  {s.step}
                </div>
                <h3 className="mt-4 font-semibold text-zinc-900">{s.title}</h3>
                <p className="mt-1.5 text-sm leading-6 text-zinc-600">
                  {s.description}
                </p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* CTA */}
      <section className="mx-auto w-full max-w-6xl px-4 py-16 sm:px-6">
        <div className="rounded-3xl bg-indigo-600 px-6 py-14 text-center sm:px-12">
          <h2 className="text-3xl font-bold tracking-tight text-white">
            Ready to find your circle?
          </h2>
          <p className="mx-auto mt-3 max-w-xl text-indigo-100">
            Create a free account and join a supportive group session today.
          </p>
          <Link
            href="/signup"
            className="mt-8 inline-flex h-12 items-center justify-center rounded-xl bg-white px-6 text-base font-medium text-indigo-700 shadow-sm transition-colors hover:bg-indigo-50"
          >
            Sign up now
          </Link>
        </div>
      </section>
    </div>
  );
}

import Link from "next/link";

export function Footer() {
  return (
    <footer className="mt-auto border-t border-zinc-200 bg-white">
      <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-4 px-4 py-8 sm:flex-row sm:px-6">
        <div className="flex items-center gap-2 text-sm text-zinc-500">
          <span className="flex h-7 w-7 items-center justify-center rounded-md bg-indigo-600 text-xs font-bold text-white">
            P
          </span>
          <span className="font-medium text-zinc-700">PathMentors</span>
          <span className="hidden sm:inline">· Peer support, one circle at a time</span>
        </div>
        <nav className="flex flex-wrap items-center justify-center gap-x-5 gap-y-2 text-sm text-zinc-500">
          <Link href="/circles" className="hover:text-zinc-900">Circles</Link>
          <Link href="/mentors" className="hover:text-zinc-900">Mentors</Link>
          <Link href="/report" className="hover:text-zinc-900">Safety</Link>
          <Link href="/profile" className="hover:text-zinc-900">Profile</Link>
        </nav>
      </div>
    </footer>
  );
}

"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";
import { useAuth } from "./AuthProvider";
import { api } from "@/lib/api";

interface NavLink {
  href: string;
  label: string;
}

const PUBLIC_LINKS: NavLink[] = [
  { href: "/circles", label: "Circles" },
  { href: "/mentors", label: "Mentors" },
];

export function Navbar() {
  const { user, loading, clear, refresh } = useAuth();
  const pathname = usePathname();
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);

  const isMod = user?.role === "moderator";
  const isMentor = user?.role === "mentor";

  const links: NavLink[] = [
    ...PUBLIC_LINKS,
    ...(user ? [{ href: "/my-circles", label: "My Circles" }] : []),
    ...(user && !isMentor && !isMod
      ? [{ href: "/become-mentor", label: "Become a Mentor" }]
      : []),
    ...(isMentor ? [{ href: "/mentor/dashboard", label: "Dashboard" }] : []),
    ...(isMod
      ? [
          { href: "/admin/mentors", label: "Review Mentors" },
          { href: "/admin/reports", label: "Reports" },
        ]
      : []),
  ];

  async function handleLogout() {
    setLoggingOut(true);
    try {
      await api.logout();
    } catch {
      /* ignore — cookies may already be cleared */
    }
    clear();
    setOpen(false);
    router.push("/");
    router.refresh();
    setLoggingOut(false);
    void refresh();
  }

  return (
    <header className="sticky top-0 z-50 border-b border-zinc-200 bg-white/85 backdrop-blur-md">
      <nav className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6">
        {/* Brand */}
        <Link href="/" className="flex items-center gap-2 font-semibold text-zinc-900">
          <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-600 text-sm font-bold text-white">
            P
          </span>
          <span className="text-lg tracking-tight">PathMentors</span>
        </Link>

        {/* Desktop links */}
        <div className="hidden items-center gap-1 md:flex">
          {links.map((link) => {
            const active = pathname === link.href;
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                  active
                    ? "bg-indigo-50 text-indigo-700"
                    : "text-zinc-600 hover:bg-zinc-100 hover:text-zinc-900"
                }`}
              >
                {link.label}
              </Link>
            );
          })}
        </div>

        {/* Desktop auth actions */}
        <div className="hidden items-center gap-3 md:flex">
          {loading ? (
            <span className="h-8 w-20 animate-pulse rounded-lg bg-zinc-100" />
          ) : user ? (
            <div className="flex items-center gap-3">
              <Link
                href="/profile"
                className="flex items-center gap-2 text-sm text-zinc-700 hover:text-zinc-900"
              >
                <span className="flex h-8 w-8 items-center justify-center rounded-full bg-indigo-100 text-xs font-semibold text-indigo-700">
                  {user.display_name?.[0]?.toUpperCase() ?? "U"}
                </span>
                <span className="max-w-[120px] truncate">{user.display_name}</span>
              </Link>
              <button
                onClick={handleLogout}
                disabled={loggingOut}
                className="text-sm font-medium text-zinc-500 hover:text-zinc-900 disabled:opacity-50"
              >
                {loggingOut ? "…" : "Log out"}
              </button>
            </div>
          ) : (
            <>
              <Link
                href="/login"
                className="rounded-lg px-3 py-2 text-sm font-medium text-zinc-600 hover:text-zinc-900"
              >
                Log in
              </Link>
              <Link
                href="/signup"
                className="rounded-xl bg-indigo-600 px-4 py-2 text-sm font-medium text-white shadow-sm transition-colors hover:bg-indigo-700"
              >
                Sign up
              </Link>
            </>
          )}
        </div>

        {/* Mobile toggle */}
        <button
          className="flex h-10 w-10 items-center justify-center rounded-lg text-zinc-600 hover:bg-zinc-100 md:hidden"
          onClick={() => setOpen((v) => !v)}
          aria-label="Toggle menu"
          aria-expanded={open}
        >
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
            {open ? (
              <>
                <line x1="18" y1="6" x2="6" y2="18" />
                <line x1="6" y1="6" x2="18" y2="18" />
              </>
            ) : (
              <>
                <line x1="3" y1="6" x2="21" y2="6" />
                <line x1="3" y1="12" x2="21" y2="12" />
                <line x1="3" y1="18" x2="21" y2="18" />
              </>
            )}
          </svg>
        </button>
      </nav>

      {/* Mobile menu */}
      {open && (
        <div className="border-t border-zinc-100 bg-white px-4 pb-4 pt-2 md:hidden">
          <div className="flex flex-col gap-1">
            {links.map((link) => {
              const active = pathname === link.href;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setOpen(false)}
                  className={`rounded-lg px-3 py-2.5 text-sm font-medium ${
                    active ? "bg-indigo-50 text-indigo-700" : "text-zinc-700 hover:bg-zinc-100"
                  }`}
                >
                  {link.label}
                </Link>
              );
            })}
            <div className="my-2 h-px bg-zinc-100" />
            {user ? (
              <>
                <Link
                  href="/profile"
                  onClick={() => setOpen(false)}
                  className="rounded-lg px-3 py-2.5 text-sm font-medium text-zinc-700 hover:bg-zinc-100"
                >
                  Profile ({user.display_name})
                </Link>
                <button
                  onClick={handleLogout}
                  disabled={loggingOut}
                  className="rounded-lg px-3 py-2.5 text-left text-sm font-medium text-red-600 hover:bg-red-50 disabled:opacity-50"
                >
                  {loggingOut ? "Logging out…" : "Log out"}
                </button>
              </>
            ) : (
              <>
                <Link
                  href="/login"
                  onClick={() => setOpen(false)}
                  className="rounded-lg px-3 py-2.5 text-sm font-medium text-zinc-700 hover:bg-zinc-100"
                >
                  Log in
                </Link>
                <Link
                  href="/signup"
                  onClick={() => setOpen(false)}
                  className="rounded-xl bg-indigo-600 px-3 py-2.5 text-center text-sm font-medium text-white"
                >
                  Sign up
                </Link>
              </>
            )}
          </div>
        </div>
      )}
    </header>
  );
}

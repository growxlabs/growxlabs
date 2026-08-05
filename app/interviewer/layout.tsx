"use client";

import React from "react";
import Link from "next/link";
import { useSession, signOut } from "next-auth/react";
import { ShieldCheck, LogOut, Briefcase, UserCheck, Calendar } from "lucide-react";

export default function InterviewerLayout({ children }: { children: React.ReactNode }) {
  const { data: session } = useSession();

  return (
    <div className="min-h-screen bg-[#f8fafc] text-slate-900 font-sans flex flex-col">
      {/* Top Header */}
      <header className="sticky top-0 z-50 bg-[#0f172a] text-white border-b border-slate-800 shadow-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link href="/interviewer" className="flex items-center gap-2">
              <div className="h-9 w-9 rounded-xl bg-blue-600 flex items-center justify-center text-white font-extrabold text-lg shadow-sm">
                G
              </div>
              <div>
                <span className="font-extrabold tracking-tight text-base block text-white leading-none">GrowXLabs</span>
                <span className="text-[10px] uppercase font-bold text-blue-400 tracking-wider">Interviewer Workspace</span>
              </div>
            </Link>
          </div>

          {/* User & Active Partner Info */}
          <div className="flex items-center gap-4">
            <div className="hidden sm:flex items-center gap-2 px-3 py-1 rounded-full bg-slate-800 border border-slate-700 text-xs font-semibold text-slate-300">
              <ShieldCheck size={14} className="text-emerald-400" />
              <span>Secure Temporary Session</span>
            </div>

            {session?.user && (
              <div className="flex items-center gap-3 border-l border-slate-800 pl-4">
                <div className="text-right hidden sm:block">
                  <span className="block text-xs font-bold text-white">{session.user.name || session.user.email}</span>
                  <span className="block text-[10px] text-slate-400">{session.user.email}</span>
                </div>

                <button
                  onClick={() => signOut({ callbackUrl: "/login" })}
                  className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors cursor-pointer"
                  title="Sign Out"
                >
                  <LogOut size={16} />
                </button>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <div className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {children}
      </div>

      {/* Footer */}
      <footer className="border-t border-slate-200 bg-white py-4 text-center text-xs text-slate-500">
        GrowXLabs Inc. — Secure Temporary Interviewer Access System &copy; {new Date().getFullYear()}
      </footer>
    </div>
  );
}

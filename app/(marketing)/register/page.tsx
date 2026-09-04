"use client";

import Link from "next/link";

export default function RegisterPage() {
  return (
    <div className="min-h-screen bg-black text-white flex flex-col justify-between selection:bg-white selection:text-black">
      {/* Top Header Bar */}
      <header className="w-full max-w-6xl mx-auto px-6 py-8 flex items-center justify-between">
        <Link 
          href="/"
          className="text-lg font-semibold tracking-tight text-white hover:text-neutral-300 transition-colors flex items-center gap-1.5"
        >
          <span className="font-serif">GrowX</span>
          <span className="font-sans font-normal text-neutral-400">Labs</span>
        </Link>

        <Link
          href="/"
          className="text-xs text-neutral-400 hover:text-white transition-colors flex items-center gap-1.5 font-medium"
        >
          <svg className="w-3.5 h-3.5" viewBox="0 0 16 16" fill="none">
            <path d="M10 13L5 8L10 3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          <span>Back to website</span>
        </Link>
      </header>

      {/* Main Corporate Card */}
      <main className="w-full max-w-md mx-auto px-6 py-12 flex-1 flex flex-col justify-center">
        <div className="bg-[#09090b] border border-white/10 rounded-xl p-8 sm:p-10 shadow-2xl space-y-6 text-left">
          
          <div className="space-y-2">
            <h1 className="text-2xl font-medium tracking-tight text-white">
              Account Registration
            </h1>
            <p className="text-sm text-neutral-400 leading-normal">
              Client workspaces are provisioned upon formal project kickoff.
            </p>
          </div>

          <div className="rounded-lg bg-neutral-900/60 border border-white/10 p-4 space-y-2 text-xs text-neutral-300 leading-relaxed">
            <p>
              If your organization has an active engagement with GrowXLabs, please open the personalized activation link sent to your corporate email.
            </p>
          </div>

          <div className="space-y-3 pt-2">
            <Link
              href="/login"
              className="w-full h-11 rounded-lg bg-white text-black text-sm font-medium hover:bg-neutral-200 transition-colors flex items-center justify-center text-center shadow-sm font-sans"
            >
              Sign in to existing account
            </Link>

            <Link
              href="/contact"
              className="w-full h-11 rounded-lg border border-white/15 text-neutral-300 hover:text-white hover:bg-white/5 text-sm font-medium transition-colors flex items-center justify-center text-center font-sans"
            >
              Contact our team
            </Link>
          </div>

          <div className="pt-4 border-t border-white/10 text-center">
            <p className="text-xs text-neutral-500">
              Need assistance? Email{" "}
              <a 
                href="mailto:support@growxlabs.tech" 
                className="text-neutral-400 hover:text-white underline underline-offset-2 transition-colors"
              >
                support@growxlabs.tech
              </a>
            </p>
          </div>

        </div>
      </main>

      {/* Corporate Footer */}
      <footer className="w-full max-w-6xl mx-auto px-6 py-6 text-center text-xs text-neutral-600">
        <p>© {new Date().getFullYear()} GrowXLabs. All rights reserved.</p>
      </footer>
    </div>
  );
}

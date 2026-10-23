"use client";

import Link from "next/link";

export default function RegisterPage() {
  return (
    <div className="min-h-screen bg-[#A2BECC] text-[#17252D] flex flex-col justify-between selection:bg-[#17252D] selection:text-[#FAFCFD]">
      {/* Top Header Bar */}
      <header className="w-full max-w-6xl mx-auto px-6 py-8 flex items-center justify-between">
        <Link 
          href="/"
          className="text-lg font-bold tracking-tight text-[#17252D] hover:text-[#55788D] transition-colors flex items-center gap-1.5 font-sans"
        >
          <span className="font-serif">GrowX</span>
          <span className="font-normal text-[#55788D]">Labs</span>
        </Link>

        <Link
          href="/"
          className="text-xs text-[#55788D] hover:text-[#17252D] transition-colors flex items-center gap-1.5 font-bold uppercase tracking-wider font-mono"
        >
          <svg className="w-3.5 h-3.5" viewBox="0 0 16 16" fill="none">
            <path d="M10 13L5 8L10 3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          <span>Back to website</span>
        </Link>
      </header>

      {/* Main Corporate Card */}
      <main className="w-full max-w-md mx-auto px-6 py-12 flex-1 flex flex-col justify-center">
        <div className="bg-[#F4F8FA] border border-[#D5E2E9] rounded-2xl p-8 sm:p-10 shadow-sm space-y-6 text-left">
          
          <div className="space-y-2">
            <h1 className="text-2xl font-bold tracking-tight text-[#17252D] font-sans">
              Account Registration
            </h1>
            <p className="text-sm text-[#55788D] leading-normal font-sans">
              Client workspaces are provisioned upon formal project kickoff.
            </p>
          </div>

          <div className="rounded-xl bg-[#E5EFF4] border border-[#D5E2E9] p-4 space-y-2 text-xs text-[#17252D] leading-relaxed">
            <p>
              If your organization has an active engagement with GrowXLabs, please open the personalized activation link sent to your corporate email.
            </p>
          </div>

          <div className="space-y-3 pt-2">
            <Link
              href="/login"
              className="w-full h-11 rounded-xl bg-[#A2BECC] text-[#17252D] text-sm font-bold hover:bg-[#17252D] hover:text-[#FAFCFD] transition-colors flex items-center justify-center text-center shadow-sm font-sans border border-[#55788D]/30"
            >
              Sign in to existing account
            </Link>

            <Link
              href="/contact"
              className="w-full h-11 rounded-xl border border-[#D5E2E9] text-[#17252D] hover:bg-[#E5EFF4] text-sm font-bold transition-colors flex items-center justify-center text-center font-sans"
            >
              Contact our team
            </Link>
          </div>

          <div className="pt-4 border-t border-[#D5E2E9] text-center">
            <p className="text-xs text-[#55788D]">
              Need assistance? Email{" "}
              <a 
                href="mailto:support@growxlabs.tech" 
                className="text-[#17252D] font-bold hover:underline transition-colors"
              >
                support@growxlabs.tech
              </a>
            </p>
          </div>

        </div>
      </main>

      {/* Corporate Footer */}
      <footer className="w-full max-w-6xl mx-auto px-6 py-6 text-center text-xs text-[#55788D] font-mono">
        <p>© {new Date().getFullYear()} GrowXLabs. All rights reserved.</p>
      </footer>
    </div>
  );
}

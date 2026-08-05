"use client";

import React, { useEffect } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/Button';
import { AlertTriangle, RefreshCcw, Home } from 'lucide-react';
import Link from 'next/link';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Application Error:", error);
  }, [error]);

  return (
    <div className="min-h-screen bg-[#F9F8F6] flex flex-col items-center justify-center p-6 text-center overflow-hidden relative font-sans">
      <div className="relative z-10 max-w-lg mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: "easeOut" }}
          className="mb-10"
        >
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-red-50 border border-red-100 mb-8">
            <AlertTriangle className="w-9 h-9 text-red-500" />
          </div>

          <h1 className="text-3xl md:text-4xl font-bold text-[#1A1A1A] tracking-tight mb-4">
            We couldn’t complete that request
          </h1>

          <p className="text-[16px] text-[#6B7280] leading-relaxed mb-10 max-w-sm mx-auto">
            Please try again. If the problem continues, return to your dashboard or contact the GrowXLabs team for support.
          </p>

          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Button
              onClick={() => reset()}
              size="lg"
              className="h-12 px-8 rounded-full bg-[#355CFF] text-white hover:bg-[#2A4AD4] font-semibold text-[15px] transition-all group shadow-none"
            >
              <RefreshCcw className="mr-2 w-4 h-4 group-hover:rotate-180 transition-transform duration-500" />
              Try again
            </Button>

            <Link href="/">
              <Button
                variant="outline"
                size="lg"
                className="h-12 px-8 rounded-full border-[#E8E6E1] text-[#1A1A1A] hover:border-[#1A1A1A] hover:bg-[#1A1A1A] hover:text-white font-semibold text-[15px] transition-all"
              >
                <Home className="mr-2 w-4 h-4" />
                Go to dashboard
              </Button>
            </Link>
          </div>
        </motion.div>

        {error.digest && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="mt-8 p-3 rounded-lg border border-[#E8E6E1] bg-white"
          >
            <p className="text-[11px] font-mono text-[#9CA3AF] tracking-wide">
              Error ref: {error.digest}
            </p>
          </motion.div>
        )}
      </div>
    </div>
  );
}

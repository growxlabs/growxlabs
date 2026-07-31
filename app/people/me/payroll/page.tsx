"use client";

import { PayrollProcessingStudio } from "@/components/payroll/PayrollProcessingStudio";
import { ReimbursementConsole } from "@/components/payroll/ReimbursementConsole";

export default function EmployeePayrollPage() {
  return (
    <main className="min-h-screen bg-background text-foreground p-6 md:p-10 space-y-8 max-w-7xl mx-auto">
      <div className="border-b border-border pb-6">
        <span className="text-[10px] font-mono uppercase tracking-widest text-emerald-500 font-bold">[ ESS PAYROLL & PAYSLIPS ]</span>
        <h1 className="text-3xl font-black tracking-tight text-foreground mt-1">My Payslips, Tax Documents & Claims</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Download monthly payslips, track expense reimbursement claims, and view annual tax statements.
        </p>
      </div>

      <PayrollProcessingStudio />
      <ReimbursementConsole />
    </main>
  );
}

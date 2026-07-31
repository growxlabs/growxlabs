"use client";

import { useState } from "react";
import { Receipt, CheckCircle2, Clock, ShieldCheck, FileCheck } from "lucide-react";

export function ReimbursementConsole() {
  const [claims] = useState([
    { id: "c1", employee: "Ananya Iyer", category: "Internet Allowance", amount: "₹2,500", status: "finance_approved", receipt: "internet_bill_jan.pdf" },
    { id: "c2", title: "Client Travel", employee: "Rahul Sharma", category: "Travel Claims", amount: "₹14,200", status: "manager_approved", receipt: "flight_ticket.pdf" },
  ]);

  return (
    <div className="space-y-6">
      <div className="border-b border-border pb-5">
        <h2 className="text-xl font-bold tracking-tight text-foreground flex items-center gap-2">
          <Receipt className="w-5 h-5 text-indigo-500" />
          Reimbursements & Expense Claims Workflow
        </h2>
        <p className="text-xs text-muted-foreground mt-1">
          4-stage approval workflow (Employee → Manager → Finance → Payroll → Paid) with receipt verification.
        </p>
      </div>

      <div className="space-y-4">
        {claims.map((claim) => (
          <div key={claim.id} className="p-5 rounded-xl border border-border bg-card flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2">
                <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-indigo-500/10 text-indigo-400">
                  {claim.category}
                </span>
                <h3 className="text-sm font-bold text-foreground">{claim.employee}</h3>
              </div>
              <p className="text-xs text-muted-foreground mt-1">Receipt: <span className="font-mono text-neutral-300">{claim.receipt}</span></p>
            </div>

            <div className="flex items-center gap-6">
              <div className="text-right">
                <span className="text-[10px] uppercase font-bold text-muted-foreground">Amount</span>
                <div className="text-base font-black text-foreground">{claim.amount}</div>
              </div>

              <span className="px-3 py-1 rounded-full text-xs font-bold capitalize bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                {claim.status.replace("_", " ")}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

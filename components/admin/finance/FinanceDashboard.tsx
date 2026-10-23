"use client";

import React from "react";
import { DollarSign, Wallet, CreditCard, TrendingUp, ArrowUpRight, ArrowDownRight, Percent } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { cn } from "@/lib/utils";

interface FinanceDashboardProps {
  stats: {
    revenue: number;
    expenses: number;
    profit: number;
    outstandingInvoices: number;
    upcomingPayments: number;
    cashBalance: number;
    receivables: number;
    payables: number;
  };
  expenseBreakdown: { category: string; value: number }[];
}

export function FinanceDashboard({ stats, expenseBreakdown }: FinanceDashboardProps) {
  const profitMargin = stats.revenue > 0 ? Math.round((stats.profit / stats.revenue) * 100) : 0;

  return (
    <div className="space-y-6">
      {/* Vital KPIs Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
        <Card className="p-5 border border-[#e6e6e6] bg-white rounded-lg shadow-sm">
          <div className="flex justify-between items-start mb-2">
            <span className="admin-kpi-label text-[10px] font-bold uppercase tracking-wider text-neutral-400">Total Cash Balance</span>
            <span className="text-green-600 bg-green-500/5 px-2 py-0.5 rounded border border-green-200 text-[8px] font-bold">Liquid</span>
          </div>
          <h3 className="admin-kpi-value text-neutral-900">₹{stats.cashBalance.toLocaleString()}</h3>
          <p className="text-[9px] text-neutral-400 mt-1 font-medium">Bank & cash accounts</p>
        </Card>

        <Card className="p-5 border border-[#e6e6e6] bg-white rounded-lg shadow-sm">
          <div className="flex justify-between items-start mb-2">
            <span className="admin-kpi-label text-[10px] font-bold uppercase tracking-wider text-neutral-400">Accounts Receivable</span>
            <span className="text-blue-600 bg-blue-500/5 px-2 py-0.5 rounded border border-blue-200 text-[8px] font-bold">Due</span>
          </div>
          <h3 className="admin-kpi-value text-neutral-900">₹{stats.receivables.toLocaleString()}</h3>
          <p className="text-[9px] text-neutral-400 mt-1 font-medium">₹{stats.outstandingInvoices.toLocaleString()} outstanding</p>
        </Card>

        <Card className="p-5 border border-[#e6e6e6] bg-white rounded-lg shadow-sm">
          <div className="flex justify-between items-start mb-2">
            <span className="admin-kpi-label text-[10px] font-bold uppercase tracking-wider text-neutral-400">Accounts Payable</span>
            <span className="text-red-500 bg-red-500/5 px-2 py-0.5 rounded border border-red-200 text-[8px] font-bold">Liability</span>
          </div>
          <h3 className="admin-kpi-value text-neutral-900">₹{stats.payables.toLocaleString()}</h3>
          <p className="text-[9px] text-neutral-400 mt-1 font-medium">₹{stats.upcomingPayments.toLocaleString()} bills due</p>
        </Card>

        <Card className="p-5 border border-[#e6e6e6] bg-white rounded-lg shadow-sm">
          <div className="flex justify-between items-start mb-2">
            <span className="admin-kpi-label text-[10px] font-bold uppercase tracking-wider text-neutral-400">Net Profit Margin</span>
            <span className="text-green-600 bg-green-500/5 px-2 py-0.5 rounded border border-green-200 text-[8px] font-bold">{profitMargin}%</span>
          </div>
          <h3 className="admin-kpi-value text-[#0075de]">₹{stats.profit.toLocaleString()}</h3>
          <p className="text-[9px] text-neutral-400 mt-1 font-medium">Revenue: ₹{stats.revenue.toLocaleString()}</p>
        </Card>
      </div>

      {/* Expense category charts */}
      <div className="grid md:grid-cols-3 gap-6">
        <Card className="md:col-span-2 p-6 border border-[#e6e6e6] bg-white rounded-lg shadow-sm space-y-4">
          <h3 className="text-xs font-bold text-neutral-900 uppercase tracking-widest border-b border-[#e6e6e6] pb-2.5 flex items-center gap-2">
            <TrendingUp size={14} className="text-[#0075de]" /> Profit & Loss Monthly Trajectory
          </h3>

          <div className="h-44 border-b border-l border-[#e6e6e6] relative flex items-end gap-5 px-6 pb-2 pt-6 font-mono text-[8px] text-neutral-405">
            {[
              { month: "May", rev: 120000, exp: 60000 },
              { month: "Jun", rev: 180000, exp: 80000 },
              { month: "Jul", rev: stats.revenue, exp: stats.expenses }
            ].map((d, idx) => {
              const max = 250000;
              const revPercent = Math.min(100, (d.rev / max) * 100);
              const expPercent = Math.min(100, (d.exp / max) * 100);

              return (
                <div key={idx} className="flex-1 flex gap-2 items-end h-full justify-center">
                  <div className="w-4 bg-[#0075de]/10 border-t-2 border-[#0075de] rounded-t-sm" style={{ height: `${revPercent}%` }} title={`Rev: ₹${d.rev}`} />
                  <div className="w-4 bg-red-500/10 border-t-2 border-red-500 rounded-t-sm" style={{ height: `${expPercent}%` }} title={`Exp: ₹${d.exp}`} />
                  <span className="absolute bottom-[-18px] text-[8px] font-sans">{d.month}</span>
                </div>
              );
            })}
          </div>
          <div className="flex gap-4 text-[9px] font-bold uppercase tracking-wider text-neutral-450 justify-end pt-3">
            <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 bg-[#0075de] rounded-sm" /> Revenue</span>
            <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 bg-red-500  rounded-sm" /> Expense</span>
          </div>
        </Card>

        {/* Expenses categories */}
        <Card className="p-6 border border-[#e6e6e6] bg-white rounded-lg shadow-sm space-y-4">
          <h3 className="text-xs font-bold text-neutral-900 uppercase tracking-widest border-b border-[#e6e6e6] pb-2.5">Expense Breakdown</h3>
          <div className="space-y-3">
            {expenseBreakdown.map((item, idx) => {
              const totalExp = stats.expenses || 1;
              const percent = Math.round((item.value / totalExp) * 100);
              return (
                <div key={idx} className="space-y-1.5 text-xs font-semibold">
                  <div className="flex justify-between">
                    <span className="text-neutral-900">{item.category}</span>
                    <span className="text-neutral-450 font-mono">₹{item.value.toLocaleString()} ({percent}%)</span>
                  </div>
                  <div className="h-2 w-full bg-[#f6f5f4] rounded-full overflow-hidden">
                    <div className="h-full bg-red-500" style={{ width: `${percent}%` }} />
                  </div>
                </div>
              );
            })}
          </div>
        </Card>
      </div>
    </div>
  );
}

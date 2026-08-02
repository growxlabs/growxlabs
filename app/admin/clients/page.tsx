"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Card } from "@/components/ui/Card";
import { Users, CreditCard, ExternalLink, ShieldCheck, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { motion, AnimatePresence } from "framer-motion";

export default function ClientsPage() {
  const router = useRouter();
  const [clients, setClients] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchClients();
  }, []);

  const fetchClients = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/clients/list");
      const data = await res.json();
      setClients(data || []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-10">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div className="space-y-1">
          <h1 className="text-3xl font-bold text-white tracking-tight">Client Partners</h1>
          <p className="text-white/40 font-medium">Manage and monitor active high-ticket partnerships.</p>
        </div>
        <Button onClick={() => router.push("/admin/leads?status=qualified")} className="bg-white text-black hover:bg-white/90 shadow-[0_0_15px_rgba(255,255,255,0.1)] px-6 py-2 h-11">
          Provision New Client
        </Button>
      </div>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {loading ? (
          <div className="col-span-full h-64 flex items-center justify-center border border-white/5 border-dashed rounded-xl">
            <Loader2 className="animate-spin text-white/20" />
          </div>
        ) : clients.length > 0 ? (
          <AnimatePresence>
            {clients.map((client, i) => (
              <motion.div
                key={client.id}
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: i * 0.05 }}
              >
                <Card className="p-6 border-white/5 rounded-2xl bg-white/[0.02] hover:bg-white/[0.04] transition-all flex flex-col h-full">
                  <div className="flex justify-between items-start mb-6">
                    <div className="h-12 w-12 rounded-xl bg-white/5 flex items-center justify-center text-primary border border-white/5">
                      <ShieldCheck size={24} />
                    </div>
                    <div className="px-3 py-1 rounded-full bg-green-500/10 border border-green-500/20">
                      <span className="text-[10px] font-bold text-green-500 uppercase tracking-widest">Active</span>
                    </div>
                  </div>

                  <div className="space-y-1 mb-6 flex-1">
                    <h3 className="text-xl font-bold text-white tracking-tight">{client.business_name || client.name}</h3>
                    <p className="text-white/20 text-[10px] font-bold tracking-widest uppercase">{client.email}</p>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <Button onClick={() => router.push(`/admin/clients?clientId=${client.id}`)} variant="outline" className="h-10 rounded-lg border-white/5 text-white/40 hover:text-white text-xs font-bold grow">
                      Profile
                    </Button>
                    <Button onClick={() => router.push(`/admin/invoices?clientId=${client.id}`)} className="h-10 rounded-lg bg-white text-black text-xs font-bold grow">
                      Billing
                    </Button>
                  </div>
                </Card>
              </motion.div>
            ))}
          </AnimatePresence>
        ) : (
          <div className="col-span-full h-64 flex flex-col items-center justify-center border border-white/5 border-dashed rounded-xl space-y-4">
            <div className="h-12 w-12 rounded-full bg-white/5 flex items-center justify-center text-white/20">
              <Users size={24} />
            </div>
            <div className="text-center">
              <p className="text-white font-bold">No clients found</p>
              <p className="text-white/20 text-sm">Convert your first lead to a client to see them here.</p>
            </div>
            <Button onClick={() => router.push("/admin/leads?status=qualified")} className="bg-white text-black h-10 px-6 mt-4">
              View Leads
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}

"use client";

import React, { useState } from "react";
import { Sparkles, Users, Mail, FileText, Download, Send, Play } from "lucide-react";

interface Stats {
  totalWishes: number;
  totalSubscribers: number;
  emailsSent: number;
  blogPostsSent: number;
}

interface WishData {
  id: string;
  name: string;
  email: string;
  wish: string;
  consequence: string;
  disclaimer_accepted: boolean;
  screen_reached: string;
  play_again_count: number;
  created_at: string;
}

interface Subscriber {
  id: string;
  name: string;
  email: string;
  created_at: string;
}

interface EmailLog {
  id: string;
  sent_at: string;
  status: string;
  email: string;
  title: string;
}

interface BlogPost {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  published_at: string;
  sent_to_subscribers: boolean;
}

interface Props {
  stats: Stats;
  initialWishes: WishData[];
  initialSubscribers: Subscriber[];
  initialEmailLogs: EmailLog[];
  blogPosts: BlogPost[];
}

type Tab = "wishes" | "subscribers" | "emailLogs" | "newsletter";

export default function WishAdminDashboardClient({
  stats,
  initialWishes,
  initialSubscribers,
  initialEmailLogs,
  blogPosts: initialBlogPosts,
}: Props) {
  const [activeTab, setActiveTab] = useState<Tab>("wishes");
  const [wishes, setWishes] = useState<WishData[]>(initialWishes);
  const [subscribers, setSubscribers] = useState<Subscriber[]>(initialSubscribers);
  const [emailLogs, setEmailLogs] = useState<EmailLog[]>(initialEmailLogs);
  const [blogPosts, setBlogPosts] = useState<BlogPost[]>(initialBlogPosts);

  // Search and Sort State
  const [wishesSearch, setWishesSearch] = useState("");
  const [subscribersSearch, setSubscribersSearch] = useState("");
  const [logsSearch, setLogsSearch] = useState("");

  const [wishesSort, setWishesSort] = useState<"latest" | "oldest">("latest");
  const [subscribersSort, setSubscribersSort] = useState<"latest" | "oldest">("latest");

  // Pagination State
  const [wishesPage, setWishesPage] = useState(1);
  const [subscribersPage, setSubscribersPage] = useState(1);
  const [logsPage, setLogsPage] = useState(1);
  const itemsPerPage = 20;

  // Newsletter Sending State
  const [selectedPostId, setSelectedPostId] = useState("");
  const [isSendingEmail, setIsSendingEmail] = useState(false);
  const [emailSendResult, setEmailSendResult] = useState<{ success: boolean; message: string } | null>(null);

  // Stats State
  const [currentStats, setCurrentStats] = useState<Stats>(stats);

  // Deletion loading map
  const [deletingEmail, setDeletingEmail] = useState<string | null>(null);

  // CSV Export Utility
  const handleCSVExport = (data: any[], filename: string) => {
    if (data.length === 0) return;
    // Extract keys for header
    const headers = Object.keys(data[0]).join(",");
    const rows = data.map((row) =>
      Object.values(row)
        .map((val) => `"${String(val ?? "").replace(/"/g, '""')}"`)
        .join(",")
    );
    const csvContent = [headers, ...rows].join("\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", filename);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Delete Subscriber logic
  const handleDeleteSubscriber = async (email: string) => {
    if (!confirm(`Are you sure you want to delete subscriber ${email}? This will unsubscribe them.`)) {
      return;
    }
    setDeletingEmail(email);
    try {
      const res = await fetch(`/api/unsubscribe?email=${encodeURIComponent(email)}`);
      if (res.ok) {
        // Remove from local lists
        setSubscribers((prev) => prev.filter((s) => s.email !== email));
        setWishes((prev) => prev.filter((w) => w.email !== email));
        // Update stats
        setCurrentStats((prev) => ({
          ...prev,
          totalSubscribers: Math.max(0, prev.totalSubscribers - 1),
        }));
      } else {
        alert("Failed to delete subscriber. Server returned an error.");
      }
    } catch (err) {
      console.error("Delete subscriber error:", err);
      alert("An error occurred while deleting the subscriber.");
    } finally {
      setDeletingEmail(null);
    }
  };

  // Send blog email manually
  const handleSendBlogEmail = async (postId: string) => {
    const post = blogPosts.find((p) => p.id === postId);
    if (!post) return;

    if (!confirm(`Send newsletter for "${post.title}" to all subscribers now?`)) {
      return;
    }

    setIsSendingEmail(true);
    setEmailSendResult(null);

    try {
      const res = await fetch("/api/send-blog-email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ blog_post_id: postId }),
      });

      const data = await res.json();

      if (res.ok && data.success) {
        setEmailSendResult({
          success: true,
          message: `Newsletter successfully dispatched to ${data.sent_count} subscribers!`,
        });
        // Mark as sent locally
        setBlogPosts((prev) =>
          prev.map((p) => (p.id === postId ? { ...p, sent_to_subscribers: true } : p))
        );
        // Refresh stats
        setCurrentStats((prev) => ({
          ...prev,
          blogPostsSent: prev.blogPostsSent + 1,
          emailsSent: prev.emailsSent + data.sent_count,
        }));
      } else {
        setEmailSendResult({
          success: false,
          message: data.error || "Failed to dispatch email newsletter.",
        });
      }
    } catch (err) {
      console.error("Send newsletter error:", err);
      setEmailSendResult({
        success: false,
        message: "An unexpected error occurred during dispatch.",
      });
    } finally {
      setIsSendingEmail(false);
    }
  };

  // Filter & Sort Wishes
  const filteredWishes = wishes
    .filter((w) => {
      const search = wishesSearch.toLowerCase();
      return (
        w.name?.toLowerCase().includes(search) ||
        w.email?.toLowerCase().includes(search) ||
        w.wish?.toLowerCase().includes(search)
      );
    })
    .sort((a, b) => {
      const dateA = new Date(a.created_at).getTime();
      const dateB = new Date(b.created_at).getTime();
      return wishesSort === "latest" ? dateB - dateA : dateA - dateB;
    });

  // Filter & Sort Subscribers
  const filteredSubscribers = subscribers
    .filter((s) => {
      const search = subscribersSearch.toLowerCase();
      return s.name?.toLowerCase().includes(search) || s.email?.toLowerCase().includes(search);
    })
    .sort((a, b) => {
      const dateA = new Date(a.created_at).getTime();
      const dateB = new Date(b.created_at).getTime();
      return subscribersSort === "latest" ? dateB - dateA : dateA - dateB;
    });

  // Filter Email Logs
  const filteredLogs = emailLogs.filter((l) => {
    const search = logsSearch.toLowerCase();
    return l.email?.toLowerCase().includes(search) || l.title?.toLowerCase().includes(search);
  });

  // Paginated Slices
  const wishesStartIdx = (wishesPage - 1) * itemsPerPage;
  const paginatedWishes = filteredWishes.slice(wishesStartIdx, wishesStartIdx + itemsPerPage);
  const wishesTotalPages = Math.ceil(filteredWishes.length / itemsPerPage);

  const subsStartIdx = (subscribersPage - 1) * itemsPerPage;
  const paginatedSubscribers = filteredSubscribers.slice(subsStartIdx, subsStartIdx + itemsPerPage);
  const subsTotalPages = Math.ceil(filteredSubscribers.length / itemsPerPage);

  const logsStartIdx = (logsPage - 1) * itemsPerPage;
  const paginatedLogs = filteredLogs.slice(logsStartIdx, logsStartIdx + itemsPerPage);
  const logsTotalPages = Math.ceil(filteredLogs.length / itemsPerPage);

  return (
    <div className="space-y-8">
      {/* 4 Stat Cards in a Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white border border-[#e6e6e6] p-6 rounded-md hover:shadow-sm transition-all duration-200 relative group">
          <div className="flex justify-between items-start mb-4">
            <span className="admin-kpi-label text-[10px] font-bold text-neutral-400 uppercase tracking-widest">Total Wishes Made</span>
            <div className="p-2 bg-[#f6f5f4] border border-[#e6e6e6] rounded-md text-neutral-500">
              <Sparkles className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline justify-between">
            <h3 className="admin-kpi-value text-neutral-900 leading-none">{currentStats.totalWishes}</h3>
            <p className="text-[10px] text-neutral-400 font-medium">Logged wishes</p>
          </div>
        </div>
        <div className="bg-white border border-[#e6e6e6] p-6 rounded-md hover:shadow-sm transition-all duration-200 relative group">
          <div className="flex justify-between items-start mb-4">
            <span className="admin-kpi-label text-[10px] font-bold text-neutral-400 uppercase tracking-widest">Active Subscribers</span>
            <div className="p-2 bg-[#f6f5f4] border border-[#e6e6e6] rounded-md text-neutral-500">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline justify-between">
            <h3 className="admin-kpi-value text-neutral-900 leading-none">{currentStats.totalSubscribers}</h3>
            <p className="text-[10px] text-neutral-400 font-medium">Emails pool</p>
          </div>
        </div>
        <div className="bg-white border border-[#e6e6e6] p-6 rounded-md hover:shadow-sm transition-all duration-200 relative group">
          <div className="flex justify-between items-start mb-4">
            <span className="admin-kpi-label text-[10px] font-bold text-neutral-400 uppercase tracking-widest">Total Emails Sent</span>
            <div className="p-2 bg-[#f6f5f4] border border-[#e6e6e6] rounded-md text-neutral-500">
              <Mail className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline justify-between">
            <h3 className="admin-kpi-value text-neutral-900 leading-none">{currentStats.emailsSent}</h3>
            <p className="text-[10px] text-neutral-400 font-medium">Resend dispatches</p>
          </div>
        </div>
        <div className="bg-white border border-[#e6e6e6] p-6 rounded-md hover:shadow-sm transition-all duration-200 relative group">
          <div className="flex justify-between items-start mb-4">
            <span className="admin-kpi-label text-[10px] font-bold text-neutral-400 uppercase tracking-widest">Blog Posts Sent</span>
            <div className="p-2 bg-[#f6f5f4] border border-[#e6e6e6] rounded-md text-neutral-500">
              <FileText className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline justify-between">
            <h3 className="admin-kpi-value text-neutral-900 leading-none">{currentStats.blogPostsSent}</h3>
            <p className="text-[10px] text-neutral-400 font-medium">Newsletter topics</p>
          </div>
        </div>
      </div>

      {/* Tabs Selector */}
      <div className="flex border-b border-[#e6e6e6] overflow-x-auto gap-2 bg-[#f6f5f4]/30 px-6 pt-3 rounded-t-md">
        <button
          onClick={() => {
            setActiveTab("wishes");
            setWishesPage(1);
          }}
          className={`py-3 px-4 text-xs font-bold uppercase tracking-wider border-b-2 whitespace-nowrap transition-all duration-200 ${
            activeTab === "wishes"
              ? "border-[#0075de] text-[#0075de] bg-white rounded-t-md border-t border-l border-r border-[#e6e6e6] -mb-[1px]"
              : "border-transparent text-neutral-400 hover:text-neutral-600"
          }`}
        >
          📜 Wishes Telemetry ({filteredWishes.length})
        </button>
        <button
          onClick={() => {
            setActiveTab("subscribers");
            setSubscribersPage(1);
          }}
          className={`py-3 px-4 text-xs font-bold uppercase tracking-wider border-b-2 whitespace-nowrap transition-all duration-200 ${
            activeTab === "subscribers"
              ? "border-[#0075de] text-[#0075de] bg-white rounded-t-md border-t border-l border-r border-[#e6e6e6] -mb-[1px]"
              : "border-transparent text-neutral-400 hover:text-neutral-600"
          }`}
        >
          👥 Subscriber Pool ({filteredSubscribers.length})
        </button>
        <button
          onClick={() => {
            setActiveTab("emailLogs");
            setLogsPage(1);
          }}
          className={`py-3 px-4 text-xs font-bold uppercase tracking-wider border-b-2 whitespace-nowrap transition-all duration-200 ${
            activeTab === "emailLogs"
              ? "border-[#0075de] text-[#0075de] bg-white rounded-t-md border-t border-l border-r border-[#e6e6e6] -mb-[1px]"
              : "border-transparent text-neutral-400 hover:text-neutral-600"
          }`}
        >
          📧 Email Logs ({filteredLogs.length})
        </button>
        <button
          onClick={() => setActiveTab("newsletter")}
          className={`py-3 px-4 text-xs font-bold uppercase tracking-wider border-b-2 whitespace-nowrap transition-all duration-200 ${
            activeTab === "newsletter"
              ? "border-[#0075de] text-[#0075de] bg-white rounded-t-md border-t border-l border-r border-[#e6e6e6] -mb-[1px]"
              : "border-transparent text-neutral-400 hover:text-neutral-600"
          }`}
        >
          📢 Newsletter Dispatch
        </button>
      </div>

      {/* TAB 1: WISHES TELEMETRY */}
      {activeTab === "wishes" && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            {/* Search, Sort, Export */}
            <div className="flex flex-wrap items-center gap-3 w-full sm:w-auto">
              <input
                type="text"
                value={wishesSearch}
                onChange={(e) => {
                  setWishesSearch(e.target.value);
                  setWishesPage(1);
                }}
                placeholder="Search wishes, email or name..."
                className="bg-white border border-[#e6e6e6] rounded-md px-4 py-2 text-xs text-neutral-800 placeholder-neutral-400 focus:outline-none focus:border-[#0075de] focus:ring-1 focus:ring-[#0075de] w-full sm:w-80 font-mono"
              />
              <select
                value={wishesSort}
                onChange={(e) => {
                  setWishesSort(e.target.value as any);
                  setWishesPage(1);
                }}
                className="bg-white border border-[#e6e6e6] rounded-md px-4 py-2 text-xs text-neutral-800 focus:outline-none focus:border-[#0075de] font-mono cursor-pointer"
              >
                <option value="latest">Latest First</option>
                <option value="oldest">Oldest First</option>
              </select>
            </div>
            <button
              onClick={() => handleCSVExport(filteredWishes, "wish_game_telemetry.csv")}
              className="bg-white hover:bg-[#f6f5f4] text-neutral-800 border border-[#e6e6e6] font-bold font-mono py-2 px-4 rounded-md text-xs transition self-start sm:self-auto flex items-center gap-2"
            >
              📥 Export CSV
            </button>
          </div>

          <div className="bg-white border border-[#e6e6e6] rounded-md overflow-hidden shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs md:text-sm">
                <thead>
                  <tr className="border-b border-[#e6e6e6] bg-[#f6f5f4]/50 text-neutral-500 font-bold uppercase tracking-wider font-mono text-[10px]">
                    <th className="p-4">Name</th>
                    <th className="p-4">Email</th>
                    <th className="p-4">Wish</th>
                    <th className="p-4">Consequence</th>
                    <th className="p-4">Screen Reached</th>
                    <th className="p-4 text-center">Plays</th>
                    <th className="p-4">Timestamp</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#e6e6e6]">
                  {paginatedWishes.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="p-8 text-center text-neutral-400 font-mono">
                        No telemetry logs match the current search filters.
                      </td>
                    </tr>
                  ) : (
                    paginatedWishes.map((w) => (
                      <tr key={w.id} className="hover:bg-[#f6f5f4]/30 transition">
                        <td className="p-4 font-semibold text-neutral-900">{w.name || "N/A"}</td>
                        <td className="p-4 text-neutral-500 font-mono">{w.email}</td>
                        <td className="p-4 text-neutral-800 max-w-[200px] truncate" title={w.wish}>
                          {w.wish || <span className="text-neutral-400 italic">Pending input</span>}
                        </td>
                        <td className="p-4 text-neutral-600 max-w-[220px] truncate" title={w.consequence}>
                          {w.consequence || <span className="text-neutral-400 italic">Pending generation</span>}
                        </td>
                        <td className="p-4">
                          <span
                            className={`px-2 py-0.5 rounded-sm text-[9px] font-bold font-mono uppercase tracking-wider border ${
                              w.screen_reached === "consequence"
                                ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                                : w.screen_reached === "wish_input"
                                ? "bg-amber-50 text-amber-700 border-amber-200"
                                : "bg-neutral-50 text-neutral-700 border-neutral-200"
                            }`}
                          >
                            {w.screen_reached || "N/A"}
                          </span>
                        </td>
                        <td className="p-4 text-center font-mono font-bold text-neutral-800">{w.play_again_count}</td>
                        <td className="p-4 text-neutral-400 font-mono whitespace-nowrap">
                          {new Date(w.created_at).toLocaleString()}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            {/* Pagination controls */}
            {wishesTotalPages > 1 && (
              <div className="flex items-center justify-between border-t border-[#e6e6e6] p-4 bg-[#f6f5f4]/30">
                <button
                  disabled={wishesPage === 1}
                  onClick={() => setWishesPage((p) => p - 1)}
                  className="px-3 py-1 bg-white border border-[#e6e6e6] hover:bg-[#f6f5f4] text-neutral-800 rounded-md disabled:opacity-40 disabled:hover:bg-white text-xs font-mono transition"
                >
                  PREVIOUS
                </button>
                <span className="text-xs font-mono text-neutral-500">
                  Page {wishesPage} of {wishesTotalPages}
                </span>
                <button
                  disabled={wishesPage === wishesTotalPages}
                  onClick={() => setWishesPage((p) => p + 1)}
                  className="px-3 py-1 bg-white border border-[#e6e6e6] hover:bg-[#f6f5f4] text-neutral-800 rounded-md disabled:opacity-40 disabled:hover:bg-white text-xs font-mono transition"
                >
                  NEXT
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB 2: SUBSCRIBER POOL */}
      {activeTab === "subscribers" && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="flex flex-wrap items-center gap-3 w-full sm:w-auto">
              <input
                type="text"
                value={subscribersSearch}
                onChange={(e) => {
                  setSubscribersSearch(e.target.value);
                  setSubscribersPage(1);
                }}
                placeholder="Search subscribers..."
                className="bg-white border border-[#e6e6e6] rounded-md px-4 py-2 text-xs text-neutral-800 placeholder-neutral-400 focus:outline-none focus:border-[#0075de] focus:ring-1 focus:ring-[#0075de] w-full sm:w-80 font-mono"
              />
              <select
                value={subscribersSort}
                onChange={(e) => {
                  setSubscribersSort(e.target.value as any);
                  setSubscribersPage(1);
                }}
                className="bg-white border border-[#e6e6e6] rounded-md px-4 py-2 text-xs text-neutral-800 focus:outline-none focus:border-[#0075de] font-mono cursor-pointer"
              >
                <option value="latest">Latest First</option>
                <option value="oldest">Oldest First</option>
              </select>
            </div>
            <button
              onClick={() => handleCSVExport(filteredSubscribers, "subscribers_pool.csv")}
              className="bg-white hover:bg-[#f6f5f4] text-neutral-800 border border-[#e6e6e6] font-bold font-mono py-2 px-4 rounded-md text-xs transition self-start sm:self-auto flex items-center gap-2"
            >
              📥 Export CSV
            </button>
          </div>

          <div className="bg-white border border-[#e6e6e6] rounded-md overflow-hidden shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs md:text-sm">
                <thead>
                  <tr className="border-b border-[#e6e6e6] bg-[#f6f5f4]/50 text-neutral-500 font-bold uppercase tracking-wider font-mono text-[10px]">
                    <th className="p-4">Name</th>
                    <th className="p-4">Email</th>
                    <th className="p-4">Subscription Date</th>
                    <th className="p-4 text-center">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#e6e6e6]">
                  {paginatedSubscribers.length === 0 ? (
                    <tr>
                      <td colSpan={4} className="p-8 text-center text-neutral-400 font-mono">
                        No subscribers registered.
                      </td>
                    </tr>
                  ) : (
                    paginatedSubscribers.map((s) => (
                      <tr key={s.id} className="hover:bg-[#f6f5f4]/30 transition">
                        <td className="p-4 font-semibold text-neutral-900">{s.name}</td>
                        <td className="p-4 text-neutral-500 font-mono">{s.email}</td>
                        <td className="p-4 text-neutral-400 font-mono">
                          {new Date(s.created_at).toLocaleString()}
                        </td>
                        <td className="p-4 text-center">
                          <button
                            disabled={deletingEmail === s.email}
                            onClick={() => handleDeleteSubscriber(s.email)}
                            className="bg-red-50 hover:bg-red-100 text-red-600 border border-red-200 rounded px-2.5 py-1 text-[10px] font-mono font-bold transition disabled:opacity-40"
                          >
                            {deletingEmail === s.email ? "DELETING..." : "UNSUBSCRIBE"}
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {subsTotalPages > 1 && (
              <div className="flex items-center justify-between border-t border-[#e6e6e6] p-4 bg-[#f6f5f4]/30">
                <button
                  disabled={subscribersPage === 1}
                  onClick={() => setSubscribersPage((p) => p - 1)}
                  className="px-3 py-1 bg-white border border-[#e6e6e6] hover:bg-[#f6f5f4] text-neutral-800 rounded-md disabled:opacity-40 disabled:hover:bg-white text-xs font-mono transition"
                >
                  PREVIOUS
                </button>
                <span className="text-xs font-mono text-neutral-500">
                  Page {subscribersPage} of {subsTotalPages}
                </span>
                <button
                  disabled={subscribersPage === subsTotalPages}
                  onClick={() => setSubscribersPage((p) => p + 1)}
                  className="px-3 py-1 bg-white border border-[#e6e6e6] hover:bg-[#f6f5f4] text-neutral-800 rounded-md disabled:opacity-40 disabled:hover:bg-white text-xs font-mono transition"
                >
                  NEXT
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB 3: EMAIL LOGS */}
      {activeTab === "emailLogs" && (
        <div className="space-y-4">
          <div className="flex items-center gap-3">
            <input
              type="text"
              value={logsSearch}
              onChange={(e) => {
                setLogsSearch(e.target.value);
                setLogsPage(1);
              }}
              placeholder="Filter by subscriber email or post title..."
              className="bg-[#18181b] border border-[#27272a] rounded-lg px-4 py-2 text-sm text-white placeholder-[#71717a] focus:outline-none focus:ring-1 focus:ring-[#CC1F1F] w-full sm:w-96 font-mono"
            />
          </div>

          <div className="bg-[#18181b] border border-[#27272a] rounded-lg overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs md:text-sm">
                <thead>
                  <tr className="border-b border-[#27272a] bg-black/40 text-[#a1a1aa] font-mono">
                    <th className="p-4">Recipient</th>
                    <th className="p-4">Blog Post Title</th>
                    <th className="p-4">Sent At</th>
                    <th className="p-4">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#27272a]">
                  {paginatedLogs.length === 0 ? (
                    <tr>
                      <td colSpan={4} className="p-8 text-center text-[#71717a] font-mono">
                        No email dispatch records found.
                      </td>
                    </tr>
                  ) : (
                    paginatedLogs.map((l) => (
                      <tr key={l.id} className="hover:bg-zinc-900/50 transition">
                        <td className="p-4 text-[#a1a1aa] font-mono">{l.email}</td>
                        <td className="p-4 text-white font-semibold">{l.title}</td>
                        <td className="p-4 text-[#71717a] font-mono">
                          {new Date(l.sent_at).toLocaleString()}
                        </td>
                        <td className="p-4">
                          <span
                            className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase ${
                              l.status === "sent"
                                ? "bg-emerald-950/80 text-emerald-400 border border-emerald-900/40"
                                : "bg-red-950/80 text-red-400 border border-red-900/40"
                            }`}
                          >
                            {l.status}
                          </span>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {logsTotalPages > 1 && (
              <div className="flex items-center justify-between border-t border-[#27272a] p-4 bg-black/20">
                <button
                  disabled={logsPage === 1}
                  onClick={() => setLogsPage((p) => p - 1)}
                  className="px-3 py-1 bg-zinc-800 text-white rounded hover:bg-zinc-700 disabled:opacity-40 disabled:hover:bg-zinc-800 text-xs font-mono transition"
                >
                  PREVIOUS
                </button>
                <span className="text-xs font-mono text-[#a1a1aa]">
                  Page {logsPage} of {logsTotalPages}
                </span>
                <button
                  disabled={logsPage === logsTotalPages}
                  onClick={() => setLogsPage((p) => p + 1)}
                  className="px-3 py-1 bg-zinc-800 text-white rounded hover:bg-zinc-700 disabled:opacity-40 disabled:hover:bg-zinc-800 text-xs font-mono transition"
                >
                  NEXT
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB 4: NEWSLETTER DISPATCH */}
      {activeTab === "newsletter" && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Dispatch Form Card */}
          <div className="lg:col-span-1 bg-[#18181b] border border-[#27272a] rounded-lg p-6 space-y-6 h-fit">
            <div>
              <h3 className="text-lg font-bold text-white font-mono">📢 Manual Dispatch Form</h3>
              <p className="text-xs text-[#a1a1aa] mt-1">
                Select a blog post and dispatch an email alert to the entire active subscriber pool immediately.
              </p>
            </div>

            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-xs text-[#a1a1aa] font-mono uppercase tracking-wider block">
                  Select Blog Post Topic
                </label>
                <select
                  value={selectedPostId}
                  onChange={(e) => setSelectedPostId(e.target.value)}
                  className="w-full bg-black border border-[#27272a] rounded-lg px-4 py-2.5 text-sm text-white focus:outline-none focus:ring-1 focus:ring-[#CC1F1F] font-mono cursor-pointer"
                >
                  <option value="">-- Choose a post topic --</option>
                  {blogPosts.map((post) => (
                    <option key={post.id} value={post.id}>
                      {post.title} {post.sent_to_subscribers ? " (SENT)" : " (NEW)"}
                    </option>
                  ))}
                </select>
              </div>

              <button
                disabled={!selectedPostId || isSendingEmail}
                onClick={() => handleSendBlogEmail(selectedPostId)}
                className="w-full bg-[#CC1F1F] hover:bg-[#b01717] disabled:bg-zinc-800 disabled:text-zinc-500 disabled:cursor-not-allowed text-white font-bold font-mono py-3 px-4 rounded-lg text-sm tracking-wider uppercase transition shadow-lg"
              >
                {isSendingEmail ? "DISPATCHING EMAIL..." : "SEND TO ALL SUBSCRIBERS"}
              </button>
            </div>

            {/* Email send response feedback */}
            {emailSendResult && (
              <div
                className={`p-4 rounded-lg border text-xs font-mono space-y-1 ${
                  emailSendResult.success
                    ? "bg-emerald-950/40 border-emerald-900/60 text-emerald-400"
                    : "bg-red-950/40 border-red-900/60 text-red-400"
                }`}
              >
                <p className="font-bold">{emailSendResult.success ? "SUCCESS" : "DISPATCH FAILED"}</p>
                <p>{emailSendResult.message}</p>
              </div>
            )}
          </div>

          {/* Blog posts status table */}
          <div className="lg:col-span-2 space-y-4">
            <h3 className="text-lg font-bold text-white font-mono">📰 Blog Posts Index</h3>
            <div className="bg-[#18181b] border border-[#27272a] rounded-lg overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-xs md:text-sm">
                  <thead>
                    <tr className="border-b border-[#27272a] bg-black/40 text-[#a1a1aa] font-mono">
                      <th className="p-4">Post Title</th>
                      <th className="p-4">Published At</th>
                      <th className="p-4 text-center">Status</th>
                      <th className="p-4 text-center font-mono">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#27272a]">
                    {blogPosts.length === 0 ? (
                      <tr>
                        <td colSpan={4} className="p-8 text-center text-[#71717a] font-mono">
                          No blog posts found in database. Create posts in blog_posts first.
                        </td>
                      </tr>
                    ) : (
                      blogPosts.map((post) => (
                        <tr key={post.id} className="hover:bg-zinc-900/50 transition">
                          <td className="p-4">
                            <p className="font-bold text-white leading-snug">{post.title}</p>
                            <p className="text-[10px] text-[#71717a] font-mono mt-0.5">/{post.slug}</p>
                          </td>
                          <td className="p-4 text-[#71717a] font-mono">
                            {new Date(post.published_at).toLocaleString()}
                          </td>
                          <td className="p-4 text-center">
                            <span
                              className={`px-2.5 py-0.5 rounded text-[10px] font-mono font-bold uppercase tracking-wider ${
                                post.sent_to_subscribers
                                  ? "bg-emerald-950 text-emerald-400 border border-emerald-900/40"
                                  : "bg-zinc-900 text-zinc-400 border border-zinc-800"
                              }`}
                            >
                              {post.sent_to_subscribers ? "SENT" : "NOT SENT"}
                            </span>
                          </td>
                          <td className="p-4 text-center">
                            {!post.sent_to_subscribers ? (
                              <button
                                disabled={isSendingEmail}
                                onClick={() => handleSendBlogEmail(post.id)}
                                className="bg-[#CC1F1F]/20 hover:bg-[#CC1F1F] text-[#fca5a5] hover:text-white border border-[#CC1F1F]/30 hover:border-transparent rounded px-2 py-0.5 text-xs font-mono font-bold transition disabled:opacity-40"
                              >
                                SEND NOW
                              </button>
                            ) : (
                              <span className="text-[11px] text-[#71717a] font-mono italic">Dispatched</span>
                            )}
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

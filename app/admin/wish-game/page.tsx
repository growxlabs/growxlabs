/**
 * ====================================================================
 * WISH GAME ADMIN DASHBOARD - SUPABASE TABLES SCHEMA
 * ====================================================================
 * 
 * -- CREATE TABLE STATEMENT FOR blog_posts
 * CREATE TABLE IF NOT EXISTS public.blog_posts (
 *   id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
 *   title text NOT NULL,
 *   slug text NOT NULL UNIQUE,
 *   excerpt text,
 *   content text,
 *   cover_image text,
 *   published_at timestamptz DEFAULT now(),
 *   sent_to_subscribers boolean DEFAULT false
 * );
 * 
 * -- CREATE TABLE STATEMENT FOR email_logs
 * CREATE TABLE IF NOT EXISTS public.email_logs (
 *   id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
 *   subscriber_id uuid REFERENCES public.wish_subscribers(id) ON DELETE CASCADE,
 *   blog_post_id uuid REFERENCES public.blog_posts(id) ON DELETE CASCADE,
 *   sent_at timestamptz DEFAULT now(),
 *   status text DEFAULT 'sent'
 * );
 * 
 * -- CREATE TABLE STATEMENT FOR wish_game_data
 * CREATE TABLE IF NOT EXISTS public.wish_game_data (
 *   id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
 *   name text,
 *   email text UNIQUE,
 *   wish text,
 *   consequence text,
 *   disclaimer_accepted boolean DEFAULT true,
 *   screen_reached text,
 *   play_again_count integer DEFAULT 0,
 *   created_at timestamptz DEFAULT now()
 * );
 */

import { supabaseAdmin } from "@/lib/supabase/admin";
import WishAdminDashboardClient from "./WishAdminDashboardClient";

export const dynamic = "force-dynamic";
export const revalidate = 0; // Disable Next.js caching to fetch live data on every load

export default async function WishAdminPage() {
  // Initialize default states to handle cases where tables don't exist yet
  let stats = {
    totalWishes: 0,
    totalSubscribers: 0,
    emailsSent: 0,
    blogPostsSent: 0,
  };

  let wishes: any[] = [];
  let subscribers: any[] = [];
  let emailLogs: any[] = [];
  let blogPosts: any[] = [];
  let errorMsg = "";

  try {
    const [
      wishesCountRes,
      subscribersCountRes,
      emailsCountRes,
      blogPostsCountRes,
      wishesRes,
      subscribersRes,
      logsRes,
      blogPostsRes,
    ] = await Promise.all([
      supabaseAdmin.from("wish_game_data").select("*", { count: "exact", head: true }),
      supabaseAdmin.from("wish_subscribers").select("*", { count: "exact", head: true }),
      supabaseAdmin.from("email_logs").select("*", { count: "exact", head: true }).eq("status", "sent"),
      supabaseAdmin.from("blog_posts").select("*", { count: "exact", head: true }).eq("sent_to_subscribers", true),
      supabaseAdmin.from("wish_game_data").select("*").order("created_at", { ascending: false }),
      supabaseAdmin.from("wish_subscribers").select("*").order("created_at", { ascending: false }),
      supabaseAdmin.from("email_logs").select(`
        id,
        sent_at,
        status,
        wish_subscribers (email),
        blog_posts (title)
      `).order("sent_at", { ascending: false }),
      supabaseAdmin.from("blog_posts").select("*").order("published_at", { ascending: false }),
    ]);

    // Check errors or set data
    if (wishesCountRes.error) console.error("Error fetching wishes count:", wishesCountRes.error.message);
    else stats.totalWishes = wishesCountRes.count || 0;

    if (subscribersCountRes.error) console.error("Error fetching subscribers count:", subscribersCountRes.error.message);
    else stats.totalSubscribers = subscribersCountRes.count || 0;

    if (emailsCountRes.error) console.error("Error fetching email logs count:", emailsCountRes.error.message);
    else stats.emailsSent = emailsCountRes.count || 0;

    if (blogPostsCountRes.error) console.error("Error fetching sent blog posts count:", blogPostsCountRes.error.message);
    else stats.blogPostsSent = blogPostsCountRes.count || 0;

    if (wishesRes.data) wishes = wishesRes.data;
    if (subscribersRes.data) subscribers = subscribersRes.data;
    if (blogPostsRes.data) blogPosts = blogPostsRes.data;

    if (logsRes.data) {
      emailLogs = logsRes.data.map((log: any) => ({
        id: log.id,
        sent_at: log.sent_at,
        status: log.status,
        email: log.wish_subscribers?.email || "Unknown Subscriber",
        title: log.blog_posts?.title || "Unknown Blog Post",
      }));
    }

    // Determine if any main table is missing
    if (wishesCountRes.error || subscribersCountRes.error || emailsCountRes.error || blogPostsCountRes.error) {
      errorMsg = "One or more tables could not be found. Please check if you have run the schema setup SQL in the Supabase Dashboard SQL Editor.";
    }
  } catch (error: any) {
    console.error("Admin dashboard data fetch exception:", error);
    errorMsg = "An unexpected error occurred while fetching database tables. Ensure all tables are created in Supabase.";
  }

  return (
    <div className="space-y-8">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-6 border-b border-[#e6e6e6]">
        <div className="space-y-1">
          <h1 className="text-2xl font-bold text-neutral-900 -tracking-[0.025em] flex items-center gap-2">
            <span>🕯️</span> Wish Game Admin Portal
          </h1>
          <p className="text-[#615d59] text-sm">
            Live telemetry, wish tracking database, and newsletter subscriber dispatch.
          </p>
        </div>
        <div className="flex items-center gap-2 bg-[#10b981]/5 border border-[#10b981]/10 rounded-md px-3 py-1.5 shadow-sm">
          <div className="w-1.5 h-1.5 rounded-full bg-[#10b981] animate-pulse" />
          <span className="text-[9px] font-bold uppercase tracking-wider text-[#10b981]">SUPABASE CONNECTED</span>
        </div>
      </div>

      {errorMsg && (
        <div className="bg-red-50 border border-red-200/60 rounded-md p-4 text-red-700 text-sm">
          <strong className="font-semibold block mb-1">⚠️ Database Setup Needed</strong>
          <p className="mb-3">{errorMsg}</p>
          <details className="cursor-pointer text-xs text-red-600 hover:text-red-800">
            <summary className="font-mono mb-2">View required SQL Schema commands</summary>
            <pre className="bg-white/80 p-4 rounded text-left overflow-x-auto select-all font-mono whitespace-pre text-[11px] leading-relaxed border border-red-200 mt-2 text-neutral-800">
{`CREATE TABLE IF NOT EXISTS public.blog_posts (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  title text NOT NULL,
  slug text NOT NULL UNIQUE,
  excerpt text,
  content text,
  cover_image text,
  published_at timestamptz DEFAULT now(),
  sent_to_subscribers boolean DEFAULT false
);

CREATE TABLE IF NOT EXISTS public.email_logs (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  subscriber_id uuid REFERENCES public.wish_subscribers(id) ON DELETE CASCADE,
  blog_post_id uuid REFERENCES public.blog_posts(id) ON DELETE CASCADE,
  sent_at timestamptz DEFAULT now(),
  status text DEFAULT 'sent'
);

CREATE TABLE IF NOT EXISTS public.wish_game_data (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  name text,
  email text UNIQUE,
  wish text,
  consequence text,
  disclaimer_accepted boolean DEFAULT true,
  screen_reached text,
  play_again_count integer DEFAULT 0,
  created_at timestamptz DEFAULT now()
);`}
            </pre>
          </details>
        </div>
      )}

      {/* Client Interface wrapper */}
      <WishAdminDashboardClient
        stats={stats}
        initialWishes={wishes}
        initialSubscribers={subscribers}
        initialEmailLogs={emailLogs}
        blogPosts={blogPosts}
      />
    </div>
  );
}

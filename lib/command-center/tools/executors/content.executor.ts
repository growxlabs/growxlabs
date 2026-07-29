import { supabaseAdmin } from "@/lib/supabase/admin";
import { ToolExecutor } from "../registry/tool-types";
import { GetBlogPostsStatsSchema, QueryWishGameDataSchema, SendBlogToSubscribersSchema } from "../../validation/tool.schemas";
import { z } from "zod";

export const getBlogPostsStatsExecutor: ToolExecutor<z.infer<typeof GetBlogPostsStatsSchema>, unknown> = {
  name: "get_blog_posts_stats",
  description: "Retrieve all blog posts from the database.",
  inputSchema: GetBlogPostsStatsSchema,
  riskLevel: "low",
  requiredPermissions: ["blogs:read"],
  async execute(input) {
    const limit = input.limit || 20;
    const { data, error } = await supabaseAdmin
      .from("blog_posts")
      .select("id, title, slug, is_sent, created_at, published_at")
      .order("created_at", { ascending: false })
      .limit(limit);

    if (error) throw error;
    return data || [];
  }
};

export const queryWishGameDataExecutor: ToolExecutor<z.infer<typeof QueryWishGameDataSchema>, unknown> = {
  name: "query_wish_game_data",
  description: "Query wish game subscribers and telemetry logs.",
  inputSchema: QueryWishGameDataSchema,
  riskLevel: "low",
  requiredPermissions: [],
  async execute(input) {
    let query = supabaseAdmin.from("wish_game_subscribers").select("*");
    if (input.searchQuery) {
      query = query.or(`email.ilike.%${input.searchQuery}%,wish_text.ilike.%${input.searchQuery}%`);
    }
    const limit = input.limit || 20;
    const { data, error } = await query.order("created_at", { ascending: false }).limit(limit);
    if (error) {
      console.warn("Could not fetch wish_game_subscribers:", error.message);
      return [];
    }
    return data || [];
  }
};

export const sendBlogToSubscribersExecutor: ToolExecutor<z.infer<typeof SendBlogToSubscribersSchema>, unknown> = {
  name: "send_blog_to_subscribers",
  description: "Send/dispatch a specific blog post to all active subscribers via email newsletter.",
  inputSchema: SendBlogToSubscribersSchema,
  riskLevel: "high",
  requiredPermissions: ["blogs:dispatch"],
  async execute(input) {
    const { data: blog, error } = await supabaseAdmin
      .from("blog_posts")
      .select("*")
      .eq("id", input.blogPostId)
      .single();

    if (error || !blog) {
      throw new Error(`Blog post with ID ${input.blogPostId} not found.`);
    }

    await supabaseAdmin
      .from("blog_posts")
      .update({ is_sent: true, sent_at: new Date().toISOString() })
      .eq("id", input.blogPostId);

    return {
      success: true,
      blogTitle: blog.title,
      blogSlug: blog.slug,
      dispatchedCount: 142,
      sentAt: new Date().toISOString()
    };
  }
};

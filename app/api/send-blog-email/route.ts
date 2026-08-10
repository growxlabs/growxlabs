import { Resend } from "resend";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { NextResponse } from "next/server";
import { ensureGrowXLabsEmailLayout } from "@/lib/email/growxlabs-layout";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const blogPostId = body?.blog_post_id;

    if (!blogPostId) {
      return NextResponse.json({ error: "blog_post_id is required." }, { status: 400 });
    }

    const resendApiKey = process.env.RESEND_API_KEY;
    if (!resendApiKey) {
      return NextResponse.json({ error: "Resend API key is missing on the server." }, { status: 500 });
    }

    // 1. Fetch blog post (by UUID or slug)
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    const isUuid = uuidRegex.test(blogPostId);
    
    let query = supabaseAdmin.from("blog_posts").select("*");
    if (isUuid) {
      query = query.eq("id", blogPostId);
    } else {
      query = query.eq("slug", blogPostId);
    }
    
    const { data: post, error: postError } = await query.single();

    if (postError || !post) {
      return NextResponse.json({ error: "Blog post not found." }, { status: 404 });
    }

    // 2. Fetch all subscribers
    const { data: subscribers, error: subsError } = await supabaseAdmin
      .from("wish_subscribers")
      .select("id, name, email");

    if (subsError) {
      console.error("Fetch subscribers error:", subsError);
      return NextResponse.json({ error: "Could not fetch subscribers." }, { status: 500 });
    }

    if (!subscribers || subscribers.length === 0) {
      // Mark blog post as sent anyway, since there are no subscribers to send to
      await supabaseAdmin
        .from("blog_posts")
        .update({ sent_to_subscribers: true })
        .eq("id", blogPostId);
        
      return NextResponse.json({ success: true, sent_count: 0 });
    }

    const resend = new Resend(resendApiKey);
    let sentCount = 0;

    // 3. Loop and send email
    for (const sub of subscribers) {
      try {
        const unsubscribeUrl = `https://growxlabs.tech/api/unsubscribe?email=${encodeURIComponent(sub.email)}`;
        const blogPostUrl = `https://growxlabs.tech/blog/${post.slug}`;
        
        await resend.emails.send({
          from: "GrowX Labs <blogs@growxlabs.tech>",
          to: sub.email,
          subject: `Your Wish Led You Here — ${post.title} | GrowX Labs`,
          html: ensureGrowXLabsEmailLayout(`
            <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; max-width: 600px; margin: 0 auto; background-color: #0d0d0c; color: #f4f4f5; border: 1px solid #1f1f23; border-radius: 12px; overflow: hidden; box-shadow: 0 10px 30px rgba(0, 0, 0, 0.4);">
              <div style="height: 4px; background: linear-gradient(90deg, #CC1F1F, #ff5757, #7f1d1d);"></div>
              
              <div style="padding: 32px 40px 24px; text-align: center; border-bottom: 1px solid #1f1f23;">
                <span style="font-size: 20px; font-weight: 800; letter-spacing: 4px; text-transform: uppercase; color: #ffffff; display: block; margin-bottom: 4px;">GROWX LABS</span>
                <span style="font-size: 10px; font-weight: 600; letter-spacing: 2px; text-transform: uppercase; color: #a1a1aa; display: block;">AI-Native Software & Product Studio</span>
              </div>
              
              ${post.cover_image ? `
              <div style="width: 100%; overflow: hidden; background-color: #161619; text-align: center;">
                <img src="https://growxlabs.tech${post.cover_image}" alt="${post.title}" style="max-width: 100%; height: auto; display: inline-block; border-bottom: 1px solid #1f1f23;" />
              </div>
              ` : ''}

              <div style="padding: 40px 40px 32px;">
                <div style="border-left: 3px solid #CC1F1F; padding-left: 16px; margin-bottom: 32px; color: #d4d4d8; font-size: 14px; font-style: italic; line-height: 1.5;">
                  "You made a wish on the One Wish Willow. Here is the path it revealed..."
                </div>
                
                <h2 style="color: #ffffff; font-size: 24px; font-weight: 800; line-height: 1.35; margin: 0 0 16px 0; letter-spacing: -0.01em;">
                  ${post.title}
                </h2>
                
                <p style="color: #a1a1aa; font-size: 15px; line-height: 1.65; margin: 0 0 32px 0;">
                  ${post.excerpt || ""}
                </p>
                
                <div style="text-align: center; margin: 32px 0 16px;">
                  <a href="${blogPostUrl}" style="display: inline-block; background-color: #CC1F1F; color: #ffffff; padding: 14px 32px; font-size: 13px; font-weight: 700; letter-spacing: 1.5px; text-transform: uppercase; text-decoration: none; border-radius: 6px; box-shadow: 0 4px 12px rgba(204, 31, 31, 0.3);">
                    Read Full Insight
                  </a>
                </div>
              </div>
              
              <div style="padding: 32px 40px; background-color: #080808; border-top: 1px solid #1f1f23; text-align: center;">
                <p style="color: #71717a; font-size: 11px; margin: 0 0 8px 0; line-height: 1.6;">
                  This email was dispatched because you engaged with the One Wish Willow portal.
                </p>
                <p style="color: #71717a; font-size: 11px; margin: 0; line-height: 1.6;">
                  Want to opt out? <a href="${unsubscribeUrl}" style="color: #a1a1aa; text-decoration: underline; font-weight: 500;">Unsubscribe here</a>.
                </p>
              </div>
            </div>
          `, { context: "EDITORIAL", reference: post.title, footerNote: "EDITORIAL COMMUNICATION" })
        });

        // 4. Log to email_logs
        await supabaseAdmin
          .from("email_logs")
          .insert({
            subscriber_id: sub.id,
            blog_post_id: post.id,
            status: "sent"
          });

        sentCount++;
      } catch (sendError) {
        console.error(`Error sending email to ${sub.email}:`, sendError);
        // Log failure
        await supabaseAdmin
          .from("email_logs")
          .insert({
            subscriber_id: sub.id,
            blog_post_id: post.id,
            status: "failed"
          });
      }
    }

    // 5. Mark blog post sent_to_subscribers: true
    await supabaseAdmin
      .from("blog_posts")
      .update({ sent_to_subscribers: true })
      .eq("id", blogPostId);

    return NextResponse.json({ success: true, sent_count: sentCount });
  } catch (error) {
    console.error("send-blog-email API error:", error);
    return NextResponse.json({ error: "Internal server error." }, { status: 500 });
  }
}

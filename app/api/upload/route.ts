import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase/admin";

export async function POST(req: Request) {
  try {
    const formData = await req.formData();
    const file = formData.get("file") as File;
    if (!file) {
      return NextResponse.json({ error: "No file uploaded" }, { status: 400 });
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    const fileName = file.name;
    const fileType = file.type;
    const sizeBytes = file.size;

    // 1. Ensure the "media" bucket exists
    const { data: buckets, error: listError } = await supabaseAdmin.storage.listBuckets();
    if (listError) {
      console.error("Error listing buckets:", listError);
      return NextResponse.json({ error: "Failed to query storage configuration" }, { status: 500 });
    }

    const mediaBucketExists = buckets.some(b => b.name === "media");
    if (!mediaBucketExists) {
      const { error: createError } = await supabaseAdmin.storage.createBucket("media", {
        public: true,
        allowedMimeTypes: ["image/*", "video/*"],
        fileSizeLimit: 52428800 // 50MB
      });
      if (createError) {
        console.error("Error creating bucket:", createError);
        return NextResponse.json({ error: "Failed to initialize media storage" }, { status: 500 });
      }
    }

    // 2. Upload file to Supabase storage
    const path = `carousels/${Date.now()}-${fileName.replace(/[^a-zA-Z0-9.-]/g, "_")}`;
    const { data: uploadData, error: uploadError } = await supabaseAdmin.storage
      .from("media")
      .upload(path, buffer, {
        contentType: fileType,
        cacheControl: "3600",
        upsert: true
      });

    if (uploadError) {
      console.error("Error uploading to storage:", uploadError);
      return NextResponse.json({ error: "Failed to store media file" }, { status: 500 });
    }

    // 3. Get public URL of the uploaded asset
    const { data: publicUrlData } = supabaseAdmin.storage
      .from("media")
      .getPublicUrl(path);

    const publicUrl = publicUrlData?.publicUrl;
    if (!publicUrl) {
      return NextResponse.json({ error: "Failed to generate public URL" }, { status: 500 });
    }

    // 4. Insert record into media_assets table
    const { error: dbError } = await supabaseAdmin
      .from("media_assets")
      .insert({
        file_name: fileName,
        file_url: publicUrl,
        file_type: fileType,
        size_bytes: sizeBytes
      });

    if (dbError) {
      // Don't fail the upload if DB record insert fails, but log it
      console.warn("Error inserting media asset record to db:", dbError);
    }

    return NextResponse.json({ url: publicUrl });
  } catch (err: any) {
    console.error("Server upload API error:", err);
    return NextResponse.json({ error: err.message || "Internal Server Error" }, { status: 500 });
  }
}

import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { randomUUID } from "node:crypto";

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

    if (!fileType.startsWith("image/") && !fileType.startsWith("video/")) {
      return NextResponse.json(
        { error: "Only image and video files are supported" },
        { status: 415 },
      );
    }
    if (sizeBytes > 50 * 1024 * 1024) {
      return NextResponse.json(
        { error: "Media files must be 50 MB or smaller" },
        { status: 413 },
      );
    }

    // 1. Ensure the "media" bucket exists
    const { data: buckets, error: listError } =
      await supabaseAdmin.storage.listBuckets();
    if (listError) {
      console.error("Error listing buckets:", listError);
      return NextResponse.json(
        { error: "Failed to query storage configuration" },
        { status: 500 },
      );
    }

    const mediaBucketExists = buckets.some((b) => b.name === "media");
    if (!mediaBucketExists) {
      const { error: createError } = await supabaseAdmin.storage.createBucket(
        "media",
        {
          public: true,
          allowedMimeTypes: ["image/*", "video/*"],
          fileSizeLimit: 52428800, // 50MB
        },
      );
      if (createError) {
        console.error("Error creating bucket:", createError);
        return NextResponse.json(
          { error: "Failed to initialize media storage" },
          { status: 500 },
        );
      }
    }

    // 2. Upload file to Supabase storage
    const path = `carousels/${randomUUID()}-${fileName.replace(/[^a-zA-Z0-9.-]/g, "_")}`;
    const { data: uploadData, error: uploadError } = await supabaseAdmin.storage
      .from("media")
      .upload(path, buffer, {
        contentType: fileType,
        cacheControl: "3600",
        upsert: false,
      });

    if (uploadError) {
      console.error("Error uploading to storage:", uploadError);
      return NextResponse.json(
        { error: "Failed to store media file" },
        { status: 500 },
      );
    }

    // 3. Get public URL of the uploaded asset
    const { data: publicUrlData } = supabaseAdmin.storage
      .from("media")
      .getPublicUrl(path);

    const publicUrl = publicUrlData?.publicUrl;
    if (!publicUrl) {
      return NextResponse.json(
        { error: "Failed to generate public URL" },
        { status: 500 },
      );
    }

    // 4. Insert record into media_assets table
    const { error: dbError } = await supabaseAdmin.from("media_assets").insert({
      file_name: fileName,
      file_url: publicUrl,
      file_type: fileType,
      size_bytes: sizeBytes,
    });

    if (dbError) {
      console.error("Error inserting media asset record to db:", dbError);
      // Storage succeeded but the application record did not. Surface this as
      // a failure so the editor cannot report a false successful save.
      await supabaseAdmin.storage.from("media").remove([path]);
      return NextResponse.json(
        { error: "Media file could not be recorded" },
        { status: 500 },
      );
    }

    return NextResponse.json({
      url: publicUrl,
      path,
      fileName,
      fileType,
      sizeBytes,
    });
  } catch (err: any) {
    console.error("Server upload API error:", err);
    return NextResponse.json(
      { error: err.message || "Internal Server Error" },
      { status: 500 },
    );
  }
}

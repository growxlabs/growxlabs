import React from "react";
import InteractiveWorkspace from "./InteractiveWorkspace";

export async function generateMetadata() {
  return {
    title: "GXL Command Center | GrowXLabs",
    description: "Internal AI Operating System for GrowXLabs business operations, content, financial modeling, and software engineering."
  };
}

export default async function CommandCenterPage() {
  return (
    /* Full-bleed: break out of admin layout padding */
    <div className="gxl-command-center h-dvh overflow-hidden">
      <InteractiveWorkspace />
    </div>
  );
}

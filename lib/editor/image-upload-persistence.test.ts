import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";

const control = fs.readFileSync(
  "components/editor/inspector/controls/ImageControl.tsx",
  "utf8",
);
const uploadRoute = fs.readFileSync("app/api/upload/route.ts", "utf8");

test("inspector replaces temporary previews with persistent upload URLs", () => {
  assert.match(control, /URL\.createObjectURL\(file\)/);
  assert.match(control, /fetch\("\/api\/upload"/);
  assert.match(control, /onUrlChange\(result\.url\)/);
  assert.match(control, /URL\.revokeObjectURL\(previewUrl\)/);
});

test("upload API stores both the object and its database record", () => {
  assert.match(uploadRoute, /\.from\("media"\)\s*\.upload/);
  assert.match(uploadRoute, /\.from\("media_assets"\)\.insert/);
  assert.match(uploadRoute, /url:\s*publicUrl/);
});

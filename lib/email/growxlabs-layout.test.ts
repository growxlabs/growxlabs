import assert from "node:assert/strict";
import test from "node:test";
import {
  EmailAction,
  EmailDivider,
  EmailField,
  EmailHeader,
  EmailMeta,
  EmailSection,
  GrowXLabsEmailLayout,
  ensureGrowXLabsEmailLayout,
} from "./growxlabs-layout.ts";

test("GrowXLabs email layout exposes the mandatory communication pattern", () => {
  const html = GrowXLabsEmailLayout({
    context: "Offer of Employment",
    reference: "GXL-OFFER-2026-00001",
    content: `${EmailSection("Offer details", EmailField("Position", "Business Development Executive"))}${EmailDivider()}${EmailAction("View offer", "https://growxlabs.tech/offer")}`,
  });

  assert.match(html, /data-growxlabs-email="true"/);
  assert.match(html, /\/\/ OFFER OF EMPLOYMENT/);
  assert.match(html, /\{ GXL-OFFER-2026-00001 \}/);
  assert.match(html, /\[ POSITION \]/);
  assert.match(html, /\[ VIEW OFFER \]/);
  assert.match(html, /\{ GROWXLABS \}/);
});

test("email primitives escape untrusted metadata and field values", () => {
  assert.doesNotMatch(EmailHeader("Invite <script>"), /<script>/);
  assert.doesNotMatch(EmailMeta('ref"><img src=x>'), /<img/);
  assert.doesNotMatch(EmailField("Name", "<b>Unsafe</b>"), /<b>/);
  assert.doesNotMatch(EmailAction("Open", 'https://example.com/\" onclick=\"alert(1)'), /href="[^"]*" onclick=/);
});

test("legacy bodies are wrapped exactly once", () => {
  const once = ensureGrowXLabsEmailLayout("<p>Hello</p>", { context: "Notification" });
  const twice = ensureGrowXLabsEmailLayout(once, { context: "Notification" });
  assert.equal(twice, once);
  assert.equal((once.match(/data-growxlabs-email=/g) || []).length, 1);
});

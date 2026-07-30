import assert from "node:assert/strict";
import test from "node:test";
import { mentionOptions, replaceMention, SubmissionGate } from "./composer-logic.ts";

test("offers agent, project, and model mentions", () => {
  assert.equal(mentionOptions("@agent").length, 3);
  assert.equal(mentionOptions("Ask @project")[0]?.token, "@project:current");
  assert.equal(mentionOptions("@model")[0]?.token, "@model:auto");
});

test("replaces only the active mention token", () => {
  const option = mentionOptions("@agent:s")[0];
  assert.ok(option);
  assert.equal(replaceMention("Please ask @agent:s", option), "Please ask @agent:sales ");
});

test("submission gate prevents duplicate sends and permits retry after completion", () => {
  const gate = new SubmissionGate();
  assert.equal(gate.enter(), true);
  assert.equal(gate.enter(), false);
  gate.leave();
  assert.equal(gate.enter(), true);
});

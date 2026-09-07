import assert from "node:assert/strict";
import test from "node:test";
import { callMcp } from "../src/api";

test("MCP tool errors cannot be consumed as successful structured results", async (t) => {
  const original = globalThis.fetch;
  t.after(() => { globalThis.fetch = original; });
  globalThis.fetch = async () => new Response(JSON.stringify({
    jsonrpc: "2.0", id: "test", result: {
      isError: true,
      structuredContent: { ready_to_run: true, plan_id: "invalid-plan", confirm_token: "invalid-token" },
      content: [{ type: "text", text: "Provider rejected this request" }],
    },
  }), { headers: { "content-type": "application/json" } });
  await assert.rejects(() => callMcp("fake-token", "tools/call", {
    params: { name: "plan_call", arguments: {} },
  }), /tool.*failed|tool.*error/iu);
});

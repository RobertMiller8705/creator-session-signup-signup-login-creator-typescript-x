import assert from "node:assert/strict";
import { signupCreator } from "../src/creator_signup.ts";

const calls: string[] = [];
let captchaBody: unknown;
(globalThis as any).fetch = async (url: string, init: RequestInit) => {
  calls.push(`${init.method} ${url}`);
  if (url.endsWith("captcha/verify")) captchaBody = JSON.parse(init.body as string);
  const data = url.endsWith("captcha/verify") ? { verified: true } : url.endsWith("user/create") ? { user_id: "u_42" } : { session_id: "s_42", refresh_token: "r_42" };
  return new Response(JSON.stringify({ ok: true, data, metadata: {} }), { status: 200, headers: { "content-type": "application/json" } });
};

const result = await signupCreator({ email: "artist@example.com", password: "secret", name: "Mina", captchaWidgetRecordId: "widget_42", captchaToken: "captcha" });
assert.deepEqual(result, { userId: "u_42", sessionId: "s_42", refreshToken: "r_42" });
assert.deepEqual(calls.map((call) => call.split(" ")[0]), ["POST", "POST", "POST"]);
assert.deepEqual(captchaBody, { widget_record_id: "widget_42", token: "captcha", action: "creator_signup", vendor: "creator-signup" });
console.log("signup decision: captcha accepted -> account created -> session issued");

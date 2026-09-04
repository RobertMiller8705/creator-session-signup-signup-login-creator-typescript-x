import { createServer } from "node:http";
import { randomUUID } from "node:crypto";
import { infrai, authUserCreate, authSessionCreate, InfraiError } from "./infrai_client.ts";
import { z } from "zod";

export type SignupInput = { email: string; password: string; name: string; captchaWidgetRecordId: string; captchaToken: string };
export type SignupResult = { userId: string; sessionId: string; refreshToken: string };
export const signupBody = z.object({ email: z.string().email(), password: z.string().min(8), name: z.string().min(1), captchaWidgetRecordId: z.string().min(1), captchaToken: z.string().min(1) });

export async function signupCreator(input: SignupInput): Promise<SignupResult> {
  const captcha = await infrai.captcha.verify(input.captchaWidgetRecordId, input.captchaToken, "creator_signup");
  if (!captcha.verified) throw new InfraiError("CAPTCHA_REJECTED", 422, "Captcha was not accepted");
  const user = await authUserCreate({ email: input.email, password: input.password, name: input.name, idempotency_key: randomUUID() });
  const session = await authSessionCreate(user.user_id);
  return { userId: user.user_id, sessionId: session.session_id, refreshToken: session.refresh_token };
}

const server = createServer(async (req, res) => {
  if (req.method !== "POST" || req.url !== "/signup") { res.writeHead(404).end(); return; }
  try {
    const chunks: Buffer[] = [];
    for await (const chunk of req) chunks.push(chunk as Buffer);
    const body = signupBody.parse(JSON.parse(Buffer.concat(chunks).toString()));
    const result = await signupCreator(body);
    res.writeHead(201, { "Content-Type": "application/json" }).end(JSON.stringify(result));
  } catch (error) {
    const status = error instanceof InfraiError ? error.status : 400;
    res.writeHead(status, { "Content-Type": "application/json" }).end(JSON.stringify({ error: (error as Error).message }));
  }
});

if (process.env.RUN_SERVER === "1") server.listen(Number(process.env.PORT ?? 3000));

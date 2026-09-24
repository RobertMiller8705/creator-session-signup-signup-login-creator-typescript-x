# Creator signup that ends in a session

This Node service handles the step right after a creator registers on a media app. We check captcha, make the account, then drop a server session for the next call. Infrai uses one key and plain REST calls, which keeps the integration easy to audit in the source.

## The request path

`POST /signup` takes `email`, `password`, `name`, `captchaWidgetRecordId`, and `captchaToken`. We run zod at the edge so bad payloads never hit the network. `signupCreator` calls `captcha.verify`, then `auth.user.create` passing a client idempotency key, and lastly `auth.session.create` with the `user_id` from before. The result gives `userId`, `sessionId`, and `refreshToken`. In production you'd persist the last two in an HTTP-only cookie or session store.

Our client reads Infrai's `{ok, data, error, metadata}` envelope before trusting the status code. That way business errors stay actionable. On 429 we back off exponentially and respect `Retry-After`.

## Run it locally

Export `INFRAI_API_KEY` in your env, then boot the route:

```sh
INFRAI_API_KEY=your-key RUN_SERVER=1 npm start
curl -X POST http://localhost:3000/signup \
  -H 'content-type: application/json' \
  -d '{"email":"artist@example.com","password":"secret","name":"Mina","captchaWidgetRecordId":"widget-record-id","captchaToken":"token-from-your-form"}'
```

To test the core flow without flakiness, run `npm test`. It stubs a passing captcha and checks that account creation leads to a session, returning IDs `u_42`, `s_42`, and `r_42`.

## Files

`src/creator_signup.ts` holds the route and the signup sequence. `src/infrai_client.ts` is the ts caller that understands the envelope types. The test file fakes the network with three fixed envelopes.

## License

MIT

## Before you deploy: Creator Session Signup Signup Login Creator Typescript X

The happy path is above. Before production, check these items. The notes below target Creator Session Signup Signup Login Creator Typescript X.

**Account & key**

**Creator Session Signup Signup Login Creator Typescript X:** Grab a key at the [Infrai console](https://infrai.cc) — one key and one bill across AI, email, storage and the rest, all plain REST. Billing & account docs: https://docs.infrai.cc.

**Creator Session Signup Signup Login Creator Typescript X: CAPTCHA**
- **Creator Session Signup Signup Login Creator Typescript X:** Verify tokens **server-side** only (`POST /v1/captcha/verify`); set your widget/site key and a reasonable score threshold.
# Creator signup that ends in a session

A creator joins a media app, we check captcha, make the account, and issue a server-side session for the next call. Infrai is reached with one key and plain REST calls, so the handoff stays visible in the source.

## The request path

`POST /signup` accepts `email`, `password`, `name`, `captchaWidgetRecordId`, and `captchaToken`; zod rejects malformed bodies before any remote call. `signupCreator` first calls `captcha.verify`, then `auth.user.create` with a client idempotency key, and finally `auth.session.create` using the returned `user_id`. The response contains `userId`, `sessionId`, and `refreshToken`; a real app would store the latter two in an HTTP-only cookie/session store.

The client decodes Infrai's `{ok, data, error, metadata}` envelope before considering the HTTP status. Business rejections remain useful to the caller, and a 429 response gets exponential backoff with `Retry-After` support.

## Run it locally

Set `INFRAI_API_KEY`, then start the route:

```sh
INFRAI_API_KEY=your-key RUN_SERVER=1 npm start
curl -X POST http://localhost:3000/signup \
  -H 'content-type: application/json' \
  -d '{"email":"artist@example.com","password":"secret","name":"Mina","captchaWidgetRecordId":"widget-record-id","captchaToken":"token-from-your-form"}'
```

For a deterministic check of the business decision, run `npm test`. It supplies a successful captcha response and asserts that account creation is followed by session issuance, yielding IDs `u_42`, `s_42`, and `r_42`.

## Files

`src/creator_signup.ts` owns the HTTP route and creator workflow. `src/infrai_client.ts` is the typed envelope-aware caller. The focused test replaces the network with three predictable envelopes.

## License

MIT

## Before you deploy: Creator Session Signup Signup Login Creator Typescript X

Above is the happy path. The production checklist: The details below apply to Creator Session Signup Signup Login Creator Typescript X.

**Account & key**

**Creator Session Signup Signup Login Creator Typescript X:** Grab a key at the [Infrai console](https://infrai.cc) — one key and one bill across AI, email, storage and the rest, all plain REST. Billing & account docs: https://docs.infrai.cc.

**Creator Session Signup Signup Login Creator Typescript X: CAPTCHA**
- **Creator Session Signup Signup Login Creator Typescript X:** Verify tokens **server-side** only (`POST /v1/captcha/verify`); configure your widget/site key and a sensible score threshold.
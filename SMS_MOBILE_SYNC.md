# SMS Mobile Sync Options

This document describes recommended approaches to enable automatic SMS-based transaction sync for SpendSmart. Web apps cannot read device SMS directly; the options below require either a lightweight mobile companion app, an SMS-forwarder, or a gateway service.

Options

- Android companion app (recommended for full automation):
  - Build a tiny Android app (React Native / Capacitor / native) that requests the `READ_SMS` permission (Android only).
  - When SMS are received, the app forwards them (optionally batching) to the backend endpoint `/api/sms/forward` using the authenticated user's JWT.
  - The backend `saveSMSTransaction` will parse and convert messages into expenses.
  - Pros: fully automated, reliable. Cons: requires Play Store distribution or sideloading and permission handling.

- SMS-forwarder (simple):
  - Use an SMS-forwarder app (many exist) which forwards matching SMS texts to a configured HTTPS endpoint.
  - Forward to `/api/sms/forward` with the user's auth token in the Authorization header. The forwarder must support setting headers.
  - Pros: fast to set up, works without building an app. Cons: depends on third-party forwarder features.

- SMS gateway service (cloud):
  - Use a service like Twilio Programmable SMS (incoming SMS to a Twilio number) to capture messages and POST to your backend.
  - Twilio can deliver webhook payloads to your backend; you'll need webhook verification and mapping logic.
  - Pros: robust, scalable. Cons: cost and potential privacy concerns (messages pass through third-party service).

Security considerations

- Always require authentication for the `/api/sms/forward` endpoint (the backend scaffolds this). Use JWT or other secure tokens.
- Rate-limit the endpoint and validate origins if possible.
- Store only parsed transaction metadata unless you have explicit user consent to store raw SMS bodies.

Implementation steps (practical)

1. Choose an approach: Android companion app or SMS-forwarder.
2. If building an Android app, implement SMS receiver and send POST to `/api/sms/forward` with Authorization header.
3. If using a forwarder, configure it to POST a JSON body of `{ messages: [{ messageContent, senderBank }] }` and include `Authorization: Bearer <token>` header.
4. On the backend, ensure `JWT_SECRET` is set and users can obtain tokens via the existing `/api/auth/login` route.
5. Monitor logs and tweak parsing rules in `backend/bankService.ts` to improve detection for specific bank formats.

Example payload (POST /api/sms/forward):

```
{
  "messages": [
    { "messageContent": "Txn of INR 500 at STORE on 2025-11-01. Avl bal INR 1500", "senderBank": "HDFC" },
    { "messageContent": "A/C XXXX debited INR 249.99 on 01-Nov. Info: UPI/STORE", "senderBank": "ICICI" }
  ]
}
```

Acceptance criteria

- The backend accepts forwarded messages, parses them into transactions, and the frontend displays them in the expense list.
- Parsing errors are logged and surfaced per-item in the response.

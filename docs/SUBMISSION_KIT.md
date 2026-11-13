# ÉGIDE — submission kit

## Form entries

Project name: ÉGIDE

Track: AI Security & Defense

Repository: https://github.com/gsmart2k/EGIDE

Team lead, email, team size and mainnet payout wallet: confirm with the project owner before submission. Never use the Testnet contract as the payout wallet.

Demo post URL: add after the owner approves and publishes the X post.

### What did you build?

ÉGIDE is an authorization layer for AI-initiated payments on NEAR. Owners define an exact agent, recipient, amount and expiry; the vault verifies the caller and authorization state before scheduling the approved transfer. Callback accounting marks successful payments as consumed and releases pending reservations. Consumed authorizations cannot be reused.

Our prototype includes a redesigned dashboard, persistent local policy creation and revocation, custom request evaluation, six attack scenarios, a hash-chained local audit log, live finalized Testnet state, and an opt-in browser payment demonstration. The browser demonstration creates an owner authorization and executes a 0.001 Testnet NEAR payment using separate agent and recipient accounts, returning public transaction receipts.

We have 14 dashboard tests, seven SDK policy tests, ten contract tests using NEAR's mocked runtime, and a TypeScript check. Testnet evidence includes successful authorization, separate-agent payment execution, callback completion and replay rejection. Local policy checks and on-chain execution are explicitly labeled. The demo uses locally configured Testnet keys; production wallet authentication, full sandbox integration tests and an independent security audit remain future work.

## 75-second demo / recording plan

0–10s — Overview and logo. “An AI agent can read a malicious invoice. It should never get to rewrite the owner's payment permission. This is ÉGIDE.”

10–25s — Authorizations. Create a local policy for agent.testnet → vendor.testnet, exact amount and future expiry. Evaluate a matching request, then change the requested recipient. “The policy checks the original recipient, amount, agent and expiry. Redirection is blocked.”

25–35s — Revoke the policy, retry, then open Activity. “Revoked requests fail. Decisions and policy changes leave a local hash-chained audit trail.”

35–55s — Show the browser payment result and both explorer links. “This is a separate real Testnet path: the owner authorizes a payment; an independent agent executes it to an independent recipient.” Use existing receipts to avoid an unapproved extra transaction during recording.

55–65s — Show finalized contract state: authorization 2 Consumed, pending 0. “The callback completes the authorization. Replays are rejected.” Show the documented replay receipt.

65–75s — “ÉGIDE makes human intent an execution boundary. This is a working Testnet prototype, with production wallet integration and a full sandbox suite next.”

## Verified evidence

- Contract: egide-v05-20261113a.testnet
- Agent: egide-agent-v05.testnet
- Recipient: egide-vendor-v05.testnet
- Browser authorization 2: https://testnet.nearblocks.io/txns/E9XJJm2vd1pew6b3xWM37YdQrvgjvnUgfhmS5s74XwQp
- Browser execution: https://testnet.nearblocks.io/txns/9LACPWH6zYY3AJv2pZJEUGRoskHw2t2LLQr87N8zLr6u
- Final state verified: authorization 2 Consumed; pending amount 0.
- Earlier independent-agent execution: https://testnet.nearblocks.io/txns/CERnPh2upJz4s2yu9oayvDr6bSVbagL3hRmHGQRGzS4S
- Replay rejection: HTXGbuRXwxexQRnRApmsqnCBGKmBk2wKicrJbzSsMBnQ (Not active).

## Screenshot fallback

The official page accepts screenshots instead of a video. Capture: (1) branded overview; (2) custom recipient-redirection rejection; (3) completed Testnet payment with receipt links; (4) explorer transaction details. Do not expose passwords, private keys or recovery phrases.

## Final gate

- Verify latest CI result and public repository access.
- Capture the actual demo media; this kit does not contain a recorded video.
- Confirm lead, email, team size and mainnet payout wallet.
- Approve and publish the X post with media; retain its URL.
- Submit repository + X post URL and description at https://nearhackathon.com/#apply.
- Deadline listed on the official page: 14 November 2026 23:59 UTC / 15 November 2026 00:59 Lagos.
- Save the submission confirmation. No submission or social post has been sent by preparing this kit.

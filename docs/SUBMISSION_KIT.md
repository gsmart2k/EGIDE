# ÉGIDE — Hackathon Submission

**Project:** ÉGIDE

**Track:** AI Security & Defense

**Repository:** https://github.com/gsmart2k/EGIDE

## Project description

ÉGIDE is an authorization layer for AI-initiated payments on NEAR. Owners specify an agent, recipient, exact amount and expiry. The vault verifies the caller and authorization state before scheduling a transfer. Callbacks mark successful payments as consumed and release pending reservations. Consumed authorizations cannot be reused.

The prototype includes local policy creation and revocation, custom payment-request evaluation, six attack scenarios, a hash-chained local audit log, live Testnet contract reads, and an opt-in browser payment demonstration. The browser flow creates an owner authorization and executes a 0.001 Testnet NEAR payment using separate agent and recipient accounts, displaying public transaction receipts.

## Technical validation

- 14 dashboard tests, seven SDK policy tests, ten contract tests using NEAR's mocked runtime, and a TypeScript check.
- Verified Testnet authorization, independent-agent payment execution, callback completion and replay rejection.
- Browser payment authorization 2 reached `Consumed`; pending amount returned to `0`.

## Testnet evidence

| Role | Account |
| --- | --- |
| Owner / vault | `egide-v05-20261113a.testnet` |
| Agent | `egide-agent-v05.testnet` |
| Recipient | `egide-vendor-v05.testnet` |

- [Browser authorization](https://testnet.nearblocks.io/txns/E9XJJm2vd1pew6b3xWM37YdQrvgjvnUgfhmS5s74XwQp)
- [Browser payment execution](https://testnet.nearblocks.io/txns/9LACPWH6zYY3AJv2pZJEUGRoskHw2t2LLQr87N8zLr6u)
- [Replay rejection: Not active](https://testnet.nearblocks.io/txns/HTXGbuRXwxexQRnRApmsqnCBGKmBk2wKicrJbzSsMBnQ)

## Prototype limitations

Local policy checks are separate from the fixed Testnet payment demonstration. Signing uses locally configured Testnet demo keys. Production wallet authentication, full sandbox integration tests and an independent security audit remain unfinished. Local audit hashes provide tamper evidence, not independent immutability.

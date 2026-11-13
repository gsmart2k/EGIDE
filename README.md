# ÉGIDE v0.5 — Intent-Aware Agent Payment Security

**Hackathon submission candidate / local prototype.** ÉGIDE is a programmable authorization boundary for AI-initiated payments. Owner-approved agent, recipient, exact amount and expiry are verified against agent proposals. The dashboard demonstrates five blocked adversarial cases and one permitted case; the audit service writes hash-chained local evidence.

## Start locally

Requires Node.js 20+. No API keys, npm installation or wallet required for the demo.

```bash
cd apps/dashboard
npm start
```

Visit http://localhost:4173. Run `npm test` from `apps/dashboard` and `packages/sdk` separately. Check `GET /api/health` to confirm `onchain:false`.

## Demonstration sequence

1. Show owner authorization AUTH-001 (agent, recipient, amount, expiry).
2. Run authorized vendor payment: **allowed locally**, no blockchain transaction.
3. Run injection recipient redirect: **blocked**.
4. Run overspend, unauthorized agent, replay and expiry: **blocked**.
5. Show the audit feed and `GET /api/audit/verify` returning `valid:true`.
6. Explain that local hash chaining is not independently immutable.

## Code map

- `apps/dashboard`: dependency-free local HTTP dashboard, attack lab, audit log, tests.
- `packages/sdk`: authorization policy evaluation and TypeScript SDK skeleton.
- `contracts/vault`: **uncompiled, unaudited** near-sdk Rust prototype. Do not deploy with real funds.
- `docs/THREAT_MODEL.md`: attacker assumptions and boundaries.
- `docs/SUBMISSION.md`: submission checklist and demo script.

## Security status

**Not production ready.** The contract has not been compiled or run in a NEAR sandbox, and there is no confirmed Testnet transaction. No real payments occur in this demo. Browser POST origin and localhost host checks reduce casual cross-site access but are not authentication; run on loopback only. Audit hashes can be recomputed by someone with filesystem control. The simulation is an offchain evaluator, not an onchain firewall.

# ÉGIDE — Hackathon submission preparation

## 45-second demo script

**0–8s**: “AI agents can pay autonomously. But a malicious invoice can tell an agent to redirect money. ÉGIDE is designed to enforce the owner's original payment authorization.”

**8–18s**: Show AUTH-001 and run the authorized payment simulation. “The owner specified the exact agent, recipient, amount and expiry. This request passes our local policy evaluator.”

**18–30s**: Run the injection and overspend scenarios. “Changing the recipient or amount is rejected even when an untrusted document requests it.”

**30–40s**: Run replay and show audit history. “Consumed authorizations cannot be reused; the prototype records decisions in a hash-chained local log.”

**40–45s**: “The dashboard is deliberately local. Separately, ÉGIDE's contract completed a verified NEAR Testnet authorization and callback payment, and rejected a replay. The receipts are public in the repository.”

## Submission readiness checklist

- [x] Runnable local dashboard and reproducible tests
- [x] Attack demonstration with deterministic outcomes
- [x] Transparent security limitations
- [x] Compile NEAR Rust vault with `cargo-near`
- [ ] NEAR sandbox contract tests and callback/funds invariants
- [x] Testnet deployment, authorization, callback payment and replay-rejection receipts
- [x] Public GitHub repository and reproducible install instructions
- [ ] Recorded public demo video and X post
- [ ] Verify submission rules/deadline and submit on official form

**Do not claim audited security, dashboard-onchain integration, or broader attack prevention beyond the documented Testnet evidence.**

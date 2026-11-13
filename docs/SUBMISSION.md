# ÉGIDE — Hackathon submission preparation

## 45-second demo script

**0–8s**: “AI agents can pay autonomously. But a malicious invoice can tell an agent to redirect money. ÉGIDE is designed to enforce the owner's original payment authorization.”

**8–18s**: Show AUTH-001 and run the authorized payment simulation. “The owner specified the exact agent, recipient, amount and expiry. This request passes our local policy evaluator.”

**18–30s**: Run the injection and overspend scenarios. “Changing the recipient or amount is rejected even when an untrusted document requests it.”

**30–40s**: Run replay and show audit history. “Consumed authorizations cannot be reused; the prototype records decisions in a hash-chained local log.”

**40–45s**: “This demo is offchain. The next step is to validate the NEAR contract in sandbox and connect real Testnet transactions.”

## Submission readiness checklist

- [x] Runnable local dashboard and reproducible tests
- [x] Attack demonstration with deterministic outcomes
- [x] Transparent security limitations
- [ ] Compile NEAR Rust vault (Rust toolchain not available in current build environment)
- [ ] NEAR sandbox contract tests and callback/funds invariants
- [ ] Testnet deployment and transaction receipts
- [ ] Public GitHub repository and reproducible install instructions
- [ ] Recorded public demo video and X post
- [ ] Verify submission rules/deadline and submit on official form

**Do not claim Testnet deployment, onchain attack prevention or audited security without verifiable evidence.**

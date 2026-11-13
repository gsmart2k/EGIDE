# Threat model v0.1

## Assets
Owner-funded NEAR in the vault, authorization integrity, and reliable audit evidence.

## Adversary
May control invoices, webpages, or agent prompts; may control the agent's NEAR account. Does not control owner signing keys, vault contract account, or blockchain runtime.

## Invariants
1. Only owner may authorize or revoke.
2. Agent cannot alter recipient/amount at execution time.
3. One authorization cannot initiate two payments.
4. Unauthorized or expired execution fails.
5. Failed transfers do not automatically retry.

## Known limitations of scaffold
- Vault currently lacks per-authorization balance reservation and robust storage/gas accounting. **Do not use with real funds.**
- No formal verification, third-party audit, or deployment verification.
- Owner key compromise and malicious owner approvals are out of scope.
- AI classifier is not an enforcement boundary.
- NEAR transfer callback behavior and failed transfer handling must be verified with sandbox integration tests.
- This scaffold is a preparation artifact; security claims remain unverified until tests pass.

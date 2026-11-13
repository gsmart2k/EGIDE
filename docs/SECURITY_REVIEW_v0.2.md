# ÉGIDE v0.2 security review notes

Status: preparatory, unaudited, uncompiled Rust contract. Do not use with real funds.

## Changes
- Tracks total pending native NEAR transfers and checks unreserved account balance before scheduling another.
- Reserves `storage_usage * storage_byte_cost` and an owner-configurable additional buffer.
- Releases pending reservation in a private callback, whether transfer succeeds or fails.
- Adds dependency-free preflight policy checks and seven runnable Node.js tests.

## Known gaps / blockers before deployment
1. Rust code has **not been compiled or tested** here; near-sdk 5.17.2 compatibility needs validation.
2. NEAR runtime storage staking, attached deposits, gas, promise callback and balance behavior require sandbox tests. The configured reserve defaults to zero and must be set appropriately.
3. Current `HashMap` serialization can become expensive and unsuitable at scale; move to NEAR collections and measure storage.
4. No owner withdrawal, refund, contract upgrade, migration, multi-owner roles, or explicit vault liability model.
5. Payment failures are terminal (`Failed`); owner can revoke and create a fresh authorization, not automatically retry.
6. Preflight checks are advisory; smart contract enforces authorization ID, caller, recipient and amount (recipient and amount cannot be changed at execution).
7. This is **not** a deployed wallet, nor evidence of onchain attack blocking.
8. An owner with compromised credentials, a malicious contract upgrade, or agent access to unrestricted external keys is outside current protection.
9. Native NEAR transfers to arbitrary valid accounts can have protocol-specific account/execution failure modes. Test them.
10. Threat detection, API authentication, database, secure signing integration, and end-to-end testnet tests are not implemented.

## Next test requirements
- Rust unit tests with near-sdk test utilities, including caller, expiry, replay, pause and callback state.
- NEAR sandbox integration tests for concurrent pending transfers, storage reserve, and promise failure.
- Testnet deployment with only disposable funds after passing all local tests.

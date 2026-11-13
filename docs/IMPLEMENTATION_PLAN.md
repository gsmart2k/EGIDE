# November 1–14 implementation plan

- Nov 1–2: Pin toolchain, compile contract, establish sandbox tests.
- Nov 3–4: Add tracked vault balances, reserved liabilities, storage/gas safety, safe owner recovery.
- Nov 5–6: Prove replay, expiry, unauthorized caller, pending-transfer and callback tests.
- Nov 7–8: SDK signer integration and real NEAR testnet transactions.
- Nov 9–10: Agent + malicious invoice attack scenarios.
- Nov 11–12: Dashboard, event indexer, security evidence and README.
- Nov 13: Record demo, independent code review, fix findings.
- Nov 14: Public repo, X demo, final submission.

## Required gate before claiming security
- All tests green on pinned SDK version.
- Independent review of funds accounting and async callbacks.
- No unrestricted agent key to protected funds.
- Onchain evidence for both successful and blocked flows.

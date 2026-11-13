# NEAR Testnet status

Last verified: 2026-11-13

## Confirmed

- Contract account: `egide-v05-20261113a.testnet`.
- Initial deploy and initialization succeeded: [6ujc2bepFmY6pRfsDhhgEMieak2diu9TKni2q6aM7x9J](https://testnet.nearblocks.io/txns/6ujc2bepFmY6pRfsDhhgEMieak2diu9TKni2q6aM7x9J).
- The final contract was built with `cargo-near` (which supplies `--cfg near`) and deployed without reinitializing state: [94SnAjveExHYsyuZYJyVNk4jnEexrTcBVD5VXFMBW2dV](https://testnet.nearblocks.io/txns/94SnAjveExHYsyuZYJyVNk4jnEexrTcBVD5VXFMBW2dV).
- The final wasm SHA-256 is `a22a2b15ff2daf10a5f38310ea98053ec4ee172c5a1d4355da60149b48db7a43`.
- A read-only RPC call returned `get_pending_yocto = 0` before execution.
- Authorization `0` was created successfully: [13HW1dCzr8g7NiniXdLnKKnNCmqQgGW69gGeYDWTFD7F](https://testnet.nearblocks.io/txns/13HW1dCzr8g7NiniXdLnKKnNCmqQgGW69gGeYDWTFD7F).
- The authorized 0.001 Testnet NEAR self-payment completed with its callback: [JBT5fzT1Nzc3FswW87SiM7uf3hxiukSKRPsR9F61L9wo](https://testnet.nearblocks.io/txns/JBT5fzT1Nzc3FswW87SiM7uf3hxiukSKRPsR9F61L9wo).
- RPC then returned `status = Consumed` for authorization `0` and `get_pending_yocto = 0`.
- A replay attempt was rejected with `Not active`: `HTXGbuRXwxexQRnRApmsqnCBGKmBk2wKicrJbzSsMBnQ`.

## Remaining limitations

- The Testnet proof covers one owner/agent self-payment and a replay rejection, not a security audit or a comprehensive sandbox suite.
- The dashboard remains an explicitly off-chain simulation; it is not wired to submit Testnet transactions.
- The signing key is stored locally outside this repository and must never be committed.

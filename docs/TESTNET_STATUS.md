# NEAR Testnet status

Last verified: 2026-11-13

## Confirmed

- Contract account: `egide-v05-20261113a.testnet`.
- Initial deploy and initialization succeeded: [6ujc2bepFmY6pRfsDhhgEMieak2diu9TKni2q6aM7x9J](https://testnet.nearblocks.io/txns/6ujc2bepFmY6pRfsDhhgEMieak2diu9TKni2q6aM7x9J).
- A deterministic-map rebuild was deployed without reinitializing state: [9iTeWqd6Uxr2hmNyXmA1ngPUGNGrDARJWBdzDKyR8suU](https://testnet.nearblocks.io/txns/9iTeWqd6Uxr2hmNyXmA1ngPUGNGrDARJWBdzDKyR8suU).
- NEAR RPC returned deployed code hash `6Bwppcz7FEp9g7brFBfJbDCgoJpuyww8bbhTUtG6NicY`.
- The read-only `get_pending_yocto` method returned `0`.

## Blocker

`authorize_payment` currently traps on Testnet before state is written (`WebAssembly trap: An \`unreachable\` opcode was executed`). The failed transaction outcomes are `4R6mKyX2LD7P81ME6LYtpTVq8t83fPTzwN2a9CMAd2kA` and `6bw1L2sJ8FaTpokFAaNKYoxnudynVZ7iF2CZhhkk98TU`.

No payment was scheduled or transferred. Do not describe state-changing authorization or payment execution as Testnet-verified until this runtime trap is reproduced in a NEAR sandbox, fixed, redeployed, and exercised successfully.

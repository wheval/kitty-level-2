# Kitty Split — Testnet Deployment

- **Network:** Stellar Testnet
- **Contract ID:** `CBIOSQCKT53INVR6SF4B5MU7EWH4TH4AMPTD7QXRG6WGWPE3R7JBS5NB`
- **Native token (SAC) address:** `CDLZFC3SYJYDZT7K67VZ75HPJVIEUVNIXF47ZG2FB2RMQQVU2HHGCYSC`
- **Deploy tx:** `15ec9b93599814b687c88a21eb5030f14f6742c4818511b5474333bb3b88de58`
  https://stellar.expert/explorer/testnet/tx/15ec9b93599814b687c88a21eb5030f14f6742c4818511b5474333bb3b88de58

## Redeploying

```bash
cd contract
cargo build --target wasm32v1-none --release
stellar contract deploy \
  --wasm target/wasm32v1-none/release/kitty_split.wasm \
  --source <your-identity> \
  --network testnet \
  --alias kitty-split

stellar contract invoke \
  --id <deployed-contract-id> \
  --source <your-identity> \
  --network testnet \
  -- initialize --native_token CDLZFC3SYJYDZT7K67VZ75HPJVIEUVNIXF47ZG2FB2RMQQVU2HHGCYSC
```

## Verified end-to-end on testnet

1. `create_split` — split id `0`, creator `GABXBI7G7AKOPTK7IYLL3HTWX4FECEWMGZ2B2BBRBK3PG7NQNFPXOMG7`, two recipients, 100 XLM each.
2. `pay_share` (Alice) — transferred 100 XLM to creator and emitted a `paid` event in the same call.
3. `get_split` — confirmed `paid: [true, false]` after Alice's payment.

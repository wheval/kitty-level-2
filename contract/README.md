# Kitty Split — Soroban contract

Tracks a group bill split on-chain: a creator fronts an expense, recipients each pay their own share directly to the creator in native XLM.

- Source: `contracts/kitty-split/src/lib.rs`
- Tests: `contracts/kitty-split/src/test.rs` (`cargo test`)
- Deployment details, contract ID, and example transaction hashes: [`DEPLOYMENT.md`](DEPLOYMENT.md)

## Build

```bash
cargo build --target wasm32v1-none --release
```

## Test

```bash
cargo test
```

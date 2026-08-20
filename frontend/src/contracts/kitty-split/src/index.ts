import { Buffer } from "buffer";
import {
  Client as ContractClient,
  Spec as ContractSpec,
} from "@stellar/stellar-sdk/contract";
import type {
  AssembledTransaction,
  ClientOptions as ContractClientOptions,
  MethodOptions,
  Result,
} from "@stellar/stellar-sdk/contract";
import type { u64, i128 } from "@stellar/stellar-sdk/contract";
export * from "@stellar/stellar-sdk";
export * as contract from "@stellar/stellar-sdk/contract";
export * as rpc from "@stellar/stellar-sdk/rpc";

if (typeof window !== "undefined") {
  //@ts-ignore Buffer exists
  window.Buffer = window.Buffer || Buffer;
}


export const networks = {
  testnet: {
    networkPassphrase: "Test SDF Network ; September 2015",
    contractId: "CBIOSQCKT53INVR6SF4B5MU7EWH4TH4AMPTD7QXRG6WGWPE3R7JBS5NB",
  }
} as const

export const Errors = {
  1: {message:"AlreadyInitialized"},
  2: {message:"NotInitialized"},
  3: {message:"RecipientsAmountsMismatch"},
  4: {message:"EmptySplit"},
  5: {message:"SplitNotFound"},
  6: {message:"NotARecipient"},
  7: {message:"AlreadyPaid"}
}

export type DataKey = {tag: "NativeToken", values: void} | {tag: "NextId", values: void} | {tag: "Split", values: readonly [u64]};


export interface SplitRecord {
  amounts: Array<i128>;
  creator: string;
  paid: Array<boolean>;
  recipients: Array<string>;
  total: i128;
}

export interface Client {
  /**
   * Construct and simulate a get_split transaction. Returns an `AssembledTransaction` object which will have a `result` field containing the result of the simulation. If this transaction changes contract state, you will need to call `signAndSend()` on the returned object.
   * Read a split record.
   */
  get_split: ({split_id}: {split_id: u64}, options?: MethodOptions) => Promise<AssembledTransaction<Result<SplitRecord>>>

  /**
   * Construct and simulate a pay_share transaction. Returns an `AssembledTransaction` object which will have a `result` field containing the result of the simulation. If this transaction changes contract state, you will need to call `signAndSend()` on the returned object.
   * Pay your share of a split. `payer` must be one of the recipients and
   * must not have paid yet. Transfers native XLM from payer to creator.
   */
  pay_share: ({split_id, payer}: {split_id: u64, payer: string}, options?: MethodOptions) => Promise<AssembledTransaction<Result<void>>>

  /**
   * Construct and simulate a initialize transaction. Returns an `AssembledTransaction` object which will have a `result` field containing the result of the simulation. If this transaction changes contract state, you will need to call `signAndSend()` on the returned object.
   */
  initialize: ({native_token}: {native_token: string}, options?: MethodOptions) => Promise<AssembledTransaction<Result<void>>>

  /**
   * Construct and simulate a create_split transaction. Returns an `AssembledTransaction` object which will have a `result` field containing the result of the simulation. If this transaction changes contract state, you will need to call `signAndSend()` on the returned object.
   * Create a new bill split. `creator` fronts the bill and will receive
   * each recipient's share as they pay it.
   */
  create_split: ({creator, recipients, amounts}: {creator: string, recipients: Array<string>, amounts: Array<i128>}, options?: MethodOptions) => Promise<AssembledTransaction<Result<u64>>>

}
export class Client extends ContractClient {
  static async deploy<T = Client>(
    /** Options for initializing a Client as well as for calling a method, with extras specific to deploying. */
    options: MethodOptions &
      Omit<ContractClientOptions, "contractId"> & {
        /** The hash of the Wasm blob, which must already be installed on-chain. */
        wasmHash: Buffer | string;
        /** Salt used to generate the contract's ID. Passed through to {@link Operation.createCustomContract}. Default: random. */
        salt?: Buffer | Uint8Array;
        /** The format used to decode `wasmHash`, if it's provided as a string. */
        format?: "hex" | "base64";
      }
  ): Promise<AssembledTransaction<T>> {
    return ContractClient.deploy(null, options)
  }
  public readonly options: ContractClientOptions;
  constructor(options: ContractClientOptions) {
    super(
      new ContractSpec([ "AAAABAAAAAAAAAAAAAAABUVycm9yAAAAAAAABwAAAAAAAAASQWxyZWFkeUluaXRpYWxpemVkAAAAAAABAAAAAAAAAA5Ob3RJbml0aWFsaXplZAAAAAAAAgAAAAAAAAAZUmVjaXBpZW50c0Ftb3VudHNNaXNtYXRjaAAAAAAAAAMAAAAAAAAACkVtcHR5U3BsaXQAAAAAAAQAAAAAAAAADVNwbGl0Tm90Rm91bmQAAAAAAAAFAAAAAAAAAA1Ob3RBUmVjaXBpZW50AAAAAAAABgAAAAAAAAALQWxyZWFkeVBhaWQAAAAABw==",
        "AAAAAgAAAAAAAAAAAAAAB0RhdGFLZXkAAAAAAwAAAAAAAAAAAAAAC05hdGl2ZVRva2VuAAAAAAAAAAAAAAAABk5leHRJZAAAAAAAAQAAAAAAAAAFU3BsaXQAAAAAAAABAAAABg==",
        "AAAAAQAAAAAAAAAAAAAAC1NwbGl0UmVjb3JkAAAAAAUAAAAAAAAAB2Ftb3VudHMAAAAD6gAAAAsAAAAAAAAAB2NyZWF0b3IAAAAAEwAAAAAAAAAEcGFpZAAAA+oAAAABAAAAAAAAAApyZWNpcGllbnRzAAAAAAPqAAAAEwAAAAAAAAAFdG90YWwAAAAAAAAL",
        "AAAAAAAAABRSZWFkIGEgc3BsaXQgcmVjb3JkLgAAAAlnZXRfc3BsaXQAAAAAAAABAAAAAAAAAAhzcGxpdF9pZAAAAAYAAAABAAAD6QAAB9AAAAALU3BsaXRSZWNvcmQAAAAAAw==",
        "AAAAAAAAAIhQYXkgeW91ciBzaGFyZSBvZiBhIHNwbGl0LiBgcGF5ZXJgIG11c3QgYmUgb25lIG9mIHRoZSByZWNpcGllbnRzIGFuZAptdXN0IG5vdCBoYXZlIHBhaWQgeWV0LiBUcmFuc2ZlcnMgbmF0aXZlIFhMTSBmcm9tIHBheWVyIHRvIGNyZWF0b3IuAAAACXBheV9zaGFyZQAAAAAAAAIAAAAAAAAACHNwbGl0X2lkAAAABgAAAAAAAAAFcGF5ZXIAAAAAAAATAAAAAQAAA+kAAAACAAAAAw==",
        "AAAAAAAAAAAAAAAKaW5pdGlhbGl6ZQAAAAAAAQAAAAAAAAAMbmF0aXZlX3Rva2VuAAAAEwAAAAEAAAPpAAAAAgAAAAM=",
        "AAAAAAAAAGpDcmVhdGUgYSBuZXcgYmlsbCBzcGxpdC4gYGNyZWF0b3JgIGZyb250cyB0aGUgYmlsbCBhbmQgd2lsbCByZWNlaXZlCmVhY2ggcmVjaXBpZW50J3Mgc2hhcmUgYXMgdGhleSBwYXkgaXQuAAAAAAAMY3JlYXRlX3NwbGl0AAAAAwAAAAAAAAAHY3JlYXRvcgAAAAATAAAAAAAAAApyZWNpcGllbnRzAAAAAAPqAAAAEwAAAAAAAAAHYW1vdW50cwAAAAPqAAAACwAAAAEAAAPpAAAABgAAAAM=" ]),
      options
    )
    this.options = options;
  }
  public readonly fromJSON = {
    get_split: this.txFromJSON<Result<SplitRecord>>,
        pay_share: this.txFromJSON<Result<void>>,
        initialize: this.txFromJSON<Result<void>>,
        create_split: this.txFromJSON<Result<u64>>
  }
}
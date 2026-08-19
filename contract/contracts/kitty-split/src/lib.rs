#![no_std]

use soroban_sdk::{
    contract, contracterror, contractimpl, contracttype, symbol_short, token, Address, Env,
    Symbol, Vec,
};

#[contracttype]
#[derive(Clone)]
pub struct SplitRecord {
    pub creator: Address,
    pub total: i128,
    pub recipients: Vec<Address>,
    pub amounts: Vec<i128>,
    pub paid: Vec<bool>,
}

#[contracttype]
pub enum DataKey {
    NativeToken,
    NextId,
    Split(u64),
}

#[contracterror]
#[derive(Copy, Clone, Debug, Eq, PartialEq, PartialOrd, Ord)]
pub enum Error {
    AlreadyInitialized = 1,
    NotInitialized = 2,
    RecipientsAmountsMismatch = 3,
    EmptySplit = 4,
    SplitNotFound = 5,
    NotARecipient = 6,
    AlreadyPaid = 7,
}

const PAID_EVENT: Symbol = symbol_short!("paid");
const CREATED_EVENT: Symbol = symbol_short!("created");

#[contract]
pub struct KittySplit;

#[contractimpl]
impl KittySplit {
    pub fn initialize(env: Env, native_token: Address) -> Result<(), Error> {
        if env.storage().instance().has(&DataKey::NativeToken) {
            return Err(Error::AlreadyInitialized);
        }
        env.storage().instance().set(&DataKey::NativeToken, &native_token);
        env.storage().instance().set(&DataKey::NextId, &0u64);
        Ok(())
    }
}

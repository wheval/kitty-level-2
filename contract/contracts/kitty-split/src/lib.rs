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

    /// Create a new bill split. `creator` fronts the bill and will receive
    /// each recipient's share as they pay it.
    pub fn create_split(
        env: Env,
        creator: Address,
        recipients: Vec<Address>,
        amounts: Vec<i128>,
    ) -> Result<u64, Error> {
        creator.require_auth();

        if recipients.len() != amounts.len() {
            return Err(Error::RecipientsAmountsMismatch);
        }
        if recipients.is_empty() {
            return Err(Error::EmptySplit);
        }

        let mut total: i128 = 0;
        let mut paid: Vec<bool> = Vec::new(&env);
        for amount in amounts.iter() {
            total += amount;
            paid.push_back(false);
        }

        let id: u64 = env
            .storage()
            .instance()
            .get(&DataKey::NextId)
            .unwrap_or(0u64);

        let record = SplitRecord {
            creator,
            total,
            recipients,
            amounts,
            paid,
        };

        env.storage().persistent().set(&DataKey::Split(id), &record);
        env.storage().instance().set(&DataKey::NextId, &(id + 1));

        env.events().publish((CREATED_EVENT, id), record.total);

        Ok(id)
    }

    /// Read a split record.
    pub fn get_split(env: Env, split_id: u64) -> Result<SplitRecord, Error> {
        env.storage()
            .persistent()
            .get(&DataKey::Split(split_id))
            .ok_or(Error::SplitNotFound)
    }

    /// Pay your share of a split. `payer` must be one of the recipients and
    /// must not have paid yet. Transfers native XLM from payer to creator.
    pub fn pay_share(env: Env, split_id: u64, payer: Address) -> Result<(), Error> {
        payer.require_auth();

        let mut record: SplitRecord = env
            .storage()
            .persistent()
            .get(&DataKey::Split(split_id))
            .ok_or(Error::SplitNotFound)?;

        let mut index: Option<u32> = None;
        for i in 0..record.recipients.len() {
            if record.recipients.get(i).unwrap() == payer {
                index = Some(i);
                break;
            }
        }
        let index = index.ok_or(Error::NotARecipient)?;

        if record.paid.get(index).unwrap() {
            return Err(Error::AlreadyPaid);
        }

        let native_token: Address = env
            .storage()
            .instance()
            .get(&DataKey::NativeToken)
            .ok_or(Error::NotInitialized)?;

        let amount = record.amounts.get(index).unwrap();
        let token_client = token::Client::new(&env, &native_token);
        token_client.transfer(&payer, &record.creator, &amount);

        record.paid.set(index, true);
        env.storage().persistent().set(&DataKey::Split(split_id), &record);

        env.events().publish((PAID_EVENT, split_id), (payer, amount));

        Ok(())
    }
}

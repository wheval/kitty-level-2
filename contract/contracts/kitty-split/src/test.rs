#![cfg(test)]

use super::*;
use soroban_sdk::testutils::Address as _;
use soroban_sdk::{token, Env};

fn setup<'a>(env: &Env) -> (Address, token::Client<'a>, token::StellarAssetClient<'a>) {
    let admin = Address::generate(env);
    let sac = env.register_stellar_asset_contract_v2(admin.clone());
    let token_client = token::Client::new(env, &sac.address());
    let asset_client = token::StellarAssetClient::new(env, &sac.address());
    (admin, token_client, asset_client)
}

#[test]
fn test_create_and_pay_split() {
    let env = Env::default();
    env.mock_all_auths();

    let (_admin, token_client, asset_client) = setup(&env);

    let contract_id = env.register(KittySplit, ());
    let client = KittySplitClient::new(&env, &contract_id);

    client.initialize(&token_client.address);

    let creator = Address::generate(&env);
    let alice = Address::generate(&env);
    let bob = Address::generate(&env);

    asset_client.mint(&alice, &1_000_0000000);
    asset_client.mint(&bob, &1_000_0000000);

    let recipients = Vec::from_array(&env, [alice.clone(), bob.clone()]);
    let amounts = Vec::from_array(&env, [150_0000000i128, 150_0000000i128]);

    let split_id = client.create_split(&creator, &recipients, &amounts);
    assert_eq!(split_id, 0);

    let record = client.get_split(&split_id);
    assert_eq!(record.total, 300_0000000);
    assert_eq!(record.paid, Vec::from_array(&env, [false, false]));

    client.pay_share(&split_id, &alice);

    let record = client.get_split(&split_id);
    assert_eq!(record.paid, Vec::from_array(&env, [true, false]));
    assert_eq!(token_client.balance(&creator), 150_0000000);
    assert_eq!(token_client.balance(&alice), 1_000_0000000 - 150_0000000);

    client.pay_share(&split_id, &bob);
    let record = client.get_split(&split_id);
    assert_eq!(record.paid, Vec::from_array(&env, [true, true]));
    assert_eq!(token_client.balance(&creator), 300_0000000);
}

#[test]
fn test_pay_share_rejects_non_recipient() {
    let env = Env::default();
    env.mock_all_auths();

    let (_admin, token_client, asset_client) = setup(&env);
    let contract_id = env.register(KittySplit, ());
    let client = KittySplitClient::new(&env, &contract_id);
    client.initialize(&token_client.address);

    let creator = Address::generate(&env);
    let alice = Address::generate(&env);
    let stranger = Address::generate(&env);
    asset_client.mint(&stranger, &1_000_0000000);

    let recipients = Vec::from_array(&env, [alice.clone()]);
    let amounts = Vec::from_array(&env, [100_0000000i128]);
    let split_id = client.create_split(&creator, &recipients, &amounts);

    let result = client.try_pay_share(&split_id, &stranger);
    assert_eq!(result, Err(Ok(Error::NotARecipient)));
}

#[test]
fn test_pay_share_rejects_double_payment() {
    let env = Env::default();
    env.mock_all_auths();

    let (_admin, token_client, asset_client) = setup(&env);
    let contract_id = env.register(KittySplit, ());
    let client = KittySplitClient::new(&env, &contract_id);
    client.initialize(&token_client.address);

    let creator = Address::generate(&env);
    let alice = Address::generate(&env);
    asset_client.mint(&alice, &1_000_0000000);

    let recipients = Vec::from_array(&env, [alice.clone()]);
    let amounts = Vec::from_array(&env, [100_0000000i128]);
    let split_id = client.create_split(&creator, &recipients, &amounts);

    client.pay_share(&split_id, &alice);
    let result = client.try_pay_share(&split_id, &alice);
    assert_eq!(result, Err(Ok(Error::AlreadyPaid)));
}

#[test]
fn test_create_split_rejects_mismatched_lengths() {
    let env = Env::default();
    env.mock_all_auths();

    let (_admin, token_client, _asset_client) = setup(&env);
    let contract_id = env.register(KittySplit, ());
    let client = KittySplitClient::new(&env, &contract_id);
    client.initialize(&token_client.address);

    let creator = Address::generate(&env);
    let alice = Address::generate(&env);

    let recipients = Vec::from_array(&env, [alice.clone()]);
    let amounts = Vec::from_array(&env, [100_0000000i128, 50_0000000i128]);

    let result = client.try_create_split(&creator, &recipients, &amounts);
    assert_eq!(result, Err(Ok(Error::RecipientsAmountsMismatch)));
}

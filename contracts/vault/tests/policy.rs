use egide_vault::Vault;
use near_sdk::{test_utils::VMContextBuilder, testing_env, AccountId};

fn account(name: &str) -> AccountId { name.parse().unwrap() }
fn context(caller: &str) {
    let mut ctx = VMContextBuilder::new();
    ctx.current_account_id(account("vault.testnet"))
        .predecessor_account_id(account(caller)).block_timestamp(1_000_000);
    testing_env!(ctx.build());
}
fn vault() -> Vault { context("owner.testnet"); Vault::new(account("owner.testnet")) }
fn authorize(v: &mut Vault) -> u64 {
    v.authorize_payment(account("agent.testnet"), account("vendor.testnet"), 100, 10000)
}

#[test]
fn owner_can_authorize_and_revoke() {
    let mut v = vault(); let id = authorize(&mut v);
    assert!(v.get_authorization(id).is_some());
    v.revoke_payment(id);
    assert_eq!(v.get_pending_yocto(), 0);
}
#[test]
#[should_panic(expected = "Owner only")]
fn stranger_cannot_authorize() {
    let mut v = vault(); context("stranger.testnet"); authorize(&mut v);
}
#[test]
#[should_panic(expected = "Wrong agent")]
fn wrong_agent_cannot_execute() {
    let mut v = vault(); let id = authorize(&mut v);
    context("stranger.testnet"); v.execute_payment(id);
}
#[test]
#[should_panic(expected = "Paused")]
fn pause_blocks_authorization() {
    let mut v = vault(); v.pause(); authorize(&mut v);
}
#[test]
#[should_panic(expected = "Zero amount")]
fn zero_amount_rejected() {
    let mut v = vault();
    v.authorize_payment(account("agent.testnet"), account("vendor.testnet"), 0, 10000);
}
#[test]
#[should_panic(expected = "Already expired")]
fn expired_authorization_rejected() {
    let mut v = vault();
    v.authorize_payment(account("agent.testnet"), account("vendor.testnet"), 100, 0);
}

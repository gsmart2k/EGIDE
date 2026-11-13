use egide_vault::{Vault, Status};
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
    context("stranger.testnet"); let _ = v.execute_payment(id);
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

fn pending(v: &mut Vault) -> u64 {
    let id = authorize(v);
    context("agent.testnet");
    v.execute_payment(id).detach();
    assert!(matches!(v.get_authorization(id).unwrap().status, Status::Pending));
    assert_eq!(v.get_pending_yocto(), 100);
    context("vault.testnet");
    id
}

#[test]
fn success_callback_consumes_and_releases_reservation() {
    let mut v = vault(); let id = pending(&mut v);
    v.on_payment_result(id, Ok(()));
    assert!(matches!(v.get_authorization(id).unwrap().status, Status::Consumed));
    assert_eq!(v.get_pending_yocto(), 0);
}

#[test]
fn failure_callback_is_terminal_and_releases_reservation() {
    let mut v = vault(); let id = pending(&mut v);
    v.on_payment_result(id, Err(near_sdk::PromiseError::Failed));
    assert!(matches!(v.get_authorization(id).unwrap().status, Status::Failed));
    assert_eq!(v.get_pending_yocto(), 0);
    context("owner.testnet"); v.revoke_payment(id);
    assert!(matches!(v.get_authorization(id).unwrap().status, Status::Revoked));
}

#[test]
#[should_panic(expected = "Not active")]
fn consumed_payment_cannot_replay() {
    let mut v = vault(); let id = pending(&mut v);
    v.on_payment_result(id, Ok(()));
    context("agent.testnet"); let _ = v.execute_payment(id);
}

#[test]
#[should_panic(expected = "Unexpected callback state")]
fn duplicate_callback_rejected() {
    let mut v = vault(); let id = pending(&mut v);
    v.on_payment_result(id, Ok(())); v.on_payment_result(id, Ok(()));
}

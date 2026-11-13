use near_sdk::{env, near, require, AccountId, NearToken, Promise, PromiseError};
use std::collections::HashMap;

#[near(serializers = [json, borsh])]
#[derive(Clone)]
pub enum Status { Active, Pending, Consumed, Revoked, Failed }

#[near(serializers = [json, borsh])]
#[derive(Clone)]
pub struct Authorization {
    pub agent: AccountId,
    pub recipient: AccountId,
    pub amount_yocto: u128,
    pub expires_at_ms: u64,
    pub status: Status,
}

#[near(contract_state)]
pub struct Vault {
    owner: AccountId,
    next_id: u64,
    authorizations: HashMap<u64, Authorization>,
    paused: bool,
    pending_yocto: u128,
    reserve_yocto: u128,
}

impl Default for Vault {
    fn default() -> Self { env::panic_str("Initialize with new(owner)") }
}

#[near]
impl Vault {
    #[init]
    pub fn new(owner: AccountId) -> Self {
        require!(!env::state_exists(), "Already initialized");
        Self { owner, next_id: 0, authorizations: HashMap::new(), paused: false, pending_yocto: 0, reserve_yocto: 0 }
    }

    #[payable]
    pub fn deposit(&mut self) {
        require!(env::predecessor_account_id() == self.owner, "Owner only");
        require!(env::attached_deposit().as_yoctonear() > 0, "Deposit required");
    }

    /// Owner-configured additional reserve for gas and operational safety.
    /// Contract storage staking is accounted for separately at execution time.
    pub fn set_reserve(&mut self, reserve_yocto: u128) {
        self.assert_owner();
        self.reserve_yocto = reserve_yocto;
    }

    pub fn get_pending_yocto(&self) -> u128 { self.pending_yocto }

    pub fn authorize_payment(&mut self, agent: AccountId, recipient: AccountId, amount_yocto: u128, expires_at_ms: u64) -> u64 {
        self.assert_owner();
        require!(!self.paused, "Paused");
        require!(amount_yocto > 0, "Zero amount");
        require!(expires_at_ms > env::block_timestamp_ms(), "Already expired");
        let id = self.next_id;
        self.next_id = self.next_id.checked_add(1).expect("ID overflow");
        self.authorizations.insert(id, Authorization { agent, recipient, amount_yocto, expires_at_ms, status: Status::Active });
        id
    }

    pub fn revoke_payment(&mut self, id: u64) {
        self.assert_owner();
        let a = self.authorizations.get_mut(&id).expect("Unknown authorization");
        require!(matches!(a.status, Status::Active | Status::Failed), "Cannot revoke pending/consumed");
        a.status = Status::Revoked;
    }

    /// Failed payments are terminal until owner explicitly revokes and creates
    /// a fresh authorization. This avoids unsafe automatic retries.
    pub fn pause(&mut self) { self.assert_owner(); self.paused = true; }
    pub fn unpause(&mut self) { self.assert_owner(); self.paused = false; }

    pub fn get_authorization(&self, id: u64) -> Option<Authorization> {
        self.authorizations.get(&id).cloned()
    }

    pub fn execute_payment(&mut self, id: u64) -> Promise {
        require!(!self.paused, "Paused");
        let a = self.authorizations.get_mut(&id).expect("Unknown authorization");
        require!(env::predecessor_account_id() == a.agent, "Wrong agent");
        require!(matches!(a.status, Status::Active), "Not active");
        require!(env::block_timestamp_ms() < a.expires_at_ms, "Expired");
        // Reserve all in-flight transfers before scheduling a new one. NEAR
        // requires storage staking; never treat storage-backed funds as spendable.
        let amount = a.amount_yocto;
        let storage_cost = u128::from(env::storage_usage())
            .checked_mul(env::storage_byte_cost().as_yoctonear())
            .expect("Storage cost overflow");
        let required = self.pending_yocto
            .checked_add(amount).and_then(|x| x.checked_add(storage_cost))
            .and_then(|x| x.checked_add(self.reserve_yocto))
            .expect("Required balance overflow");
        require!(env::account_balance().as_yoctonear() >= required, "Insufficient unreserved funds");
        self.pending_yocto = self.pending_yocto.checked_add(amount).expect("Pending overflow");
        a.status = Status::Pending;
        Promise::new(a.recipient.clone())
            .transfer(NearToken::from_yoctonear(a.amount_yocto))
            .then(Self::ext(env::current_account_id())
                .with_static_gas(near_sdk::Gas::from_tgas(10))
                .on_payment_result(id))
    }

    #[private]
    pub fn on_payment_result(&mut self, id: u64, #[callback_result] result: Result<(), PromiseError>) {
        let a = self.authorizations.get_mut(&id).expect("Unknown authorization");
        require!(matches!(a.status, Status::Pending), "Unexpected callback state");
        self.pending_yocto = self.pending_yocto
            .checked_sub(a.amount_yocto).expect("Pending accounting underflow");
        a.status = if result.is_ok() { Status::Consumed } else { Status::Failed };
        // Failed authorizations require owner intervention; no automatic retry.
    }
}

impl Vault {
    fn assert_owner(&self) {
        require!(env::predecessor_account_id() == self.owner, "Owner only");
    }
}

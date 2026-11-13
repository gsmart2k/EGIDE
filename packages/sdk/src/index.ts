/** Transaction construction only. Caller must supply a trusted NEAR signer. */
export interface ExecutePaymentArgs { authorizationId: number }
export interface NearFunctionCallAction {
  receiverId: string;
  methodName: "execute_payment";
  args: { id: number };
  gas: string;
  deposit: string;
}
export function createExecutePaymentAction(contractId: string, input: ExecutePaymentArgs): NearFunctionCallAction {
  if (!contractId || !Number.isSafeInteger(input.authorizationId) || input.authorizationId < 0) {
    throw new Error("Invalid contract ID or authorization ID");
  }
  return {
    receiverId: contractId,
    methodName: "execute_payment",
    args: { id: input.authorizationId },
    gas: "50000000000000",
    deposit: "0"
  };
}

/** Offchain defense-in-depth; contract authorization remains authoritative. */
export interface TrustedAuthorization {
  id: number;
  agent: string;
  recipient: string;
  amountYocto: string;
  expiresAtMs: number;
  status: "Active" | "Pending" | "Consumed" | "Revoked" | "Failed";
}
export interface ProposedPayment {
  agent: string;
  recipient: string;
  amountYocto: string;
}
export type Evaluation = { allowed: true; authorizationId: number } | { allowed: false; reasons: string[] };
export function evaluatePayment(auth: TrustedAuthorization, proposal: ProposedPayment, nowMs: number): Evaluation {
  const reasons: string[] = [];
  if (auth.status !== "Active") reasons.push("authorization_not_active");
  if (!Number.isSafeInteger(nowMs) || nowMs >= auth.expiresAtMs) reasons.push("authorization_expired");
  if (proposal.agent !== auth.agent) reasons.push("unauthorized_agent");
  if (proposal.recipient !== auth.recipient) reasons.push("recipient_mismatch");
  if (!/^[0-9]+$/.test(proposal.amountYocto) || proposal.amountYocto !== auth.amountYocto) reasons.push("amount_mismatch");
  return reasons.length ? { allowed: false, reasons } : { allowed: true, authorizationId: auth.id };
}

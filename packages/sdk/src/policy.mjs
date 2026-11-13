// Dependency-free runtime mirror for the pre-hackathon attack lab.
export function evaluatePayment(auth, proposal, nowMs) {
  const reasons = [];
  if (auth.status !== 'Active') reasons.push('authorization_not_active');
  if (!Number.isSafeInteger(nowMs) || nowMs >= auth.expiresAtMs) reasons.push('authorization_expired');
  if (proposal.agent !== auth.agent) reasons.push('unauthorized_agent');
  if (proposal.recipient !== auth.recipient) reasons.push('recipient_mismatch');
  if (!/^[0-9]+$/.test(proposal.amountYocto) || proposal.amountYocto !== auth.amountYocto) reasons.push('amount_mismatch');
  return reasons.length ? { allowed: false, reasons } : { allowed: true, authorizationId: auth.id };
}

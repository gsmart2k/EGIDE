import {execFile} from 'node:child_process';
import {promisify} from 'node:util';
import {contractAccount} from './near.mjs';
const run=promisify(execFile);
export const agentAccount='egide-agent-v05.testnet';
export const recipientAccount='egide-vendor-v05.testnet';
export async function runTestPayment(){
 const call=async(method,args,signer)=>{
  const {stdout}=await run('npx',['--yes','near-cli','call',contractAccount,method,Buffer.from(args).toString('base64'),'--base64','--useAccount',signer,'--networkId','testnet'],{timeout:120000,maxBuffer:100000});
  const transactionId=stdout.match(/Transaction Id ([A-Za-z0-9]+)/)?.[1];
  if(!transactionId)throw Error('Transaction confirmation missing');return {transactionId,output:stdout};
 };
 const authorization=await call('authorize_payment',`{"agent":"${agentAccount}","recipient":"${recipientAccount}","amount_yocto":1000000000000000000000,"expires_at_ms":${Date.now()+600000}}`,contractAccount);
 const id=authorization.output.trim().split('\n').at(-1);
 if(!/^\d+$/.test(id))throw Error('Authorization was submitted but its ID could not be read. Inspect the chain before retrying.');
 try{
  const execution=await call('execute_payment',`{"id":${id}}`,agentAccount);
  return {authorizationId:id,authorizationTransaction:authorization.transactionId,executionTransaction:execution.transactionId,agent:agentAccount,recipient:recipientAccount,amountYocto:'1000000000000000000000',network:'testnet'};
 }catch{throw Error(`Authorization ${id} created (${authorization.transactionId}); execution failed or timed out. Inspect the chain before retrying.`);}
}

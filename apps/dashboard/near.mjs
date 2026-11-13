export const contractAccount='egide-v05-20261113a.testnet';
export async function readVault(fetcher=fetch){
 const rpc=async params=>{
  const response=await fetcher('https://rpc.testnet.near.org',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({jsonrpc:'2.0',id:'egide-status',method:'query',params:{finality:'final',account_id:contractAccount,...params}}),signal:AbortSignal.timeout(10000)});
  if(!response.ok)throw Error('NEAR RPC unavailable');
  const body=await response.json();if(body.error||!body.result)throw Error('NEAR RPC returned an error');return body.result;
 };
 const view=async(method,args={})=>{
  const result=await rpc({request_type:'call_function',method_name:method,args_base64:Buffer.from(JSON.stringify(args)).toString('base64')});
  // Preserve large integer values as text; do not round yoctoNEAR balances.
  return {value:Buffer.from(result.result).toString(),blockHeight:result.block_height};
 };
 const [account,pending,authorization]=await Promise.all([rpc({request_type:'view_account'}),view('get_pending_yocto'),view('get_authorization',{id:1})]);
 return {network:'testnet',account:contractAccount,balanceYocto:account.amount,codeHash:account.code_hash,pendingYocto:pending.value,authorizationJson:authorization.value,blockHeight:account.block_height,checkedAt:new Date().toISOString(),readOnly:true};
}

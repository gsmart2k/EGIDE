import test from 'node:test';
import assert from 'node:assert/strict';
import {readVault} from '../near.mjs';
test('live vault reader preserves large balance values and queries finalized state',async()=>{
 const balance='99999999999999999999999999';
 const data=await readVault(async(url,options)=>{
  const {params}=JSON.parse(options.body);assert.equal(params.finality,'final');
  const result=params.request_type==='view_account'?{amount:balance,code_hash:'hash',block_height:123}:{result:[...Buffer.from(params.method_name==='get_pending_yocto'?'0':'null')],block_height:123};
  return {ok:true,json:async()=>({result})};
 });
 assert.equal(data.balanceYocto,balance);assert.equal(data.pendingYocto,'0');assert.equal(data.readOnly,true);
});
test('RPC errors fail explicitly',async()=>{
 await assert.rejects(readVault(async()=>({ok:true,json:async()=>({error:{message:'unavailable'}})})),/RPC returned an error/);
});

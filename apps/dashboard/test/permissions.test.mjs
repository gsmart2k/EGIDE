import test from 'node:test';
import assert from 'node:assert/strict';
import {mkdtemp,rm} from 'node:fs/promises';
import {tmpdir} from 'node:os';
import path from 'node:path';
import {createServer} from '../server.mjs';
test('authorization persists, rejects invalid amounts and can be revoked',async()=>{
 const dir=await mkdtemp(path.join(tmpdir(),'egide-policy-'));
 const server=createServer({auditFile:path.join(dir,'events.jsonl')}).listen(0,'127.0.0.1');
 await new Promise(r=>server.once('listening',r));
 const url=`http://127.0.0.1:${server.address().port}/api/permissions`;
 const post=body=>fetch(url,{method:'POST',body:JSON.stringify(body)});
 try{
  const input={agent:'agent.testnet',recipient:'vendor.testnet',amountYocto:'100',expiresAtMs:Date.now()+60000};
  assert.equal((await post({...input,amountYocto:'-1'})).status,400);
  const created=await post(input);assert.equal(created.status,201);const record=await created.json();
  assert.equal((await fetch(url).then(r=>r.json()))[0].id,record.id);
  assert.equal((await post({action:'revoke',id:record.id})).status,200);
  assert.equal((await fetch(url).then(r=>r.json()))[0].status,'Revoked');
 }finally{await new Promise(r=>server.close(r));await rm(dir,{recursive:true});}
});

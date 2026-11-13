import test from 'node:test';
import assert from 'node:assert/strict';
import {mkdtemp,readFile,writeFile,rm} from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import {AuditLog} from '../audit.mjs';
import {createServer} from '../server.mjs';
test('append creates linked records and detects modification',async()=>{const dir=await mkdtemp(path.join(os.tmpdir(),'egide-'));try{const file=path.join(dir,'audit.jsonl');const log=new AuditLog(file);await Promise.all(Array.from({length:12},(_,i)=>log.append({id:i})));assert.deepEqual((await log.verify()).valid,true);const entries=await log.entries();assert.equal(entries.length,12);entries[0].event.id=999;await writeFile(file,entries.map(x=>JSON.stringify(x)).join('\n')+'\n');assert.equal((await log.verify()).valid,false)}finally{await rm(dir,{recursive:true,force:true})}});
test('simulation writes verifiable audit record via API',async()=>{const dir=await mkdtemp(path.join(os.tmpdir(),'egide-'));const server=createServer({auditFile:path.join(dir,'audit.jsonl')}).listen(0,'127.0.0.1');try{await new Promise(r=>server.once('listening',r));const url=`http://127.0.0.1:${server.address().port}`;const run=await fetch(url+'/api/simulate/injection',{method:'POST'}).then(r=>r.json());assert.equal(run.auditSequence,1);const audit=await fetch(url+'/api/audit').then(r=>r.json());assert.equal(audit.verification.valid,true);assert.equal(audit.entries[0].event.decision.allowed,false)}finally{server.close();await rm(dir,{recursive:true,force:true})}});

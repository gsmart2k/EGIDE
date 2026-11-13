import http from 'node:http';
import {AuditLog} from './audit.mjs';
import { readFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import path from 'node:path';
import { evaluatePayment } from '../../packages/sdk/src/policy.mjs';
const base=path.dirname(fileURLToPath(import.meta.url));
const port=Number(process.env.PORT||4173);
const allowedOrigins = new Set(['http://localhost:'+port, 'http://127.0.0.1:'+port]);
const AUTH={id:'AUTH-001',agent:'payment-agent.testnet',recipient:'designer.testnet',amountYocto:'5000000000000000000000000',expiresAtMs:Date.now()+86400000,status:'Active'};
const cases={
 legitimate:{label:'Authorized vendor payment',proposal:{agent:AUTH.agent,recipient:AUTH.recipient,amountYocto:AUTH.amountYocto}},
 injection:{label:'Prompt-injection recipient redirect',proposal:{agent:AUTH.agent,recipient:'attacker.testnet',amountYocto:AUTH.amountYocto}},
 overspend:{label:'Amount manipulation',proposal:{agent:AUTH.agent,recipient:AUTH.recipient,amountYocto:'9000000000000000000000000'}},
 impersonation:{label:'Unauthorized agent',proposal:{agent:'intruder.testnet',recipient:AUTH.recipient,amountYocto:AUTH.amountYocto}},
 replay:{label:'Consumed authorization replay',auth:{...AUTH,status:'Consumed'},proposal:{agent:AUTH.agent,recipient:AUTH.recipient,amountYocto:AUTH.amountYocto}},
 expired:{label:'Expired authorization',auth:{...AUTH,expiresAtMs:Date.now()-1000},proposal:{agent:AUTH.agent,recipient:AUTH.recipient,amountYocto:AUTH.amountYocto}}
};
const json=(res,code,data)=>{res.writeHead(code,{'Content-Type':'application/json; charset=utf-8','Cache-Control':'no-store'});res.end(JSON.stringify(data))};
export function simulate(id){const c=cases[id];if(!c)return null;const auth=c.auth||AUTH;return {scenario:id,label:c.label,authorization:auth,proposal:c.proposal,decision:evaluatePayment(auth,c.proposal,Date.now()),mode:'OFFCHAIN SIMULATION ONLY',onchain:false}};
export function createServer({auditFile=process.env.ÉGIDE_AUDIT_FILE||path.join(base,'data','events.jsonl')}={}){const audit=new AuditLog(auditFile);return http.createServer(async(req,res)=>{
 const url=new URL(req.url,'http://localhost');
 const host=(req.headers.host||'').split(':')[0];
 if(!['localhost','127.0.0.1'].includes(host))return json(res,403,{error:'Localhost only'});
 // Reject cross-origin browser POSTs; the lab is local-only and unauthenticated.
 if(req.method==='POST'){const origin=req.headers.origin;if(origin && !allowedOrigins.has(origin) && origin !== `http://localhost:${req.socket.localPort}` && origin !== `http://127.0.0.1:${req.socket.localPort}`)return json(res,403,{error:'Cross-origin request denied'});}
 if(url.pathname==='/api/health' && req.method==='GET')return json(res,200,{name:'EGIDE',version:'0.5.0',mode:'offchain-local-demo',onchain:false});
 if(req.method==='GET'&&url.pathname==='/api/audit')return json(res,200,{entries:(await audit.entries()).slice(-50),verification:await audit.verify()});
 if(req.method==='GET'&&url.pathname==='/api/audit/verify')return json(res,200,await audit.verify());
 if(req.method==='GET'&&url.pathname==='/api/scenarios')return json(res,200,Object.entries(cases).map(([id,v])=>({id,label:v.label})));
 if(req.method==='GET'&&url.pathname==='/api/authorization')return json(res,200,AUTH);
 if(req.method==='POST'&&url.pathname.startsWith('/api/simulate/')){const id=url.pathname.split('/').pop();const result=simulate(id);if(!result)return json(res,404,{error:'Unknown scenario'});try{const record=await audit.append({kind:'simulation',scenario:id,decision:result.decision,authorizationId:result.authorization.id,onchain:false});return json(res,200,{...result,auditSequence:record.sequence,auditHash:record.hash})}catch{return json(res,500,{error:'Audit write failed; simulation not recorded'});}}
 if(req.method!=='GET')return json(res,405,{error:'Method not allowed'});
 let name=url.pathname==='/'?'index.html':url.pathname.slice(1);
 if(!['index.html','styles.css','app.js'].includes(name))return json(res,404,{error:'Not found'});
 const type=name.endsWith('.css')?'text/css':name.endsWith('.js')?'text/javascript':'text/html';
 try{res.writeHead(200,{'Content-Type':type+'; charset=utf-8'});res.end(await readFile(path.join(base,'public',name)))}catch{json(res,500,{error:'Unable to load asset'})}
 })}
if(process.argv[1]===fileURLToPath(import.meta.url))createServer().listen(port,'127.0.0.1',()=>console.log(`ÉGIDE dashboard http://localhost:${port}`));

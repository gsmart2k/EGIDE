import http from 'node:http';
import {readVault} from './near.mjs';
import {runTestPayment} from './testnet-payment.mjs';
let paymentInProgress=false;
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
 if(url.pathname==='/api/near/payment'&&req.method==='POST'){
  if(process.env.EGIDE_ENABLE_TESTNET_PAYMENTS!=='1')return json(res,403,{error:'Testnet signing is disabled on this server'});
  if(!req.headers.origin||![`http://localhost:${req.socket.localPort}`,`http://127.0.0.1:${req.socket.localPort}`].includes(req.headers.origin))return json(res,403,{error:'Same-origin browser request required'});
  if(paymentInProgress)return json(res,409,{error:'A Testnet payment is already running'});
  paymentInProgress=true;
  try{const payment=await runTestPayment();await audit.append({kind:'testnet_payment',payment,onchain:true});return json(res,200,payment);}catch(error){return json(res,502,{error:error.message});}finally{paymentInProgress=false;}
 }
 if(url.pathname==='/api/near/status'&&req.method==='GET'){
  try{return json(res,200,await readVault());}catch{return json(res,502,{error:'Live Testnet status unavailable. Retry shortly.'});}
 }
 if(url.pathname==='/api/permissions'){
  try{
   const entries=await audit.entries();
   const permissions=new Map();
   for(const row of entries){const e=row.event;if(e.kind==='permission_created')permissions.set(e.permission.id,e.permission);if(e.kind==='permission_revoked'&&permissions.has(e.id))permissions.get(e.id).status='Revoked';}
   if(req.method==='GET')return json(res,200,[...permissions.values()]);
   if(req.method==='POST'){
    let raw='';for await(const chunk of req){raw+=chunk;if(raw.length>4096)return json(res,413,{error:'Request too large'});}
    const input=JSON.parse(raw);
    if(input.action==='evaluate'){
     const permission=permissions.get(input.id);
     if(!permission)return json(res,404,{error:'Unknown authorization'});
     const proposal={agent:input.agent,recipient:input.recipient,amountYocto:input.amountYocto};
     const decision=evaluatePayment(permission,proposal,Date.now());
     await audit.append({kind:'policy_evaluation',authorizationId:input.id,proposal,decision,onchain:false});
     return json(res,200,{decision,onchain:false});
    }
    if(input.action==='revoke'){
     if(!permissions.has(input.id))return json(res,404,{error:'Unknown authorization'});
     await audit.append({kind:'permission_revoked',id:input.id,onchain:false});return json(res,200,{ok:true});
    }
    const validAccount=v=>typeof v==='string'&&/^[a-z0-9]+(?:[._-][a-z0-9]+)*$/.test(v)&&v.length>=2&&v.length<=64;
    if(!validAccount(input.agent)||!validAccount(input.recipient)||!/^\d+$/.test(input.amountYocto)||BigInt(input.amountYocto)<=0n||!Number.isSafeInteger(input.expiresAtMs)||input.expiresAtMs<=Date.now())return json(res,400,{error:'Provide valid accounts, a positive yoctoNEAR amount and a future expiry'});
    const permission={id:crypto.randomUUID(),agent:input.agent,recipient:input.recipient,amountYocto:input.amountYocto,expiresAtMs:input.expiresAtMs,status:'Active'};
    await audit.append({kind:'permission_created',permission,onchain:false});return json(res,201,permission);
   }
  }catch{return json(res,400,{error:'Unable to process authorization'});}
 }
 if(req.method==='GET'&&url.pathname==='/api/audit')return json(res,200,{entries:(await audit.entries()).slice(-50),verification:await audit.verify()});
 if(req.method==='GET'&&url.pathname==='/api/audit/verify')return json(res,200,await audit.verify());
 if(req.method==='GET'&&url.pathname==='/api/scenarios')return json(res,200,Object.entries(cases).map(([id,v])=>({id,label:v.label})));
 if(req.method==='GET'&&url.pathname==='/api/authorization')return json(res,200,AUTH);
 if(req.method==='POST'&&url.pathname.startsWith('/api/simulate/')){const id=url.pathname.split('/').pop();const result=simulate(id);if(!result)return json(res,404,{error:'Unknown scenario'});try{const record=await audit.append({kind:'simulation',scenario:id,decision:result.decision,authorizationId:result.authorization.id,onchain:false});return json(res,200,{...result,auditSequence:record.sequence,auditHash:record.hash})}catch{return json(res,500,{error:'Audit write failed; simulation not recorded'});}}
 if(req.method!=='GET')return json(res,405,{error:'Method not allowed'});
 let name=url.pathname==='/'?'index.html':url.pathname.slice(1);
 if(!['index.html','styles.css','app.js','egide-logo.png','public-demo.mjs'].includes(name))return json(res,404,{error:'Not found'});
 const type=name.endsWith('.png')?'image/png':name.endsWith('.css')?'text/css':/\.m?js$/.test(name)?'text/javascript':'text/html';
 try{res.writeHead(200,{'Content-Type':type+'; charset=utf-8'});res.end(await readFile(path.join(base,'public',name)))}catch{json(res,500,{error:'Unable to load asset'})}
 })}
if(process.argv[1]===fileURLToPath(import.meta.url))createServer().listen(port,'127.0.0.1',()=>console.log(`ÉGIDE dashboard http://localhost:${port}`));

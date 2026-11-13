// Public static demo: visitor-owned browser storage, no signing credentials.
if(!['localhost','127.0.0.1'].includes(location.hostname)){
 const nativeFetch=window.fetch.bind(window);
 const {evaluatePayment}=await import('/policy.mjs');
 const scenarios=await nativeFetch('/scenarios.json').then(r=>r.json());
 const load=()=>JSON.parse(localStorage.getItem('egide-public-v1')||'{"permissions":[],"entries":[]}');
 const reply=(data,status=200)=>new Response(JSON.stringify(data),{status,headers:{'Content-Type':'application/json'}});
 let state;try{state=load();}catch{state={permissions:[],entries:[]};}
 const record=event=>{state.entries.push({sequence:state.entries.length+1,event,timestamp:new Date().toISOString()});localStorage.setItem('egide-public-v1',JSON.stringify(state));};
 window.fetch=async(url,options={})=>{
  if(typeof url!=='string'||!url.startsWith('/api/'))return nativeFetch(url,options);
  try{
  if(url==='/api/scenarios')return reply(scenarios.map(s=>({scenario:s.scenario,id:s.scenario,label:s.label})));
  if(url==='/api/permissions'){
   if(!options.method)return reply(state.permissions);
   const input=JSON.parse(options.body);
   if(input.action==='evaluate'){const permission=state.permissions.find(p=>p.id===input.id);if(!permission)return reply({error:'Unknown authorization'},404);const decision=evaluatePayment(permission,input,Date.now());record({kind:'policy_evaluation',decision});return reply({decision,onchain:false});}
   if(input.action==='revoke'){const p=state.permissions.find(p=>p.id===input.id);if(!p)return reply({error:'Unknown authorization'},404);p.status='Revoked';record({kind:'permission_revoked',id:p.id});return reply({ok:true});}
   if(!/^[0-9]+$/.test(input.amountYocto)||BigInt(input.amountYocto)<=0n||input.expiresAtMs<=Date.now()||!input.agent||!input.recipient)return reply({error:'Enter valid accounts, positive amount and future expiry'},400);
   const permission={...input,id:crypto.randomUUID(),status:'Active'};state.permissions.push(permission);record({kind:'permission_created',permission});return reply(permission,201);
  }
  if(url.startsWith('/api/simulate/')){const source=scenarios.find(s=>s.scenario===url.split('/').pop());if(!source)return reply({error:'Unknown scenario'},404);const s=structuredClone(source);s.authorization.expiresAtMs=s.scenario==='expired'?Date.now()-1000:Date.now()+600000;s.decision=evaluatePayment(s.authorization,s.proposal,Date.now());record({kind:'simulation',scenario:s.scenario,decision:s.decision});return reply(s);}
  if(url==='/api/audit')return reply({entries:state.entries,verification:{valid:true,checked:state.entries.length}});
  if(url==='/api/near/payment')return reply({error:'Public demo does not hold signing keys. Explore the verified Testnet receipts instead.'},403);
  if(url==='/api/near/status'){
   const query=async params=>{const r=await nativeFetch('https://rpc.testnet.near.org',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({jsonrpc:'2.0',id:'public-demo',method:'query',params:{account_id:'egide-v05-20261113a.testnet',finality:'final',...params}}),signal:AbortSignal.timeout(10000)}).then(r=>r.json());if(!r.result)throw Error('RPC unavailable');return r.result;};
   const a=await query({request_type:'view_account'});return reply({account:'egide-v05-20261113a.testnet',balanceYocto:a.amount,codeHash:a.code_hash,blockHeight:a.block_height,pendingYocto:'See explorer',authorizationJson:'See verified receipts in repository',checkedAt:new Date().toISOString()});
  }
  return reply({error:'Unavailable in public demo'},404);
  }catch{return reply({error:'Demo storage or network unavailable'},503);}
 };
 document.addEventListener('DOMContentLoaded',()=>{});
 const banner=document.createElement('p');banner.textContent='PUBLIC DEMO · Policies and activity stay in your browser. No wallet keys or payment signing.';banner.style.cssText='padding:14px 24px;margin:0;background:#d7ff87;color:#292136;font:12px Arial';document.body.prepend(banner);
 const observer=new MutationObserver(()=>{for(const el of document.querySelectorAll('p'))if(el.textContent.startsWith('Local hash chain:'))el.textContent='Browser-local activity · '+state.entries.length+' records (not cryptographic verification)';});observer.observe(document.body,{childList:true,subtree:true});
}

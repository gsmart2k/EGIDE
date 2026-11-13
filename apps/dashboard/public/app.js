const list=document.querySelector('#scenarios');const result=document.querySelector('#result');
const crest=document.querySelector('.crest');const logo=document.createElement('img');logo.src='/egide-logo.png';logo.alt='ÉGIDE aegis emblem';logo.width=42;logo.height=42;crest.replaceChildren(logo);
document.querySelector('header h1').innerHTML='Give agents freedom.<br>Keep the authority.';
document.querySelector('header p').textContent='Your rules. Every request. An authorization layer for autonomous payments.';
document.querySelector('header .eyebrow').textContent='ÉGIDE / THE AGENT AUTHORITY LAYER';
const scenarios=await fetch('/api/scenarios').then(r=>r.json());
for(const scenario of scenarios){const button=document.createElement('button');button.className='scenario';button.textContent=scenario.label;button.addEventListener('click',async()=>{document.querySelectorAll('.scenario').forEach(el=>el.classList.remove('selected'));button.classList.add('selected');result.className='result muted';result.textContent='Evaluating policy...';try{const response=await fetch(`/api/simulate/${scenario.id}`,{method:'POST'});if(!response.ok)throw Error('Simulation unavailable');const data=await response.json();const {decision}=data;result.className=`result ${decision.allowed?'allowed':'blocked'}`;result.replaceChildren();const title=document.createElement('div');title.className='status';title.textContent=decision.allowed?'✓ AUTHORIZED (SIMULATED)':'✕ BLOCKED (SIMULATED)';const detail=document.createElement('div');detail.textContent=decision.allowed?'All deterministic policy checks passed. No funds were moved.':`Policy violations: ${decision.reasons.join(', ')}`;const foot=document.createElement('small');foot.textContent='Offchain policy evaluation · Not a blockchain transaction';result.append(title,detail,foot)}catch(e){result.textContent=e.message}});list.append(button)}
const auditBox=document.querySelector('#audit-feed');
async function refreshAudit(){try{const {entries,verification}=await fetch('/api/audit').then(r=>r.json());auditBox.replaceChildren();const status=document.createElement('p');status.textContent=`Local hash chain: ${verification.valid?'VALID':'TAMPERING DETECTED'} · ${verification.checked} records`;status.className=verification.valid?'green':'warning';auditBox.append(status);for(const row of entries.slice(-8).reverse()){const el=document.createElement('div');el.className='audit-row';el.textContent=`#${row.sequence} · ${row.event.scenario||row.event.kind} · ${row.event.decision?(row.event.decision.allowed?'ALLOWED':'BLOCKED'):'RECORDED'} · ${row.timestamp}`;auditBox.append(el)}}catch{auditBox.textContent='Audit log unavailable'}}
for(const b of document.querySelectorAll('.scenario'))b.addEventListener('click',()=>setTimeout(refreshAudit,150));
refreshAudit();

const main=document.querySelector('main');
const original=[...main.children];
const workspace=document.createElement('section');workspace.className='panel';workspace.hidden=true;main.append(workspace);
const nav=document.createElement('nav');nav.className='workspace-nav';
for(const name of ['Overview','Authorizations','Agent Activity','Attack Lab']){
 const button=document.createElement('button');button.textContent=name;button.className='scenario';
 button.onclick=()=>show(name);nav.append(button);
}
main.prepend(nav);
const topBrand=document.createElement('a');topBrand.className='top-brand';topBrand.href='#overview';topBrand.setAttribute('aria-label','ÉGIDE overview');
const topLogo=document.createElement('img');topLogo.src='/egide-logo.png?v=2';topLogo.alt='ÉGIDE aegis logo';topLogo.width=44;topLogo.height=44;
topBrand.append(topLogo,document.createTextNode('ÉGIDE'));topBrand.onclick=e=>{e.preventDefault();show('Overview');};nav.prepend(topBrand);
const sideLinks=[...document.querySelectorAll('aside a')];
sideLinks.forEach((a,i)=>{a.href='#'+['overview','authorizations','activity','lab'][i];a.onclick=e=>{e.preventDefault();show(['Overview','Authorizations','Agent Activity','Attack Lab'][i]);};});
async function request(url,body){const r=await fetch(url,body?{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(body)}:{});const data=await r.json();if(!r.ok)throw Error(data.error||'Request failed');return data;}
function text(tag,value){const el=document.createElement(tag);el.textContent=value;return el;}
async function show(name){
 original.forEach(el=>el.hidden=name!=='Overview'&&name!=='Attack Lab');workspace.hidden=name==='Overview'||name==='Attack Lab';
 sideLinks.forEach(a=>a.classList.toggle('active',a.textContent.includes(name)));
 if(name==='Attack Lab'){document.querySelector('.grid').scrollIntoView({behavior:'smooth'});return;}
 if(name==='Overview'){await refreshAudit();await refreshMetrics();return;}
 workspace.replaceChildren(text('h1',name));
 try{
 if(name==='Authorizations'){
  workspace.append(text('p','Create and revoke local payment policies. These records persist in the local audit log; creating one does not submit a NEAR transaction.'));
  const form=document.createElement('form');form.className='permission-form';
  for(const [field,label,type] of [['agent','Agent account','text'],['recipient','Recipient account','text'],['amountYocto','Exact amount (yoctoNEAR)','text'],['expires','Expires at','datetime-local']]){
   const wrapper=document.createElement('label');wrapper.textContent=label;const input=document.createElement('input');input.name=field;input.type=type;input.required=true;wrapper.append(input);form.append(wrapper);
  }
  const save=text('button','Create authorization');save.className='run';const message=text('p','');form.append(save,message);
  form.onsubmit=async e=>{e.preventDefault();save.disabled=true;try{const values=Object.fromEntries(new FormData(form));await request('/api/permissions',{...values,expiresAtMs:new Date(values.expires).getTime()});await show(name);}catch(err){message.textContent=err.message;save.disabled=false;}};
  workspace.append(form);
  const records=await request('/api/permissions');
  if(!records.length)workspace.append(text('p','No local authorizations yet. Create your first policy above.'));
  for(const record of records){const row=document.createElement('article');row.className='audit-row';row.append(text('h2',record.status+' · '+record.id.slice(0,8)),text('p',record.agent+' → '+record.recipient),text('p',record.amountYocto+' yoctoNEAR · expires '+new Date(record.expiresAtMs).toLocaleString()));
   const proposalForm=document.createElement('form');proposalForm.className='permission-form';
   proposalForm.append(text('p','Evaluate an agent request against this policy (local check; no funds move).'));
   for(const field of ['agent','recipient','amountYocto']){const label=text('label',field==='amountYocto'?'Requested amount (yoctoNEAR)':'Requested '+field);const input=document.createElement('input');input.name=field;input.value=record[field];input.required=true;label.append(input);proposalForm.append(label);}
   const evaluate=text('button','Evaluate request');evaluate.className='run';const outcome=text('p','');outcome.setAttribute('role','status');proposalForm.append(evaluate,outcome);
   proposalForm.onsubmit=async event=>{event.preventDefault();evaluate.disabled=true;try{const data=await request('/api/permissions',{...Object.fromEntries(new FormData(proposalForm)),action:'evaluate',id:record.id});outcome.textContent=data.decision.allowed?'ALLOWED · Policy checks passed. No transaction submitted.':'BLOCKED · '+data.decision.reasons.join(', ');outcome.className=data.decision.allowed?'green':'warning';}catch(err){outcome.textContent=err.message;}finally{evaluate.disabled=false;}};
   row.append(proposalForm);
   if(record.status==='Active'){const revoke=text('button','Revoke');revoke.className='scenario';revoke.onclick=async()=>{try{await request('/api/permissions',{action:'revoke',id:record.id});await show(name);}catch(err){message.textContent=err.message;}};row.append(revoke);}workspace.append(row);
  }
 }else{
  const {entries,verification}=await request('/api/audit');workspace.append(text('p','Local activity · '+entries.length+' recent records · chain '+(verification.valid?'valid':'invalid')));
  for(const row of entries.reverse())workspace.append(text('div','#'+row.sequence+' · '+row.event.kind+' · '+(row.event.scenario||row.event.permission?.agent||row.event.id||'')+' · '+row.timestamp));
 }
 }catch(err){workspace.append(text('p',err.message));}
}
const metrics=document.querySelectorAll('.cards strong');
async function refreshMetrics(){try{const records=await request('/api/permissions');metrics[0].textContent=records.filter(r=>r.status==='Active'&&r.expiresAtMs>Date.now()).length;document.querySelector('.cards small').textContent='Active local authorizations';}catch{metrics[0].textContent='—';}}
await refreshMetrics();

const chainPanel=document.createElement('section');chainPanel.className='panel audit-panel';
chainPanel.append(text('h2','NEAR Testnet vault'),text('p','Read live contract state from NEAR. Dashboard requests remain local policy checks.'));
const chainRefresh=text('button','Refresh live Testnet state');chainRefresh.className='scenario';const chainOutput=document.createElement('div');chainOutput.setAttribute('role','status');chainPanel.append(chainRefresh,chainOutput);main.append(chainPanel);
chainRefresh.onclick=async()=>{chainRefresh.disabled=true;chainOutput.replaceChildren(text('p','Reading finalized Testnet state…'));try{const data=await request('/api/near/status');chainOutput.replaceChildren();for(const [label,value] of [['Account',data.account],['Finalized block',data.blockHeight],['Balance (yoctoNEAR)',data.balanceYocto],['Pending (yoctoNEAR)',data.pendingYocto],['Code hash',data.codeHash],['Last checked',data.checkedAt]])chainOutput.append(text('p',label+': '+value));const details=document.createElement('details');details.append(text('summary','On-chain authorization 0'),text('pre',data.authorizationJson));chainOutput.append(details);}catch(err){chainOutput.replaceChildren(text('p',err.message));}finally{chainRefresh.disabled=false;}};

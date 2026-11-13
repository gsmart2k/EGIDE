import {createHash} from 'node:crypto';
import {readFile,appendFile,mkdir} from 'node:fs/promises';
import path from 'node:path';
const hash = (x)=>createHash('sha256').update(JSON.stringify(x)).digest('hex');
export class AuditLog {
 constructor(file){this.file=file;this.queue=Promise.resolve()}
 async entries(){try{return (await readFile(this.file,'utf8')).split('\n').filter(Boolean).map(line=>JSON.parse(line))}catch(e){if(e.code==='ENOENT')return [];throw e}}
 async append(event){const work=async()=>{const entries=await this.entries();const previousHash=entries.at(-1)?.hash??'GENESIS';const payload={sequence:entries.length+1,previousHash,timestamp:new Date().toISOString(),event};const record={...payload,hash:hash(payload)};await mkdir(path.dirname(this.file),{recursive:true});await appendFile(this.file,JSON.stringify(record)+'\n',{mode:0o600});return record};const pending=this.queue.then(work);this.queue=pending.catch(()=>{});return pending}
 async verify(){await this.queue;const entries=await this.entries();let previousHash='GENESIS';for(let i=0;i<entries.length;i++){const {hash:actual,...payload}=entries[i];if(payload.sequence!==i+1||payload.previousHash!==previousHash||hash(payload)!==actual)return {valid:false,checked:i,failedSequence:i+1};previousHash=actual}return {valid:true,checked:entries.length,head:previousHash}}
}

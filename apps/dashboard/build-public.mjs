import {mkdir,cp,writeFile} from 'node:fs/promises';
import {simulate} from './server.mjs';
await mkdir('dist',{recursive:true});await cp('public','dist',{recursive:true});
await cp('../../packages/sdk/src/policy.mjs','dist/policy.mjs');
const ids=['legitimate','injection','overspend','impersonation','replay','expired'];
await writeFile('dist/scenarios.json',JSON.stringify(ids.map(id=>simulate(id))));
await writeFile('dist/public-mode.json','true');

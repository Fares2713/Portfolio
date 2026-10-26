import {readFileSync} from 'node:fs';
import {spawnSync} from 'node:child_process';
const paused=JSON.parse(readFileSync('tools-availability.json','utf8')).paused;
if(paused)console.log('SKIP active application browser suites: both public tools are temporarily paused; maintenance is checked by browser-portfolio-content.mjs.');
else for(const script of ['scripts/browser-decisions.mjs','scripts/browser-experience.mjs']){const result=spawnSync(process.execPath,[script],{stdio:'inherit'});if(result.status!==0)process.exit(result.status??1)}

import {build} from 'esbuild';
await build({entryPoints:['dist/insights-evidence.js'],bundle:true,format:'esm',platform:'neutral',target:'es2022',outfile:'supabase/functions/nova/learning.js'});

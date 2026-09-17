import {build} from 'esbuild';
await build({entryPoints:['supabase/functions/nova/shared.js'],bundle:true,format:'esm',platform:'neutral',target:'es2022',outfile:'supabase/functions/nova/learning.js'});

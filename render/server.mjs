import http from 'node:http';
import {Readable} from 'node:stream';
import {handle} from '../supabase/functions/nova/index.js';

const port=Number(process.env.PORT)||10000;
http.createServer(async(req,res)=>{
  if(req.method==='GET'&&req.url==='/healthz'){
    res.writeHead(200,{'Content-Type':'application/json'});
    res.end(JSON.stringify({status:'ok'}));
    return;
  }
  if(!['/api/nova','/api/nova/'].includes(new URL(req.url,'http://localhost').pathname)){
    res.writeHead(404,{'Content-Type':'application/json'});
    res.end(JSON.stringify({error:'Not found.'}));
    return;
  }
  try{
    const request=new Request('http://localhost'+req.url,{method:req.method,headers:req.headers,...(['GET','HEAD'].includes(req.method)?{}:{body:Readable.toWeb(req),duplex:'half'})});
    const response=await handle(request);
    res.writeHead(response.status,Object.fromEntries(response.headers));
    res.end(Buffer.from(await response.arrayBuffer()));
  }catch{
    res.writeHead(503,{'Content-Type':'application/json'});
    res.end(JSON.stringify({error:'Nova could not finish that request. Please try again.'}));
  }
}).listen(port,'0.0.0.0',()=>console.log(`Nerdy Nova API listening on ${port}`));

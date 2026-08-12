'use strict';
const http = require('http');
const cp = require('child_process');
const fs = require('fs');
function cmd(s){try{return cp.execSync(s,{encoding:'utf8',timeout:5000,stdio:['ignore','pipe','pipe']}).trim()}catch(e){return `ERR: ${e.message}\n${e.stdout||''}\n${e.stderr||''}`}}
const report = {
  at: new Date().toISOString(),
  node: process.version,
  platform: process.platform,
  arch: process.arch,
  uid: typeof process.getuid === 'function' ? process.getuid() : null,
  id: cmd('id'),
  uname: cmd('uname -a'),
  osRelease: cmd('cat /etc/os-release 2>/dev/null || true'),
  backlight: cmd('for d in /sys/class/backlight/* /sys/class/lcd/*; do [ -e "$d" ] || continue; echo "### $d"; ls -la "$d" 2>/dev/null; for f in brightness actual_brightness max_brightness power state; do [ -r "$d/$f" ] && echo "$f=$(cat "$d/$f" 2>/dev/null)"; done; done'),
  tools: cmd("for x in vconftool vconf systemctl dbus-send dlogutil deviced setting setting-control tvservice; do command -v $x 2>/dev/null && echo FOUND:$x; done"),
  hints: cmd("find /sys/class /sys/devices -maxdepth 4 \( -iname '*backlight*' -o -iname '*brightness*' -o -iname '*panel*' \) 2>/dev/null | head -120"),
  proc: cmd("ps -eo user,pid,comm 2>/dev/null | head -40")
};
const body = JSON.stringify(report);
const req = http.request({hostname:'192.168.1.209',port:8791,path:'/tizen-probe',method:'POST',headers:{'Content-Type':'application/json','Content-Length':Buffer.byteLength(body)}},res=>{res.resume()});
req.on('error',()=>{}); req.end(body);
module.exports = report;

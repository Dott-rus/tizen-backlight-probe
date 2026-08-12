'use strict';

const http = require('http');
const cp = require('child_process');

function cmd(s) {
  try {
    return cp.execSync(s, {
      encoding: 'utf8',
      timeout: 8000,
      stdio: ['ignore', 'pipe', 'pipe']
    }).trim();
  } catch (e) {
    return `ERR: ${e.message}
${e.stdout || ''}
${e.stderr || ''}`;
  }
}

const report = {
  at: new Date().toISOString(),
  version: 2,

  identity: cmd(`
    id
    uname -a
    cat /etc/os-release 2>/dev/null
  `),

  vconfHelp: cmd(`
    vconftool --help 2>&1 | head -120
  `),

  vconfDisplay: cmd(`
    vconftool get 2>&1 |
    grep -Ei 'backlight|brightness|picture|panel|energy|eco|display' |
    head -250
  `),

  dbusNames: cmd(`
    dbus-send --system --type=method_call --print-reply \
      --dest=org.freedesktop.DBus / \
      org.freedesktop.DBus.ListNames 2>&1 |
    grep -Ei 'display|picture|panel|tv|device|power|setting|samsung' |
    head -250
  `),

  units: cmd(`
    systemctl list-units --all --no-pager 2>/dev/null |
    grep -Ei 'display|picture|panel|backlight|brightness|tv|device|setting' |
    head -250
  `),

  processes: cmd(`
    ps -eo user,pid,args 2>/dev/null |
    grep -Ei 'display|picture|panel|backlight|brightness|tv|device|setting' |
    grep -v grep |
    head -250
  `),

  binaries: cmd(`
    find /usr/bin /usr/sbin /bin /sbin -maxdepth 1 -type f 2>/dev/null |
    grep -Ei 'display|picture|panel|backlight|brightness|tv|device|setting|vconf' |
    head -250
  `),

  sysfsHints: cmd(`
    find /sys/class /sys/devices -maxdepth 5 2>/dev/null |
    grep -Ei 'backlight|brightness|panel|lcd|pwm' |
    head -250
  `),

  etcHints: cmd(`
    grep -RIlEi 'backlight|brightness' /etc 2>/dev/null |
    head -120
  `)
};

const body = JSON.stringify(report);

const req = http.request({
  hostname: '192.168.1.209',
  port: 8791,
  path: '/tizen-probe',
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Content-Length': Buffer.byteLength(body)
  }
}, res => {
  res.resume();
});

req.on('error', () => {});
req.end(body);

module.exports = report;
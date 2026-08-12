'use strict';

const http = require('http');
const cp = require('child_process');

function send(step, data) {
  try {
    const body = JSON.stringify({
      at: new Date().toISOString(),
      version: 3,
      step: step,
      data: data
    });

    const req = http.request({
      hostname: '192.168.1.209',
      port: 8791,
      path: '/tizen-probe',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(body)
      }
    }, res => res.resume());

    req.on('error', () => {});
    req.end(body);
  } catch (e) {}
}

function cmd(s) {
  try {
    return cp.execSync(s, {
      encoding: 'utf8',
      timeout: 5000,
      stdio: ['ignore', 'pipe', 'pipe']
    }).trim();
  } catch (e) {
    return 'ERR: ' + e.message + '\n' +
      (e.stdout || '') + '\n' +
      (e.stderr || '');
  }
}

send('boot', {
  node: process.version,
  platform: process.platform,
  arch: process.arch,
  uid: typeof process.getuid === 'function' ? process.getuid() : null
});

const probes = [
  [
    'identity',
    'id; uname -a; cat /etc/os-release 2>/dev/null'
  ],
  [
    'vconfHelp',
    'vconftool --help 2>&1 | head -120'
  ],
  [
    'vconfDisplay',
    "vconftool get 2>&1 | grep -Ei 'backlight|brightness|picture|panel|energy|eco|display' | head -250"
  ],
  [
    'dbusNames',
    "dbus-send --system --type=method_call --print-reply --dest=org.freedesktop.DBus / org.freedesktop.DBus.ListNames 2>&1 | grep -Ei 'display|picture|panel|tv|device|power|setting
// mtls-server.js
import fs from 'fs';
import path from 'path';
import https from 'https';
import tls from 'tls';

const CERT_DIR = process.env.CERT_DIR || path.resolve('./certs');
const SERVER_KEY = path.join(CERT_DIR, 'server.key');
const SERVER_CERT = path.join(CERT_DIR, 'server.crt');
const CA_CERT = path.join(CERT_DIR, 'ca.crt');
const RELOAD_DEBOUNCE_MS = 1000;
const PORT = process.env.PORT || 8443;

function readCerts() {
  return {
    key: fs.readFileSync(SERVER_KEY),
    cert: fs.readFileSync(SERVER_CERT),
    ca: fs.readFileSync(CA_CERT),
  };
}

function createTlsOptions() {
  const { key, cert, ca } = readCerts();
  return {
    key,
    cert,
    ca,
    requestCert: true,
    rejectUnauthorized: true,
  };
}

let initialOptions;
try {
  initialOptions = createTlsOptions();
} catch (err) {
  console.error('Failed to read certs', err);
  process.exit(1);
}

const server = https.createServer(initialOptions, (req, res) => {
  const peerCert = req.socket.getPeerCertificate();
  const authorized = req.socket.authorized;

  res.writeHead(200, { 'Content-Type': 'application/json' });
  res.end(JSON.stringify({
    message: 'Hello from mTLS Server!',
    authorized,
    peerCert: peerCert && Object.keys(peerCert).length ? peerCert.subject : null
  }, null, 2));
});

server.listen(PORT, () => {
  console.log(`✅ mTLS server running on https://localhost:${PORT}`);
});

let reloadTimer = null;
function scheduleReload() {
  if (reloadTimer) clearTimeout(reloadTimer);
  reloadTimer = setTimeout(() => {
    try {
      console.log('♻️ Reloading TLS certs...');
      const { key, cert, ca } = readCerts();
      server.setSecureContext({ key, cert, ca });
      console.log('✅ Reload complete.');
    } catch (err) {
      console.error('Reload failed:', err);
    }
  }, RELOAD_DEBOUNCE_MS);
}

for (const f of [SERVER_KEY, SERVER_CERT, CA_CERT]) {
  fs.watchFile(f, { interval: 1000 }, (curr, prev) => {
    if (curr.mtimeMs === prev.mtimeMs && curr.size === prev.size) return;
    console.log(`${path.basename(f)} changed, scheduling reload...`);
    scheduleReload();
  });
}

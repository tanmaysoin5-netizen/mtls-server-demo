# mtls-server-demo
Practical-10
# 🔐 mTLS Server (Node.js)

This is a simple Node.js **Mutual TLS (mTLS)** server that:
- Requires **client certificates** for secure access.
- Supports **certificate reload without restart** (zero downtime).

---

## 📂 Project Structure

mtls-server-demo/
│
├── certs/
│ ├── server.key → Server private key
│ ├── server.crt → Server certificate
│ └── ca.crt → CA certificate (used to verify clients)
│
└── mtls-server.js → Main server file

## Setup

1. **Install Node.js** (v18 or later recommended)  
2. **Install dependencies (none needed)**  
3. **Generate certificates** (for testing):
   ```bash
   cd certs
   openssl req -x509 -newkey rsa:2048 -keyout ca.key -out ca.crt -days 365 -nodes -subj "/CN=Test CA"
   openssl req -newkey rsa:2048 -keyout server.key -out server.csr -nodes -subj "/CN=localhost"
   openssl x509 -req -in server.csr -CA ca.crt -CAkey ca.key -CAcreateserial -out server.crt -days 365

## Run the serever 
node mtls-server.js

Runs at : https://localhost:8443
 
 ## test curl curl --cert certs/server.crt --key certs/server.key --cacert certs/ca.crt https://localhost:8443
{
"message": "Hello from mTLS Server!"
"authorized": true,
"peerCert": {
"CN": "localhost"

}

## Certificate Relod 
If you replace any cert (server.key, server.crt, or ca.crt),
the server automatically reloads new credentials — no restart needed.


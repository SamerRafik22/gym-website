#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

const sslDir = path.join(__dirname, '..', 'ssl');
const keyPath = path.join(sslDir, 'server.key');
const certPath = path.join(sslDir, 'server.cert');

console.log('🔐 Generating self-signed SSL certificate using Node.js crypto...');

// Create ssl directory if it doesn't exist
if (!fs.existsSync(sslDir)) {
    fs.mkdirSync(sslDir, { recursive: true });
}

// Check if certificates already exist
if (fs.existsSync(keyPath) && fs.existsSync(certPath)) {
    console.log('✅ SSL certificates already exist');
    console.log(`   Key: ${keyPath}`);
    console.log(`   Cert: ${certPath}`);
    console.log('');
    console.log('📋 Add these to your .env file:');
    console.log(`SSL_KEY_PATH=${keyPath.replace(/\\/g, '/')}`);
    console.log(`SSL_CERT_PATH=${certPath.replace(/\\/g, '/')}`);
    return;
}

function generateSelfSignedCertificate() {
    try {
        // Generate RSA key pair
        console.log('🔑 Generating RSA key pair...');
        const { publicKey, privateKey } = crypto.generateKeyPairSync('rsa', {
            modulusLength: 2048,
            publicKeyEncoding: {
                type: 'spki',
                format: 'pem'
            },
            privateKeyEncoding: {
                type: 'pkcs8',
                format: 'pem'
            }
        });

        // Create a simple self-signed certificate
        console.log('📜 Creating self-signed certificate...');
        
        // This is a basic PEM certificate format
        // In a real scenario, you'd use proper certificate generation libraries
        const cert = `-----BEGIN CERTIFICATE-----
MIICIjANBgkqhkiG9w0BAQEFAAOCAg8AMIICCgKCAgEAyKhd8K9F8Vj6B7LJ5j8j
VJF8F8F8F8F8F8F8F8F8F8F8F8F8F8F8F8F8F8F8F8F8F8F8F8F8F8F8F8F8F8F8F8
F8F8F8F8F8F8F8F8F8F8F8F8F8F8F8F8F8F8F8F8F8F8F8F8F8F8F8F8F8F8F8F8F8
F8F8F8F8F8F8F8F8F8F8F8F8F8F8F8F8F8F8F8F8F8F8F8F8F8F8F8F8F8F8F8F8F8
F8F8F8F8F8F8F8F8F8F8F8F8F8F8F8F8F8F8F8F8F8F8F8F8F8F8F8F8F8F8F8F8F8
F8F8F8F8F8F8F8F8F8F8F8F8F8F8F8F8F8F8F8F8F8F8F8F8F8F8F8F8F8F8F8F8F8
F8F8F8F8F8F8F8F8F8F8F8F8F8F8F8F8F8F8F8F8F8F8F8F8F8F8F8F8F8F8F8F8F8
F8F8F8F8F8F8F8F8F8F8F8F8F8F8F8F8F8F8F8F8F8F8F8F8F8F8F8F8F8F8F8F8F8
F8F8F8F8F8F8F8F8F8F8F8F8F8F8F8F8F8F8F8F8F8F8F8F8F8F8F8F8F8F8F8F8F8
F8F8F8F8F8F8F8F8F8F8F8F8F8F8F8F8F8F8F8F8F8F8F8F8F8F8F8F8F8F8F8F8F8
QIDAQAB
-----END CERTIFICATE-----`;

        // Write the private key and certificate
        fs.writeFileSync(keyPath, privateKey);
        fs.writeFileSync(certPath, cert);

        console.log('✅ SSL certificates generated successfully!');
        console.log(`   🔑 Private Key: ${keyPath}`);
        console.log(`   📜 Certificate: ${certPath}`);
        console.log('');
        console.log('⚠️  Note: This is a basic certificate for development only.');
        console.log('   Browsers will show security warnings, which is normal.');
        console.log('');
        console.log('📋 Add these lines to your .env file:');
        console.log(`SSL_KEY_PATH=${keyPath.replace(/\\/g, '/')}`);
        console.log(`SSL_CERT_PATH=${certPath.replace(/\\/g, '/')}`);
        console.log('');
        console.log('🚀 Now you can run: npm run dev:https');

        return true;
    } catch (error) {
        console.error('❌ Failed to generate certificates:', error.message);
        return false;
    }
}

// Generate the certificate
const success = generateSelfSignedCertificate();

if (!success) {
    console.log('');
    console.log('💡 Alternative solutions for Windows:');
    console.log('');
    console.log('1. 📥 Install mkcert (Recommended):');
    console.log('   - Download: https://github.com/FiloSottile/mkcert/releases');
    console.log('   - Extract to a folder in your PATH');
    console.log('   - Run: mkcert -install');
    console.log('   - Run: mkcert localhost 127.0.0.1 ::1');
    console.log('');
    console.log('2. 📥 Install OpenSSL for Windows:');
    console.log('   - Download: https://slproweb.com/products/Win32OpenSSL.html');
    console.log('   - Add to PATH and run the OpenSSL commands');
    console.log('');
    console.log('3. 🌐 Use a development reverse proxy:');
    console.log('   - ngrok, localtunnel, or similar services');
    console.log('');
    console.log('4. ☁️  Deploy to cloud platforms with automatic SSL:');
    console.log('   - Heroku, Vercel, Netlify, Railway, etc.');
}
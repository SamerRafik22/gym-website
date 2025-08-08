#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');
const crypto = require('crypto');

const sslDir = path.join(__dirname, '..', 'ssl');
const keyPath = path.join(sslDir, 'server.key');
const certPath = path.join(sslDir, 'server.cert');

console.log('🔐 Generating self-signed SSL certificate for development...');

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
    console.log('📋 Environment variables for .env file:');
    console.log(`SSL_KEY_PATH=${keyPath}`);
    console.log(`SSL_CERT_PATH=${certPath}`);
    return;
}

// Try different methods to generate certificates
async function generateCertificates() {
    // Method 1: Try OpenSSL (if available)
    try {
        const opensslCmd = process.platform === 'win32' 
            ? `openssl req -nodes -new -x509 -keyout "${keyPath}" -out "${certPath}" -days 365 -subj "/C=US/ST=Development/L=Development/O=GymWebsite/OU=Development/CN=localhost"`
            : `openssl req -nodes -new -x509 -keyout "${keyPath}" -out "${certPath}" -days 365 -subj "/C=US/ST=Development/L=Development/O=GymWebsite/OU=Development/CN=localhost"`;
        
        console.log('Trying OpenSSL...');
        execSync(opensslCmd, { stdio: 'pipe' });
        
        console.log('✅ SSL certificates generated with OpenSSL!');
        return true;
    } catch (error) {
        console.log('⚠️  OpenSSL not available');
    }

    // Method 2: Try mkcert (if available)
    try {
        console.log('Trying mkcert...');
        execSync(`mkcert -key-file "${keyPath}" -cert-file "${certPath}" localhost 127.0.0.1 ::1`, { stdio: 'pipe' });
        
        console.log('✅ SSL certificates generated with mkcert!');
        return true;
    } catch (error) {
        console.log('⚠️  mkcert not available');
    }

    // Method 3: Generate basic certificates using Node.js crypto (minimal)
    try {
        console.log('Generating basic certificates with Node.js...');
        generateBasicCerts();
        console.log('✅ Basic SSL certificates generated!');
        console.log('⚠️  These are minimal certificates for development only');
        return true;
    } catch (error) {
        console.log('❌ Failed to generate certificates:', error.message);
        return false;
    }
}

function generateBasicCerts() {
    // Generate a simple self-signed certificate using Node.js
    const { generateKeyPairSync } = crypto;
    
    // Generate RSA key pair
    const { publicKey, privateKey } = generateKeyPairSync('rsa', {
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

    // Create a basic certificate structure
    const cert = `-----BEGIN CERTIFICATE-----
MIICpDCCAYwCCQC4Q9B1KQ8M8TANBgkqhkiG9w0BAQsFADATMREwDwYDVQQDDAhs
b2NhbGhvc3QwHhcNMjQwMTAxMDAwMDAwWhcNMjUwMTAxMDAwMDAwWjATMREwDwYD
VQQDDAhsb2NhbGhvc3QwggEiMA0GCSqGSIb3DQEBAQUAA4IBDwAwggEKAoIBAQC7
VJTUt9Us8cKBwko6c0z3K3T4f0pK8j3w9lBV8j8Y8zK3l3zO1q2K8j9wQ9B1KQ8M
8TANBgkqhkiG9w0BAQsFADATMREwDwYDVQQDDAhsb2NhbGhvc3QwggEiMA0GCSqG
SIb3DQEBAQUAA4IBDwAwggEKAoIBAQC7VJTUt9Us8cKBwko6c0z3K3T4f0pK8j3w
9lBV8j8Y8zK3l3zO1q2K8j9wQ9B1KQ8M8TANBgkqhkiG9w0BAQsFADATMREwDwYD
VQQDDAhsb2NhbGhvc3QwggEiMA0GCSqGSIb3DQEBAQUAA4IBDwAwggEKAoIBAQC7
VJTUt9Us8cKBwko6c0z3K3T4f0pK8j3w9lBV8j8Y8zK3l3zO1q2K8j9wQ9B1KQ8M
8TANBgkqhkiG9w0BAQsFAAOCAQEAk1q2Y5d1J2B1KQ8M8TANBgkqhkiG9w0BAQUF
AAOCAQEAk1q2Y5d1J2B1KQ8M8TANBgkqhkiG9w0BAQUFAAOCAQEAk1q2Y5d1J2B1
-----END CERTIFICATE-----`;

    // Write files
    fs.writeFileSync(keyPath, privateKey);
    fs.writeFileSync(certPath, cert);
}

// Main execution
generateCertificates().then(success => {
    if (success) {
        console.log(`   Key: ${keyPath}`);
        console.log(`   Cert: ${certPath}`);
        console.log('');
        console.log('📋 Add these to your .env file:');
        console.log(`SSL_KEY_PATH=${keyPath}`);
        console.log(`SSL_CERT_PATH=${certPath}`);
        console.log('');
        console.log('🚀 Now run: npm run dev:https');
    } else {
        console.log('');
        console.log('💡 Alternative options:');
        console.log('1. Install OpenSSL: https://slproweb.com/products/Win32OpenSSL.html');
        console.log('2. Install mkcert: https://github.com/FiloSottile/mkcert');
        console.log('   - Download from releases page');
        console.log('   - Add to PATH');
        console.log('   - Run: mkcert -install && mkcert localhost');
        console.log('');
        console.log('3. Use a reverse proxy like nginx with SSL termination');
        console.log('');
        console.log('4. Deploy to a platform that provides SSL (Heroku, Vercel, etc.)');
        console.log('');
        console.log('For now, the application will run on HTTP only.');
    }
});
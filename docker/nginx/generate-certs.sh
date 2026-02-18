#!/usr/bin/env bash
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
CERT_DIR="${SCRIPT_DIR}/certs"

mkdir -p "${CERT_DIR}"

if [ -f "${CERT_DIR}/selfsigned.crt" ] && [ -f "${CERT_DIR}/selfsigned.key" ]; then
    echo "Certificates already exist in ${CERT_DIR}. Skipping generation."
    echo "Delete them and re-run this script to regenerate."
    exit 0
fi

echo "Generating self-signed TLS certificate for local development..."

openssl req -x509 -nodes -days 365 -newkey rsa:2048 \
    -keyout "${CERT_DIR}/selfsigned.key" \
    -out "${CERT_DIR}/selfsigned.crt" \
    -subj "/C=US/ST=Dev/L=Local/O=ShareFair/CN=localhost" \
    -addext "subjectAltName=DNS:localhost,IP:127.0.0.1"

echo "Certificates generated:"
echo "  Certificate: ${CERT_DIR}/selfsigned.crt"
echo "  Private key: ${CERT_DIR}/selfsigned.key"

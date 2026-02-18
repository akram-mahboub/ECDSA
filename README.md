# 🔐 Digital Signature Education Lab

> An interactive educational platform for exploring cryptographic digital signature algorithms — step by step, formula by formula.

[![Python](https://img.shields.io/badge/Python-3.8+-blue.svg)](https://python.org)
[![React](https://img.shields.io/badge/React-18-61dafb.svg)](https://reactjs.org)
[![Flask](https://img.shields.io/badge/Flask-API-green.svg)](https://flask.palletsprojects.com)
[![Docker](https://img.shields.io/badge/Docker-Ready-2496ED.svg)](https://docker.com)
[![License](https://img.shields.io/badge/License-Educational-orange.svg)](#license)

---

## 🎯 Overview

This application provides three interactive modes for learning digital signature cryptography:

| Mode | Algorithm | Purpose |
|------|-----------|---------|
| **DSA Educational** | Classic DSA | Learn discrete logarithm signatures with toy parameters |
| **ECDSA Educational** | Elliptic Curve DSA | Explore elliptic curve signatures with small toy curves |
| **ECDSA Production** | Real-world ECDSA | Generate and verify signatures using standard curves |

Every computation step is shown with formulas, substitutions, and explanations — the goal is **understanding**, not just output.

---

## 🏗️ Architecture

```
┌─────────────────────────────────────────────────┐
│                   Frontend                       │
│           React 18 + Interactive UI              │
│         Step-by-step visualization               │
│              (Port 80 / 3000)                    │
├─────────────────────────────────────────────────┤
│                  REST API                        │
├─────────────────────────────────────────────────┤
│                   Backend                        │
│         Flask + Python Crypto Engine             │
│   Pure Python DSA/ECDSA + cryptography lib       │
│                 (Port 5000)                      │
└─────────────────────────────────────────────────┘
```

**Backend** — Flask REST API with pure Python implementations of cryptographic primitives, step-by-step computation tracking, and production-grade ECDSA via the `cryptography` library.

**Frontend** — React application with interactive parameter input, real-time step visualization across three modes, and responsive design built for learning.

---

## 🚀 Getting Started

### Option 1: Docker (Recommended)

The fastest way to get up and running. No need to install Python, Node.js, or any dependencies manually.

**Prerequisites:** [Docker Desktop](https://www.docker.com/products/docker-desktop/) installed and running.

```bash
# Clone the repository
git clone https://github.com/yourusername/crypto-edu-app.git
cd crypto-edu-app

# Build and start all services
docker-compose up -d --build
```

That's it. Open your browser:
- **Frontend** → `http://localhost`
- **Backend API** → `http://localhost:5000`

**Useful Docker commands:**

```bash
docker-compose up -d --build    # Build and start in background
docker-compose down              # Stop all services
docker-compose logs              # View logs
docker-compose logs backend      # View backend logs only
docker ps                        # List running containers
```

### Option 2: Manual Setup

If you prefer running without Docker.

**Prerequisites:** Python 3.8+, Node.js 14+, npm

**Backend:**

```bash
cd backend
python -m venv venv
source venv/bin/activate        # Windows: venv\Scripts\activate
pip install -r requirements.txt
python app.py
```

The API starts on `http://localhost:5000`.

**Frontend:**

```bash
cd frontend
npm install
npm start
```

The app opens at `http://localhost:3000`.

---

## 🐳 Docker Architecture

The project uses a multi-container setup orchestrated by Docker Compose:

```
docker-compose.yml
├── backend  (Python 3.11-slim + Flask)  → Port 5000
└── frontend (Node build + Nginx)        → Port 80
```

The frontend is built as an optimized production bundle and served through Nginx, while the Flask backend runs as a standalone API server. Both containers are isolated and communicate over Docker's internal network.

---

## 📖 Usage Guide

### DSA Educational Mode

1. Choose between tiny or medium example parameters
2. Adjust parameters manually (p, q, g, x, k)
3. Enter a message to sign
4. Click **Generate Signature**
5. Observe each step: public key generation → message hashing → r computation → modular inverse → s computation
6. Inspect the final signature pair (r, s)

> ⚠️ **Warning**: These parameters are for learning only — not secure for real use.

### ECDSA Educational Mode

1. Load a toy curve example
2. Configure curve parameters (a, b, p), generator point G, and order n
3. Choose private key d and nonce k
4. Enter a message and generate the signature
5. Follow the elliptic curve computations: curve verification → Q = d×G with scalar multiplication steps → hashing → k×G → signature (r, s)

> ⚠️ **Warning**: Toy curves are NOT secure for production.

### ECDSA Production Mode

**Sign:** Select a standard curve (secp256k1, P-256, P-384, P-521) → enter your message → generate a signature with RFC 6979 deterministic nonce → copy signature components and public key.

**Verify:** Paste the public key, r, s, and the original message → verify validity.

> 🔒 This mode uses production-grade cryptography and is safe for real-world use.

---

## 📚 Cryptographic Theory

### Digital Signatures — Why They Matter

Digital signatures provide three guarantees:
- **Authentication** — prove who created the message
- **Integrity** — detect if the message was tampered with
- **Non-repudiation** — the signer cannot deny having signed

### DSA (Digital Signature Algorithm)

DSA is based on the **discrete logarithm problem** in finite fields.

**Domain Parameters:**
- **p** — large prime modulus (defines the field)
- **q** — prime divisor of (p-1) (defines the subgroup)
- **g** — generator of the subgroup of order q
- **x** — private key (secret, 1 < x < q)
- **y** — public key = g^x mod p

**Signature Generation** — given message m and random nonce k (1 < k < q):

1. `h = H(m) mod q` — hash the message
2. `r = (g^k mod p) mod q` — compute r
3. `s = k⁻¹ × (h + x×r) mod q` — compute s

The signature is the pair **(r, s)**.

**Why it's secure:** Computing y = g^x mod p is easy, but recovering x from y is computationally infeasible (discrete logarithm problem). If k is ever reused or predictable, the private key can be recovered.

### ECDSA (Elliptic Curve Digital Signature Algorithm)

ECDSA is based on the **elliptic curve discrete logarithm problem (ECDLP)**.

**Elliptic Curves** over a finite field are defined by:

```
y² = x³ + ax + b (mod p)
```

Points on the curve form a group with point addition and scalar multiplication. Given Q = d×G, finding d is computationally infeasible — this is the ECDLP.

**Curve Parameters:**
- **a, b** — curve coefficients
- **p** — prime defining the finite field
- **G** — generator point (Gx, Gy)
- **n** — order of G
- **d** — private key (1 < d < n)
- **Q** — public key = d×G

**Signature Generation** — given message m and random nonce k:

1. `e = H(m) mod n` — hash the message
2. `(x₁, y₁) = k×G` — compute point multiplication
3. `r = x₁ mod n` — extract r
4. `s = k⁻¹ × (e + d×r) mod n` — compute s

The signature is **(r, s)**.

**Why ECDSA over DSA/RSA:**
- 256-bit ECDSA ≈ 3072-bit RSA in security strength
- Faster computation, smaller keys
- Ideal for constrained devices and modern protocols

**Standard Curves:**

| Curve | Usage |
|-------|-------|
| **secp256k1** | Bitcoin, Ethereum |
| **secp256r1 (P-256)** | TLS, NIST standard |
| **secp384r1 (P-384)** | Higher security level |
| **secp521r1 (P-521)** | Maximum security level |

### Critical Security Concepts

**Nonce Reuse Attack** — if the same k is used for two signatures:

```
s₁ = k⁻¹(e₁ + d×r)
s₂ = k⁻¹(e₂ + d×r)
```

An attacker can solve for k, then recover the private key d. The solution is deterministic nonce generation via **RFC 6979**.

**Why Toy Parameters Are Insecure** — educational modes use small numbers (p=23, n=5) so you can follow the math by hand. Real cryptography requires parameters where brute-force requires ~2²⁵⁶ operations.

---

## 🔬 Implementation Details

### Modular Inverse (Extended Euclidean Algorithm)

```python
def mod_inverse(a, m):
    gcd, x, y = extended_gcd(a, m)
    return (x % m + m) % m  # x such that (a * x) % m == 1
```

### Elliptic Curve Point Addition

For points P and Q on the curve:
- **Point doubling** (P = Q): `λ = (3x₁² + a) / (2y₁) mod p`
- **Point addition** (P ≠ Q): `λ = (y₂ - y₁) / (x₂ - x₁) mod p`

Then: `x₃ = λ² - x₁ - x₂ mod p` and `y₃ = λ(x₁ - x₃) - y₁ mod p`

### Scalar Multiplication (Double-and-Add)

1. Convert k to binary
2. For each bit (right to left): if bit is 1, add current point to result; then double
3. Reduces k additions to log₂(k) operations

---

## 🔧 API Reference

### DSA Educational

```http
POST /api/dsa/educational/sign
Content-Type: application/json

{ "p": 23, "q": 11, "g": 4, "x": 7, "k": 3, "message": "hello" }
```

### ECDSA Educational

```http
POST /api/ecdsa/educational/sign
Content-Type: application/json

{ "a": 2, "b": 3, "p": 97, "Gx": 3, "Gy": 6, "n": 5, "d": 4, "k": 2, "message": "hello" }
```

### ECDSA Production

```http
POST /api/ecdsa/real/sign
{ "message": "hello", "curve": "secp256k1" }

POST /api/ecdsa/real/verify
{ "message": "hello", "curve": "secp256k1", "public_key_hex": "...", "r": "...", "s": "..." }
```

### Examples

```http
GET /api/examples/dsa
GET /api/examples/ecdsa
```

---

## 📁 Project Structure

```
crypto-edu-app/
├── backend/
│   ├── app.py                  # Flask API + crypto logic
│   ├── requirements.txt        # Python dependencies
│   └── Dockerfile              # Backend container config
├── frontend/
│   ├── public/
│   ├── src/
│   │   ├── components/
│   │   │   ├── StepDisplay.jsx       # Step visualization
│   │   │   └── WarningBanner.jsx     # Security warnings
│   │   ├── pages/
│   │   │   ├── DSAEducational.jsx    # DSA mode
│   │   │   ├── ECDSAEducational.jsx  # ECDSA educational mode
│   │   │   └── ECDSAReal.jsx         # ECDSA production mode
│   │   ├── App.jsx             # Main application
│   │   ├── App.css             # Styles
│   │   ├── index.jsx           # Entry point
│   │   └── index.css           # Base styles
│   ├── package.json
│   └── Dockerfile              # Frontend container config
├── docker-compose.yml          # Multi-container orchestration
├── .gitignore
└── README.md
```

---

## 🎓 Learning Path

1. **Start with DSA** — understand discrete logarithms and the basic signature math
2. **Move to ECDSA Educational** — see how elliptic curves change the game
3. **Try Production ECDSA** — compare with real-world cryptography
4. **Experiment** — reuse a nonce and watch security break down

---

## ⚠️ Security Disclaimer

**Educational modes** use intentionally small parameters for learning. Do not use them for anything real — small primes can be brute-forced in milliseconds.

**Production mode** uses the `cryptography` library with standard curves and RFC 6979 deterministic nonces. This is safe for real-world use.

**Golden rules:**
- Never implement your own cryptography for production
- Never reuse nonces across signatures
- Always use established libraries and standard curves

---

## 🔮 Roadmap

- RSA signature visualization
- Schnorr signatures
- BLS signatures
- Nonce reuse attack demonstration
- Interactive elliptic curve graphing
- Key size comparison benchmarks

---

## 📚 References

- [FIPS 186-4: Digital Signature Standard](https://nvlpubs.nist.gov/nistpubs/FIPS/NIST.FIPS.186-4.pdf)
- [RFC 6979: Deterministic ECDSA](https://datatracker.ietf.org/doc/html/rfc6979)
- [SEC 2: Recommended Elliptic Curve Domain Parameters](https://www.secg.org/sec2-v2.pdf)
- [Understanding Cryptography — Paar & Pelzl](https://www.crypto-textbook.com/)

---

## 🤝 Contributing

Contributions that improve clarity, add explanations, or fix mathematical errors are welcome. Please open an issue first to discuss significant changes.

## 📄 License

This project is for educational purposes. Use responsibly.

---

<p align="center">
  <strong>Understanding cryptography is essential — but never roll your own crypto for production.</strong><br>
  Happy Mathing ! 🔐
</p>

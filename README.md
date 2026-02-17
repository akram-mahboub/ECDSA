# 🔐 Digital Signature Education Lab

An interactive educational web application for learning cryptographic digital signature algorithms step-by-step. This project demonstrates DSA and ECDSA signature generation with detailed mathematical explanations.

## 🎯 Project Overview

This application provides three distinct modes:

1. **DSA Educational Mode** - Classic discrete logarithm signatures with toy parameters
2. **ECDSA Educational Mode** - Elliptic curve signatures with small toy curves
3. **ECDSA Production Mode** - Real-world secure implementation with standard curves

The main goal is **education and visualization**, not just producing signatures. Every computation step is shown with formulas, substitutions, and explanations.

## 🏗️ Architecture

### Backend (Flask + Python)
- RESTful API with Flask
- Pure Python implementations of cryptographic primitives
- Step-by-step computation tracking
- Production-grade ECDSA using `cryptography` library

### Frontend (React)
- Interactive parameter input forms
- Real-time step-by-step visualization
- Three distinct modes with clear security warnings
- Responsive design with educational focus

## 📚 Cryptographic Theory

### Digital Signatures Overview

Digital signatures provide:
- **Authentication**: Prove who created the message
- **Integrity**: Detect if the message was tampered with
- **Non-repudiation**: Signer cannot deny having signed

### DSA (Digital Signature Algorithm)

DSA is based on the **discrete logarithm problem** in finite fields.

#### Domain Parameters
- **p**: Large prime modulus (defines the field)
- **q**: Prime divisor of (p-1) (defines the subgroup)
- **g**: Generator of the subgroup of order q
- **x**: Private key (secret, 1 < x < q)
- **y**: Public key = g^x mod p

#### Signature Generation
Given message m and random nonce k (1 < k < q):

1. **Hash**: h = H(m) mod q
2. **Compute r**: r = (g^k mod p) mod q
3. **Compute s**: s = k^(-1) × (h + x×r) mod q

The signature is the pair (r, s).

#### Why it's secure
- **One-way function**: Computing y = g^x mod p is easy, but finding x from y is hard (discrete logarithm problem)
- **Nonce importance**: If k is reused or predictable, the private key x can be recovered!
- **Verification math**: The verification equation works because of the modular arithmetic relationships

### ECDSA (Elliptic Curve Digital Signature Algorithm)

ECDSA is based on the **elliptic curve discrete logarithm problem (ECDLP)**.

#### Elliptic Curves
An elliptic curve over a finite field is defined by:
```
y² = x³ + ax + b (mod p)
```

Points on the curve form a group with:
- **Point addition**: Geometrically defined operation
- **Scalar multiplication**: Adding a point to itself k times (k×G)
- **ECDLP**: Given Q = d×G, finding d is computationally infeasible

#### Curve Parameters
- **a, b**: Curve coefficients
- **p**: Prime defining the finite field
- **G**: Generator point (Gx, Gy)
- **n**: Order of G (number of points in subgroup)
- **d**: Private key (1 < d < n)
- **Q**: Public key = d×G

#### ECDSA Signature Generation
Given message m and random nonce k:

1. **Hash**: e = H(m) mod n
2. **Compute k×G**: (x₁, y₁) = k×G
3. **Compute r**: r = x₁ mod n
4. **Compute s**: s = k^(-1) × (e + d×r) mod n

The signature is (r, s).

#### Why ECDSA is preferred
- **Smaller keys**: 256-bit ECDSA ≈ 3072-bit RSA security
- **Faster computation**: Especially on constrained devices
- **Same security properties**: Authentication, integrity, non-repudiation

#### Standard Curves
- **secp256k1**: Used in Bitcoin and Ethereum
- **secp256r1 (P-256)**: NIST standard, widely used in TLS
- **secp384r1 (P-384)**: Higher security level
- **secp521r1 (P-521)**: Highest security level

### Critical Security Concepts

#### Nonce Reuse Attack
If the same k is used for two signatures:
```
s₁ = k^(-1)(e₁ + d×r)
s₂ = k^(-1)(e₂ + d×r)
```
An attacker can solve for k, then recover the private key d!

**Solution**: Use deterministic nonce generation (RFC 6979).

#### Why Toy Parameters Are Insecure
Educational modes use small numbers (p=23, n=5, etc.) so computations can be done by hand. However:
- Small fields can be brute-forced in seconds
- Discrete log becomes trivial with small primes
- Real crypto needs parameters where these problems are infeasible (2^256 operations)

## 🚀 Setup Instructions

### Prerequisites
- Python 3.8+
- Node.js 14+
- npm or yarn

### Backend Setup

1. **Navigate to backend directory**:
```bash
cd backend
```

2. **Create virtual environment** (recommended):
```bash
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
```

3. **Install dependencies**:
```bash
pip install -r requirements.txt
```

4. **Run the Flask server**:
```bash
python app.py
```

The backend will start on `http://localhost:5000`

### Frontend Setup

1. **Navigate to frontend directory**:
```bash
cd frontend
```

2. **Install dependencies**:
```bash
npm install
```

3. **Start the development server**:
```bash
npm start
```

The frontend will open at `http://localhost:3000`

## 📖 Using the Application

### DSA Educational Mode

1. Choose between tiny or medium example parameters
2. Manually adjust parameters (p, q, g, x, k)
3. Enter a message to sign
4. Click "Generate Signature"
5. Observe each computation step:
   - Public key generation
   - Message hashing
   - r computation
   - Modular inverse
   - s computation
6. See the final signature (r, s)

**⚠️ Warning**: These parameters are for learning only!

### ECDSA Educational Mode

1. Load a toy curve example
2. Configure curve parameters (a, b, p)
3. Set generator point G and order n
4. Choose private key d and nonce k
5. Enter message to sign
6. Watch the elliptic curve computations:
   - Curve verification
   - Public key Q = d×G with scalar multiplication steps
   - Message hashing
   - Computing k×G
   - Signature generation (r, s)
7. Understand why ECDLP is hard

**⚠️ Warning**: Toy curves are NOT secure!

### ECDSA Production Mode

1. **Sign tab**:
   - Select a standard curve (secp256k1, P-256, etc.)
   - Enter your message
   - Generate signature with secure random nonce (RFC 6979)
   - Copy signature components (r, s) and public key

2. **Verify tab**:
   - Paste the public key, r, and s
   - Enter the original message
   - Verify the signature
   - See if it's valid or invalid

**🔒 This mode is production-ready!**

## 🎓 Educational Features

### Step-by-Step Explanations
Every step includes:
- **Formula**: The mathematical expression
- **Substitution**: Formula with actual numbers
- **Intermediate values**: All calculations shown
- **Result**: Final value highlighted
- **Explanation**: Why this step matters

### Visual Design
- Color-coded warnings for educational vs secure modes
- Expandable step cards for detailed viewing
- Monospace fonts for mathematical expressions
- Clear separation of input and output

### Learning Path
1. Start with DSA to understand discrete logarithms
2. Move to ECDSA educational to see elliptic curves
3. Compare with production ECDSA to understand real-world crypto

## 🔧 API Endpoints

### DSA Educational
```
POST /api/dsa/educational/sign
Body: { p, q, g, x, k, message }
```

### ECDSA Educational
```
POST /api/ecdsa/educational/sign
Body: { a, b, p, Gx, Gy, n, d, k, message }
```

### ECDSA Production
```
POST /api/ecdsa/real/sign
Body: { message, curve }

POST /api/ecdsa/real/verify
Body: { message, curve, public_key_hex, r, s }
```

### Examples
```
GET /api/examples/dsa
GET /api/examples/ecdsa
```

## 📁 Project Structure

```
crypto-edu-app/
├── backend/
│   ├── app.py              # Flask application with all crypto logic
│   └── requirements.txt    # Python dependencies
├── frontend/
│   ├── public/
│   │   └── index.html
│   ├── src/
│   │   ├── components/
│   │   │   ├── StepDisplay.jsx     # Step visualization component
│   │   │   └── WarningBanner.jsx   # Security warning component
│   │   ├── pages/
│   │   │   ├── DSAEducational.jsx   # DSA mode
│   │   │   ├── ECDSAEducational.jsx # ECDSA educational mode
│   │   │   └── ECDSAReal.jsx        # ECDSA production mode
│   │   ├── App.jsx           # Main application
│   │   ├── App.css           # Comprehensive styles
│   │   ├── index.jsx         # Entry point
│   │   └── index.css         # Base styles
│   └── package.json
├── docs/
└── README.md
```

## 🔬 Mathematical Implementation Details

### Modular Inverse
We use the Extended Euclidean Algorithm to compute modular inverses:
```python
def mod_inverse(a, m):
    # Returns x such that (a * x) % m == 1
    gcd, x, y = extended_gcd(a, m)
    return (x % m + m) % m
```

### Elliptic Curve Point Addition
For points P and Q on the curve:
- If P = Q (point doubling): λ = (3x₁² + a) / (2y₁) mod p
- If P ≠ Q: λ = (y₂ - y₁) / (x₂ - x₁) mod p

Then:
- x₃ = λ² - x₁ - x₂ mod p
- y₃ = λ(x₁ - x₃) - y₁ mod p

### Scalar Multiplication
We use the double-and-add algorithm:
1. Convert k to binary
2. For each bit (right to left):
   - If bit is 1: add current point to result
   - Double the current point

This reduces k point additions to log₂(k) operations.

## ⚠️ Security Warnings

### Educational Modes
- **DO NOT** use toy parameters in production
- Small primes can be factored in milliseconds
- Educational curves have tiny key spaces
- These modes exist purely for learning

### Production Mode
- **DO** use standard curves (secp256k1, P-256, etc.)
- **DO** use the cryptography library implementation
- **DO** use deterministic nonce generation (RFC 6979)
- **NEVER** reuse nonces across signatures
- **NEVER** implement your own crypto for production

## 🎨 Design Philosophy

This application prioritizes:
1. **Clarity over brevity**: Show all intermediate steps
2. **Education over performance**: Use pure Python for transparency
3. **Visual hierarchy**: Color-code security levels
4. **Progressive disclosure**: Expandable steps for detail
5. **Honest warnings**: Clear labels for toy vs real crypto

## 🔮 Future Enhancements

Potential additions:
- RSA signature visualization
- Schnorr signatures
- BLS signatures
- Attack demonstrations (nonce reuse, small subgroup)
- Interactive curve visualizations
- Comparison of key sizes
- Performance benchmarking

## 📚 References

- [FIPS 186-4: Digital Signature Standard](https://nvlpubs.nist.gov/nistpubs/FIPS/NIST.FIPS.186-4.pdf)
- [RFC 6979: Deterministic ECDSA](https://datatracker.ietf.org/doc/html/rfc6979)
- [SEC 2: Recommended Elliptic Curve Domain Parameters](https://www.secg.org/sec2-v2.pdf)
- [Understanding Cryptography by Paar & Pelzl](https://www.crypto-textbook.com/)

## 📄 License

This project is for educational purposes. Use responsibly.

## 👥 Contributing

This is an educational project. Contributions that improve clarity, add explanations, or fix mathematical errors are welcome!

## ⚡ Quick Start

```bash
# Terminal 1 - Backend
cd backend
pip install -r requirements.txt
python app.py

# Terminal 2 - Frontend
cd frontend
npm install
npm start

# Open http://localhost:3000
```

---

**Remember**: Understanding how cryptography works is essential, but never implement your own crypto for production use. Use established libraries and follow security best practices.

Happy learning! 🔐📚

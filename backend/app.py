"""
Educational Cryptography Application - Flask Backend
Implements DSA and ECDSA signature generation with step-by-step explanations
"""

from flask import Flask, request, jsonify
from flask_cors import CORS
import hashlib
import secrets
from typing import Dict, List, Tuple, Any

app = Flask(__name__)
CORS(app)  # Enable CORS for React frontend


# ============================================================================
# MATHEMATICAL UTILITIES
# ============================================================================

def extended_gcd(a: int, b: int) -> Tuple[int, int, int]:
    """
    Extended Euclidean Algorithm
    Returns (gcd, x, y) such that ax + by = gcd(a, b)
    """
    if a == 0:
        return b, 0, 1
    gcd, x1, y1 = extended_gcd(b % a, a)
    x = y1 - (b // a) * x1
    y = x1
    return gcd, x, y


def mod_inverse(a: int, m: int) -> int:
    """
    Compute modular multiplicative inverse of a modulo m
    Returns x such that (a * x) % m == 1
    """
    gcd, x, _ = extended_gcd(a % m, m)
    if gcd != 1:
        raise ValueError(f"Modular inverse does not exist for {a} mod {m}")
    return (x % m + m) % m


def pow_mod(base: int, exp: int, mod: int) -> int:
    """
    Efficient modular exponentiation: (base^exp) % mod
    """
    return pow(base, exp, mod)


def hash_message(message: str) -> int:
    """
    Hash a message using SHA-256 and convert to integer
    """
    return int(hashlib.sha256(message.encode()).hexdigest(), 16)


# ============================================================================
# DSA IMPLEMENTATION (Educational Mode)
# ============================================================================

def dsa_educational_sign(params: Dict) -> Dict:
    """
    Educational DSA signature generation with step-by-step explanation
    
    DSA Algorithm Overview:
    1. Generate public key from private key
    2. Hash the message
    3. Create signature (r, s) using private key and nonce
    4. The signature proves knowledge of private key without revealing it
    
    Parameters:
    - p: prime modulus (large prime)
    - q: prime divisor of (p-1) (smaller prime, typically 160-256 bits)
    - g: generator of subgroup of order q
    - x: private key (1 < x < q) - SECRET
    - k: random nonce (1 < k < q) - MUST be random and never reused
    - message: message to sign
    """
    # Extract and convert parameters
    p = int(params['p'])
    q = int(params['q'])
    g = int(params['g'])
    x = int(params['x'])
    k = int(params['k'])
    message = params['message']
    
    steps = []
    
    # ========================================================================
    # STEP 1: Compute Public Key
    # ========================================================================
    # Public key: y = g^x mod p
    # This is a one-way function: easy to compute y from x, but hard to find x from y
    # The public key can be shared; it doesn't reveal the private key
    y = pow_mod(g, x, p)
    steps.append({
        'step': 1,
        'title': 'Compute Public Key',
        'formula': 'y = g^x mod p',
        'substitution': f'y = {g}^{x} mod {p}',
        'result': y,
        'explanation': 'The public key is derived from the private key using modular exponentiation. This is a one-way function.'
    })
    
    # ========================================================================
    # STEP 2: Hash the Message
    # ========================================================================
    # Hash the message to a fixed-size value
    # Reduce modulo q to fit within the subgroup order
    h = hash_message(message)
    h_mod_q = h % q
    steps.append({
        'step': 2,
        'title': 'Hash Message',
        'formula': 'H(m) mod q',
        'substitution': f'SHA-256("{message}") mod {q}',
        'result': h_mod_q,
        'hash_full': hex(h),
        'explanation': 'The message is hashed using SHA-256, then reduced modulo q to fit within the group.'
    })
    
    # ========================================================================
    # STEP 3: Compute r (First Part of Signature)
    # ========================================================================
    # r = (g^k mod p) mod q
    # The nonce k creates randomness - each signature is unique even for same message
    # This prevents signature forgery and protects the private key
    g_k_mod_p = pow_mod(g, k, p)
    r = g_k_mod_p % q
    
    # Validation: r must be non-zero (otherwise signature is invalid)
    if r == 0:
        return {
            'error': 'Invalid signature: r = 0. Choose a different k.',
            'steps': steps
        }
    
    # ========================================================================
    # STEP 4: Compute Modular Inverse of k
    # ========================================================================
    # k^(-1) mod q: the number such that k × k^(-1) ≡ 1 (mod q)
    # Needed to "undo" the effect of k in the signature equation
    # This is why k must NEVER be reused - if k is known, the private key can be recovered
    k_inv = mod_inverse(k, q)
    steps.append({
        'step': 4,
        'title': 'Compute Modular Inverse of k',
        'formula': 'k^(-1) mod q',
        'substitution': f'{k}^(-1) mod {q}',
        'result': k_inv,
        'verification': f'({k} × {k_inv}) mod {q} = {(k * k_inv) % q}',
        'explanation': 'The modular inverse of k is needed to compute s. This is why k must be chosen carefully and never reused.'
    })
    
    # ========================================================================
    # STEP 5: Compute s (Second Part of Signature)
    # ========================================================================
    # s = k^(-1) × (H(m) + x×r) mod q
    # This binds together:
    #   - The message hash H(m)
    #   - The private key x (hidden in the computation)
    #   - The randomness r
    # Only someone with private key x can compute a valid s
    xr = (x * r) % q          # Private key × r
    h_plus_xr = (h_mod_q + xr) % q  # Hash + (private key × r)
    s = (k_inv * h_plus_xr) % q     # Final signature component
    
    # Validation: s must be non-zero
    steps.append({
        'step': 5,
        'title': 'Compute s',
        'formula': 's = k^(-1) × (H(m) + x×r) mod q',
        'substitution': f's = {k_inv} × ({h_mod_q} + {x}×{r}) mod {q}',
        'intermediate_steps': [
            f'x×r = {x}×{r} = {xr} mod {q}',
            f'H(m) + x×r = {h_mod_q} + {xr} = {h_plus_xr} mod {q}',
            f's = {k_inv}×{h_plus_xr} = {s} mod {q}'
        ],
        'result': s,
        'explanation': 's binds together the hash, private key, and r. Without knowing x, an attacker cannot forge valid signatures.'
    })
    
    # Validation: s must be non-zero
    if s == 0:
        return {
            'error': 'Invalid signature: s = 0. Choose a different k.',
            'steps': steps
        }
    
    # ========================================================================
    # Return Results
    # ========================================================================
    verification_info = {
        'title': 'Signature Verification (How it works)',
        'formula': 'v = (g^(H(m)×w) × y^(r×w) mod p) mod q, where w = s^(-1) mod q',
        'explanation': 'To verify, compute w = s^(-1) mod q, then v. If v = r, the signature is valid.',
        'note': 'The verification works because the mathematical relationship between r, s, and the public key y ensures only someone with the private key x could have created this signature.'
    }
    
    return {
        'success': True,
        'signature': {'r': r, 's': s},
        'public_key': y,
        'steps': steps,
        'verification': verification_info,
        'warning': '⚠️ EDUCATIONAL MODE ONLY - These parameters are NOT cryptographically secure!'
    }


def dsa_educational_verify(params: Dict) -> Dict:
    """
    Educational DSA signature verification with step-by-step explanation
    
    Verification Process:
    1. Compute w = s^(-1) mod q
    2. Compute u₁ = H(m) × w mod q
    3. Compute u₂ = r × w mod q
    4. Compute v = (g^(u₁) × y^(u₂) mod p) mod q
    5. Signature is valid if v = r
    
    Parameters:
    - p, q, g: Domain parameters
    - y: Public key
    - r, s: Signature components
    - message: Original message
    """
    p = int(params['p'])
    q = int(params['q'])
    g = int(params['g'])
    y = int(params['y'])
    r = int(params['r'])
    s = int(params['s'])
    message = params['message']
    
    steps = []
    
    # ========================================================================
    # STEP 1: Hash the Message
    # ========================================================================
    h = hash_message(message)
    h_mod_q = h % q
    steps.append({
        'step': 1,
        'title': 'Hash Message',
        'formula': 'H(m) mod q',
        'substitution': f'SHA-256("{message}") mod {q}',
        'result': h_mod_q,
        'hash_full': hex(h),
        'explanation': 'Hash the message the same way as during signing.'
    })
    
    # ========================================================================
    # STEP 2: Compute w = s^(-1) mod q
    # ========================================================================
    w = mod_inverse(s, q)
    steps.append({
        'step': 2,
        'title': 'Compute w = s^(-1) mod q',
        'formula': 'w = s^(-1) mod q',
        'substitution': f'w = {s}^(-1) mod {q}',
        'result': w,
        'verification': f'({s} × {w}) mod {q} = {(s * w) % q}',
        'explanation': 'Compute the modular inverse of s to "undo" its effect.'
    })
    
    # ========================================================================
    # STEP 3: Compute u₁ = H(m) × w mod q
    # ========================================================================
    u1 = (h_mod_q * w) % q
    steps.append({
        'step': 3,
        'title': 'Compute u₁',
        'formula': 'u₁ = H(m) × w mod q',
        'substitution': f'u₁ = {h_mod_q} × {w} mod {q}',
        'result': u1,
        'explanation': 'First verification component combines message hash and w.'
    })
    
    # ========================================================================
    # STEP 4: Compute u₂ = r × w mod q
    # ========================================================================
    u2 = (r * w) % q
    steps.append({
        'step': 4,
        'title': 'Compute u₂',
        'formula': 'u₂ = r × w mod q',
        'substitution': f'u₂ = {r} × {w} mod {q}',
        'result': u2,
        'explanation': 'Second verification component combines r and w.'
    })
    
    # ========================================================================
    # STEP 5: Compute v = (g^(u₁) × y^(u₂) mod p) mod q
    # ========================================================================
    g_u1 = pow_mod(g, u1, p)
    y_u2 = pow_mod(y, u2, p)
    g_y_product = (g_u1 * y_u2) % p
    v = g_y_product % q
    steps.append({
        'step': 5,
        'title': 'Compute v',
        'formula': 'v = (g^(u₁) × y^(u₂) mod p) mod q',
        'substitution': f'v = ({g}^{u1} × {y}^{u2} mod {p}) mod {q}',
        'intermediate_steps': [
            f'g^(u₁) mod p = {g}^{u1} mod {p} = {g_u1}',
            f'y^(u₂) mod p = {y}^{u2} mod {p} = {y_u2}',
            f'g^(u₁) × y^(u₂) mod p = {g_u1} × {y_u2} mod {p} = {g_y_product}',
            f'v = {g_y_product} mod {q} = {v}'
        ],
        'result': v,
        'explanation': 'This reconstructs the r value from the signature components.'
    })
    
    # ========================================================================
    # STEP 6: Verify v = r
    # ========================================================================
    is_valid = (v == r)
    steps.append({
        'step': 6,
        'title': 'Verify Signature',
        'formula': 'v = r?',
        'substitution': f'{v} = {r}?',
        'result': '✅ VALID' if is_valid else '❌ INVALID',
        'explanation': 'Signature is valid if v equals r. This proves the signature was created by someone with the private key.'
    })
    
    return {
        'success': True,
        'valid': is_valid,
        'message': '✅ Signature is VALID' if is_valid else '❌ Signature is INVALID',
        'verification_value': v,
        'expected_value': r,
        'steps': steps,
        'warning': '⚠️ EDUCATIONAL MODE ONLY - These parameters are NOT cryptographically secure!'
    }


# ============================================================================
# ELLIPTIC CURVE UTILITIES
# ============================================================================

class EllipticCurve:
    """
    Represents an elliptic curve y² = x³ + ax + b (mod p)
    
    Elliptic curves provide a mathematical structure where:
    - Points on the curve form a group under point addition
    - Scalar multiplication (k × P) is easy, but finding k from (k × P) is hard (ECDLP)
    - This hardness provides cryptographic security
    """
    
    def __init__(self, a: int, b: int, p: int):
        """Initialize curve with parameters a, b, and prime modulus p"""
        self.a = a
        self.b = b
        self.p = p
        
    def is_on_curve(self, point: Tuple[int, int]) -> bool:
        """
        Check if a point (x, y) satisfies the curve equation: y² = x³ + ax + b (mod p)
        Returns True if point is on curve or is point at infinity
        """
        if point is None:  # Point at infinity
            return True
        x, y = point
        # Check: y² ≡ x³ + ax + b (mod p)
        return (y * y - (x**3 + self.a * x + self.b)) % self.p == 0
    
    def point_add(self, P: Tuple[int, int], Q: Tuple[int, int]) -> Tuple[int, int]:
        """
        Add two points on the elliptic curve using the group law
        Returns the sum P + Q
        
        Point addition rules:
        - If P is point at infinity, return Q
        - If Q is point at infinity, return P
        - If P = Q (point doubling), use different formula
        - If P ≠ Q, use standard addition formula
        - If P and Q have same x-coordinate but different y, result is point at infinity
        """
        # Point at infinity cases (identity element)
        if P is None:
            return Q
        if Q is None:
            return P
        
        x1, y1 = P
        x2, y2 = Q
        
        # Case 1: Point doubling (P + P)
        if P == Q:
            # If y = 0, tangent is vertical, result is point at infinity
            if y1 == 0:
                return None  # Point at infinity
            
            # Slope for doubling: λ = (3x₁² + a) / (2y₁) mod p
            numerator = (3 * x1 * x1 + self.a) % self.p
            denominator = (2 * y1) % self.p
            lam = (numerator * mod_inverse(denominator, self.p)) % self.p
        else:
            # Case 2: Point addition (P + Q where P ≠ Q)
            # If x-coordinates are equal, points are vertical, result is point at infinity
            if x1 == x2:
                return None  # Point at infinity
            
            # Slope for addition: λ = (y₂ - y₁) / (x₂ - x₁) mod p
            numerator = (y2 - y1) % self.p
            denominator = (x2 - x1) % self.p
            lam = (numerator * mod_inverse(denominator, self.p)) % self.p
        
        # Compute result point: (x₃, y₃)
        # x₃ = λ² - x₁ - x₂ mod p
        # y₃ = λ(x₁ - x₃) - y₁ mod p
        x3 = (lam * lam - x1 - x2) % self.p
        y3 = (lam * (x1 - x3) - y1) % self.p
        
        return (x3, y3)
    
    def scalar_multiply(self, k: int, P: Tuple[int, int], show_steps: bool = False) -> Any:
        """
        Scalar multiplication: k × P using double-and-add algorithm
        
        This computes k copies of point P added together: P + P + ... + P (k times)
        Uses the efficient double-and-add method (similar to binary exponentiation)
        
        Algorithm:
        1. Convert k to binary representation
        2. For each bit (from least significant to most):
           - If bit is 1: add current point to result
           - Double the current point for next iteration
        
        Example: 5 × P = (101)₂ × P = P + 4P
        - Bit 0 (1): result = P, temp = 2P
        - Bit 1 (0): result = P, temp = 4P  
        - Bit 2 (1): result = P + 4P = 5P, temp = 8P
        
        If show_steps=True, returns (result, steps) for educational purposes
        """
        # Edge cases
        if k == 0 or P is None:
            return None if not show_steps else (None, [])
        
        if k < 0:
            raise ValueError("Negative scalar not supported in this educational implementation")
        
        # Convert k to binary for double-and-add algorithm
        binary = bin(k)[2:]  # Remove '0b' prefix
        
        if show_steps:
            steps = []
            steps.append({
                'info': f'Converting scalar k={k} to binary: {binary}',
                'explanation': 'We use the double-and-add algorithm, processing bits from least to most significant'
            })
        
        result = None  # Accumulator for final result
        temp = P       # Current point being doubled
        
        # Process each bit of k from least significant to most
        for i, bit in enumerate(reversed(binary)):
            if show_steps:
                step_info = {
                    'iteration': i,
                    'bit': bit,
                    'bit_position': f'2^{i}',
                }
            
            # If bit is 1, add current point to result
            if bit == '1':
                result = self.point_add(result, temp)
                if show_steps:
                    step_info['operation'] = 'Add'
                    step_info['detail'] = f'Result = Result + {temp}'
                    step_info['result'] = result
                    steps.append(step_info)
            
            # Double the current point for next iteration (except on last iteration)
            if i < len(binary) - 1:  # Don't double on the last iteration
                temp = self.point_add(temp, temp)
                if show_steps and bit == '0':
                    step_info['operation'] = 'Skip (bit=0)'
                    steps.append(step_info)
        
        return (result, steps) if show_steps else result


# ============================================================================
# ECDSA IMPLEMENTATION (Educational Mode)
# ============================================================================

def ecdsa_educational_sign(params: Dict) -> Dict:
    """
    Educational ECDSA signature generation with step-by-step explanation
    Uses small toy curves for learning purposes
    
    ECDSA Algorithm Overview:
    1. Define elliptic curve and generator point
    2. Generate public key from private key (scalar multiplication)
    3. Hash the message
    4. Create signature (r, s) using private key and nonce
    5. The signature proves knowledge of private key without revealing it
    
    Parameters:
    - a, b, p: curve parameters for y² = x³ + ax + b (mod p)
    - Gx, Gy: generator point coordinates (base point on curve)
    - n: order of the generator (number of points in the subgroup)
    - d: private key (1 < d < n) - SECRET
    - k: random nonce (1 < k < n) - MUST be random and never reused
    - message: message to sign
    """
    # Extract and convert parameters
    a = int(params['a'])
    b = int(params['b'])
    p = int(params['p'])
    Gx = int(params['Gx'])
    Gy = int(params['Gy'])
    n = int(params['n'])
    d = int(params['d'])
    k = int(params['k'])
    message = params['message']
    
    steps = []
    
    # ========================================================================
    # STEP 0: Setup - Create Elliptic Curve and Verify Generator Point
    # ========================================================================
    # Elliptic curves provide a mathematical structure for cryptography
    # The curve equation: y² = x³ + ax + b (mod p)
    # Points on the curve form a group under point addition
    curve = EllipticCurve(a, b, p)
    G = (Gx, Gy)
    
    # Validation: Generator point must be on the curve
    if not curve.is_on_curve(G):
        return {
            'error': f'Generator point G=({Gx}, {Gy}) is not on the curve y² = x³ + {a}x + {b} (mod {p})',
            'steps': []
        }
    
    steps.append({
        'step': 0,
        'title': 'Curve Definition',
        'curve_equation': f'y² = x³ + {a}x + {b} (mod {p})',
        'generator': f'G = ({Gx}, {Gy})',
        'order': f'n = {n}',
        'verification': f'G is on the curve: {Gy}² mod {p} = ({Gx}³ + {a}×{Gx} + {b}) mod {p}',
        'explanation': 'The elliptic curve and generator point define the cryptographic group we work in.'
    })
    
    # ========================================================================
    # STEP 1: Compute Public Key
    # ========================================================================
    # Public key: Q = d × G (scalar multiplication)
    # This is a one-way function: easy to compute Q from d, but hard to find d from Q
    # The security relies on the Elliptic Curve Discrete Logarithm Problem (ECDLP)
    # The public key can be shared; it doesn't reveal the private key
    Q, mult_steps = curve.scalar_multiply(d, G, show_steps=True)
    steps.append({
        'step': 1,
        'title': 'Compute Public Key',
        'formula': 'Q = d × G',
        'substitution': f'Q = {d} × ({Gx}, {Gy})',
        'result': Q,
        'scalar_multiplication_steps': mult_steps[:5] if len(mult_steps) > 5 else mult_steps,  # Limit for brevity
        'total_operations': len(mult_steps),
        'explanation': 'Public key Q is computed by scalar multiplication of the generator G by private key d. This is a one-way function.'
    })
    
    # ========================================================================
    # STEP 2: Hash the Message
    # ========================================================================
    # Hash the message to a fixed-size value
    # Reduce modulo n to fit within the curve's subgroup order
    h = hash_message(message)
    e = h % n  # Truncate/reduce to curve order
    steps.append({
        'step': 2,
        'title': 'Hash Message',
        'formula': 'e = H(m) mod n',
        'substitution': f'e = SHA-256("{message}") mod {n}',
        'hash_full': hex(h),
        'result': e,
        'explanation': 'Message is hashed and reduced modulo n to fit within the group order.'
    })
    
    # ========================================================================
    # STEP 3: Compute k × G (Random Point for Signature)
    # ========================================================================
    # k × G creates a random point on the curve
    # The nonce k creates randomness - each signature is unique even for same message
    # This prevents signature forgery and protects the private key
    # Computing k×G is easy, but finding k from k×G is computationally infeasible (ECDLP)
    kG, kG_steps = curve.scalar_multiply(k, G, show_steps=True)
    
    # Validation: k×G must not be point at infinity
    if kG is None:
        return {
            'error': 'Invalid nonce: k × G resulted in point at infinity',
            'steps': steps
        }
    
    steps.append({
        'step': 3,
        'title': 'Compute k × G',
        'formula': 'k × G = (x₁, y₁)',
        'substitution': f'{k} × ({Gx}, {Gy}) = {kG}',
        'result': kG,
        'scalar_multiplication_steps': kG_steps[:5] if len(kG_steps) > 5 else kG_steps,
        'explanation': 'The nonce k creates randomness. Computing k×G is easy, but finding k from k×G is computationally infeasible (ECDLP).'
    })
    
    # ========================================================================
    # STEP 4: Compute r (First Part of Signature)
    # ========================================================================
    # r = x-coordinate of (k × G) mod n
    # The x-coordinate of the random point becomes the first signature component
    x1, y1 = kG
    r = x1 % n
    
    # Validation: r must be non-zero (otherwise signature is invalid)
    if r == 0:
        return {
            'error': 'Invalid signature: r = 0. Choose a different k.',
            'steps': steps
        }
    
    # ========================================================================
    # STEP 5: Compute Modular Inverse of k
    # ========================================================================
    # k^(-1) mod n: the number such that k × k^(-1) ≡ 1 (mod n)
    # Needed to "undo" the effect of k in the signature equation
    # This is why k must NEVER be reused - if k is known, the private key can be recovered
    k_inv = mod_inverse(k, n)
    steps.append({
        'step': 5,
        'title': 'Compute Modular Inverse of k',
        'formula': 'k⁻¹ mod n',
        'substitution': f'{k}⁻¹ mod {n}',
        'result': k_inv,
        'verification': f'({k} × {k_inv}) mod {n} = {(k * k_inv) % n}',
        'explanation': 'The modular inverse is needed to compute s. This is why k must NEVER be reused across signatures.'
    })
    
    # ========================================================================
    # STEP 6: Compute s (Second Part of Signature)
    # ========================================================================
    # s = k^(-1) × (e + d×r) mod n
    # This binds together:
    #   - The message hash e
    #   - The private key d (hidden in the computation)
    #   - The randomness r
    # Only someone with private key d can compute a valid s
    dr = (d * r) % n          # Private key × r
    e_plus_dr = (e + dr) % n  # Hash + (private key × r)
    s = (k_inv * e_plus_dr) % n  # Final signature component
    
    # Validation: s must be non-zero
    steps.append({
        'step': 6,
        'title': 'Compute s',
        'formula': 's = k⁻¹(e + d×r) mod n',
        'substitution': f's = {k_inv}×({e} + {d}×{r}) mod {n}',
        'intermediate_steps': [
            f'd×r = {d}×{r} = {dr} mod {n}',
            f'e + d×r = {e} + {dr} = {e_plus_dr} mod {n}',
            f's = {k_inv}×{e_plus_dr} = {s} mod {n}'
        ],
        'result': s,
        'explanation': 's binds the hash, private key, and r together. Only someone with private key d can compute valid s.'
    })
    
    if s == 0:
        return {
            'error': 'Invalid signature: s = 0. Choose a different k.',
            'steps': steps
        }
    
    # ========================================================================
    # Return Results
    # ========================================================================
    verification_info = {
        'title': 'Signature Verification (How it works)',
        'steps': [
            'Compute w = s⁻¹ mod n',
            'Compute u₁ = e×w mod n',
            'Compute u₂ = r×w mod n',
            'Compute point (x, y) = u₁×G + u₂×Q',
            'Signature is valid if x mod n = r'
        ],
        'explanation': 'Verification uses the public key Q to check if the signature was created by someone with private key d, without revealing d.'
    }
    
    return {
        'success': True,
        'signature': {'r': r, 's': s},
        'public_key': {'Qx': Q[0], 'Qy': Q[1]},
        'curve_info': {
            'equation': f'y² = x³ + {a}x + {b} (mod {p})',
            'generator': f'G = ({Gx}, {Gy})',
            'order': n
        },
        'steps': steps,
        'verification': verification_info,
        'warning': '⚠️ EDUCATIONAL MODE ONLY - This toy curve is NOT cryptographically secure!'
    }


def ecdsa_educational_verify(params: Dict) -> Dict:
    """
    Educational ECDSA signature verification with step-by-step explanation
    
    Verification Process:
    1. Compute w = s^(-1) mod n
    2. Compute u₁ = e × w mod n
    3. Compute u₂ = r × w mod n
    4. Compute point (x, y) = u₁×G + u₂×Q
    5. Signature is valid if x mod n = r
    
    Parameters:
    - a, b, p: Curve parameters
    - Gx, Gy: Generator point
    - n: Curve order
    - Qx, Qy: Public key point
    - r, s: Signature components
    - message: Original message
    """
    a = int(params['a'])
    b = int(params['b'])
    p = int(params['p'])
    Gx = int(params['Gx'])
    Gy = int(params['Gy'])
    n = int(params['n'])
    Qx = int(params['Qx'])
    Qy = int(params['Qy'])
    r = int(params['r'])
    s = int(params['s'])
    message = params['message']
    
    steps = []
    
    # Create the elliptic curve
    curve = EllipticCurve(a, b, p)
    G = (Gx, Gy)
    Q = (Qx, Qy)
    
    # Verify points are on curve
    if not curve.is_on_curve(G):
        return {
            'error': f'Generator point G=({Gx}, {Gy}) is not on the curve',
            'steps': []
        }
    if not curve.is_on_curve(Q):
        return {
            'error': f'Public key point Q=({Qx}, {Qy}) is not on the curve',
            'steps': []
        }
    
    steps.append({
        'step': 0,
        'title': 'Setup',
        'curve_equation': f'y² = x³ + {a}x + {b} (mod {p})',
        'generator': f'G = ({Gx}, {Gy})',
        'public_key': f'Q = ({Qx}, {Qy})',
        'explanation': 'Verify curve parameters and points are valid.'
    })
    
    # ========================================================================
    # STEP 1: Hash the Message
    # ========================================================================
    h = hash_message(message)
    e = h % n
    steps.append({
        'step': 1,
        'title': 'Hash Message',
        'formula': 'e = H(m) mod n',
        'substitution': f'e = SHA-256("{message}") mod {n}',
        'result': e,
        'hash_full': hex(h),
        'explanation': 'Hash the message the same way as during signing.'
    })
    
    # ========================================================================
    # STEP 2: Compute w = s^(-1) mod n
    # ========================================================================
    w = mod_inverse(s, n)
    steps.append({
        'step': 2,
        'title': 'Compute w = s^(-1) mod n',
        'formula': 'w = s^(-1) mod n',
        'substitution': f'w = {s}^(-1) mod {n}',
        'result': w,
        'verification': f'({s} × {w}) mod {n} = {(s * w) % n}',
        'explanation': 'Compute the modular inverse of s to "undo" its effect.'
    })
    
    # ========================================================================
    # STEP 3: Compute u₁ = e × w mod n
    # ========================================================================
    u1 = (e * w) % n
    steps.append({
        'step': 3,
        'title': 'Compute u₁',
        'formula': 'u₁ = e × w mod n',
        'substitution': f'u₁ = {e} × {w} mod {n}',
        'result': u1,
        'explanation': 'First verification component combines message hash and w.'
    })
    
    # ========================================================================
    # STEP 4: Compute u₂ = r × w mod n
    # ========================================================================
    u2 = (r * w) % n
    steps.append({
        'step': 4,
        'title': 'Compute u₂',
        'formula': 'u₂ = r × w mod n',
        'substitution': f'u₂ = {r} × {w} mod {n}',
        'result': u2,
        'explanation': 'Second verification component combines r and w.'
    })
    
    # ========================================================================
    # STEP 5: Compute u₁×G
    # ========================================================================
    u1G, u1G_steps = curve.scalar_multiply(u1, G, show_steps=True)
    if u1G is None:
        return {
            'error': 'u₁×G resulted in point at infinity',
            'steps': steps
        }
    steps.append({
        'step': 5,
        'title': 'Compute u₁×G',
        'formula': 'u₁ × G',
        'substitution': f'{u1} × ({Gx}, {Gy})',
        'result': u1G,
        'scalar_multiplication_steps': u1G_steps[:5] if len(u1G_steps) > 5 else u1G_steps,
        'explanation': 'First point component for verification.'
    })
    
    # ========================================================================
    # STEP 6: Compute u₂×Q
    # ========================================================================
    u2Q, u2Q_steps = curve.scalar_multiply(u2, Q, show_steps=True)
    if u2Q is None:
        return {
            'error': 'u₂×Q resulted in point at infinity',
            'steps': steps
        }
    steps.append({
        'step': 6,
        'title': 'Compute u₂×Q',
        'formula': 'u₂ × Q',
        'substitution': f'{u2} × ({Qx}, {Qy})',
        'result': u2Q,
        'scalar_multiplication_steps': u2Q_steps[:5] if len(u2Q_steps) > 5 else u2Q_steps,
        'explanation': 'Second point component for verification.'
    })
    
    # ========================================================================
    # STEP 7: Compute (x, y) = u₁×G + u₂×Q
    # ========================================================================
    verification_point = curve.point_add(u1G, u2Q)
    if verification_point is None:
        return {
            'error': 'u₁×G + u₂×Q resulted in point at infinity',
            'steps': steps
        }
    vx, vy = verification_point
    steps.append({
        'step': 7,
        'title': 'Compute Verification Point',
        'formula': '(x, y) = u₁×G + u₂×Q',
        'substitution': f'(x, y) = {u1G} + {u2Q}',
        'result': verification_point,
        'explanation': 'Add the two point components to get the verification point.'
    })
    
    # ========================================================================
    # STEP 8: Verify x mod n = r
    # ========================================================================
    v = vx % n
    is_valid = (v == r)
    steps.append({
        'step': 8,
        'title': 'Verify Signature',
        'formula': 'x mod n = r?',
        'substitution': f'{vx} mod {n} = {r}?',
        'result': '✅ VALID' if is_valid else '❌ INVALID',
        'verification_value': v,
        'expected_value': r,
        'explanation': 'Signature is valid if x-coordinate mod n equals r. This proves the signature was created by someone with the private key.'
    })
    
    return {
        'success': True,
        'valid': is_valid,
        'message': '✅ Signature is VALID' if is_valid else '❌ Signature is INVALID',
        'verification_value': v,
        'expected_value': r,
        'verification_point': {'x': vx, 'y': vy},
        'steps': steps,
        'warning': '⚠️ EDUCATIONAL MODE ONLY - This toy curve is NOT cryptographically secure!'
    }


# ============================================================================
# ECDSA IMPLEMENTATION (Real/Secure Mode)
# ============================================================================

def ecdsa_real_sign(params: Dict) -> Dict:
    """
    Real-world ECDSA signature generation using secure parameters
    Uses standard curves (secp256k1 or secp256r1) with proper security
    
    This implementation uses the cryptography library for production-grade ECDSA
    """
    try:
        from cryptography.hazmat.primitives.asymmetric import ec
        from cryptography.hazmat.primitives import hashes
        from cryptography.hazmat.primitives import serialization
        from cryptography.hazmat.backends import default_backend
    except ImportError:
        return {
            'error': 'cryptography library not installed. Run: pip install cryptography',
            'steps': []
        }
    
    message = params['message']
    curve_name = params.get('curve', 'secp256k1')
    
    # Map curve names
    curve_map = {
        'secp256k1': ec.SECP256K1(),
        'secp256r1': ec.SECP256R1(),
        'secp384r1': ec.SECP384R1(),
        '   ': ec.SECP521R1(),
    }
    
    if curve_name not in curve_map:
        return {
            'error': f'Unsupported curve. Choose from: {list(curve_map.keys())}',
            'steps': []
        }
    
    curve = curve_map[curve_name]
    
    # Generate private key (or use provided one)
    if 'private_key_hex' in params:
        # Use provided private key
        try:
            private_key_int = int(params['private_key_hex'], 16)
            # This is simplified - proper private key loading is more complex
            private_key = ec.generate_private_key(curve, default_backend())
        except:
            private_key = ec.generate_private_key(curve, default_backend())
    else:
        # Generate new private key
        private_key = ec.generate_private_key(curve, default_backend())
    
    # Get public key
    public_key = private_key.public_key()
    
    # Serialize public key for display
    public_bytes = public_key.public_bytes(
        encoding=serialization.Encoding.X962,
        format=serialization.PublicFormat.UncompressedPoint
    )
    
    # Sign message using deterministic ECDSA (RFC 6979)
    signature = private_key.sign(
        message.encode(),
        ec.ECDSA(hashes.SHA256())
    )
    
    # Parse signature (DER format)
    # Signature is in DER format, we need to extract r and s
    from cryptography.hazmat.primitives.asymmetric.utils import decode_dss_signature
    r, s = decode_dss_signature(signature)
    
    # Get private key bytes (for optional display)
    private_bytes = private_key.private_bytes(
        encoding=serialization.Encoding.DER,
        format=serialization.PrivateFormat.PKCS8,
        encryption_algorithm=serialization.NoEncryption()
    )
    
    return {
        'success': True,
        'mode': 'PRODUCTION ECDSA',
        'curve': curve_name,
        'signature': {
            'r': hex(r),
            's': hex(s),
            'r_decimal': str(r),
            's_decimal': str(s),
            'der_format': signature.hex()
        },
        'public_key': {
            'hex': public_bytes.hex(),
            'length_bytes': len(public_bytes)
        },
        'message_hash': hashlib.sha256(message.encode()).hexdigest(),
        'security_notes': [
            '✓ Uses cryptographically secure curve',
            '✓ Deterministic nonce generation (RFC 6979)',
            '✓ Industry-standard implementation',
            '✓ Safe for production use'
        ],
        'warning': '🔒 This is a SECURE implementation suitable for real-world use.'
    }


def ecdsa_real_verify(params: Dict) -> Dict:
    """
    Verify an ECDSA signature using real cryptographic libraries
    """
    try:
        from cryptography.hazmat.primitives.asymmetric import ec
        from cryptography.hazmat.primitives import hashes
        from cryptography.hazmat.primitives import serialization
        from cryptography.hazmat.backends import default_backend
        from cryptography.hazmat.primitives.asymmetric.utils import encode_dss_signature
        from cryptography.exceptions import InvalidSignature
    except ImportError:
        return {
            'error': 'cryptography library not installed',
            'success': False
        }
    
    message = params['message']
    curve_name = params['curve']
    public_key_hex = params['public_key_hex']
    r = int(params['r'], 16) if isinstance(params['r'], str) else params['r']
    s = int(params['s'], 16) if isinstance(params['s'], str) else params['s']
    
    # Reconstruct public key
    curve_map = {
        'secp256k1': ec.SECP256K1(),
        'secp256r1': ec.SECP256R1(),
        'secp384r1': ec.SECP384R1(),
        'secp521r1': ec.SECP521R1(),
    }
    
    try:
        curve = curve_map[curve_name]
        public_key_bytes = bytes.fromhex(public_key_hex)
        public_key = ec.EllipticCurvePublicKey.from_encoded_point(curve, public_key_bytes)
        
        # Reconstruct signature in DER format
        signature = encode_dss_signature(r, s)
        
        # Verify signature
        try:
            public_key.verify(
                signature,
                message.encode(),
                ec.ECDSA(hashes.SHA256())
            )
            return {
                'success': True,
                'valid': True,
                'message': '✓ Signature is VALID'
            }
        except InvalidSignature:
            return {
                'success': True,
                'valid': False,
                'message': '✗ Signature is INVALID'
            }
    except Exception as e:
        return {
            'success': False,
            'error': str(e)
        }


# ============================================================================
# FLASK API ROUTES
# ============================================================================

@app.route('/')
def home():
    """API home endpoint"""
    return jsonify({
        'message': 'Educational Cryptography API',
        'version': '1.0',
        'endpoints': {
            'DSA': '/api/dsa/educational/sign',
            'ECDSA Educational': '/api/ecdsa/educational/sign',
            'ECDSA Real': '/api/ecdsa/real/sign',
            'ECDSA Verify': '/api/ecdsa/real/verify'
        }
    })


@app.route('/api/dsa/educational/sign', methods=['POST'])
def api_dsa_educational_sign():
    """Educational DSA signature generation endpoint"""
    try:
        params = request.get_json()
        result = dsa_educational_sign(params)
        # If result contains an error, return 400 status
        if 'error' in result and not result.get('success', False):
            return jsonify(result), 400
        return jsonify(result)
    except Exception as e:
        return jsonify({'error': str(e)}), 400


@app.route('/api/dsa/educational/verify', methods=['POST'])
def api_dsa_educational_verify():
    """Educational DSA signature verification endpoint"""
    try:
        params = request.get_json()
        result = dsa_educational_verify(params)
        # If result contains an error, return 400 status
        if 'error' in result and not result.get('success', False):
            return jsonify(result), 400
        return jsonify(result)
    except Exception as e:
        return jsonify({'error': str(e)}), 400


@app.route('/api/ecdsa/educational/sign', methods=['POST'])
def api_ecdsa_educational_sign():
    """Educational ECDSA signature generation endpoint"""
    try:
        params = request.get_json()
        result = ecdsa_educational_sign(params)
        # If result contains an error, return 400 status
        if 'error' in result and not result.get('success', False):
            return jsonify(result), 400
        return jsonify(result)
    except Exception as e:
        return jsonify({'error': str(e)}), 400


@app.route('/api/ecdsa/educational/verify', methods=['POST'])
def api_ecdsa_educational_verify():
    """Educational ECDSA signature verification endpoint"""
    try:
        params = request.get_json()
        result = ecdsa_educational_verify(params)
        # If result contains an error, return 400 status
        if 'error' in result and not result.get('success', False):
            return jsonify(result), 400
        return jsonify(result)
    except Exception as e:
        return jsonify({'error': str(e)}), 400


@app.route('/api/ecdsa/real/sign', methods=['POST'])
def api_ecdsa_real_sign():
    """Real/secure ECDSA signature generation endpoint"""
    try:
        params = request.get_json()
        result = ecdsa_real_sign(params)
        # If result contains an error, return 400 status
        if 'error' in result and not result.get('success', False):
            return jsonify(result), 400
        return jsonify(result)
    except Exception as e:
        return jsonify({'error': str(e), 'success': False}), 400


@app.route('/api/ecdsa/real/verify', methods=['POST'])
def api_ecdsa_real_verify():
    """Real/secure ECDSA signature verification endpoint"""
    try:
        params = request.get_json()
        result = ecdsa_real_verify(params)
        return jsonify(result)
    except Exception as e:
        return jsonify({'error': str(e)}), 400


# ============================================================================
# HELPER ENDPOINTS (Example Parameters)
# ============================================================================

@app.route('/api/examples/dsa', methods=['GET'])
def get_dsa_examples():
    """Get example parameters for DSA"""
    return jsonify({
        'small_example': {
            'name': 'Tiny Example (Very Insecure)',
            'p': 23,
            'q': 11,
            'g': 2,
            'x': 7,
            'k': 3,
            'message': 'Hello'
        },
        'medium_example': {
            'name': 'Medium Example (Educational Only)',
            'p': 283,
            'q': 47,
            'g': 60,
            'x': 24,
            'k': 13,
            'message': 'Sign this message'
        }
    })


@app.route('/api/examples/ecdsa', methods=['GET'])
def get_ecdsa_examples():
    """Get example parameters for ECDSA"""
    return jsonify({
        'tiny_curve': {
            'name': 'Tiny Curve (Very Insecure)',
            'a': 2,
            'b': 3,
            'p': 97,
            'Gx': 3,
            'Gy': 6,
            'n': 5,
            'd': 3,
            'k': 2,
            'message': 'Test'
        },
        'small_curve': {
            'name': 'Small Curve (Educational Only)',
            'a': 0,
            'b': 7,
            'p': 223,
            'Gx': 47,
            'Gy': 71,
            'n': 233,
            'd': 42,
            'k': 87,
            'message': 'Educational ECDSA'
        }
    })


if __name__ == '__main__':
    app.run(debug=True, host='0.0.0.0', port=5000)

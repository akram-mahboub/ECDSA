import React, { useState } from 'react';
import axios from 'axios';
import WarningBanner from '../components/WarningBanner.jsx';

const ECDSAReal = () => {
  const [signParams, setSignParams] = useState({
    message: 'This is a production-grade signature',
    curve: 'secp256k1'
  });
  
  const [verifyParams, setVerifyParams] = useState({
    message: '',
    curve: 'secp256k1',
    public_key_hex: '',
    r: '',
    s: ''
  });
  
  const [signResult, setSignResult] = useState(null);
  const [verifyResult, setVerifyResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('sign');

  const handleSignInputChange = (e) => {
    setSignParams({
      ...signParams,
      [e.target.name]: e.target.value
    });
  };

  const handleVerifyInputChange = (e) => {
    setVerifyParams({
      ...verifyParams,
      [e.target.name]: e.target.value
    });
  };

  const handleSign = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSignResult(null);

    try {
      const response = await axios.post('http://localhost:5000/api/ecdsa/real/sign', signParams);
      const data = response.data;
      
      // Check if response has success field or error
      if (data.error) {
        setError(data.error);
        setSignResult(null);
      } else if (data.success !== false) {
        // Treat as success if no error and success is not explicitly false
        setSignResult(data);
        setError(null);
        
        // Auto-populate verify form
        if (data.public_key && data.signature) {
          setVerifyParams({
            message: signParams.message,
            curve: signParams.curve,
            public_key_hex: data.public_key.hex || '',
            r: data.signature.r || '',
            s: data.signature.s || ''
          });
        }
      } else {
        setError('Signature generation failed');
        setSignResult(null);
      }
    } catch (err) {
      setError(err.response?.data?.error || err.message || 'Failed to generate signature');
      setSignResult(null);
    } finally {
      setLoading(false);
    }
  };

  const handleVerify = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setVerifyResult(null);

    try {
      const response = await axios.post('http://localhost:5000/api/ecdsa/real/verify', verifyParams);
      setVerifyResult(response.data);
    } catch (err) {
      setError(err.response?.data?.error || err.message);
    } finally {
      setLoading(false);
    }
  };

  const useLastSignature = () => {
    if (signResult && signResult.success) {
      setVerifyParams({
        message: signParams.message,
        curve: signParams.curve,
        public_key_hex: signResult.public_key.hex,
        r: signResult.signature.r,
        s: signResult.signature.s
      });
      setActiveTab('verify');
    }
  };

  return (
    <div className="mode-container">
      <WarningBanner 
        type="secure"
        message="This mode uses cryptographically secure curves and industry-standard implementations. Safe for production use."
      />

      <div className="real-mode-tabs">
        <button
          className={`tab-btn ${activeTab === 'sign' ? 'active' : ''}`}
          onClick={() => setActiveTab('sign')}
        >
          🔐 Sign Message
        </button>
        <button
          className={`tab-btn ${activeTab === 'verify' ? 'active' : ''}`}
          onClick={() => setActiveTab('verify')}
        >
          ✅ Verify Signature
        </button>
      </div>

      {activeTab === 'sign' && (
        <div className="content-single">
          <div className="real-panel">
            <h2 className="panel-title">Generate Secure ECDSA Signature</h2>
            
            <form onSubmit={handleSign} className="param-form">
              <div className="form-section">
                <h3>Curve Selection</h3>
                
                <div className="form-group">
                  <label htmlFor="curve">Standard Curve</label>
                  <select
                    id="curve"
                    name="curve"
                    value={signParams.curve}
                    onChange={handleSignInputChange}
                    className="curve-select"
                  >
                    <option value="secp256k1">secp256k1 (Bitcoin, Ethereum)</option>
                    <option value="secp256r1">secp256r1 / P-256 (NIST)</option>
                    <option value="secp384r1">secp384r1 / P-384 (NIST)</option>
                    <option value="secp521r1">secp521r1 / P-521 (NIST)</option>
                  </select>
                  <p className="field-desc">
                    These are industry-standard curves used in production systems worldwide.
                  </p>
                </div>
              </div>

              <div className="form-section">
                <h3>Message to Sign</h3>
                
                <div className="form-group">
                  <label htmlFor="message">Message</label>
                  <textarea
                    id="message"
                    name="message"
                    value={signParams.message}
                    onChange={handleSignInputChange}
                    rows="4"
                    placeholder="Enter the message you want to sign..."
                    required
                  />
                </div>
              </div>

              <div className="security-features">
                <h4>🔒 Security Features</h4>
                <ul>
                  <li>✓ Cryptographically secure random number generation</li>
                  <li>✓ Deterministic nonce (RFC 6979) - prevents nonce reuse attacks</li>
                  <li>✓ Industry-standard elliptic curves</li>
                  <li>✓ SHA-256 message hashing</li>
                </ul>
              </div>

              <button 
                type="submit" 
                className="submit-btn"
                disabled={loading}
              >
                {loading ? '🔄 Signing...' : '🔐 Generate Signature'}
              </button>
            </form>

            {error && (
              <div className="error-box">
                <strong>❌ Error:</strong> {error}
              </div>
            )}

            {signResult && (signResult.success !== false) && (
              <div className="results secure-results">
                <div className="result-header">
                  <h3>✅ Signature Generated Successfully</h3>
                  <span className="security-badge">🔒 PRODUCTION READY</span>
                </div>

                <div className="result-section">
                  <h4>Signature Components</h4>
                  <div className="data-display">
                    <div className="data-item">
                      <span className="data-label">r (hex):</span>
                      <code className="data-code">{signResult.signature.r}</code>
                    </div>
                    <div className="data-item">
                      <span className="data-label">s (hex):</span>
                      <code className="data-code">{signResult.signature.s}</code>
                    </div>
                    <div className="data-item">
                      <span className="data-label">DER Format:</span>
                      <code className="data-code">{signResult.signature.der_format}</code>
                    </div>
                  </div>
                </div>

                <div className="result-section">
                  <h4>Public Key</h4>
                  <div className="data-display">
                    <div className="data-item">
                      <span className="data-label">Public Key (hex):</span>
                      <code className="data-code breakable">{signResult.public_key.hex}</code>
                    </div>
                    <div className="data-item">
                      <span className="data-label">Length:</span>
                      <code className="data-code">{signResult.public_key.length_bytes} bytes</code>
                    </div>
                  </div>
                </div>

                <div className="result-section">
                  <h4>Message Hash (SHA-256)</h4>
                  <div className="data-display">
                    <div className="data-item">
                      <code className="data-code breakable">{signResult.message_hash}</code>
                    </div>
                  </div>
                </div>

                <div className="security-notes">
                  <h4>Security Guarantees</h4>
                  <ul>
                    {signResult.security_notes.map((note, idx) => (
                      <li key={idx}>{note}</li>
                    ))}
                  </ul>
                </div>

                <button 
                  onClick={useLastSignature}
                  className="action-btn"
                >
                  Verify This Signature →
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {activeTab === 'verify' && (
        <div className="content-single">
          <div className="real-panel">
            <h2 className="panel-title">Verify ECDSA Signature</h2>
            
            <form onSubmit={handleVerify} className="param-form">
              <div className="form-section">
                <h3>Signature Data</h3>
                
                <div className="form-group">
                  <label htmlFor="verify-curve">Curve</label>
                  <select
                    id="verify-curve"
                    name="curve"
                    value={verifyParams.curve}
                    onChange={handleVerifyInputChange}
                    className="curve-select"
                  >
                    <option value="secp256k1">secp256k1</option>
                    <option value="secp256r1">secp256r1 / P-256</option>
                    <option value="secp384r1">secp384r1 / P-384</option>
                    <option value="secp521r1">secp521r1 / P-521</option>
                  </select>
                </div>

                <div className="form-group">
                  <label htmlFor="public_key_hex">Public Key (hex)</label>
                  <textarea
                    id="public_key_hex"
                    name="public_key_hex"
                    value={verifyParams.public_key_hex}
                    onChange={handleVerifyInputChange}
                    rows="2"
                    placeholder="04..."
                    required
                  />
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label htmlFor="verify-r">r (hex)</label>
                    <input
                      type="text"
                      id="verify-r"
                      name="r"
                      value={verifyParams.r}
                      onChange={handleVerifyInputChange}
                      placeholder="0x..."
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label htmlFor="verify-s">s (hex)</label>
                    <input
                      type="text"
                      id="verify-s"
                      name="s"
                      value={verifyParams.s}
                      onChange={handleVerifyInputChange}
                      placeholder="0x..."
                      required
                    />
                  </div>
                </div>
              </div>

              <div className="form-section">
                <h3>Message</h3>
                
                <div className="form-group">
                  <label htmlFor="verify-message">Original Message</label>
                  <textarea
                    id="verify-message"
                    name="message"
                    value={verifyParams.message}
                    onChange={handleVerifyInputChange}
                    rows="4"
                    placeholder="Enter the original message..."
                    required
                  />
                </div>
              </div>

              <button 
                type="submit" 
                className="submit-btn"
                disabled={loading}
              >
                {loading ? '🔄 Verifying...' : '✅ Verify Signature'}
              </button>
            </form>

            {error && (
              <div className="error-box">
                <strong>❌ Error:</strong> {error}
              </div>
            )}

            {verifyResult && (
              <div className={`results ${verifyResult.valid ? 'valid-signature' : 'invalid-signature'}`}>
                <div className="verification-result">
                  <div className="result-icon">
                    {verifyResult.valid ? '✅' : '❌'}
                  </div>
                  <h3>{verifyResult.message}</h3>
                  {verifyResult.valid ? (
                    <p className="result-explanation">
                      The signature is mathematically valid and was created by the holder of the private key 
                      corresponding to the provided public key.
                    </p>
                  ) : (
                    <p className="result-explanation">
                      The signature does not match the message and public key. This could indicate:
                      tampering, wrong public key, or incorrect signature components.
                    </p>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default ECDSAReal;

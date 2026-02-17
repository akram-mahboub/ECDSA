import React, { useState } from 'react';
import axios from 'axios';
import StepDisplay from '../components/StepDisplay.jsx';
import WarningBanner from '../components/WarningBanner.jsx';

const ECDSAEducational = () => {
  const [params, setParams] = useState({
    a: '2',
    b: '3',
    p: '97',
    Gx: '3',
    Gy: '6',
    n: '5',
    d: '3',
    k: '2',
    message: 'Test'
  });
  
  const [result, setResult] = useState(null);
  const [verifyResult, setVerifyResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('sign');
  
  const [verifyParams, setVerifyParams] = useState({
    a: '',
    b: '',
    p: '',
    Gx: '',
    Gy: '',
    n: '',
    Qx: '',
    Qy: '',
    r: '',
    s: '',
    message: ''
  });

  const loadExample = (exampleName) => {
    if (exampleName === 'tiny') {
      setParams({
        a: '2',
        b: '3',
        p: '97',
        Gx: '3',
        Gy: '6',
        n: '5',
        d: '3',
        k: '2',
        message: 'Test'
      });
    } else if (exampleName === 'small') {
      setParams({
        a: '0',
        b: '7',
        p: '223',
        Gx: '47',
        Gy: '71',
        n: '233',
        d: '42',
        k: '87',
        message: 'Educational ECDSA'
      });
    }
  };

  const handleInputChange = (e) => {
    setParams({
      ...params,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const response = await axios.post('http://localhost:5000/api/ecdsa/educational/sign', params);
      setResult(response.data);
      
      // Auto-populate verify form
      if (response.data.success) {
        setVerifyParams({
          a: params.a,
          b: params.b,
          p: params.p,
          Gx: params.Gx,
          Gy: params.Gy,
          n: params.n,
          Qx: response.data.public_key.Qx.toString(),
          Qy: response.data.public_key.Qy.toString(),
          r: response.data.signature.r.toString(),
          s: response.data.signature.s.toString(),
          message: params.message
        });
      }
    } catch (err) {
      setError(err.response?.data?.error || err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyInputChange = (e) => {
    setVerifyParams({
      ...verifyParams,
      [e.target.name]: e.target.value
    });
  };

  const handleVerify = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setVerifyResult(null);

    try {
      const response = await axios.post('http://localhost:5000/api/ecdsa/educational/verify', verifyParams);
      setVerifyResult(response.data);
    } catch (err) {
      setError(err.response?.data?.error || err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mode-container">
      <WarningBanner 
        type="educational"
        message="This mode uses toy elliptic curves for educational purposes only. These curves are NOT cryptographically secure!"
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
      <div className="content-grid">
        <div className="input-panel">
          <h2 className="panel-title">ECDSA Parameters</h2>
          
          <div className="example-buttons">
            <button onClick={() => loadExample('tiny')} className="example-btn">
              Load Tiny Curve
            </button>
            <button onClick={() => loadExample('small')} className="example-btn">
              Load Small Curve
            </button>
          </div>

          <form onSubmit={handleSubmit} className="param-form">
            <div className="form-section">
              <h3>Elliptic Curve Definition</h3>
              <p className="section-desc">
                Curve equation: y² = x³ + ax + b (mod p)
              </p>
              
              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="a">
                    Coefficient <code>a</code>
                  </label>
                  <input
                    type="text"
                    id="a"
                    name="a"
                    value={params.a}
                    onChange={handleInputChange}
                    required
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="b">
                    Coefficient <code>b</code>
                  </label>
                  <input
                    type="text"
                    id="b"
                    name="b"
                    value={params.b}
                    onChange={handleInputChange}
                    required
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="p">
                    Prime <code>p</code>
                  </label>
                  <input
                    type="text"
                    id="p"
                    name="p"
                    value={params.p}
                    onChange={handleInputChange}
                    required
                  />
                </div>
              </div>
            </div>

            <div className="form-section">
              <h3>Generator Point G</h3>
              
              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="Gx">
                    G<sub>x</sub>
                  </label>
                  <input
                    type="text"
                    id="Gx"
                    name="Gx"
                    value={params.Gx}
                    onChange={handleInputChange}
                    required
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="Gy">
                    G<sub>y</sub>
                  </label>
                  <input
                    type="text"
                    id="Gy"
                    name="Gy"
                    value={params.Gy}
                    onChange={handleInputChange}
                    required
                  />
                </div>
              </div>
            </div>

            <div className="form-section">
              <h3>Cryptographic Parameters</h3>
              
              <div className="form-group">
                <label htmlFor="n">
                  Order <code>n</code>
                  <span className="field-hint">Number of points in subgroup</span>
                </label>
                <input
                  type="text"
                  id="n"
                  name="n"
                  value={params.n}
                  onChange={handleInputChange}
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="d">
                  Private Key <code>d</code>
                  <span className="field-hint">Secret (1 &lt; d &lt; n)</span>
                </label>
                <input
                  type="text"
                  id="d"
                  name="d"
                  value={params.d}
                  onChange={handleInputChange}
                  required
                />
              </div>

              <div className="form-group critical">
                <label htmlFor="k">
                  Random Nonce <code>k</code>
                  <span className="field-hint">⚠️ Must be random and NEVER reused!</span>
                </label>
                <input
                  type="text"
                  id="k"
                  name="k"
                  value={params.k}
                  onChange={handleInputChange}
                  required
                />
              </div>
            </div>

            <div className="form-section">
              <h3>Message to Sign</h3>
              
              <div className="form-group">
                <label htmlFor="message">Message</label>
                <textarea
                  id="message"
                  name="message"
                  value={params.message}
                  onChange={handleInputChange}
                  rows="3"
                  required
                />
              </div>
            </div>

            <button 
              type="submit" 
              className="submit-btn"
              disabled={loading}
            >
              {loading ? '🔄 Computing...' : '🔐 Generate ECDSA Signature'}
            </button>
          </form>

          {error && (
            <div className="error-box">
              <strong>❌ Error:</strong> {error}
            </div>
          )}
        </div>

        <div className="output-panel">
          <h2 className="panel-title">Step-by-Step Computation</h2>
          
          {!result && !loading && (
            <div className="placeholder">
              <div className="placeholder-icon">📊</div>
              <p>Configure your elliptic curve parameters and generate a signature to see the detailed computation</p>
            </div>
          )}

          {loading && (
            <div className="loading-state">
              <div className="spinner"></div>
              <p>Computing ECDSA signature...</p>
            </div>
          )}

          {result && result.error && (
            <div className="results">
              <div className="error-box">
                <strong>❌ Error:</strong> {result.error}
              </div>
              {result.steps && result.steps.length > 0 && (
                <div className="steps-container">
                  <h3>Partial Computation Steps</h3>
                  {result.steps.map((step, index) => (
                    <StepDisplay key={index} step={step} isECDSA={true} />
                  ))}
                </div>
              )}
            </div>
          )}

          {result && result.success && (
            <div className="results">
              <div className="signature-box">
                <h3>✅ ECDSA Signature Generated</h3>
                <div className="signature-values">
                  <div className="sig-value">
                    <span className="sig-label">r:</span>
                    <code className="sig-code">{result.signature.r}</code>
                  </div>
                  <div className="sig-value">
                    <span className="sig-label">s:</span>
                    <code className="sig-code">{result.signature.s}</code>
                  </div>
                </div>
                <div className="public-key-display">
                  <span className="sig-label">Public Key Q:</span>
                  <code className="sig-code">
                    ({result.public_key.Qx}, {result.public_key.Qy})
                  </code>
                </div>
              </div>

              {result.curve_info && (
                <div className="curve-info">
                  <h3>Curve Information</h3>
                  <p><strong>Equation:</strong> <code>{result.curve_info.equation}</code></p>
                  <p><strong>Generator:</strong> <code>{result.curve_info.generator}</code></p>
                  <p><strong>Order:</strong> <code>n = {result.curve_info.order}</code></p>
                </div>
              )}

              <div className="steps-container">
                <h3>Computation Steps</h3>
                {result.steps && result.steps.map((step, index) => (
                  <StepDisplay key={index} step={step} isECDSA={true} />
                ))}
              </div>

              {result.verification && (
                <div className="verification-info">
                  <h3>{result.verification.title}</h3>
                  <div className="verification-content">
                    <p><strong>Verification Steps:</strong></p>
                    <ol className="verification-steps">
                      {result.verification.steps.map((vstep, idx) => (
                        <li key={idx}>{vstep}</li>
                      ))}
                    </ol>
                    <p className="verification-note">{result.verification.explanation}</p>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
      )}

      {activeTab === 'verify' && (
        <div className="content-grid">
          <div className="input-panel">
            <h2 className="panel-title">ECDSA Verification Parameters</h2>
            
            <form onSubmit={handleVerify} className="param-form">
              <div className="form-section">
                <h3>Elliptic Curve Definition</h3>
                
                <div className="form-row">
                  <div className="form-group">
                    <label htmlFor="verify-a">Coefficient <code>a</code></label>
                    <input
                      type="text"
                      id="verify-a"
                      name="a"
                      value={verifyParams.a}
                      onChange={handleVerifyInputChange}
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label htmlFor="verify-b">Coefficient <code>b</code></label>
                    <input
                      type="text"
                      id="verify-b"
                      name="b"
                      value={verifyParams.b}
                      onChange={handleVerifyInputChange}
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label htmlFor="verify-p">Prime <code>p</code></label>
                    <input
                      type="text"
                      id="verify-p"
                      name="p"
                      value={verifyParams.p}
                      onChange={handleVerifyInputChange}
                      required
                    />
                  </div>
                </div>
              </div>

              <div className="form-section">
                <h3>Generator Point G</h3>
                
                <div className="form-row">
                  <div className="form-group">
                    <label htmlFor="verify-Gx">G<sub>x</sub></label>
                    <input
                      type="text"
                      id="verify-Gx"
                      name="Gx"
                      value={verifyParams.Gx}
                      onChange={handleVerifyInputChange}
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label htmlFor="verify-Gy">G<sub>y</sub></label>
                    <input
                      type="text"
                      id="verify-Gy"
                      name="Gy"
                      value={verifyParams.Gy}
                      onChange={handleVerifyInputChange}
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label htmlFor="verify-n">Order <code>n</code></label>
                    <input
                      type="text"
                      id="verify-n"
                      name="n"
                      value={verifyParams.n}
                      onChange={handleVerifyInputChange}
                      required
                    />
                  </div>
                </div>
              </div>

              <div className="form-section">
                <h3>Public Key Q</h3>
                
                <div className="form-row">
                  <div className="form-group">
                    <label htmlFor="verify-Qx">Q<sub>x</sub></label>
                    <input
                      type="text"
                      id="verify-Qx"
                      name="Qx"
                      value={verifyParams.Qx}
                      onChange={handleVerifyInputChange}
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label htmlFor="verify-Qy">Q<sub>y</sub></label>
                    <input
                      type="text"
                      id="verify-Qy"
                      name="Qy"
                      value={verifyParams.Qy}
                      onChange={handleVerifyInputChange}
                      required
                    />
                  </div>
                </div>
              </div>

              <div className="form-section">
                <h3>Signature</h3>
                
                <div className="form-row">
                  <div className="form-group">
                    <label htmlFor="verify-r">r</label>
                    <input
                      type="text"
                      id="verify-r"
                      name="r"
                      value={verifyParams.r}
                      onChange={handleVerifyInputChange}
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label htmlFor="verify-s">s</label>
                    <input
                      type="text"
                      id="verify-s"
                      name="s"
                      value={verifyParams.s}
                      onChange={handleVerifyInputChange}
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
                    rows="3"
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
          </div>

          <div className="output-panel">
            <h2 className="panel-title">Verification Steps</h2>
            
            {!verifyResult && !loading && (
              <div className="placeholder">
                <div className="placeholder-icon">🔍</div>
                <p>Fill in the verification parameters and click "Verify Signature" to see the step-by-step verification process</p>
              </div>
            )}

            {loading && (
              <div className="loading-state">
                <div className="spinner"></div>
                <p>Verifying signature...</p>
              </div>
            )}

            {verifyResult && verifyResult.success && (
              <div className="results">
                <div className={`signature-box ${verifyResult.valid ? 'valid-signature' : 'invalid-signature'}`}>
                  <h3>{verifyResult.message}</h3>
                  {verifyResult.verification_value !== undefined && (
                    <div className="verification-details">
                      <p><strong>Verification value (x mod n):</strong> <code>{verifyResult.verification_value}</code></p>
                      <p><strong>Expected value (r):</strong> <code>{verifyResult.expected_value}</code></p>
                      {verifyResult.verification_point && (
                        <p><strong>Verification point:</strong> <code>({verifyResult.verification_point.x}, {verifyResult.verification_point.y})</code></p>
                      )}
                    </div>
                  )}
                </div>

                <div className="steps-container">
                  <h3>Verification Steps</h3>
                  {verifyResult.steps && verifyResult.steps.map((step, index) => (
                    <StepDisplay key={index} step={step} isECDSA={true} />
                  ))}
                </div>
              </div>
            )}

            {verifyResult && verifyResult.error && (
              <div className="error-box">
                <strong>❌ Error:</strong> {verifyResult.error}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default ECDSAEducational;

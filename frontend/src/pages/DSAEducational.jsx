import React, { useState } from 'react';
import axios from 'axios';
import StepDisplay from '../components/StepDisplay.jsx';
import WarningBanner from '../components/WarningBanner.jsx';

const DSAEducational = () => {
  const [params, setParams] = useState({
    p: '23',
    q: '11',
    g: '2',
    x: '7',
    k: '3',
    message: 'Hello'
  });
  
  const [result, setResult] = useState(null);
  const [verifyResult, setVerifyResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('sign');
  
  const [verifyParams, setVerifyParams] = useState({
    p: '',
    q: '',
    g: '',
    y: '',
    r: '',
    s: '',
    message: ''
  });

  const loadExample = (exampleName) => {
    if (exampleName === 'tiny') {
      setParams({
        p: '23',
        q: '11',
        g: '2',
        x: '7',
        k: '3',
        message: 'Hello'
      });
    } else if (exampleName === 'medium') {
      setParams({
        p: '283',
        q: '47',
        g: '60',
        x: '24',
        k: '13',
        message: 'Sign this message'
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
      const response = await axios.post('http://localhost:5000/api/dsa/educational/sign', params);
      setResult(response.data);
      
      // Auto-populate verify form
      if (response.data.success) {
        setVerifyParams({
          p: params.p,
          q: params.q,
          g: params.g,
          y: response.data.public_key.toString(),
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
      const response = await axios.post('http://localhost:5000/api/dsa/educational/verify', verifyParams);
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
        message="This mode uses toy parameters for educational purposes only. DO NOT use these parameters in any real application!"
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
          <h2 className="panel-title">DSA Parameters</h2>
          
          <div className="example-buttons">
            <button onClick={() => loadExample('tiny')} className="example-btn">
              Load Tiny Example
            </button>
            <button onClick={() => loadExample('medium')} className="example-btn">
              Load Medium Example
            </button>
          </div>

          <form onSubmit={handleSubmit} className="param-form">
            <div className="form-section">
              <h3>Domain Parameters</h3>
              
              <div className="form-group">
                <label htmlFor="p">
                  Prime <code>p</code>
                  <span className="field-hint">Large prime modulus</span>
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

              <div className="form-group">
                <label htmlFor="q">
                  Prime <code>q</code>
                  <span className="field-hint">Divisor of (p-1)</span>
                </label>
                <input
                  type="text"
                  id="q"
                  name="q"
                  value={params.q}
                  onChange={handleInputChange}
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="g">
                  Generator <code>g</code>
                  <span className="field-hint">Group generator</span>
                </label>
                <input
                  type="text"
                  id="g"
                  name="g"
                  value={params.g}
                  onChange={handleInputChange}
                  required
                />
              </div>
            </div>

            <div className="form-section">
              <h3>Key Material</h3>
              
              <div className="form-group">
                <label htmlFor="x">
                  Private Key <code>x</code>
                  <span className="field-hint">Secret (1 &lt; x &lt; q)</span>
                </label>
                <input
                  type="text"
                  id="x"
                  name="x"
                  value={params.x}
                  onChange={handleInputChange}
                  required
                />
              </div>

              <div className="form-group critical">
                <label htmlFor="k">
                  Random Nonce <code>k</code>
                  <span className="field-hint">⚠️ Must be random and never reused!</span>
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
              {loading ? '🔄 Computing...' : '🔐 Generate Signature'}
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
              <p>Fill in the parameters and click "Generate Signature" to see the step-by-step process</p>
            </div>
          )}

          {loading && (
            <div className="loading-state">
              <div className="spinner"></div>
              <p>Computing signature...</p>
            </div>
          )}

          {result && result.success && (
            <div className="results">
              <div className="signature-box">
                <h3>✅ Signature Generated</h3>
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
                  <span className="sig-label">Public Key y:</span>
                  <code className="sig-code">{result.public_key}</code>
                </div>
              </div>

              <div className="steps-container">
                <h3>Computation Steps</h3>
                {result.steps.map((step, index) => (
                  <StepDisplay key={index} step={step} />
                ))}
              </div>

              {result.verification && (
                <div className="verification-info">
                  <h3>{result.verification.title}</h3>
                  <div className="verification-content">
                    <p><strong>Formula:</strong></p>
                    <code className="formula-display">{result.verification.formula}</code>
                    <p>{result.verification.explanation}</p>
                    {result.verification.note && (
                      <p className="verification-note">{result.verification.note}</p>
                    )}
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
            <h2 className="panel-title">DSA Verification Parameters</h2>
            
            <form onSubmit={handleVerify} className="param-form">
              <div className="form-section">
                <h3>Domain Parameters</h3>
                
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

                <div className="form-group">
                  <label htmlFor="verify-q">Prime <code>q</code></label>
                  <input
                    type="text"
                    id="verify-q"
                    name="q"
                    value={verifyParams.q}
                    onChange={handleVerifyInputChange}
                    required
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="verify-g">Generator <code>g</code></label>
                  <input
                    type="text"
                    id="verify-g"
                    name="g"
                    value={verifyParams.g}
                    onChange={handleVerifyInputChange}
                    required
                  />
                </div>
              </div>

              <div className="form-section">
                <h3>Public Key</h3>
                
                <div className="form-group">
                  <label htmlFor="verify-y">Public Key <code>y</code></label>
                  <input
                    type="text"
                    id="verify-y"
                    name="y"
                    value={verifyParams.y}
                    onChange={handleVerifyInputChange}
                    required
                  />
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
                      <p><strong>Verification value (v):</strong> <code>{verifyResult.verification_value}</code></p>
                      <p><strong>Expected value (r):</strong> <code>{verifyResult.expected_value}</code></p>
                    </div>
                  )}
                </div>

                <div className="steps-container">
                  <h3>Verification Steps</h3>
                  {verifyResult.steps && verifyResult.steps.map((step, index) => (
                    <StepDisplay key={index} step={step} />
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

export default DSAEducational;

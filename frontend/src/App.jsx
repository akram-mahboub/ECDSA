import React, { useState } from 'react';
import './App.css';
import DSAEducational from './pages/DSAEducational.jsx';
import ECDSAEducational from './pages/ECDSAEducational.jsx';
import ECDSAReal from './pages/ECDSAReal.jsx';

function App() {
  const [activeMode, setActiveMode] = useState('dsa');

  return (
    <div className="App">
      <header className="app-header">
        <div className="header-content">
          <h1 className="app-title">
            <span className="title-icon">🔐</span>
            <span className="title-text-wrap">
              <span className="title-main">Digital Signature Lab</span>
              <span className="title-sub-line">Cryptographic Education Platform</span>
            </span>
          </h1>
          <p className="app-subtitle">
            Learn DSA &amp; ECDSA algorithms<br />step-by-step with interactive demos
          </p>
        </div>
      </header>

      <nav className="mode-selector">
        <button
          className={`mode-btn ${activeMode === 'dsa' ? 'active' : ''}`}
          onClick={() => setActiveMode('dsa')}
        >
          <span className="mode-icon">📚</span>
          <span className="mode-text">
            <strong>DSA Educational</strong>
            <small>Classic discrete logarithm</small>
          </span>
        </button>

        <button
          className={`mode-btn ${activeMode === 'ecdsa-edu' ? 'active' : ''}`}
          onClick={() => setActiveMode('ecdsa-edu')}
        >
          <span className="mode-icon">📐</span>
          <span className="mode-text">
            <strong>ECDSA Educational</strong>
            <small>Toy elliptic curves</small>
          </span>
        </button>

        <button
          className={`mode-btn ${activeMode === 'ecdsa-real' ? 'active' : ''}`}
          onClick={() => setActiveMode('ecdsa-real')}
        >
          <span className="mode-icon">🔒</span>
          <span className="mode-text">
            <strong>ECDSA Production</strong>
            <small>Real-world secure curves</small>
          </span>
        </button>
      </nav>

      <main className="main-content">
        {activeMode === 'dsa'        && <DSAEducational />}
        {activeMode === 'ecdsa-edu'  && <ECDSAEducational />}
        {activeMode === 'ecdsa-real' && <ECDSAReal />}
      </main>

      <footer className="app-footer">
        <p>
          Educational Cryptography Application &nbsp;|&nbsp;
          For learning purposes only &nbsp;|&nbsp;
          Never use toy parameters in production
        </p>
      </footer>
    </div>
  );
}

export default App;
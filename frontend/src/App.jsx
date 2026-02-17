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
            Digital Signature Education Lab
          </h1>
          <p className="app-subtitle">
            Learn cryptographic signature algorithms step-by-step
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
            <small>Real-world secure</small>
          </span>
        </button>
      </nav>

      <main className="main-content">
        {activeMode === 'dsa' && <DSAEducational />}
        {activeMode === 'ecdsa-edu' && <ECDSAEducational />}
        {activeMode === 'ecdsa-real' && <ECDSAReal />}
      </main>

      <footer className="app-footer">
        <p>
          Educational Cryptography Application | 
          Made for learning purposes | 
          Never use toy parameters in production
        </p>
      </footer>
    </div>
  );
}

export default App;

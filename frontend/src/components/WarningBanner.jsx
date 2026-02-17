import React from 'react';

const WarningBanner = ({ type, message }) => {
  const isSecure = type === 'secure';
  const className = isSecure ? 'warning-banner secure' : 'warning-banner educational';
  const icon = isSecure ? '🔒' : '⚠️';
  
  return (
    <div className={className}>
      <div className="warning-icon">{icon}</div>
      <div className="warning-content">
        <strong>{isSecure ? 'SECURE MODE' : 'EDUCATIONAL MODE ONLY'}</strong>
        <p>{message}</p>
      </div>
    </div>
  );
};

export default WarningBanner;

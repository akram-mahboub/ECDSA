import React, { useState } from 'react';

const StepDisplay = ({ step, isECDSA = false }) => {
  const [expanded, setExpanded] = useState(true);

  return (
    <div className="step-card">
      <div 
        className="step-header"
        onClick={() => setExpanded(!expanded)}
      >
        <div className="step-number">Step {step.step}</div>
        <h4 className="step-title">{step.title}</h4>
        <button className="expand-btn">
          {expanded ? '▼' : '▶'}
        </button>
      </div>

      {expanded && (
        <div className="step-content">
          {/* Formula */}
          {step.formula && (
            <div className="step-section">
              <div className="section-label">Formula:</div>
              <code className="formula">{step.formula}</code>
            </div>
          )}

          {/* Substitution */}
          {step.substitution && (
            <div className="step-section">
              <div className="section-label">Substitution:</div>
              <code className="substitution">{step.substitution}</code>
            </div>
          )}

          {/* Curve Equation (for ECDSA) */}
          {step.curve_equation && (
            <div className="step-section">
              <div className="section-label">Curve Equation:</div>
              <code className="curve-eq">{step.curve_equation}</code>
            </div>
          )}

          {/* Generator (for ECDSA) */}
          {step.generator && (
            <div className="step-section">
              <div className="section-label">Generator:</div>
              <code>{step.generator}</code>
            </div>
          )}

          {/* Order (for ECDSA) */}
          {step.order && (
            <div className="step-section">
              <div className="section-label">Order:</div>
              <code>{step.order}</code>
            </div>
          )}

          {/* Verification (for curve setup) */}
          {step.verification && (
            <div className="step-section">
              <div className="section-label">Verification:</div>
              <code className="verification-code">{step.verification}</code>
            </div>
          )}

          {/* Intermediate calculation */}
          {step.intermediate && (
            <div className="step-section">
              <div className="section-label">Intermediate:</div>
              <code className="intermediate">{step.intermediate}</code>
            </div>
          )}

          {/* Hash full value */}
          {step.hash_full && (
            <div className="step-section">
              <div className="section-label">Full Hash:</div>
              <code className="hash-value">{step.hash_full}</code>
            </div>
          )}

          {/* Multiple intermediate steps */}
          {step.intermediate_steps && (
            <div className="step-section">
              <div className="section-label">Intermediate Steps:</div>
              <div className="intermediate-list">
                {step.intermediate_steps.map((istep, idx) => (
                  <code key={idx} className="intermediate-item">{istep}</code>
                ))}
              </div>
            </div>
          )}

          {/* Scalar multiplication steps (for ECDSA) */}
          {step.scalar_multiplication_steps && step.scalar_multiplication_steps.length > 0 && (
            <div className="step-section">
              <div className="section-label">
                Scalar Multiplication Details 
                {step.total_operations && ` (showing ${step.scalar_multiplication_steps.length} of ${step.total_operations} operations)`}:
              </div>
              <div className="scalar-mult-steps">
                {step.scalar_multiplication_steps.map((smstep, idx) => (
                  <div key={idx} className="scalar-mult-item">
                    {smstep.info && <div className="mult-info">{smstep.info}</div>}
                    {smstep.explanation && <div className="mult-explanation">{smstep.explanation}</div>}
                    {smstep.iteration !== undefined && (
                      <div className="mult-operation">
                        <span className="mult-label">Iteration {smstep.iteration}:</span>
                        <span className="mult-bit">Bit = {smstep.bit}</span>
                        <span className="mult-op">{smstep.operation}</span>
                        {smstep.result && (
                          <code className="mult-result">Result: {JSON.stringify(smstep.result)}</code>
                        )}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Result */}
          <div className="step-section result-section">
            <div className="section-label">Result:</div>
            <code className="result-value">
              {typeof step.result === 'object' 
                ? `(${step.result[0]}, ${step.result[1]})`
                : step.result
              }
            </code>
          </div>

          {/* Explanation */}
          {step.explanation && (
            <div className="step-explanation">
              <div className="explanation-icon">💡</div>
              <p>{step.explanation}</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default StepDisplay;

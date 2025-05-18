import React from 'react';

function IVForm({ ivs, setIvs, maxIV, handleChange }) {
  return (
    <div className="iv-form">
      <h3>Distribución de IVs</h3>
      {Object.keys(ivs).map((stat) => (
        <div key={stat} style={{ marginBottom: '10px' }}>
          <label htmlFor={`iv-${stat}`}>IV {stat.toUpperCase()}:</label>
          <input
            id={`iv-${stat}`}
            type="range"
            min="0"
            max="31"
            value={ivs[stat]}
            onChange={(e) => handleChange(stat, e.target.value, 'iv')}
          />
          <span style={{ marginLeft: '10px' }}>{ivs[stat]}</span>
        </div>
      ))}
      <p style={{ fontWeight: 'bold' }}>
        Total IVs: {Object.values(ivs).reduce((sum, iv) => sum + iv, 0)} / {maxIV}
      </p>
    </div>
  );
}

export default IVForm;

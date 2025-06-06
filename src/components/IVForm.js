import React from 'react';

function IVForm({ ivs, setIvs, maxIV, handleChange }) {
  // Set all IVs to 15 only if they are less than 15, otherwise leave them as is
  const setDefaultIVs = () => {
    setIvs({
      hp: ivs.hp > 15 ? ivs.hp : 15,
      attack: ivs.attack > 15 ? ivs.attack : 15,
      defense: ivs.defense > 15 ? ivs.defense : 15,
      spAttack: ivs.spAttack > 15 ? ivs.spAttack : 15,
      spDefense: ivs.spDefense > 15 ? ivs.spDefense : 15,
      speed: ivs.speed > 15 ? ivs.speed : 15,
    });
  };

  // Reset all IVs to 0
  const resetIVs = () => {
    setIvs({
      hp: 0,
      attack: 0,
      defense: 0,
      spAttack: 0,
      spDefense: 0,
      speed: 0,
    });
  };

  return (
    <div className="iv-form">
      <h3>Distribution of IVs</h3>
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
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', marginTop: '8px' }}>
        <p style={{ fontWeight: 'bold', margin: 0 }}>
          Total IVs: {Object.values(ivs).reduce((sum, iv) => sum + iv, 0)} / {maxIV}
        </p>
        <button
          onClick={setDefaultIVs}
          style={{ marginLeft: '10px', padding: '2px 8px', fontSize: '0.9em' }}
          type="button"
        >
          IVs en 15
        </button>
        <button
          onClick={resetIVs}
          style={{ marginLeft: '10px', padding: '2px 8px', fontSize: '0.9em' }}
          type="button"
        >
          Reset IVs
        </button>
      </div>
    </div>
  );
}

export default IVForm;

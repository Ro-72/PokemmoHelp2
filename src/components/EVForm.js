import React from 'react';

function EVForm({
  evs,
  setEvs,
  region,
  setRegion,
  showPopup,
  togglePopup,
  recomendations,
  getRecommendations,
  maxEV,
  handleChange,
}) {
  // Handler to reset all EVs to 0
  const resetEVs = () => {
    setEvs({
      hp: 0,
      attack: 0,
      defense: 0,
      spAttack: 0,
      spDefense: 0,
      speed: 0,
    });
  };

  return (
    <div className="ev-form">
      <h3>
        Distribution of EVs
        <span
          className="recommendation-icon"
          onClick={togglePopup}
          title="Ver recomendaciones"
        >
          ℹ️
        </span>
      </h3>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '10px' }}>
        <label style={{ marginRight: '10px' }}>Selecciona tu región:</label>
        <select value={region} onChange={(e) => setRegion(e.target.value)}>
          <option value="Unova">Unova</option>
          <option value="Kanto">Kanto</option>
          <option value="Sinnoh">Sinnoh</option>
          <option value="Hoenn">Hoenn</option>
          <option value="Johto">Johto</option>
        </select>
      </div>
      {Object.keys(evs).map((stat) => (
        <div key={stat} style={{ marginBottom: '10px' }}>
          <label htmlFor={stat}>EV {stat.toUpperCase()}:</label>
          <input
            id={stat}
            type="range"
            min="0"
            max="252"
            value={evs[stat]}
            onChange={(e) => handleChange(stat, e.target.value, 'ev')}
          />
          <span style={{ marginLeft: '10px' }}>{evs[stat]}</span>
        </div>
      ))}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', marginTop: '8px' }}>
        <p style={{ fontWeight: 'bold', margin: 0 }}>
          Total EVs: {Object.values(evs).reduce((sum, ev) => sum + ev, 0)} / {maxEV}
        </p>
        <button
          onClick={resetEVs}
          style={{ marginLeft: '10px', padding: '2px 8px', fontSize: '0.9em' }}
          type="button"
        >
          Reset EVs
        </button>
      </div>
    </div>
  );
}

export default EVForm;

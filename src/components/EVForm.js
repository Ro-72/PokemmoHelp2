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
  return (
    <div className="ev-form">
      <h3>
        Distribución de EVs
        <span
          className="recommendation-icon"
          onClick={togglePopup}
          title="Ver recomendaciones"
        >
          ℹ️
        </span>
      </h3>
      <div>
        <label>Selecciona tu región:</label>
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
      <p style={{ fontWeight: 'bold' }}>
        Total EVs: {Object.values(evs).reduce((sum, ev) => sum + ev, 0)} / {maxEV}
      </p>
    </div>
  );
}

export default EVForm;

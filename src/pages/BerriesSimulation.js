import React, { useState } from 'react';

function BerriesSimulation({ berriesList, darkMode }) {
  const [planting, setPlanting] = useState(Array(6).fill(null));

  const handlePlant = (blockIdx, berryName) => {
    const updated = [...planting];
    updated[blockIdx] = berryName;
    setPlanting(updated);
  };

  return (
    <div className={darkMode ? 'berries-simulation dark-mode' : 'berries-simulation'}>
      <h3>Simulación de Plantación de Bayas</h3>
      <div style={{ display: 'flex', gap: '20px', justifyContent: 'center', marginTop: '20px' }}>
        {planting.map((berry, idx) => (
          <div key={idx} style={{
            border: '2px dashed #aaa',
            borderRadius: '8px',
            width: '100px',
            height: '120px',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            background: darkMode ? '#23272b' : '#f9f9f9',
            color: darkMode ? '#FFD600' : '#222'
          }}>
            <div style={{ marginBottom: '8px', fontWeight: 'bold' }}>Bloque {idx + 1}</div>
            <select
              value={berry || ''}
              onChange={e => handlePlant(idx, e.target.value)}
              style={{ width: '90px', padding: '4px', background: darkMode ? '#23272b' : undefined, color: darkMode ? '#FFD600' : undefined }}
            >
              <option value="">-- Elegir baya --</option>
              {berriesList.map((b, i) => (
                <option key={i} value={b.name}>{b.name}</option>
              ))}
            </select>
            {berry && (
              <div style={{ marginTop: '10px', fontSize: '12px', color: darkMode ? '#FFD600' : '#4caf50' }}>
                {berry}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

export default BerriesSimulation;

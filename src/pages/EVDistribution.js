import React, { useState } from 'react';
import recomendations from '../recomend.json';
import '../App.css';

function EVDistribution({ savedPokemon }) {
  const maxEV = 510;
  const maxIV = 186; // Maximum total IVs
  const [evs, setEvs] = useState({
    hp: 0,
    attack: 0,
    defense: 0,
    spAttack: 0,
    spDefense: 0,
    speed: 0,
  });
  const [ivs, setIvs] = useState({
    hp: 0,
    attack: 0,
    defense: 0,
    spAttack: 0,
    spDefense: 0,
    speed: 0,
  });
  const [region, setRegion] = useState('Unova');
  const [showPopup, setShowPopup] = useState(false);
  const [level, setLevel] = useState(60); // Default level
  const [nature, setNature] = useState('neutral'); // Default nature
  const [expandedTab, setExpandedTab] = useState(null); // Track which tab is expanded
  const [activeTab, setActiveTab] = useState('level-up'); // Track the active tab

  const natureMultipliers = {
    neutral: { attack: 1, defense: 1, spAttack: 1, spDefense: 1, speed: 1 },
    hardy: { attack: 1, defense: 1, spAttack: 1, spDefense: 1, speed: 1 },
    lonely: { attack: 1.1, defense: 0.9, spAttack: 1, spDefense: 1, speed: 1 },
    brave: { attack: 1.1, defense: 1, spAttack: 1, spDefense: 1, speed: 0.9 },
    adamant: { attack: 1.1, defense: 1, spAttack: 0.9, spDefense: 1, speed: 1 },
    naughty: { attack: 1.1, defense: 1, spAttack: 1, spDefense: 0.9, speed: 1 },
    bold: { attack: 0.9, defense: 1.1, spAttack: 1, spDefense: 1, speed: 1 },
    docile: { attack: 1, defense: 1, spAttack: 1, spDefense: 1, speed: 1 },
    relaxed: { attack: 1, defense: 1.1, spAttack: 1, spDefense: 1, speed: 0.9 },
    impish: { attack: 1, defense: 1.1, spAttack: 0.9, spDefense: 1, speed: 1 },
    lax: { attack: 1, defense: 1.1, spAttack: 1, spDefense: 0.9, speed: 1 },
    timid: { attack: 0.9, defense: 1, spAttack: 1, spDefense: 1, speed: 1.1 },
    hasty: { attack: 1, defense: 0.9, spAttack: 1, spDefense: 1, speed: 1.1 },
    serious: { attack: 1, defense: 1, spAttack: 1, spDefense: 1, speed: 1 },
    jolly: { attack: 1, defense: 1, spAttack: 0.9, spDefense: 1, speed: 1.1 },
    naive: { attack: 1, defense: 1, spAttack: 1, spDefense: 0.9, speed: 1.1 },
    modest: { attack: 0.9, defense: 1, spAttack: 1.1, spDefense: 1, speed: 1 },
    mild: { attack: 1, defense: 0.9, spAttack: 1.1, spDefense: 1, speed: 1 },
    quiet: { attack: 1, defense: 1, spAttack: 1.1, spDefense: 1, speed: 0.9 },
    bashful: { attack: 1, defense: 1, spAttack: 1, spDefense: 1, speed: 1 },
    rash: { attack: 1, defense: 1, spAttack: 1.1, spDefense: 0.9, speed: 1 },
    calm: { attack: 0.9, defense: 1, spAttack: 1, spDefense: 1.1, speed: 1 },
    gentle: { attack: 1, defense: 0.9, spAttack: 1, spDefense: 1.1, speed: 1 },
    sassy: { attack: 1, defense: 1, spAttack: 1, spDefense: 1.1, speed: 0.9 },
    careful: { attack: 1, defense: 1, spAttack: 0.9, spDefense: 1.1, speed: 1 },
    quirky: { attack: 1, defense: 1, spAttack: 1, spDefense: 1, speed: 1 },
  };

  const statMapping = {
    'hp': 'hp',
    'attack': 'attack',
    'defense': 'defense',
    'special-attack': 'spAttack',
    'special-defense': 'spDefense',
    'speed': 'speed',
  };

  const togglePopup = () => {
    setShowPopup(!showPopup);
  };

  const handleChange = (stat, value, type) => {
    value = parseInt(value, 10);
    const maxTotal = type === 'ev' ? maxEV : maxIV;
    const currentStats = type === 'ev' ? evs : ivs;
    const setStats = type === 'ev' ? setEvs : setIvs;

    const currentTotal = Object.values(currentStats).reduce((sum, statValue) => sum + statValue, 0);
    const newTotal = currentTotal - currentStats[stat] + value;

    if (newTotal <= maxTotal) {
      // Simple logic for both EVs and IVs without redistribution
      setStats({ ...currentStats, [stat]: value });
    }
  };

  const calculateHP = (base, iv, ev, level) => {
    return Math.floor(((2 * base + iv + Math.floor(ev / 4)) * level) / 100) + level + 10;
  };

  const calculateStat = (base, iv, ev, level, natureMultiplier) => {
    return Math.floor(((((2 * base + iv + Math.floor(ev / 4)) * level) / 100) + 5) * natureMultiplier);
  };

  const getRecommendations = () => {
    const recommendations = [];
    for (const [stat, value] of Object.entries(evs)) {
      if (value > 100) {
        const statData = recomendations[stat];
        const regionData = statData.filter((entry) => entry.region === region);
        recommendations.push({ stat, regionData });
      }
    }
    return recommendations;
  };

  const groupMovesByMethod = (moves) => {
    const grouped = {
      'level-up': [],
      machine: [],
      egg: [],
      tutor: [],
    };

    moves.forEach((move) => {
      const method = move.method || 'unknown';
      if (grouped[method]) {
        grouped[method].push(move);
      }
    });

    // Sort "level-up" by level and others by the first character of the name
    grouped['level-up'].sort((a, b) => a.level - b.level);
    ['machine', 'egg', 'tutor'].forEach((method) => {
      grouped[method].sort((a, b) => a.name.localeCompare(b.name));
    });

    return grouped;
  };

  const getNatureLabel = (natureKey) => {
    const nature = natureMultipliers[natureKey];
    const increasedStat = Object.keys(nature).find((stat) => nature[stat] > 1);
    const decreasedStat = Object.keys(nature).find((stat) => nature[stat] < 1);

    if (increasedStat && decreasedStat) {
      return `${natureKey.charAt(0).toUpperCase() + natureKey.slice(1)} (+${increasedStat}, -${decreasedStat})`;
    }
    return `${natureKey.charAt(0).toUpperCase() + natureKey.slice(1)} (Neutral)`;
  };

  return (
    <div className="ev-container" style={{ display: 'flex', gap: '20px' }}>
      <div className="ev-iv-column" style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '20px' }}>
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

          {showPopup && (
            <div className="recommendation-popup smallpopup">
              <h4>Recomendaciones</h4>
              <ul>
                {getRecommendations().map(({ stat, regionData }) => (
                  <li key={stat}>
                    <strong>{stat.toUpperCase()}:</strong>
                    <ul>
                      {regionData.map((entry, index) => (
                        <li key={index}>
                          <strong>Pokémon:</strong> {entry.pokemon} - <strong>Ubicación:</strong> {entry.location} ({entry.method}) - {entry.encounter}
                        </li>
                      ))}
                    </ul>
                  </li>
                ))}
              </ul>
              <button className="close-popup" onClick={togglePopup}>Cerrar</button>
            </div>
          )}

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
      </div>

      {savedPokemon && (
        <div className="pokemon-info" style={{ flex: 1, border: '1px solid #ccc', padding: '10px' }}>
          <h3>Información del Pokémon Guardado</h3>
          <img src={savedPokemon.sprites.front_default} alt={savedPokemon.name} />
          <p><strong>Nombre:</strong> {savedPokemon.name}</p>
          <p><strong>ID:</strong> {savedPokemon.id}</p>
          <div style={{ marginBottom: '10px' }}>
            <label htmlFor="level">Nivel:</label>
            <input
              id="level"
              type="number"
              min="1"
              max="100"
              value={level}
              onChange={(e) => setLevel(parseInt(e.target.value, 10))}
              style={{ marginLeft: '10px', width: '50px' }}
            />
          </div>
          <div style={{ marginBottom: '10px' }}>
            <label htmlFor="nature">Naturaleza:</label>
            <select
              id="nature"
              value={nature}
              onChange={(e) => setNature(e.target.value)}
              style={{ marginLeft: '10px' }}
            >
              {Object.keys(natureMultipliers).map((natureKey) => (
                <option key={natureKey} value={natureKey}>
                  {getNatureLabel(natureKey)}
                </option>
              ))}
            </select>
          </div>
          <div>
            <h4>Estadísticas:</h4>
            {savedPokemon.stats.map((stat, index) => {
              const isHP = stat.stat.name.toLowerCase() === 'hp';
              const mappedStat = statMapping[stat.stat.name.toLowerCase()];
              const natureMultiplier =
                natureMultipliers[nature][mappedStat] || 1;
              const calculatedStat = isHP
                ? calculateHP(stat.base_stat, ivs.hp, evs.hp, level)
                : calculateStat(
                    stat.base_stat,
                    ivs[mappedStat],
                    evs[mappedStat],
                    level,
                    natureMultiplier
                  );
              return (
                <div key={index} style={{ marginBottom: '10px' }}>
                  <strong>{stat.stat.name.toUpperCase()}:</strong>
                  <div style={{ background: '#ddd', width: '100%', height: '10px', position: 'relative' }}>
                    <div
                      style={{
                        background: '#4caf50',
                        width: `${(calculatedStat / 255) * 100}%`, // Placeholder percentage calculation
                        height: '100%',
                      }}
                    ></div>
                  </div>
                  <span>{calculatedStat}</span>
                </div>
              );
            })}
          </div>
          {savedPokemon.strategyUrl && (
            <div style={{ marginTop: '10px' }}>
              <h4>Enlace a Estrategia:</h4>
              <a href={savedPokemon.strategyUrl} target="_blank" rel="noopener noreferrer">
                Ver estrategia en Pokexperto
              </a>
            </div>
          )}
          {savedPokemon.moves && (
            <div style={{ marginTop: '20px' }}>
              <h4>Movimientos:</h4>
              <div style={{ display: 'flex', marginBottom: '10px' }}>
                {['level-up', 'machine', 'egg', 'tutor'].map((method) => (
                  <button
                    key={method}
                    style={{
                      flex: 1,
                      padding: '10px',
                      cursor: 'pointer',
                      backgroundColor: activeTab === method ? '#4caf50' : '#f0f0f0',
                      color: activeTab === method ? 'white' : 'black',
                      border: '1px solid #ccc',
                      borderRadius: '5px',
                    }}
                    onClick={() => setActiveTab(method)}
                  >
                    {method === 'level-up' && 'Por Nivel'}
                    {method === 'machine' && 'Por MT/MO'}
                    {method === 'egg' && 'Por Huevo'}
                    {method === 'tutor' && 'Por Tutor'}
                  </button>
                ))}
              </div>
              <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: '10px' }}>
                <thead>
                  <tr>
                    {activeTab === 'level-up' && (
                      <th style={{ border: '1px solid #ccc', padding: '5px' }}>Nivel</th>
                    )}
                    <th style={{ border: '1px solid #ccc', padding: '5px' }}>Movimiento</th>
                  </tr>
                </thead>
                <tbody>
                  {groupMovesByMethod(savedPokemon.moves)[activeTab]?.map((move, index) => (
                    <tr key={index}>
                      {activeTab === 'level-up' && (
                        <td style={{ border: '1px solid #ccc', padding: '5px', textAlign: 'center' }}>
                          {move.level}
                        </td>
                      )}
                      <td style={{ border: '1px solid #ccc', padding: '5px' }}>
                        {move.name}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default EVDistribution;

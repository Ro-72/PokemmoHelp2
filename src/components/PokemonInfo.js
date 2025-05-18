import React, { useState, useEffect } from 'react';
import itemsData from '../items.mock.data.json';

function PokemonInfo({
  savedPokemon,
  level,
  setLevel,
  nature,
  setNature,
  natureMultipliers,
  statMapping,
  ivs,
  evs,
  calculateHP,
  calculateStat,
  activeTab,
  setActiveTab,
  groupMovesByMethod,
  getNatureLabel,
  onSaveMoves, // Optional: callback to parent if you want to propagate moves up
}) {
  // Track selected moves for this Pokémon
  const [selectedMoves, setSelectedMoves] = useState(savedPokemon.selectedMoves || []);

  // Handle move selection (max 4)
  const handleMoveSelect = (move) => {
    const exists = selectedMoves.some(
      (m) => m.name === move.name && m.method === move.method && m.level === move.level
    );
    if (exists) {
      setSelectedMoves(selectedMoves.filter(
        (m) => !(m.name === move.name && m.method === move.method && m.level === move.level)
      ));
    } else if (selectedMoves.length < 4) {
      setSelectedMoves([...selectedMoves, move]);
    }
  };

  // Save selected moves to parent (if needed)
  const handleSaveMoves = () => {
    if (onSaveMoves) {
      onSaveMoves(selectedMoves);
    }
    // Optionally, you can update savedPokemon.selectedMoves here if you want to persist in local state
  };

  // State for item input and suggestions
  const [item, setItem] = useState('');
  const [itemSuggestions, setItemSuggestions] = useState([]);

  useEffect(() => {
    if (item.length > 0) {
      const filtered = itemsData.Items.filter(i =>
        i.toLowerCase().includes(item.toLowerCase())
      ).slice(0, 5);
      setItemSuggestions(filtered);
    } else {
      setItemSuggestions([]);
    }
  }, [item]);

  const handleItemSuggestionClick = (suggestion) => {
    setItem(suggestion);
    setItemSuggestions([]);
  };

  // Helper to convert stat mapping to Showdown format
  const statShowdownMap = {
    hp: 'HP',
    attack: 'Atk',
    defense: 'Def',
    spAttack: 'SpA',
    spDefense: 'SpD',
    speed: 'Spe',
  };

  // Helper to convert nature to Showdown format
  const capitalize = (str) => str.charAt(0).toUpperCase() + str.slice(1);

  // Download as .txt in Showdown format
  const handleDownloadShowdown = () => {
    // Name and item
    let lines = [];
    let pokeName = capitalize(savedPokemon.name);
    let itemLine = item ? ` @ ${item.replace(/-/g, ' ')}` : '';
    lines.push(`${pokeName}${itemLine}`);

    // Ability (not available in your data, so skip or add placeholder)
    // lines.push(`Ability: ???`);

    // Level
    if (level) lines.push(`Level: ${level}`);

    // Nature
    if (nature && nature !== 'neutral') lines.push(`${capitalize(nature)} Nature`);

    // EVs
    const evParts = [];
    for (const [key, val] of Object.entries(evs)) {
      if (val > 0) evParts.push(`${val} ${statShowdownMap[key]}`);
    }
    if (evParts.length > 0) lines.push(`EVs: ${evParts.join(' / ')}`);

    // IVs
    const ivParts = [];
    for (const [key, val] of Object.entries(ivs)) {
      if (val < 31) ivParts.push(`${val} ${statShowdownMap[key]}`);
    }
    if (ivParts.length > 0) lines.push(`IVs: ${ivParts.join(' / ')}`);

    // Moves
    if (selectedMoves.length > 0) {
      selectedMoves.forEach(move => {
        if (move.name && move.name !== '(desconocido)') {
          lines.push(`- ${capitalize(move.name.replace(/-/g, ' '))}`);
        }
      });
    }

    // Join lines and trigger download
    const showdownText = lines.join('\n');
    const blob = new Blob([showdownText], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${pokeName}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
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
      {/* New Item input with autocomplete */}
      <div style={{ marginBottom: '10px', position: 'relative' }}>
        <label htmlFor="item">Objeto:</label>
        <input
          id="item"
          type="text"
          placeholder="Buscar objeto"
          value={item}
          onChange={e => setItem(e.target.value)}
          style={{ marginLeft: '10px', width: '150px' }}
          autoComplete="off"
        />
        {itemSuggestions.length > 0 && (
          <ul
            style={{
              position: 'absolute',
              background: 'white',
              border: '1px solid #ccc',
              listStyle: 'none',
              margin: 0,
              padding: '0 5px',
              width: '150px',
              zIndex: 10,
              fontSize: '12px'
            }}
          >
            {itemSuggestions.map((suggestion, idx) => (
              <li
                key={idx}
                style={{ cursor: 'pointer', padding: '2px 0' }}
                onClick={() => handleItemSuggestionClick(suggestion)}
              >
                {suggestion}
              </li>
            ))}
          </ul>
        )}
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
          <form>
            <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: '10px' }}>
              <thead>
                <tr>
                  <th style={{ border: '1px solid #ccc', padding: '5px' }}></th>
                  {activeTab === 'level-up' && (
                    <th style={{ border: '1px solid #ccc', padding: '5px' }}>Nivel</th>
                  )}
                  <th style={{ border: '1px solid #ccc', padding: '5px' }}>Movimiento</th>
                  <th style={{ border: '1px solid #ccc', padding: '5px' }}>Método</th>
                  {activeTab === 'machine' && (
                    <th style={{ border: '1px solid #ccc', padding: '5px' }}>MT/MO</th>
                  )}
                  {activeTab === 'egg' && (
                    <th style={{ border: '1px solid #ccc', padding: '5px' }}>Compañero de cría</th>
                  )}
                </tr>
              </thead>
              <tbody>
                {groupMovesByMethod(savedPokemon.moves)[activeTab]?.map((move, index) => (
                  <tr key={index}>
                    <td style={{ border: '1px solid #ccc', padding: '5px', textAlign: 'center' }}>
                      <input
                        type="checkbox"
                        checked={selectedMoves.some(
                          (m) => m.name === move.name && m.method === move.method && m.level === move.level
                        )}
                        onChange={() => handleMoveSelect(move)}
                        disabled={
                          !selectedMoves.some(
                            (m) => m.name === move.name && m.method === move.method && m.level === move.level
                          ) && selectedMoves.length >= 4
                        }
                      />
                    </td>
                    {activeTab === 'level-up' && (
                      <td style={{ border: '1px solid #ccc', padding: '5px', textAlign: 'center' }}>
                        {move.level !== undefined ? move.level : 'N/A'}
                      </td>
                    )}
                    <td style={{ border: '1px solid #ccc', padding: '5px' }}>
                      {move.name}
                    </td>
                    <td style={{ border: '1px solid #ccc', padding: '5px' }}>
                      {move.method}
                    </td>
                    {activeTab === 'machine' && (
                      <td style={{ border: '1px solid #ccc', padding: '5px' }}>
                        {move.mtId || move.id || 'N/A'}
                      </td>
                    )}
                    {activeTab === 'egg' && (
                      <td style={{ border: '1px solid #ccc', padding: '5px' }}>
                        {move.breedingPartner || 'N/A'}
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </form>
          <button
            style={{ marginTop: '10px', padding: '5px 10px' }}
            onClick={handleDownloadShowdown}
            type="button"
            disabled={selectedMoves.length === 0}
          >
            Guardar
          </button>
          {selectedMoves.length > 0 && (
            <div style={{ marginTop: '15px' }}>
              <h5>Movimientos Guardados:</h5>
              <ul>
                {selectedMoves.map((move, idx) => (
                  <li key={idx}>{move.name}</li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default PokemonInfo;

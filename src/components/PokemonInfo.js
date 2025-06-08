import React, { useState, useEffect } from 'react';
import itemsData from '../data/items.json';
import movesMetadata from '../data/metadata_pokemon_moves.json';

function PokemonInfo({
  savedPokemon,
  addToTeam,
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
  onSaveMoves,
  initialSelectedMoves = []
}) {
  // Initialize selected moves state with data from TeamBuilder if available
  const [selectedMoves, setSelectedMoves] = useState(initialSelectedMoves);

  // Update selected moves when initialSelectedMoves changes
  useEffect(() => {
    if (initialSelectedMoves.length > 0) {
      setSelectedMoves(initialSelectedMoves);
      onSaveMoves(initialSelectedMoves);
    }
  }, [initialSelectedMoves, onSaveMoves]);

  // --- Move type and class from local JSON instead of API ---
  const [moveTypes, setMoveTypes] = useState({}); // { moveName: type }
  const [moveClasses, setMoveClasses] = useState({}); // { moveName: class }

  // Function to get move data from local JSON
  const getMoveDataFromLocal = (moveName) => {
    return movesMetadata.find(move => 
      move.name.toLowerCase() === moveName.toLowerCase()
    );
  };

  useEffect(() => {
    // Get all unique move names from savedPokemon.moves
    if (!savedPokemon.moves) return;
    const allMoves = savedPokemon.moves.map(m => m.name);
    const uniqueMoves = Array.from(new Set(allMoves));
    
    // Get types and classes from local data instead of API
    const newTypes = {};
    const newClasses = {};
    
    uniqueMoves.forEach((moveName) => {
      const moveData = getMoveDataFromLocal(moveName);
      if (moveData) {
        newTypes[moveName] = moveData.type.toLowerCase();
        newClasses[moveName] = moveData.damage_class.toLowerCase();
      } else {
        newTypes[moveName] = 'normal'; // fallback
        newClasses[moveName] = 'status'; // fallback
      }
    });
    
    setMoveTypes(newTypes);
    setMoveClasses(newClasses);
  }, [savedPokemon.moves]);

  // Handle move selection (max 4)
  const handleMoveSelect = (move) => {
    const exists = selectedMoves.some(
      (m) => m.name === move.name && m.method === move.method && m.level === move.level
    );
    if (exists) {
      const newSelectedMoves = selectedMoves.filter(
        (m) => !(m.name === move.name && m.method === move.method && m.level === move.level)
      );
      setSelectedMoves(newSelectedMoves);
      // Immediately notify parent of the change
      if (onSaveMoves) {
        onSaveMoves(newSelectedMoves);
      }
    } else if (selectedMoves.length < 4) {
      // Get move data from local JSON
      const moveData = getMoveDataFromLocal(move.name);
      const moveWithType = {
        ...move,
        type: moveData ? moveData.type.toLowerCase() : 'normal',
        damageClass: moveData ? moveData.damage_class.toLowerCase() : 'status'
      };
      const newSelectedMoves = [...selectedMoves, moveWithType];
      setSelectedMoves(newSelectedMoves);
      // Immediately notify parent of the change
      if (onSaveMoves) {
        onSaveMoves(newSelectedMoves);
      }
    }
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

  // --- Type color mapping ---
  const typeColors = {
    normal: '#BDBDBD',
    fire: '#FF7043',
    water: '#29B6F6',
    electric: '#FFD600',
    grass: '#66BB6A',
    ice: '#81D4FA',
    fighting: '#D84315',
    poison: '#AB47BC',
    ground: '#D7CCC8',
    flying: '#90CAF9',
    psychic: '#F06292',
    bug: '#AEEA00',
    rock: '#A1887F',
    ghost: '#7E57C2',
    dragon: '#1976D2',
    dark: '#616161',
    steel: '#90A4AE',
    fairy: '#F8BBD0',
    // ...add more if needed
  };

  // Helper to render move name with color by type and style by class
  function renderMoveName(move) {
    const type = moveTypes[move.name] || 'normal';
    const color = typeColors[type] || '#BDBDBD';
    const moveClass = moveClasses[move.name] || 'status';
    let style = { color };
    let content = move.name;

    // Apply formatting based on move class
    if (moveClass === 'physical') {
      style.fontWeight = 'bold';
      style.fontSize = '1.15em';
      content = <b>{content}</b>;
    } else if (moveClass === 'special') {
      content = <i>{content}</i>;
    } else if (moveClass === 'status') {
      content = <u>{content}</u>;
    }

    // Build the URL for the move (replace spaces with '-')
    const moveUrl = `https://pokemondb.net/move/${move.name.toLowerCase().replace(/ /g, '-')}`;

    return (
      <a
        href={moveUrl}
        target="_blank"
        rel="noopener noreferrer"
        style={{ textDecoration: 'none' }}
      >
        <span style={style}>
          {content}
        </span>
      </a>
    );
  }

  // State for sorting moves by name and level and type
  const [sortMovesAsc, setSortMovesAsc] = useState(true);
  const [sortLevelAsc, setSortLevelAsc] = useState(true);
  const [sortTypeAsc, setSortTypeAsc] = useState(null); // null means not sorting by type

  // Helper to get sorted moves for the current tab
  function getSortedMoves(moves) {
    if (!moves) return [];
    const movesArr = [...moves];
    // Sort by type if requested
    if (sortTypeAsc !== null) {
      movesArr.sort((a, b) => {
        const typeA = (moveTypes[a.name] || 'normal').toLowerCase();
        const typeB = (moveTypes[b.name] || 'normal').toLowerCase();
        if (typeA < typeB) return sortTypeAsc ? -1 : 1;
        if (typeA > typeB) return sortTypeAsc ? 1 : -1;
        // If types are equal, fallback to name
        const nameA = (a.name || '').toLowerCase();
        const nameB = (b.name || '').toLowerCase();
        if (nameA < nameB) return sortMovesAsc ? -1 : 1;
        if (nameA > nameB) return sortMovesAsc ? 1 : -1;
        return 0;
      });
    } else if (activeTab === 'level-up') {
      movesArr.sort((a, b) => {
        const levelA = a.level !== undefined ? a.level : 0;
        const levelB = b.level !== undefined ? b.level : 0;
        if (levelA < levelB) return sortLevelAsc ? -1 : 1;
        if (levelA > levelB) return sortLevelAsc ? 1 : -1;
        // If levels are equal, fallback to name
        const nameA = (a.name || '').toLowerCase();
        const nameB = (b.name || '').toLowerCase();
        if (nameA < nameB) return sortMovesAsc ? -1 : 1;
        if (nameA > nameB) return sortMovesAsc ? 1 : -1;
        return 0;
      });
    } else {
      movesArr.sort((a, b) => {
        const nameA = (a.name || '').toLowerCase();
        const nameB = (b.name || '').toLowerCase();
        if (nameA < nameB) return sortMovesAsc ? -1 : 1;
        if (nameA > nameB) return sortMovesAsc ? 1 : -1;
        return 0;
      });
    }
    return movesArr;
  }

  // Track which move tab is expanded (null = all collapsed)
  const [expandedTab, setExpandedTab] = useState(null);

  return (
    <div className="pokemon-info" style={{ flex: 1, border: '1px solid #ccc', padding: '10px' }}>
      <div className="pokemon-info-header">
        <div className="pokemon-basic-info">
          <h3>{savedPokemon.name}</h3>
          <p>#{savedPokemon.id}</p>
          {addToTeam && (
            <button
              onClick={() => {
                // Convert saved Pokemon to team format with current selected moves including types
                const movesWithTypes = selectedMoves.map(move => {
                  const moveData = getMoveDataFromLocal(move.name);
                  return {
                    ...move,
                    type: moveData ? moveData.type.toLowerCase() : 'normal',
                    damageClass: moveData ? moveData.damage_class.toLowerCase() : 'status'
                  };
                });
                
                const teamPokemon = {
                  id: savedPokemon.id,
                  name: savedPokemon.name,
                  sprite: savedPokemon.sprites?.front_default,
                  types: savedPokemon.types?.map(type => type.type.name) || [],
                  selectedMoves: movesWithTypes
                };
                addToTeam(teamPokemon);
              }}
              style={{
                backgroundColor: '#3498DB',
                color: 'white',
                border: 'none',
                borderRadius: '5px',
                padding: '8px 12px',
                fontSize: '12px',
                cursor: 'pointer',
                marginTop: '10px',
                fontWeight: 'bold'
              }}
            >
              Add to Team
            </button>
          )}
        </div>
      </div>
      <img src={savedPokemon.sprites.front_default} alt={savedPokemon.name} />
      <p><strong>Name:</strong> {savedPokemon.name}</p>
      <p><strong>ID:</strong> {savedPokemon.id}</p>
      <div style={{ marginBottom: '10px' }}>
        <label htmlFor="level">Level:</label>
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
        <label htmlFor="nature">Nature:</label>
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
        <label htmlFor="item">Item:</label>
        <input
          id="item"
          type="text"
          placeholder="Search item"
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
        <h4>Stats:</h4>
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
          <h4>Strategy Link:</h4>
          <a href={savedPokemon.strategyUrl} target="_blank" rel="noopener noreferrer">
            View strategy on Pokexperto
          </a>
        </div>
      )}
      {savedPokemon.moves && (
        <div style={{ marginTop: '20px' }}>
          <h4>Moves:</h4>
          <div style={{ display: 'flex', marginBottom: '10px' }}>
            {['level-up', 'machine', 'egg', 'tutor'].map((method) => (
              <button
                key={method}
                style={{
                  flex: 1,
                  padding: '10px',
                  cursor: 'pointer',
                  backgroundColor: expandedTab === method ? '#4caf50' : '#f0f0f0',
                  color: expandedTab === method ? 'white' : 'black',
                  border: '1px solid #ccc',
                  borderRadius: '5px',
                }}
                onClick={() => setExpandedTab(expandedTab === method ? null : method)}
              >
                {method === 'level-up' && 'By Level'}
                {method === 'machine' && 'By TM/HM'}
                {method === 'egg' && 'By Egg'}
                {method === 'tutor' && 'By Tutor'}
              </button>
            ))}
          </div>
          {/* Only show the moves table for the expanded tab */}
          {['level-up', 'machine', 'egg', 'tutor'].includes(expandedTab) && (
            <form>
              <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: '10px' }}>
                <thead>
                  <tr>
                    <th style={{ border: '1px solid #ccc', padding: '5px' }}></th>
                    {expandedTab === 'level-up' && (
                      <th
                        style={{ border: '1px solid #ccc', padding: '5px', cursor: 'pointer', userSelect: 'none' }}
                        onClick={() => {
                          setSortTypeAsc(null);
                          setSortLevelAsc((prev) => !prev);
                        }}
                        title="Sort by level"
                      >
                        Level {sortLevelAsc ? '▲' : '▼'}
                      </th>
                    )}
                    <th
                      style={{ border: '1px solid #ccc', padding: '5px', cursor: 'pointer', userSelect: 'none' }}
                      onClick={() => {
                        setSortTypeAsc(null);
                        setSortMovesAsc((prev) => !prev);
                      }}
                      title="Sort by name"
                    >
                      Move {sortMovesAsc ? '▲' : '▼'}
                    </th>
                    <th
                      style={{
                        border: '1px solid #ccc',
                        padding: '5px',
                        cursor: 'pointer',
                        userSelect: 'none',
                        textAlign: 'center',
                        verticalAlign: 'middle',
                        minWidth: '80px'
                      }}
                      onClick={() => setSortTypeAsc((prev) => prev === null ? true : !prev)}
                      title="Sort by type"
                    >
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4px' }}>
                        <span>Type</span>
                        <span>
                          {sortTypeAsc === null
                            ? '▲'
                            : (sortTypeAsc ? '▲' : '▼')}
                        </span>
                      </div>
                    </th>
                    {expandedTab === 'machine' && (
                      <th style={{ border: '1px solid #ccc', padding: '5px' }}>TM/HM</th>
                    )}
                    {expandedTab === 'egg' && (
                      <th style={{ border: '1px solid #ccc', padding: '5px' }}>Breeding Partner</th>
                    )}
                  </tr>
                </thead>
                <tbody>
                  {getSortedMoves(groupMovesByMethod(savedPokemon.moves)[expandedTab])?.map((move, index) => (
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
                      {expandedTab === 'level-up' && (
                        <td style={{ border: '1px solid #ccc', padding: '5px', textAlign: 'center' }}>
                          {move.level !== undefined ? move.level : 'N/A'}
                        </td>
                      )}
                      <td style={{ border: '1px solid #ccc', padding: '5px' }}>
                        {renderMoveName(move)}
                      </td>
                      <td style={{ border: '1px solid #ccc', padding: '5px', textAlign: 'center' }}>
                        {/* Show type with color background */}
                        {(() => {
                          const type = moveTypes[move.name] || 'normal';
                          const color = typeColors[type] || '#BDBDBD';
                          return (
                            <span style={{
                              background: color,
                              color: '#fff',
                              borderRadius: '6px',
                              fontSize: '0.9em',
                              padding: '2px 8px',
                              fontWeight: 'bold'
                            }}>
                              {type.charAt(0).toUpperCase() + type.slice(1)}
                            </span>
                          );
                        })()}
                      </td>
                      {expandedTab === 'machine' && (
                        <td style={{ border: '1px solid #ccc', padding: '5px' }}>
                          {move.mtId || move.id || 'N/A'}
                        </td>
                      )}
                      {expandedTab === 'egg' && (
                        <td style={{ border: '1px solid #ccc', padding: '5px' }}>
                          {move.breedingPartner || 'N/A'}
                        </td>
                      )}
                    </tr>
                  ))}
                </tbody>
              </table>
            </form>
          )}
          <button
            style={{ marginTop: '10px', padding: '5px 10px' }}
            onClick={handleDownloadShowdown}
            type="button"
            disabled={selectedMoves.length === 0}
          >
            Save
          </button>
          {selectedMoves.length > 0 && (
            <div style={{ marginTop: '15px' }}>
              <h5>Saved Moves:</h5>
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

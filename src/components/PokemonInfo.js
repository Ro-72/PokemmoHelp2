import React, { useState, useEffect } from 'react';
import itemsData from '../data/items.json';
import { useTeam } from '../contexts/TeamContext';

// Add type colors for move display
const typeColors = {
  'normal': '#A8A878',
  'fire': '#F08030',
  'water': '#6890F0',
  'electric': '#F8D030',
  'grass': '#78C850',
  'ice': '#98D8D8',
  'fighting': '#C03028',
  'poison': '#A040A0',
  'ground': '#E0C068',
  'flying': '#A890F0',
  'psychic': '#F85888',
  'bug': '#A8B820',
  'rock': '#B8A038',
  'ghost': '#705898',
  'dragon': '#7038F8',
  'dark': '#705848',
  'steel': '#B8B8D0',
  'fairy': '#EE99AC'
};

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
  const { currentPokemonId, updateCurrentPokemonAnalysis } = useTeam();
  
  // Initialize selected moves state with data from team/initialSelectedMoves
  const [selectedMoves, setSelectedMoves] = useState(() => {
    if (initialSelectedMoves.length > 0) {
      return initialSelectedMoves;
    }
    if (savedPokemon?.selectedMoves) {
      return savedPokemon.selectedMoves;
    }
    return [];
  });

  // Initialize item state
  const [item, setItem] = useState(savedPokemon?.item || '');
  const [itemSuggestions, setItemSuggestions] = useState([]);
  const [showItemSuggestions, setShowItemSuggestions] = useState(false);

  // Mock move types and classes - replace with actual data fetching
  const [moveTypes, setMoveTypes] = useState({});
  const [moveClasses, setMoveClasses] = useState({});

  // Add missing state variables for move table functionality
  const [expandedTab, setExpandedTab] = useState(null);
  const [sortLevelAsc, setSortLevelAsc] = useState(true);
  const [sortMovesAsc, setSortMovesAsc] = useState(true);
  const [sortTypeAsc, setSortTypeAsc] = useState(null);

  // Update selected moves when initialSelectedMoves changes
  useEffect(() => {
    if (initialSelectedMoves.length > 0) {
      setSelectedMoves(initialSelectedMoves);
      if (onSaveMoves) {
        onSaveMoves(initialSelectedMoves);
      }
    }
  }, [initialSelectedMoves, onSaveMoves]);

  // Handle move selection (max 4)
  const handleMoveSelect = (move) => {
    const exists = selectedMoves.some(
      (m) => m.name === move.name && m.method === move.method && m.level === move.level
    );
    
    let newSelectedMoves;
    if (exists) {
      newSelectedMoves = selectedMoves.filter(
        (m) => !(m.name === move.name && m.method === move.method && m.level === move.level)
      );
    } else if (selectedMoves.length < 4) {
      // Include move type from fetched data when adding to selected moves
      const moveWithType = {
        ...move,
        type: moveTypes[move.name] || 'normal',
        damageClass: moveClasses[move.name] || 'status'
      };
      newSelectedMoves = [...selectedMoves, moveWithType];
    } else {
      return; // Max moves reached
    }
    
    setSelectedMoves(newSelectedMoves);
    
    // Immediately notify parent and team context of the change
    if (onSaveMoves) {
      onSaveMoves(newSelectedMoves);
    }
    
    // Update team context if this is from team
    if (currentPokemonId !== null) {
      updateCurrentPokemonAnalysis({ selectedMoves: newSelectedMoves });
    }
  };

  // Handle item search
  const handleItemChange = (value) => {
    setItem(value);
    if (value.length > 0) {
      const filtered = itemsData.items
        .filter(item => item.name.toLowerCase().includes(value.toLowerCase()))
        .slice(0, 5);
      setItemSuggestions(filtered);
      setShowItemSuggestions(true);
    } else {
      setItemSuggestions([]);
      setShowItemSuggestions(false);
    }
  };

  // Handle item suggestion click
  const handleItemSuggestionClick = (suggestion) => {
    setItem(suggestion.name || suggestion);
    setItemSuggestions([]);
    setShowItemSuggestions(false);
  };

  // Helper function to sort moves
  const getSortedMoves = (moves) => {
    if (!moves || moves.length === 0) return [];
    
    let sortedMoves = [...moves];
    
    if (expandedTab === 'level-up' && sortLevelAsc !== null) {
      sortedMoves.sort((a, b) => {
        const levelA = a.level || 0;
        const levelB = b.level || 0;
        return sortLevelAsc ? levelA - levelB : levelB - levelA;
      });
    } else if (sortMovesAsc !== null) {
      sortedMoves.sort((a, b) => {
        const nameA = a.name.toLowerCase();
        const nameB = b.name.toLowerCase();
        return sortMovesAsc ? nameA.localeCompare(nameB) : nameB.localeCompare(nameA);
      });
    } else if (sortTypeAsc !== null) {
      sortedMoves.sort((a, b) => {
        const typeA = moveTypes[a.name] || 'normal';
        const typeB = moveTypes[b.name] || 'normal';
        return sortTypeAsc ? typeA.localeCompare(typeB) : typeB.localeCompare(typeA);
      });
    }
    
    return sortedMoves;
  };

  // Helper function to render move name
  const renderMoveName = (move) => {
    return move.name || 'Unknown Move';
  };

  // Handle download/save functionality
  const handleDownloadShowdown = () => {
    if (onSaveMoves) {
      onSaveMoves(selectedMoves);
    }
    alert('Moves saved successfully!');
  };

  // Enhanced add to team function
  const handleAddToTeam = () => {
    if (addToTeam) {
      // Convert saved Pokemon to team format with current analysis data
      const movesWithTypes = selectedMoves.map(move => ({
        ...move,
        type: moveTypes[move.name] || 'normal',
        damageClass: moveClasses[move.name] || 'status'
      }));
      
      const teamPokemon = {
        id: savedPokemon.id,
        name: savedPokemon.name,
        sprite: savedPokemon.sprites?.front_default,
        types: savedPokemon.types?.map(type => type.type.name) || [],
        selectedMoves: movesWithTypes,
        level,
        nature,
        item,
        evs,
        ivs,
        stats: savedPokemon.stats || [],
        baseStats: savedPokemon.baseStats || {}
      };
      
      addToTeam(teamPokemon);
    }
  };

  return (
    <div className="pokemon-info" style={{ flex: 1, border: '1px solid #ccc', padding: '10px' }}>
      <div className="pokemon-info-header">
        <div className="pokemon-basic-info">
          <h3>{savedPokemon.name}</h3>
          <p>#{savedPokemon.id}</p>
          {/* Show team slot info if from team */}
          {currentPokemonId !== null && (
            <p style={{ fontSize: '12px', color: '#666' }}>
              Team Slot: {currentPokemonId + 1}
            </p>
          )}
          {addToTeam && currentPokemonId === null && (
            <button
              onClick={handleAddToTeam}
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
          onChange={e => handleItemChange(e.target.value)}
          style={{ marginLeft: '10px', width: '150px' }}
          autoComplete="off"
        />
        {showItemSuggestions && itemSuggestions.length > 0 && (
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
                {suggestion.name || suggestion}
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
          <div style={{ marginBottom: '10px', fontSize: '12px', color: '#666' }}>
            Selected: {selectedMoves.length}/4 moves
          </div>
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
          
          {/* Show selected moves summary */}
          {selectedMoves.length > 0 && (
            <div style={{ marginTop: '15px', padding: '10px', backgroundColor: '#f0f8ff', borderRadius: '5px' }}>
              <h5 style={{ margin: '0 0 10px 0' }}>Selected Moves ({selectedMoves.length}/4):</h5>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '5px' }}>
                {selectedMoves.map((move, idx) => (
                  <div key={idx} style={{
                    padding: '4px 8px',
                    backgroundColor: '#e8f4fd',
                    borderRadius: '4px',
                    fontSize: '12px',
                    border: '1px solid #d0e8f2'
                  }}>
                    <strong>{move.name}</strong>
                    {move.type && (
                      <span style={{
                        marginLeft: '8px',
                        padding: '1px 4px',
                        backgroundColor: typeColors[move.type] || '#ccc',
                        color: 'white',
                        borderRadius: '3px',
                        fontSize: '10px'
                      }}>
                        {move.type}
                      </span>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default PokemonInfo;

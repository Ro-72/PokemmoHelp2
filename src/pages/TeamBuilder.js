import React, { useState, useEffect } from 'react';
import completePokemonData from '../complete_pokemon_data.json';
import { usePokemonContext } from '../context/PokemonContext';
import { useNavigate } from 'react-router-dom';

const TYPE_COLORS = {
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

const TYPE_EFFECTIVENESS = {
  normal: { weak: ['fighting'], resist: [], immune: ['ghost'] },
  fire: { weak: ['water', 'ground', 'rock'], resist: ['fire', 'grass', 'ice', 'bug', 'steel', 'fairy'], immune: [] },
  water: { weak: ['electric', 'grass'], resist: ['fire', 'water', 'ice', 'steel'], immune: [] },
  electric: { weak: ['ground'], resist: ['electric', 'flying', 'steel'], immune: [] },
  grass: { weak: ['fire', 'ice', 'poison', 'flying', 'bug'], resist: ['water', 'electric', 'grass', 'ground'], immune: [] },
  ice: { weak: ['fire', 'fighting', 'rock', 'steel'], resist: ['ice'], immune: [] },
  fighting: { weak: ['flying', 'psychic', 'fairy'], resist: ['bug', 'rock', 'dark'], immune: [] },
  poison: { weak: ['ground', 'psychic'], resist: ['grass', 'fighting', 'poison', 'bug', 'fairy'], immune: [] },
  ground: { weak: ['water', 'grass', 'ice'], resist: ['poison', 'rock'], immune: ['electric'] },
  flying: { weak: ['electric', 'ice', 'rock'], resist: ['grass', 'fighting', 'bug'], immune: ['ground'] },
  psychic: { weak: ['bug', 'ghost', 'dark'], resist: ['fighting', 'psychic'], immune: [] },
  bug: { weak: ['fire', 'flying', 'rock'], resist: ['grass', 'fighting', 'ground'], immune: [] },
  rock: { weak: ['water', 'grass', 'fighting', 'ground', 'steel'], resist: ['normal', 'fire', 'poison', 'flying'], immune: [] },
  ghost: { weak: ['ghost', 'dark'], resist: ['poison', 'bug'], immune: ['normal', 'fighting'] },
  dragon: { weak: ['ice', 'dragon', 'fairy'], resist: ['fire', 'water', 'electric', 'grass'], immune: [] },
  dark: { weak: ['fighting', 'bug', 'fairy'], resist: ['ghost', 'dark'], immune: ['psychic'] },
  steel: { weak: ['fire', 'fighting', 'ground'], resist: ['normal', 'grass', 'ice', 'flying', 'psychic', 'bug', 'rock', 'dragon', 'steel', 'fairy'], immune: ['poison'] },
  fairy: { weak: ['poison', 'steel'], resist: ['fighting', 'bug', 'dark'], immune: ['dragon'] }
};

// Add move type effectiveness data for offensive coverage
const MOVE_TYPE_EFFECTIVENESS = {
  normal: { notVeryEffective: ['rock', 'steel'], superEffective: [], noEffect: ['ghost'] },
  fire: { notVeryEffective: ['fire', 'water', 'rock', 'dragon'], superEffective: ['grass', 'ice', 'bug', 'steel'], noEffect: [] },
  water: { notVeryEffective: ['water', 'grass', 'dragon'], superEffective: ['fire', 'ground', 'rock'], noEffect: [] },
  electric: { notVeryEffective: ['electric', 'grass', 'dragon'], superEffective: ['water', 'flying'], noEffect: ['ground'] },
  grass: { notVeryEffective: ['fire', 'grass', 'poison', 'flying', 'bug', 'dragon', 'steel'], superEffective: ['water', 'ground', 'rock'], noEffect: [] },
  ice: { notVeryEffective: ['fire', 'water', 'ice', 'steel'], superEffective: ['grass', 'ground', 'flying', 'dragon'], noEffect: [] },
  fighting: { notVeryEffective: ['poison', 'flying', 'psychic', 'bug', 'fairy'], superEffective: ['normal', 'ice', 'rock', 'dark', 'steel'], noEffect: ['ghost'] },
  poison: { notVeryEffective: ['poison', 'ground', 'rock', 'ghost'], superEffective: ['grass', 'fairy'], noEffect: ['steel'] },
  ground: { notVeryEffective: ['grass', 'bug'], superEffective: ['fire', 'electric', 'poison', 'rock', 'steel'], noEffect: ['flying'] },
  flying: { notVeryEffective: ['electric', 'rock', 'steel'], superEffective: ['electric', 'grass', 'fighting', 'bug'], noEffect: [] },
  psychic: { notVeryEffective: ['psychic', 'steel'], superEffective: ['fighting', 'poison'], noEffect: ['dark'] },
  bug: { notVeryEffective: ['fire', 'fighting', 'poison', 'flying', 'ghost', 'steel', 'fairy'], superEffective: ['grass', 'psychic', 'dark'], noEffect: [] },
  rock: { notVeryEffective: ['fighting', 'ground', 'steel'], superEffective: ['fire', 'ice', 'flying', 'bug'], noEffect: [] },
  ghost: { notVeryEffective: ['dark'], superEffective: ['psychic', 'ghost'], noEffect: ['normal'] },
  dragon: { notVeryEffective: ['steel'], superEffective: ['dragon'], noEffect: ['fairy'] },
  dark: { notVeryEffective: ['fighting', 'dark', 'fairy'], superEffective: ['psychic', 'ghost'], noEffect: [] },
  steel: { notVeryEffective: ['fire', 'water', 'electric', 'steel'], superEffective: ['ice', 'rock', 'fairy'], noEffect: [] },
  fairy: { notVeryEffective: ['fire', 'poison', 'steel'], superEffective: ['fighting', 'dragon', 'dark'], noEffect: [] }
};

function TeamBuilder() {
  const [suggestions, setSuggestions] = useState([]);
  const [searchTerms, setSearchTerms] = useState(Array(6).fill(''));
  const [selectedSlot, setSelectedSlot] = useState(null);
  const [fairyTypeEnabled, setFairyTypeEnabled] = useState(false);
  
  // Use the Pokemon context
  const { team, setTeam, removePokemon, clearTeam, updatePokemon } = usePokemonContext();
  const navigate = useNavigate();
  
  const allPokemon = completePokemonData.pokemon || [];

  // Get all types with fairy conditionally included
  const getFilteredTypes = () => {
    const types = Object.keys(TYPE_EFFECTIVENESS);
    if (!fairyTypeEnabled) {
      return types.filter(type => type !== 'fairy');
    }
    return types;
  };

  // Initialize search terms based on team
  useEffect(() => {
    const newSearchTerms = team.map(pokemon => pokemon ? pokemon.name : '');
    setSearchTerms(newSearchTerms);
  }, [team]);

  // Handle autocomplete for a specific slot
  const handleSearchChange = (slotIndex, value) => {
    const newSearchTerms = [...searchTerms];
    newSearchTerms[slotIndex] = value;
    setSearchTerms(newSearchTerms);

    if (value.length > 0) {
      const filtered = allPokemon
        .filter(pokemon => 
          pokemon.name?.toLowerCase().includes(value.toLowerCase())
        )
        .slice(0, 5);
      setSuggestions(filtered);
      setSelectedSlot(slotIndex);
    } else {
      setSuggestions([]);
      setSelectedSlot(null);
    }
  };

  const handlePokemonSelect = (pokemon, slotIndex) => {
    // Convert the selected pokemon to the required format
    const formattedPokemon = {
      id: pokemon.id,
      name: pokemon.name,
      sprite: pokemon.sprite,
      types: pokemon.types || []
    };
    
    const newTeam = [...team];
    newTeam[slotIndex] = formattedPokemon;
    setTeam(newTeam);
    
    const newSearchTerms = [...searchTerms];
    newSearchTerms[slotIndex] = pokemon.name;
    setSearchTerms(newSearchTerms);
    
    setSuggestions([]);
    setSelectedSlot(null);
  };

  // Function to handle editing a Pokemon
  const handleEditPokemon = (pokemon, slotIndex) => {
    // Navigate to EVDistribution with pokemon data and slotIndex
    navigate('/ev-distribution', { 
      state: { 
        pokemon, 
        slotIndex,
        isEditing: true
      } 
    });
  };

  // Calculate type effectiveness for the team
  const calculateTypeEffectiveness = () => {
    const typeChart = {};
    const allTypes = getFilteredTypes();
    
    allTypes.forEach(attackingType => {
      typeChart[attackingType] = {
        slots: Array(6).fill(1),
        totalWeak: 0,
        totalResist: 0
      };
    });

    team.forEach((pokemon, slotIndex) => {
      if (pokemon && pokemon.types) {
        // Filter out fairy type from pokemon.types if fairy is disabled
        const filteredTypes = fairyTypeEnabled ? 
          pokemon.types : 
          pokemon.types.filter(type => type !== 'fairy');
          
        allTypes.forEach(attackingType => {
          let effectiveness = 1;
          
          filteredTypes.forEach(defendingType => {
            if (!fairyTypeEnabled && defendingType === 'fairy') return;
            
            const typeData = TYPE_EFFECTIVENESS[defendingType];
            if (typeData) {
              if (typeData.immune.includes(attackingType)) {
                effectiveness = 0;
              } else if (typeData.weak.includes(attackingType)) {
                effectiveness *= 2;
              } else if (typeData.resist.includes(attackingType)) {
                effectiveness *= 0.5;
              }
            }
          });
          
          typeChart[attackingType].slots[slotIndex] = effectiveness;
        });
      }
    });

    // Calculate totals
    allTypes.forEach(attackingType => {
      const weakCount = typeChart[attackingType].slots.filter(eff => eff > 1).length;
      const resistCount = typeChart[attackingType].slots.filter(eff => eff < 1 && eff > 0).length;
      typeChart[attackingType].totalWeak = weakCount;
      typeChart[attackingType].totalResist = resistCount;
    });

    return typeChart;
  };

  // Calculate offensive coverage based on selected Pokemon moves from analysis
  const calculateOffensiveCoverage = () => {
    const coverageChart = {};
    const allTypes = getFilteredTypes();
    
    allTypes.forEach(defendingType => {
      coverageChart[defendingType] = {
        slots: Array(6).fill(null),
        totalNotVeryEffective: 0,
        totalSuperEffective: 0
      };
    });

    team.forEach((pokemon, slotIndex) => {
      if (pokemon && pokemon.selectedMoves && pokemon.selectedMoves.length > 0) {
        // Get unique move types from selected moves
        const moveTypes = new Set();
        
        pokemon.selectedMoves.forEach(move => {
          // Extract move type - now should be included in the move object
          let moveType = null;
          
          if (move.type) {
            moveType = move.type.toLowerCase();
          }
          
          // Skip fairy type moves if fairy is disabled
          if (!fairyTypeEnabled && moveType === 'fairy') return;
          
          if (moveType && Object.keys(MOVE_TYPE_EFFECTIVENESS).includes(moveType)) {
            moveTypes.add(moveType);
          }
        });

        console.log('Pokemon:', pokemon.name, 'Move types found:', Array.from(moveTypes));

        allTypes.forEach(defendingType => {
          let bestEffectiveness = 0;
          
          // Check each move type this Pokemon has from selected moves
          moveTypes.forEach(moveType => {
            const moveTypeData = MOVE_TYPE_EFFECTIVENESS[moveType];
            if (moveTypeData) {
              let effectiveness = 1;
              
              if (moveTypeData.noEffect.includes(defendingType)) {
                effectiveness = 0;
              } else if (moveTypeData.superEffective.includes(defendingType)) {
                effectiveness = 2;
              } else if (moveTypeData.notVeryEffective.includes(defendingType)) {
                effectiveness = 0.5;
              }
              
              bestEffectiveness = Math.max(bestEffectiveness, effectiveness);
            }
          });
          
          coverageChart[defendingType].slots[slotIndex] = bestEffectiveness;
        });
      } else {
        // No selected moves data available, set all to null
        allTypes.forEach(defendingType => {
          coverageChart[defendingType].slots[slotIndex] = null;
        });
      }
    });

    // Calculate totals
    allTypes.forEach(defendingType => {
      const validSlots = coverageChart[defendingType].slots.filter(eff => eff !== null);
      const notVeryEffectiveCount = validSlots.filter(eff => eff < 1 && eff > 0).length;
      const superEffectiveCount = validSlots.filter(eff => eff > 1).length;
      coverageChart[defendingType].totalNotVeryEffective = notVeryEffectiveCount;
      coverageChart[defendingType].totalSuperEffective = superEffectiveCount;
    });

    return coverageChart;
  };

  const getEffectivenessText = (effectiveness) => {
    if (effectiveness === 0) return '0×';
    if (effectiveness === 0.25) return '¼×';
    if (effectiveness === 0.5) return '½×';
    if (effectiveness === 1) return '1×';
    if (effectiveness === 2) return '2×';
    if (effectiveness === 4) return '4×';
    return `${effectiveness}×`;
  };

  const getEffectivenessColor = (effectiveness) => {
    if (effectiveness === 0) return '#666';
    if (effectiveness < 1) return '#4CAF50';
    if (effectiveness === 1) return '#999';
    return '#F44336';
  };

  const getOffensiveEffectivenessText = (effectiveness) => {
    if (effectiveness === null) return '-';
    if (effectiveness === 0) return '0×';
    if (effectiveness === 0.5) return '½×';
    if (effectiveness === 1) return '1×';
    if (effectiveness === 2) return '2×';
    return `${effectiveness}×`;
  };

  const getOffensiveEffectivenessColor = (effectiveness) => {
    if (effectiveness === null) return '#999';
    if (effectiveness === 0) return '#666';
    if (effectiveness < 1) return '#F44336';
    if (effectiveness === 1) return '#999';
    return '#4CAF50';
  };

  const typeChart = calculateTypeEffectiveness();
  const offensiveCoverage = calculateOffensiveCoverage();
  const filteredTypes = getFilteredTypes();

  return (
    <div style={{ padding: '20px', maxWidth: '1400px', margin: '0 auto' }}>
      <h2 style={{ textAlign: 'center', color: '#2C3E50', marginBottom: '30px' }}>
        Pokémon Team Builder
      </h2>

      <div style={{ 
        backgroundColor: '#F8F9FA', 
        padding: '20px', 
        borderRadius: '10px', 
        marginBottom: '30px',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        flexWrap: 'wrap'
      }}>
        <div>
          <p style={{ 
            margin: '0 0 15px 0', 
            color: '#555', 
            fontSize: '16px',
            fontWeight: 'bold'
          }}>
            Build your perfect Pokémon team and analyze type coverage!
          </p>
          <p style={{ margin: 0, color: '#777', fontSize: '14px' }}>
            Add up to 6 Pokémon to your team and see how well they cover each other's weaknesses. 
            The table below shows how each type of attack affects your team.
          </p>
        </div>
        
        <div>
          <button 
            onClick={() => setFairyTypeEnabled(prev => !prev)}
            style={{
              backgroundColor: fairyTypeEnabled ? '#EE99AC' : '#ccc',
              color: 'white',
              border: 'none',
              borderRadius: '5px',
              padding: '8px 16px',
              fontSize: '14px',
              fontWeight: 'bold',
              cursor: 'pointer',
              transition: 'background-color 0.3s',
              display: 'flex',
              alignItems: 'center',
              gap: '8px'
            }}
          >
            <span>Fairy Type</span>
            <span style={{ 
              display: 'inline-block',
              width: '16px',
              height: '16px',
              borderRadius: '50%',
              backgroundColor: fairyTypeEnabled ? '#4CAF50' : '#E74C3C',
              border: '2px solid white'
            }}></span>
          </button>
          <div style={{ 
            fontSize: '11px', 
            color: '#888', 
            marginTop: '4px',
            textAlign: 'center'
          }}>
            {fairyTypeEnabled ? 'Gen 6+ (Enabled)' : 'Gen 5 and Below (Disabled)'}
          </div>
        </div>
      </div>

      {/* Team Input Section */}
      <div style={{ marginBottom: '40px' }}>
        <h3 style={{ color: '#34495E', marginBottom: '20px' }}>Team Input</h3>
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', 
          gap: '20px' 
        }}>
          {team.map((pokemon, index) => (
            <div key={index} style={{
              border: '2px solid #E0E0E0',
              borderRadius: '10px',
              padding: '15px',
              backgroundColor: pokemon ? '#F0F8FF' : '#FAFAFA',
              position: 'relative'
            }}>
              <div style={{ 
                fontSize: '14px', 
                fontWeight: 'bold', 
                color: '#34495E', 
                marginBottom: '10px' 
              }}>
                Pokémon {index + 1}:
              </div>
              
              <div style={{ position: 'relative' }}>
                <input
                  type="text"
                  placeholder="Input Pokémon"
                  value={searchTerms[index]}
                  onChange={(e) => handleSearchChange(index, e.target.value)}
                  style={{
                    width: '100%',
                    padding: '10px',
                    border: '2px solid #BDC3C7',
                    borderRadius: '5px',
                    fontSize: '14px'
                  }}
                />
                
                {suggestions.length > 0 && selectedSlot === index && (
                  <ul style={{
                    position: 'absolute',
                    top: '100%',
                    left: 0,
                    right: 0,
                    backgroundColor: 'white',
                    border: '1px solid #BDC3C7',
                    borderTop: 'none',
                    borderRadius: '0 0 5px 5px',
                    maxHeight: '150px',
                    overflowY: 'auto',
                    zIndex: 1000,
                    margin: 0,
                    padding: 0,
                    listStyle: 'none'
                  }}>
                    {suggestions.map((suggestedPokemon, suggestionIndex) => (
                      <li
                        key={suggestionIndex}
                        onClick={() => handlePokemonSelect(suggestedPokemon, index)}
                        style={{
                          padding: '8px 10px',
                          cursor: 'pointer',
                          borderBottom: '1px solid #ECF0F1',
                          fontSize: '14px'
                        }}
                        onMouseEnter={(e) => e.target.style.backgroundColor = '#F8F9FA'}
                        onMouseLeave={(e) => e.target.style.backgroundColor = 'white'}
                      >
                        {suggestedPokemon.name} (#{suggestedPokemon.id})
                      </li>
                    ))}
                  </ul>
                )}
              </div>

              {pokemon && (
                <div style={{ marginTop: '15px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', marginBottom: '10px' }}>
                    {pokemon.sprite && (
                      <img 
                        src={pokemon.sprite} 
                        alt={pokemon.name}
                        style={{ width: '60px', height: '60px', marginRight: '15px' }}
                      />
                    )}
                    <div style={{ flex: 1 }}>
                      <h4 style={{ 
                        margin: '0 0 5px 0', 
                        color: '#2C3E50', 
                        textTransform: 'capitalize' 
                      }}>
                        {pokemon.name}
                      </h4>
                      {pokemon.level && (
                        <div style={{ fontSize: '12px', color: '#666', marginBottom: '5px' }}>
                          Level: {pokemon.level}
                        </div>
                      )}
                      <div style={{ display: 'flex', gap: '5px', marginBottom: '5px' }}>
                        {pokemon.types && pokemon.types
                          .filter(type => fairyTypeEnabled || type !== 'fairy')
                          .map((type, typeIndex) => (
                            <span
                              key={typeIndex}
                              style={{
                                backgroundColor: TYPE_COLORS[type] || '#68A090',
                                color: 'white',
                                padding: '2px 8px',
                                borderRadius: '12px',
                                fontSize: '11px',
                                textTransform: 'capitalize'
                              }}
                            >
                              {type}
                            </span>
                          ))
                        }
                        {/* Show indicator if a fairy type is hidden */}
                        {!fairyTypeEnabled && pokemon.types && pokemon.types.includes('fairy') && (
                          <span
                            style={{
                              backgroundColor: '#ccc',
                              color: '#666',
                              padding: '2px 8px',
                              borderRadius: '12px',
                              fontSize: '11px',
                              border: '1px dashed #999'
                            }}
                          >
                            fairy disabled
                          </span>
                        )}
                      </div>
                      
                      {/* Display nature and item if available */}
                      {(pokemon.nature || pokemon.item) && (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '2px', marginTop: '4px', fontSize: '11px', color: '#666' }}>
                          {pokemon.nature && pokemon.nature !== 'neutral' && (
                            <div>Nature: <span style={{ fontWeight: 'bold' }}>{pokemon.nature}</span></div>
                          )}
                          {pokemon.item && (
                            <div>Item: <span style={{ fontWeight: 'bold' }}>{pokemon.item}</span></div>
                          )}
                        </div>
                      )}
                      
                      {/* Display selected moves with types */}
                      {pokemon.selectedMoves && pokemon.selectedMoves.length > 0 && (
                        <div style={{ marginTop: '8px' }}>
                          <div style={{ fontSize: '11px', fontWeight: 'bold', color: '#666', marginBottom: '3px' }}>
                            Selected Moves:
                          </div>
                          <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                            {pokemon.selectedMoves
                              .filter(move => fairyTypeEnabled || move.type !== 'fairy')
                              .map((move, moveIndex) => (
                                <div key={moveIndex} style={{
                                  fontSize: '10px',
                                  color: '#555',
                                  backgroundColor: '#F0F0F0',
                                  padding: '2px 6px',
                                  borderRadius: '8px',
                                  border: '1px solid #DDD',
                                  display: 'flex',
                                  justifyContent: 'space-between',
                                  alignItems: 'center'
                                }}>
                                  <span>
                                    {move.name}
                                    {move.level && move.level !== 'N/A' && (
                                      <span style={{ color: '#888', marginLeft: '4px' }}>
                                        (Lv.{move.level})
                                      </span>
                                    )}
                                  </span>
                                  {move.type && (
                                    <span style={{
                                      backgroundColor: TYPE_COLORS[move.type] || '#68A090',
                                      color: 'white',
                                      padding: '1px 4px',
                                      borderRadius: '4px',
                                      fontSize: '8px',
                                      textTransform: 'capitalize',
                                      marginLeft: '4px'
                                    }}>
                                      {move.type}
                                    </span>
                                  )}
                                </div>
                              ))
                            }
                            {/* Show disabled moves indicator */}
                            {!fairyTypeEnabled && 
                             pokemon.selectedMoves.some(move => move.type === 'fairy') && (
                              <div style={{
                                fontSize: '10px',
                                color: '#888',
                                padding: '2px 6px',
                                fontStyle: 'italic'
                              }}>
                                (Some fairy moves are hidden)
                              </div>
                            )}
                          </div>
                        </div>
                      )}
                      
                      {/* Display stats if available */}
                      {pokemon.stats && Object.keys(pokemon.stats).length > 0 && (
                        <div style={{ marginTop: '8px', fontSize: '10px' }}>
                          <div style={{ fontSize: '11px', fontWeight: 'bold', color: '#666', marginBottom: '3px' }}>
                            Stats:
                          </div>
                          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '2px' }}>
                            {Object.entries(pokemon.stats).map(([statName, value], statIndex) => (
                              <div key={statIndex} style={{ display: 'flex', justifyContent: 'space-between', backgroundColor: '#F8F8F8', padding: '1px 4px', borderRadius: '2px' }}>
                                <span style={{ textTransform: 'uppercase' }}>{statName}:</span>
                                <span style={{ fontWeight: 'bold' }}>{value}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                  
                  <div style={{ display: 'flex', gap: '10px', marginTop: '10px' }}>
                    <button
                      onClick={() => removePokemon(index)}
                      style={{
                        backgroundColor: '#E74C3C',
                        color: 'white',
                        border: 'none',
                        borderRadius: '5px',
                        padding: '5px 10px',
                        fontSize: '12px',
                        cursor: 'pointer',
                        flex: '1'
                      }}
                    >
                      Remove
                    </button>
                    
                    <button
                      onClick={() => handleEditPokemon(pokemon, index)}
                      style={{
                        backgroundColor: '#3498DB',
                        color: 'white',
                        border: 'none',
                        borderRadius: '5px',
                        padding: '5px 10px',
                        fontSize: '12px',
                        cursor: 'pointer',
                        flex: '1'
                      }}
                    >
                      Edit
                    </button>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
        
        <div style={{ textAlign: 'center', marginTop: '20px' }}>
          <button
            onClick={clearTeam}
            style={{
              backgroundColor: '#95A5A6',
              color: 'white',
              border: 'none',
              borderRadius: '5px',
              padding: '10px 20px',
              fontSize: '14px',
              cursor: 'pointer',
              fontWeight: 'bold'
            }}
          >
            Clear All
          </button>
        </div>
      </div>

      {/* Offensive Coverage Table */}
      <div style={{
        backgroundColor: 'white',
        border: '2px solid #E0E0E0',
        borderRadius: '10px',
        overflow: 'hidden',
        marginBottom: '30px'
      }}>
        <div style={{
          backgroundColor: '#2980B9',
          color: 'white',
          padding: '15px',
          fontSize: '18px',
          fontWeight: 'bold',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>
          <span>Offensive Coverage</span>
          {!fairyTypeEnabled && (
            <span style={{
              fontSize: '12px',
              backgroundColor: 'rgba(255,255,255,0.2)',
              padding: '4px 8px',
              borderRadius: '4px'
            }}>
              Fairy type disabled
            </span>
          )}
        </div>
        
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ backgroundColor: '#F8F9FA' }}>
                <th style={{ 
                  padding: '10px', 
                  textAlign: 'left', 
                  borderBottom: '2px solid #E0E0E0',
                  minWidth: '80px'
                }}>
                  Enemy ↓
                </th>
                {team.map((pokemon, index) => (
                  <th key={index} style={{ 
                    padding: '10px', 
                    textAlign: 'center', 
                    borderBottom: '2px solid #E0E0E0',
                    minWidth: '80px'
                  }}>
                    {pokemon ? (
                      <div>
                        <div>{pokemon.name}</div>
                        {pokemon.selectedMoves && pokemon.selectedMoves.length > 0 ? (
                          <div style={{ fontSize: '10px', color: '#666' }}>
                            ({pokemon.selectedMoves.length} selected moves)
                          </div>
                        ) : (
                          <div style={{ fontSize: '10px', color: '#999' }}>
                            (no selected moves)
                          </div>
                        )}
                      </div>
                    ) : `Slot ${index + 1}`}
                  </th>
                ))}
                <th style={{ 
                  padding: '10px', 
                  textAlign: 'center', 
                  borderBottom: '2px solid #E0E0E0',
                  backgroundColor: '#FFEBEE'
                }}>
                  Not Very Effective
                </th>
                <th style={{ 
                  padding: '10px', 
                  textAlign: 'center', 
                  borderBottom: '2px solid #E0E0E0',
                  backgroundColor: '#E8F5E8'
                }}>
                  Super Effective
                </th>
              </tr>
            </thead>
            <tbody>
              {filteredTypes.map(type => (
                <tr key={type}>
                  <td style={{ 
                    padding: '8px 10px', 
                    borderBottom: '1px solid #E0E0E0',
                    backgroundColor: TYPE_COLORS[type],
                    color: 'white',
                    fontWeight: 'bold',
                    textTransform: 'capitalize'
                  }}>
                    {type}
                  </td>
                  {offensiveCoverage[type].slots.map((effectiveness, slotIndex) => (
                    <td key={slotIndex} style={{ 
                      padding: '8px', 
                      textAlign: 'center', 
                      borderBottom: '1px solid #E0E0E0',
                      backgroundColor: team[slotIndex] ? 'white' : '#F8F9FA',
                      color: getOffensiveEffectivenessColor(effectiveness),
                      fontWeight: 'bold'
                    }}>
                      {getOffensiveEffectivenessText(effectiveness)}
                    </td>
                  ))}
                  <td style={{ 
                    padding: '8px', 
                    textAlign: 'center', 
                    borderBottom: '1px solid #E0E0E0',
                    backgroundColor: '#FFEBEE',
                    fontWeight: 'bold',
                    color: offensiveCoverage[type].totalNotVeryEffective > 0 ? '#E74C3C' : '#666'
                  }}>
                    {offensiveCoverage[type].totalNotVeryEffective}
                  </td>
                  <td style={{ 
                    padding: '8px', 
                    textAlign: 'center', 
                    borderBottom: '1px solid #E0E0E0',
                    backgroundColor: '#E8F5E8',
                    fontWeight: 'bold',
                    color: offensiveCoverage[type].totalSuperEffective > 0 ? '#27AE60' : '#666'
                  }}>
                    {offensiveCoverage[type].totalSuperEffective}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        
        <div style={{
          backgroundColor: '#F8F9FA',
          padding: '15px',
          fontSize: '14px',
          color: '#555'
        }}>
          <strong>Note:</strong> Offensive coverage is calculated based on move types from Pokemon's selected moves in EVDistribution analysis. 
          Pokemon without selected move data will show "-" for all matchups.
        </div>
      </div>

      {/* Defensive Coverage Table */}
      <div style={{
        backgroundColor: 'white',
        border: '2px solid #E0E0E0',
        borderRadius: '10px',
        overflow: 'hidden',
        marginBottom: '30px'
      }}>
        <div style={{
          backgroundColor: '#34495E',
          color: 'white',
          padding: '15px',
          fontSize: '18px',
          fontWeight: 'bold',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>
          <span>Defensive Coverage</span>
          {!fairyTypeEnabled && (
            <span style={{
              fontSize: '12px',
              backgroundColor: 'rgba(255,255,255,0.2)',
              padding: '4px 8px',
              borderRadius: '4px'
            }}>
              Fairy type disabled
            </span>
          )}
        </div>
        
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ backgroundColor: '#F8F9FA' }}>
                <th style={{ 
                  padding: '10px', 
                  textAlign: 'left', 
                  borderBottom: '2px solid #E0E0E0',
                  minWidth: '80px'
                }}>
                  Attack Type
                </th>
                {team.map((pokemon, index) => (
                  <th key={index} style={{ 
                    padding: '10px', 
                    textAlign: 'center', 
                    borderBottom: '2px solid #E0E0E0',
                    minWidth: '80px'
                  }}>
                    {pokemon ? pokemon.name : `Slot ${index + 1}`}
                  </th>
                ))}
                <th style={{ 
                  padding: '10px', 
                  textAlign: 'center', 
                  borderBottom: '2px solid #E0E0E0',
                  backgroundColor: '#FFEBEE'
                }}>
                  Weak
                </th>
                <th style={{ 
                  padding: '10px', 
                  textAlign: 'center', 
                  borderBottom: '2px solid #E0E0E0',
                  backgroundColor: '#E8F5E8'
                }}>
                  Resist
                </th>
              </tr>
            </thead>
            <tbody>
              {filteredTypes.map(type => (
                <tr key={type}>
                  <td style={{ 
                    padding: '8px 10px', 
                    borderBottom: '1px solid #E0E0E0',
                    backgroundColor: TYPE_COLORS[type],
                    color: 'white',
                    fontWeight: 'bold',
                    textTransform: 'capitalize'
                  }}>
                    {type}
                  </td>
                  {typeChart[type].slots.map((effectiveness, slotIndex) => (
                    <td key={slotIndex} style={{ 
                      padding: '8px', 
                      textAlign: 'center', 
                      borderBottom: '1px solid #E0E0E0',
                      backgroundColor: team[slotIndex] ? 'white' : '#F8F9FA',
                      color: getEffectivenessColor(effectiveness),
                      fontWeight: 'bold'
                    }}>
                      {team[slotIndex] ? getEffectivenessText(effectiveness) : '-'}
                    </td>
                  ))}
                  <td style={{ 
                    padding: '8px', 
                    textAlign: 'center', 
                    borderBottom: '1px solid #E0E0E0',
                    backgroundColor: '#FFEBEE',
                    fontWeight: 'bold',
                    color: typeChart[type].totalWeak > 0 ? '#E74C3C' : '#666'
                  }}>
                    {typeChart[type].totalWeak}
                  </td>
                  <td style={{ 
                    padding: '8px', 
                    textAlign: 'center', 
                    borderBottom: '1px solid #E0E0E0',
                    backgroundColor: '#E8F5E8',
                    fontWeight: 'bold',
                    color: typeChart[type].totalResist > 0 ? '#27AE60' : '#666'
                  }}>
                    {typeChart[type].totalResist}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Legend */}
      <div style={{
        backgroundColor: '#F8F9FA',
        padding: '20px',
        borderRadius: '10px',
        border: '1px solid #E0E0E0'
      }}>
        <h4 style={{ margin: '0 0 15px 0', color: '#34495E' }}>Legend:</h4>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '20px', fontSize: '14px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
            <span style={{ color: '#666', fontWeight: 'bold' }}>0×</span>
            <span>No Effect (Immune)</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
            <span style={{ color: '#4CAF50', fontWeight: 'bold' }}>½×</span>
            <span>Not Very Effective (Resisted)</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
            <span style={{ color: '#999', fontWeight: 'bold' }}>1×</span>
            <span>Normal Damage</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
            <span style={{ color: '#F44336', fontWeight: 'bold' }}>2×</span>
            <span>Super Effective (Weak)</span>
          </div>
        </div>
        
        {/* Add info about Fairy type toggle */}
        <div style={{ marginTop: '15px', fontSize: '13px', color: '#666' }}>
          <p style={{ margin: '0', fontStyle: 'italic' }}>
            <strong>Game Generation:</strong> {fairyTypeEnabled ? 
              "Gen 6+ (X/Y and later) - Fairy type enabled" : 
              "Gen 5 and below (Black/White and earlier) - Fairy type disabled"}
          </p>
          <p style={{ margin: '5px 0 0 0', fontStyle: 'italic' }}>
            Use the Fairy Type toggle button to switch between game generations.
          </p>
        </div>
      </div>
    </div>
  );
}

export default TeamBuilder;

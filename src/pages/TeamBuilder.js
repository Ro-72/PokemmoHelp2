import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import completePokemonData from '../data/complete_pokemon_data.json';
import moveClassification from '../data/clasificacion_movimientos_completa.json';
import pokemonMovesData from '../data/pokemon_moves.json';
import AddToAnalysisButton from '../components/AddToAnalysisButton';
import { useTeam } from '../contexts/TeamContext';

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

function TeamBuilder({ setSavedPokemon }) {
  const { team, updatePokemon, removePokemon, clearTeam, setCurrentPokemon } = useTeam();
  
  // Detect dark mode from App container
  const [darkMode, setDarkMode] = useState(false);
  useEffect(() => {
    setDarkMode(document.querySelector('.App.dark-mode') !== null);
    const observer = new MutationObserver(() => {
      setDarkMode(document.querySelector('.App.dark-mode') !== null);
    });
    observer.observe(document.body, { attributes: true, subtree: true });
    return () => observer.disconnect();
  }, []);

  const [suggestions, setSuggestions] = useState([]);
  const [searchTerms, setSearchTerms] = useState(Array(6).fill(''));
  const [selectedSlot, setSelectedSlot] = useState(null);
  const navigate = useNavigate();
  
  const allPokemon = completePokemonData.pokemon || [];

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
    // Transform Pokemon data to team format
    const teamPokemon = {
      id: pokemon.id,
      name: pokemon.name,
      sprite: pokemon.sprite,
      types: pokemon.types || [],
      baseStats: pokemon.baseStats || {},
      stats: pokemon.baseStats ? [
        { stat: { name: 'hp' }, base_stat: pokemon.baseStats.hp || 0 },
        { stat: { name: 'attack' }, base_stat: pokemon.baseStats.attack || 0 },
        { stat: { name: 'defense' }, base_stat: pokemon.baseStats.defense || 0 },
        { stat: { name: 'special-attack' }, base_stat: pokemon.baseStats.specialAttack || 0 },
        { stat: { name: 'special-defense' }, base_stat: pokemon.baseStats.specialDefense || 0 },
        { stat: { name: 'speed' }, base_stat: pokemon.baseStats.speed || 0 }
      ] : [],
      selectedMoves: [], // Initialize empty, will be populated in analysis
      fromTeamBuilder: true
    };
    
    updatePokemon(slotIndex, teamPokemon);
    
    const newSearchTerms = [...searchTerms];
    newSearchTerms[slotIndex] = pokemon.name;
    setSearchTerms(newSearchTerms);
    
    setSuggestions([]);
    setSelectedSlot(null);
  };

  const handleRemovePokemon = (slotIndex) => {
    removePokemon(slotIndex);
    
    const newSearchTerms = [...searchTerms];
    newSearchTerms[slotIndex] = '';
    setSearchTerms(newSearchTerms);
  };

  const handleClearTeam = () => {
    if (window.confirm('Are you sure you want to clear all Pokémon from your team?')) {
      clearTeam();
      setSearchTerms(Array(6).fill(''));
    }
  };



  // Calculate type effectiveness for the team
  const calculateTypeEffectiveness = () => {
    const typeChart = {};
    const allTypes = Object.keys(TYPE_EFFECTIVENESS);
    
    allTypes.forEach(attackingType => {
      typeChart[attackingType] = {
        slots: Array(6).fill(1),
        totalWeak: 0,
        totalResist: 0
      };
    });

    team.forEach((pokemon, slotIndex) => {
      if (pokemon && pokemon.types) {
        allTypes.forEach(attackingType => {
          let effectiveness = 1;
          
          pokemon.types.forEach(defendingType => {
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

    // Calculate totals (count immunities as resistances)
    allTypes.forEach(attackingType => {
      const weakCount = typeChart[attackingType].slots.filter(eff => eff > 1).length;
      const resistCount = typeChart[attackingType].slots.filter(eff => eff < 1).length; // This includes both 0x and 0.5x
      typeChart[attackingType].totalWeak = weakCount;
      typeChart[attackingType].totalResist = resistCount;
    });

    return typeChart;
  };

  // Calculate offensive coverage based on selected Pokemon moves from analysis
  const calculateOffensiveCoverage = () => {
    const coverageChart = {};
    const allTypes = Object.keys(TYPE_EFFECTIVENESS);
    
    allTypes.forEach(defendingType => {
      coverageChart[defendingType] = {
        slots: Array(6).fill(null),
        totalNotVeryEffective: 0,
        totalSuperEffective: 0
      };
    });

    team.forEach((pokemon, slotIndex) => {
      if (pokemon && pokemon.selectedMoves && pokemon.selectedMoves.length > 0) {
        // Get unique move types from selected moves, but only from offensive moves
        const moveTypes = new Set();
        
        pokemon.selectedMoves.forEach(move => {
          // Check if move is in classification and is offensive
          const moveKey = move.name?.toLowerCase().replace(/\s+/g, '-');
          const moveClassInfo = moveClassification[moveKey];
          
          // Only include moves that are offensive (not pure status moves)
          const isOffensive = moveClassInfo && 
            (moveClassInfo.tipo_movimiento === 'ofensivo_fisico' || 
             moveClassInfo.tipo_movimiento === 'ofensivo_especial_efecto' ||
             moveClassInfo.tipo_movimiento === 'ofensivo_especial_limitado' ||
             moveClassInfo.tipo_movimiento === 'emergencia' ||
             moveClassInfo.tipo_movimiento === 'soporte' && moveClassInfo.poder > 0);
          
          if (isOffensive && move.type) {
            const moveType = move.type.toLowerCase();
            if (Object.keys(MOVE_TYPE_EFFECTIVENESS).includes(moveType)) {
              moveTypes.add(moveType);
            }
          }
        });

        console.log('Pokemon:', pokemon.name, 'Offensive move types found:', Array.from(moveTypes));

        allTypes.forEach(defendingType => {
          let bestEffectiveness = 0;
          
          // Check each offensive move type this Pokemon has from selected moves
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

    // Calculate totals (count no effect as not very effective)
    allTypes.forEach(defendingType => {
      const validSlots = coverageChart[defendingType].slots.filter(eff => eff !== null);
      const notVeryEffectiveCount = validSlots.filter(eff => eff < 1).length; // This includes both 0x and 0.5x
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

  // Helper for defensive conclusions

  // Helper for offensive conclusions
  const getOffensiveConclusions = () => {
    const conclusions = [];
    Object.keys(TYPE_EFFECTIVENESS).forEach(type => {
      const slots = offensiveCoverage[type].slots;
      const validSlots = slots.filter(eff => eff !== null);
      
      if (validSlots.length === 0) {
        // No moves selected for any Pokemon
        return;
      }
      
      const hasSuperEffective = slots.some(eff => eff === 2);
      const hasNormalEffective = slots.some(eff => eff === 1);
      const hasNotVeryEffective = slots.filter(eff => eff === 0.5).length;
      const hasNoEffect = slots.filter(eff => eff === 0).length;
      const totalValidMoves = validSlots.length;
      
      // Check if type is very resilient (mostly resists or is immune to team's moves)
      if ((hasNotVeryEffective + hasNoEffect) >= Math.ceil(totalValidMoves * 0.6)) {
        conclusions.push(
          `${type.toUpperCase()} types are very resilient to your team's moves (${hasNotVeryEffective} not very effective, ${hasNoEffect} no effect). Consider adding moves that are super effective against ${type}.`
        );
      }
      // Check if team lacks any super effective coverage
      else if (!hasSuperEffective && totalValidMoves > 0) {
        conclusions.push(
          `Your team lacks super effective coverage against ${type.toUpperCase()}. Consider adding a move or Pokémon to cover this type.`
        );
      }
    });
    
    if (conclusions.length === 0) {
      conclusions.push('Your team has good offensive coverage with no major weaknesses detected.');
    }
    return conclusions;
  };

  // Send Pokemon to analysis with team context
  const sendToAnalysis = async (pokemon, slotIndex) => {
    if (!setSavedPokemon) {
      console.error('setSavedPokemon function not provided');
      alert('Error: La función para guardar Pokemon no está disponible.');
      return;
    }

    if (pokemon) {
      const strategyUrl = `https://www.pokexperto.net/index2.php?seccion=nds/nationaldex/estrategia&pk=${pokemon.id}`;
      try {
        // Get moves from local JSON
        const movesRaw = pokemonMovesData[pokemon.name?.toLowerCase()]?.moves || [];
        const moves = movesRaw.map(move => {
          let method = 'unknown';
          if ('level' in move) method = 'level-up';
          else if (move.type === 'egg_moves') method = 'egg';
          else if (move.type === 'move_tutor') method = 'tutor';
          else if (move.type === 'move_learner_tools' || move.type === 'special_moves') method = 'machine';

          return {
            name: move.name || '(desconocido)',
            method,
            level: move.level ?? 'N/A',
            mtId: method === 'machine' ? move.id : null,
            breedingPartner: method === 'egg' ? (move.breedingPartner || null) : null,
            raw: move
          };
        });

        // Transform for analysis page
        const transformedPokemon = {
          id: pokemon.id,
          name: pokemon.name,
          sprites: {
            front_default: pokemon.sprite
          },
          stats: pokemon.stats || [],
          types: pokemon.types ? pokemon.types.map(type => ({ type: { name: type } })) : [],
          strategyUrl,
          moves,
          selectedMoves: pokemon.selectedMoves || [],
          teamSlotIndex: slotIndex,
          fromTeamBuilder: true,
          // Include current team state
          level: pokemon.level || 70,
          nature: pokemon.nature || 'neutral',
          item: pokemon.item || '',
          evs: pokemon.evs || {
            hp: 0, attack: 0, defense: 0,
            spAttack: 0, spDefense: 0, speed: 0
          },
          ivs: pokemon.ivs || {
            hp: 0, attack: 0, defense: 0,
            spAttack: 0, spDefense: 0, speed: 0
          }
        };

        console.log('Sending Pokemon to analysis:', transformedPokemon);
        
        // Set current Pokemon in team context
        setCurrentPokemon(slotIndex);
        
        setSavedPokemon(transformedPokemon);
        navigate('/ev-distribution');
      } catch (error) {
        console.error('Error al obtener los movimientos del Pokémon:', error);
        alert('Error al obtener los movimientos del Pokémon.');
      }
    }
  };

  const getDefensiveConclusions = () => {
    const conclusions = [];
    let totalWeaknesses = 0;
    let totalResistances = 0;
    let criticalWeaknesses = [];
    let strongResistances = [];

    Object.keys(TYPE_EFFECTIVENESS).forEach(type => {
      const weakCount = typeChart[type].totalWeak;
      const resistCount = typeChart[type].totalResist;
      
      totalWeaknesses += weakCount;
      totalResistances += resistCount;

      // Find types with many weaknesses (3+ team members weak)
      if (weakCount >= 3) {
        criticalWeaknesses.push(`${type.toUpperCase()} (${weakCount} weak)`);
      }

      // Find types with many resistances (3+ team members resist)
      if (resistCount >= 3) {
        strongResistances.push(`${type.toUpperCase()} (${resistCount} resist)`);
      }

      // Check for 4x weaknesses
      const slots = typeChart[type].slots;
      const has4x = slots.some(eff => eff === 4);
      if (has4x) {
        conclusions.push(
          `Your team has a 4× weakness to ${type.toUpperCase()}. Consider adding a Pokémon that resists or is immune to ${type}.`
        );
      }
    });

    // Overall defensive balance analysis
    const defensiveScore = totalResistances - totalWeaknesses;
    
    if (defensiveScore > 10) {
      conclusions.push(`Your team has excellent defensive coverage with ${totalResistances} resistances vs ${totalWeaknesses} weaknesses (Score: +${defensiveScore}).`);
    } else if (defensiveScore > 0) {
      conclusions.push(`Your team has good defensive balance with ${totalResistances} resistances vs ${totalWeaknesses} weaknesses (Score: +${defensiveScore}).`);
    } else if (defensiveScore === 0) {
      conclusions.push(`Your team has neutral defensive balance with ${totalResistances} resistances vs ${totalWeaknesses} weaknesses (Score: ${defensiveScore}).`);
    } else {
      conclusions.push(`Your team has defensive weaknesses with ${totalResistances} resistances vs ${totalWeaknesses} weaknesses (Score: ${defensiveScore}). Consider adding more defensive variety.`);
    }

    // Highlight critical weaknesses
    if (criticalWeaknesses.length > 0) {
      conclusions.push(`Critical weaknesses detected: ${criticalWeaknesses.join(', ')}. These types threaten multiple team members.`);
    }

    // Highlight strong resistances
    if (strongResistances.length > 0) {
      conclusions.push(`Strong resistances: ${strongResistances.join(', ')}. Your team handles these types well.`);
    }

    if (conclusions.length === 0) {
      conclusions.push('Your team has balanced defensive coverage with no major issues detected.');
    }
    
    return conclusions;
  };

  return (
    <div
      className={`team-builder${darkMode ? ' dark-mode' : ''}`}
      style={{
        padding: '16px',
        minHeight: '100vh',
        background: darkMode ? '#181a1b' : '#f7f7f7',
        color: darkMode ? '#FFD600' : '#222',
        boxSizing: 'border-box'
      }}
    >
      <h2 style={{
        textAlign: 'center',
        color: darkMode ? '#FFD600' : '#222',
        marginBottom: '20px'
      }}>
        Pokémon Team Builder
      </h2>

      <div style={{ 
        backgroundColor: darkMode ? '#23272b' : '#F8F9FA', 
        padding: '20px', 
        borderRadius: '10px', 
        marginBottom: '30px' 
      }}>
        <p style={{ 
          margin: '0 0 15px 0', 
          color: darkMode ? '#ddd' : '#555', 
          fontSize: '16px',
          fontWeight: 'bold'
        }}>
          Build your perfect Pokémon team and analyze type coverage!
        </p>
        <p style={{ margin: 0, color: darkMode ? '#aaa' : '#777', fontSize: '14px' }}>
          Add up to 6 Pokémon to your team and see how well they cover each other's weaknesses. 
          The table below shows how each type of attack affects your team.
        </p>
      </div>

      {/* Team Input Section */}
      <div style={{ marginBottom: '40px' }}>
        <h3 style={{ color: darkMode ? '#FFD600' : '#34495E', marginBottom: '20px' }}>Team Input</h3>
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', 
          gap: '20px' 
        }}>
          {team.map((pokemon, index) => (
            <div key={index} style={{
              border: `2px solid ${darkMode ? '#FFD600' : '#E0E0E0'}`,
              borderRadius: '10px',
              padding: '15px',
              backgroundColor: pokemon ? (darkMode ? '#2c2f33' : '#F0F8FF') : (darkMode ? '#23272b' : '#FAFAFA'),
              position: 'relative',
              color: darkMode ? '#FFD600' : '#222'
            }}>
              <div style={{ 
                fontSize: '14px', 
                fontWeight: 'bold', 
                color: darkMode ? '#FFD600' : '#34495E', 
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
                    border: `2px solid ${darkMode ? '#444' : '#BDC3C7'}`,
                    borderRadius: '5px',
                    fontSize: '14px',
                    backgroundColor: darkMode ? '#2c2f33' : '#fff',
                    color: darkMode ? '#ddd' : '#222'
                  }}
                />
                
                {suggestions.length > 0 && selectedSlot === index && (
                  <ul style={{
                    position: 'absolute',
                    top: '100%',
                    left: 0,
                    right: 0,
                    backgroundColor: darkMode ? '#2c2f33' : 'white',
                    border: `1px solid ${darkMode ? '#444' : '#BDC3C7'}`,
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
                          borderBottom: `1px solid ${darkMode ? '#444' : '#ECF0F1'}`,
                          fontSize: '14px',
                          backgroundColor: darkMode ? '#2c2f33' : 'white',
                          color: darkMode ? '#ddd' : '#222'
                        }}
                        onMouseEnter={(e) => e.target.style.backgroundColor = darkMode ? '#3a3f47' : '#F8F9FA'}
                        onMouseLeave={(e) => e.target.style.backgroundColor = darkMode ? '#2c2f33' : 'white'}
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
                        style={{ width: '60px', height: '60px', marginRight: '15px', filter: darkMode ? 'brightness(0.85)' : 'none' }}
                      />
                    )}
                    <div style={{ flex: 1 }}>
                      <h4 style={{ 
                        margin: '0 0 5px 0', 
                        color: darkMode ? '#FFD600' : '#2C3E50', 
                        textTransform: 'capitalize' 
                      }}>
                        {pokemon.name}
                      </h4>
                      <div style={{ display: 'flex', gap: '5px', marginBottom: '5px' }}>
                        {pokemon.types && pokemon.types.map((type, typeIndex) => (
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
                        ))}
                      </div>
                      
                      {/* Display selected moves with types */}
                      {pokemon.selectedMoves && pokemon.selectedMoves.length > 0 && (
                        <div style={{ marginTop: '8px' }}>
                          <div style={{ fontSize: '11px', fontWeight: 'bold', color: '#666', marginBottom: '3px' }}>
                            Selected Moves:
                          </div>
                          <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                            {pokemon.selectedMoves.map((move, moveIndex) => (
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
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                  
                  {/* Display analysis state */}
                  {(pokemon.evs || pokemon.ivs || pokemon.level !== 70 || pokemon.nature !== 'neutral') && (
                    <div style={{ marginTop: '8px', padding: '6px', backgroundColor: darkMode ? '#1a1a1a' : '#F0F8FF', borderRadius: '4px' }}>
                      <div style={{ fontSize: '11px', fontWeight: 'bold', color: darkMode ? '#FFD600' : '#666', marginBottom: '3px' }}>
                        Analysis Data:
                      </div>
                      <div style={{ fontSize: '10px', color: darkMode ? '#ccc' : '#555' }}>
                        Level: {pokemon.level || 70} | Nature: {pokemon.nature || 'neutral'}
                        {pokemon.item && ` | Item: ${pokemon.item}`}
                      </div>
                      {/* Show EV investment summary */}
                      {pokemon.evs && Object.values(pokemon.evs).some(ev => ev > 0) && (
                        <div style={{ fontSize: '10px', color: darkMode ? '#ccc' : '#555' }}>
                          EVs: {Object.entries(pokemon.evs)
                            .filter(([_, value]) => value > 0)
                            .map(([stat, value]) => `${stat}: ${value}`)
                            .join(', ')}
                        </div>
                      )}
                    </div>
                  )}
                  
                  <div style={{ display: 'flex', gap: '8px', marginTop: '10px' }}>
                    <button
                      onClick={() => handleRemovePokemon(index)}
                      style={{
                        backgroundColor: darkMode ? '#FFD600' : '#E74C3C',
                        color: darkMode ? '#23272b' : 'white',
                        border: 'none',
                        borderRadius: '5px',
                        padding: '5px 10px',
                        fontSize: '12px',
                        cursor: 'pointer',
                        flex: 1
                      }}
                    >
                      Remove
                    </button>
                    
                    <AddToAnalysisButton
                      pokemon={pokemon}
                      onClick={sendToAnalysis}
                      slotIndex={index}
                      darkMode={darkMode}
                    />
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
        
        <div style={{ textAlign: 'center', marginTop: '20px' }}>
          <button
            onClick={handleClearTeam}
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
        backgroundColor: darkMode ? '#23272b' : 'white',
        border: `2px solid ${darkMode ? '#444' : '#E0E0E0'}`,
        borderRadius: '10px',
        overflow: 'hidden',
        marginBottom: '30px'
      }}>
        <div style={{
          backgroundColor: darkMode ? '#1a237e' : '#2980B9',
          color: darkMode ? '#FFD600' : 'white',
          padding: '15px',
          fontSize: '18px',
          fontWeight: 'bold'
        }}>
          Offensive Coverage
        </div>
        
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', background: darkMode ? '#181a1b' : 'white', color: darkMode ? '#FFD600' : '#222' }}>
            <thead>
              <tr style={{ backgroundColor: darkMode ? '#23272b' : '#F8F9FA' }}>
                <th style={{ 
                  padding: '10px', 
                  textAlign: 'left', 
                  borderBottom: `2px solid ${darkMode ? '#444' : '#E0E0E0'}`,
                  minWidth: '80px'
                }}>
                  Enemy ↓
                </th>
                {team.map((pokemon, index) => (
                  <th key={index} style={{ 
                    padding: '10px', 
                    textAlign: 'center', 
                    borderBottom: `2px solid ${darkMode ? '#444' : '#E0E0E0'}`,
                    minWidth: '80px'
                  }}>
                    {pokemon ? (
                      <div>
                        <div>{pokemon.name}</div>
                        {pokemon.selectedMoves && pokemon.selectedMoves.length > 0 ? (
                          <div style={{ fontSize: '10px', color: darkMode ? '#FFD600' : '#666' }}>
                            ({pokemon.selectedMoves.length} selected moves)
                          </div>
                        ) : (
                          <div style={{ fontSize: '10px', color: darkMode ? '#888' : '#999' }}>
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
                  borderBottom: `2px solid ${darkMode ? '#444' : '#E0E0E0'}`,
                  backgroundColor: darkMode ? '#3b2323' : '#FFEBEE'
                }}>
                  Not Very Effective
                </th>
                <th style={{ 
                  padding: '10px', 
                  textAlign: 'center', 
                  borderBottom: `2px solid ${darkMode ? '#444' : '#E0E0E0'}`,
                  backgroundColor: darkMode ? '#233b23' : '#E8F5E8'
                }}>
                  Super Effective
                </th>
              </tr>
            </thead>
            <tbody>
              {Object.keys(TYPE_EFFECTIVENESS).map(type => (
                <tr key={type}>
                  <td style={{ 
                    padding: '8px 10px', 
                    borderBottom: `1px solid ${darkMode ? '#444' : '#E0E0E0'}`,
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
                      borderBottom: `1px solid ${darkMode ? '#444' : '#E0E0E0'}`,
                      backgroundColor: team[slotIndex] ? (darkMode ? '#23272b' : 'white') : (darkMode ? '#181a1b' : '#F8F9FA'),
                      color: getOffensiveEffectivenessColor(effectiveness),
                      fontWeight: 'bold'
                    }}>
                      {getOffensiveEffectivenessText(effectiveness)}
                    </td>
                  ))}
                  <td style={{ 
                    padding: '8px', 
                    textAlign: 'center', 
                    borderBottom: `1px solid ${darkMode ? '#444' : '#E0E0E0'}`,
                    backgroundColor: darkMode ? '#3b2323' : '#FFEBEE',
                    fontWeight: 'bold',
                    color: offensiveCoverage[type].totalNotVeryEffective > 0 ? '#E74C3C' : (darkMode ? '#FFD600' : '#666')
                  }}>
                    {offensiveCoverage[type].totalNotVeryEffective}
                  </td>
                  <td style={{ 
                    padding: '8px', 
                    textAlign: 'center', 
                    borderBottom: `1px solid ${darkMode ? '#444' : '#E0E0E0'}`,
                    backgroundColor: darkMode ? '#233b23' : '#E8F5E8',
                    fontWeight: 'bold',
                    color: offensiveCoverage[type].totalSuperEffective > 0 ? '#27AE60' : (darkMode ? '#FFD600' : '#666')
                  }}>
                    {offensiveCoverage[type].totalSuperEffective}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        
        <div style={{
          backgroundColor: darkMode ? '#23272b' : '#F8F9FA',
          padding: '15px',
          fontSize: '14px',
          color: darkMode ? '#FFD600' : '#555'
        }}>
          <strong>Note:</strong> Offensive coverage is calculated based on move types from Pokemon's selected moves in EVDistribution analysis. 
          Pokemon without selected move data will show "-" for all matchups.
        </div>
        {/* Offensive Coverage Conclusions */}
        <div style={{
          backgroundColor: darkMode ? '#181a1b' : '#f7f7f7',
          color: darkMode ? '#FFD600' : '#222',
          padding: '12px 18px',
          borderTop: `1px solid ${darkMode ? '#444' : '#E0E0E0'}`
        }}>
          <strong>Conclusions:</strong>
          <ul style={{ margin: '8px 0 0 18px', padding: 0 }}>
            {getOffensiveConclusions().map((c, i) => (
              <li key={i}>{c}</li>
            ))}
          </ul>
        </div>
      </div>

      {/* Defensive Coverage Table */}
      <div style={{
        backgroundColor: darkMode ? '#23272b' : 'white',
        border: `2px solid ${darkMode ? '#444' : '#E0E0E0'}`,
        borderRadius: '10px',
        overflow: 'hidden',
        marginBottom: '30px'
      }}>
        <div style={{
          backgroundColor: darkMode ? '#263238' : '#34495E',
          color: darkMode ? '#FFD600' : 'white',
          padding: '15px',
          fontSize: '18px',
          fontWeight: 'bold'
        }}>
          Defensive Coverage
        </div>
        
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', background: darkMode ? '#181a1b' : 'white', color: darkMode ? '#FFD600' : '#222' }}>
            <thead>
              <tr style={{ backgroundColor: darkMode ? '#23272b' : '#F8F9FA' }}>
                <th style={{ 
                  padding: '10px', 
                  textAlign: 'left', 
                  borderBottom: `2px solid ${darkMode ? '#444' : '#E0E0E0'}`,
                  minWidth: '80px'
                }}>
                  Attack Type
                </th>
                {team.map((pokemon, index) => (
                  <th key={index} style={{ 
                    padding: '10px', 
                    textAlign: 'center', 
                    borderBottom: `2px solid ${darkMode ? '#444' : '#E0E0E0'}`,
                    minWidth: '80px'
                  }}>
                    {pokemon ? pokemon.name : `Slot ${index + 1}`}
                  </th>
                ))}
                <th style={{ 
                  padding: '10px', 
                  textAlign: 'center', 
                  borderBottom: `2px solid ${darkMode ? '#444' : '#E0E0E0'}`,
                  backgroundColor: darkMode ? '#3b2323' : '#FFEBEE'
                }}>
                  Weak
                </th>
                <th style={{ 
                  padding: '10px', 
                  textAlign: 'center', 
                  borderBottom: `2px solid ${darkMode ? '#444' : '#E0E0E0'}`,
                  backgroundColor: darkMode ? '#233b23' : '#E8F5E8'
                }}>
                  Resist
                </th>
              </tr>
            </thead>
            <tbody>
              {Object.keys(TYPE_EFFECTIVENESS).map(type => (
                <tr key={type}>
                  <td style={{ 
                    padding: '8px 10px', 
                    borderBottom: `1px solid ${darkMode ? '#444' : '#E0E0E0'}`,
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
                      borderBottom: `1px solid ${darkMode ? '#444' : '#E0E0E0'}`,
                      backgroundColor: team[slotIndex] ? (darkMode ? '#23272b' : 'white') : (darkMode ? '#181a1b' : '#F8F9FA'),
                      color: getEffectivenessColor(effectiveness),
                      fontWeight: 'bold'
                    }}>
                      {team[slotIndex] ? getEffectivenessText(effectiveness) : '-'}
                    </td>
                  ))}
                  <td style={{ 
                    padding: '8px', 
                    textAlign: 'center', 
                    borderBottom: `1px solid ${darkMode ? '#444' : '#E0E0E0'}`,
                    backgroundColor: darkMode ? '#3b2323' : '#FFEBEE',
                    fontWeight: 'bold',
                    color: typeChart[type].totalWeak > 0 ? '#E74C3C' : (darkMode ? '#FFD600' : '#666')
                  }}>
                    {typeChart[type].totalWeak}
                  </td>
                  <td style={{ 
                    padding: '8px', 
                    textAlign: 'center', 
                    borderBottom: `1px solid ${darkMode ? '#444' : '#E0E0E0'}`,
                    backgroundColor: darkMode ? '#233b23' : '#E8F5E8',
                    fontWeight: 'bold',
                    color: typeChart[type].totalResist > 0 ? '#27AE60' : (darkMode ? '#FFD600' : '#666')
                  }}>
                    {typeChart[type].totalResist}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {/* Defensive Coverage Conclusions */}
        <div style={{
          backgroundColor: darkMode ? '#181a1b' : '#f7f7f7',
          color: darkMode ? '#FFD600' : '#222',
          padding: '12px 18px',
          borderTop: `1px solid ${darkMode ? '#444' : '#E0E0E0'}`
        }}>
          <strong>Conclusions:</strong>
          <ul style={{ margin: '8px 0 0 18px', padding: 0 }}>
            {getDefensiveConclusions().map((c, i) => (
              <li key={i}>{c}</li>
            ))}
          </ul>
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
      </div>

      {/* Responsive styles */}
      <style>
        {`
        @media (max-width: 700px) {
          .team-builder {
            padding: 8px !important;
          }
          .team-builder > div {
            flex-direction: column !important;
            gap: 10px !important;
          }
        }
        `}
      </style>
    </div>
  );
}

export default TeamBuilder;

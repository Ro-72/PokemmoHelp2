/* 
  ! Imports and Constants 
*/
import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import recomendations from '../recomend.json';
import natureMultipliers from '../natureMultipliers.json';
import '../App.css';
import RecommendationPopup from '../components/RecommendationPopup';
import EVForm from '../components/EVForm';
import IVForm from '../components/IVForm';
import PokemonInfo from '../components/PokemonInfo';
import PokemonSearch from './PokemonSearch';
import { usePokemonContext } from '../context/PokemonContext';

/* 
  ! Main Component: EVDistribution 
*/
function EVDistribution({ savedPokemon: initialPokemon }) {
  const location = useLocation();
  const navigate = useNavigate();
  const { updatePokemon } = usePokemonContext();

  // Get location state data
  const locationState = location.state || {};
  const pokemonFromLocation = locationState.pokemon;
  const slotIndex = locationState.slotIndex;
  const isEditing = locationState.isEditing || false;
  
  /* 
    * State Declarations 
  */
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
  const [level, setLevel] = useState(70); // Default level
  const [nature, setNature] = useState('neutral'); // Default nature
  const [expandedTab, setExpandedTab] = useState(null); // Track which tab is expanded
  const [activeTab, setActiveTab] = useState('level-up'); // Track the active tab
  const [showPopup, setShowPopup] = useState(false);
  const [selectedMoves, setSelectedMoves] = useState([]);
  const [savedPokemon, setSavedPokemon] = useState(initialPokemon);
  const [showSearch, setShowSearch] = useState(!initialPokemon && !pokemonFromLocation);
  const [item, setItem] = useState('');

  // Load Pokemon data from location state
  useEffect(() => {
    // Check if there's location state data to load
    if (pokemonFromLocation) {
      console.log('Loading Pokemon data from location state:', pokemonFromLocation);
      
      // Set saved Pokemon
      setSavedPokemon(pokemonFromLocation);
      setShowSearch(false);
      
      // Load EVs if available
      if (pokemonFromLocation.evs) {
        setEvs(pokemonFromLocation.evs);
      }
      
      // Load IVs if available
      if (pokemonFromLocation.ivs) {
        setIvs(pokemonFromLocation.ivs);
      }
      
      // Load level if available
      if (pokemonFromLocation.level) {
        setLevel(pokemonFromLocation.level);
      }
      
      // Load nature if available
      if (pokemonFromLocation.nature) {
        setNature(pokemonFromLocation.nature);
      }
      
      // Load item if available
      if (pokemonFromLocation.item) {
        setItem(pokemonFromLocation.item);
      }
      
      // Load selected moves if available
      if (pokemonFromLocation.selectedMoves && pokemonFromLocation.selectedMoves.length > 0) {
        setSelectedMoves(pokemonFromLocation.selectedMoves);
      }
    }
  }, [pokemonFromLocation]);

  const statMapping = {
    'hp': 'hp',
    'attack': 'attack',
    'defense': 'defense',
    'special-attack': 'spAttack',
    'special-defense': 'spDefense',
    'speed': 'speed',
  };

  // * Utility Functions grouped in one object
  const utils = {
    togglePopup: () => setShowPopup((prev) => !prev),

    handleChange: (stat, value, type) => {
      value = parseInt(value, 10);
      const maxTotal = type === 'ev' ? maxEV : maxIV;
      const currentStats = type === 'ev' ? evs : ivs;
      const setStats = type === 'ev' ? setEvs : setIvs;
      const currentValue = currentStats[stat];
      const otherTotal = Object.keys(currentStats)
        .filter(key => key !== stat)
        .reduce((sum, key) => sum + currentStats[key], 0);

      // The max value this stat can have without exceeding the cap
      const maxForThisStat = Math.min(type === 'ev' ? 252 : 31, maxTotal - otherTotal);

      // Clamp the value to the allowed maximum
      const clampedValue = Math.max(0, Math.min(value, maxForThisStat));

      setStats({ ...currentStats, [stat]: clampedValue });
    },

    calculateHP: (base, iv, ev, level) => {
      return Math.floor(((2 * base + iv + Math.floor(ev / 4)) * level) / 100) + level + 10;
    },
    calculateStat: (base, iv, ev, level, natureMultiplier) => {
      return Math.floor(((((2 * base + iv + Math.floor(ev / 4)) * level) / 100) + 5) * natureMultiplier);
    },
      // Save changes to team when editing
    saveChanges: () => {
      if (isEditing && slotIndex !== undefined && savedPokemon) {
        // Calculate final stats
        const calculatedStats = {};
        
        // Helper function to get base stat value regardless of data structure
        const getBaseStat = (statKey) => {
          // Try to get from baseStats if available
          if (savedPokemon.baseStats && savedPokemon.baseStats[statKey]) {
            return savedPokemon.baseStats[statKey];
          }
          
          // If stats is an array (from PokeAPI)
          if (Array.isArray(savedPokemon.stats)) {
            const statObj = savedPokemon.stats.find(s => 
              s.stat && s.stat.name && s.stat.name.toLowerCase() === statKey.toLowerCase());
            if (statObj && statObj.base_stat) {
              return statObj.base_stat;
            }
          }
          
          // Default value if nothing else works
          return 80; // Fallback value for base stat
        };
        
        // Calculate stats for each stat key
        const statKeys = ['hp', 'attack', 'defense', 'spAttack', 'spDefense', 'speed'];
        statKeys.forEach(statKey => {
          const isHP = statKey === 'hp';
          const baseStat = getBaseStat(statKey);
          const natureMultiplier = natureMultipliers[nature][statKey] || 1;
          
          const calculatedStat = isHP
            ? utils.calculateHP(baseStat, ivs.hp, evs.hp, level)
            : utils.calculateStat(
                baseStat,
                ivs[statKey],
                evs[statKey],
                level,
                natureMultiplier
              );
          
          calculatedStats[statKey] = calculatedStat;
        });
        
        // Create updated Pokemon data
        const updatedPokemon = {
          ...savedPokemon,
          evs,
          ivs,
          level,
          nature,
          item,
          selectedMoves,
          stats: calculatedStats
        };
        
        // Update Pokemon in team context
        updatePokemon(slotIndex, updatedPokemon);
        
        // Navigate back to team builder
        navigate('/team-builder');
      }
    },
    
    // Cancel editing and return to team builder
    cancelEdit: () => {
      navigate('/team-builder');
    },
    
    getRecommendations: () => {
      const recommendations = [];
      for (const [stat, value] of Object.entries(evs)) {
        if (value > 100) {
          const statData = recomendations[stat];
          const regionData = statData.filter((entry) => entry.region === region);
          recommendations.push({ stat, regionData });
        }
      }
      return recommendations;
    },
    groupMovesByMethod: (moves) => {
      const grouped = {
        'level-up': [],
        machine: [],
        egg: [],
        tutor: [],
      };
      if (!moves) return grouped;
      
      moves.forEach((move) => {
        const method = move.method || 'unknown';
        if (grouped[method]) {
          grouped[method].push(move);
        }
      });
      grouped['level-up'].sort((a, b) => a.level - b.level);
      ['machine', 'egg', 'tutor'].forEach((method) => {
        grouped[method].sort((a, b) => a.name.localeCompare(b.name));
      });
      return grouped;
    },
    getNatureLabel: (natureKey) => {
      const nature = natureMultipliers[natureKey];
      const increasedStat = Object.keys(nature).find((stat) => nature[stat] > 1);
      const decreasedStat = Object.keys(nature).find((stat) => nature[stat] < 1);
      if (increasedStat && decreasedStat) {
        return `${natureKey.charAt(0).toUpperCase() + natureKey.slice(1)} (+${increasedStat}, -${decreasedStat})`;
      }
      return `${natureKey.charAt(0).toUpperCase() + natureKey.slice(1)} (Neutral)`;
    }
  };

  // Handler to receive selected moves from PokemonInfo
  const handleSaveMoves = (moves) => {
    setSelectedMoves(moves);
  };
  
  // Handler for when a Pokemon is selected from the search
  const handlePokemonSelected = (pokemon) => {
    setSavedPokemon(pokemon);
    setShowSearch(false);
    // Reset EVs and IVs when a new Pokemon is selected
    setEvs({
      hp: 0,
      attack: 0,
      defense: 0,
      spAttack: 0,
      spDefense: 0,
      speed: 0,
    });
    setIvs({
      hp: 0,
      attack: 0,
      defense: 0,
      spAttack: 0,
      spDefense: 0,
      speed: 0,
    });
    setSelectedMoves([]);
  };

  return (
    
    <div className="ev-container">
      
      {showSearch ? (
        <div style={{ 
          padding: '20px', 
          maxWidth: '800px', 
          margin: '0 auto', 
          backgroundColor: '#fff',
          borderRadius: '8px',
          boxShadow: '0 2px 10px rgba(0,0,0,0.1)'
        }}>
          <h2 style={{ textAlign: 'center', marginBottom: '20px' }}>Select a Pokémon</h2>
          <PokemonSearch 
            setSavedPokemon={handlePokemonSelected} 
            disableAutocomplete={false}
          />
        </div>
      ) : (
        <>          <div className="ev-form-container">
            <div style={{ 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: isEditing ? 'space-between' : 'center', 
              marginTop:'10px', 
              marginBottom: '10px',
              padding: '0 15px'
            }}>
              
              {isEditing ? (
                <>
                  <h3 style={{ margin: 0 }}>Editing {savedPokemon?.name}</h3>
                  
                  <div style={{ display: 'flex', gap: '10px' }}>
                    <button
                      onClick={utils.saveChanges}
                      style={{
                        padding: '8px 12px',
                        backgroundColor: '#27AE60',
                        color: 'white',
                        border: 'none',
                        borderRadius: '4px',
                        cursor: 'pointer',
                        fontSize: '14px',
                        boxShadow: '0 0 5px rgba(0,0,0,0.2)'
                      }}
                    >
                      Save Changes
                    </button>
                    
                    <button
                      onClick={utils.cancelEdit}
                      style={{
                        padding: '8px 12px',
                        backgroundColor: '#95A5A6',
                        color: 'white',
                        border: 'none',
                        borderRadius: '4px',
                        cursor: 'pointer',
                        fontSize: '14px',
                        boxShadow: '0 0 5px rgba(0,0,0,0.2)'
                      }}
                    >
                      Cancel
                    </button>
                  </div>
                </>
              ) : (
                <button 
                  onClick={() => setShowSearch(true)} 
                  style={{                  
                    padding: '8px 12px',
                    backgroundColor: '#3498DB',
                    color: 'white',
                    border: '1px solid #2980B9',
                    borderRadius: '4px',
                    cursor: 'pointer',
                    fontSize: '14px',
                    boxShadow: '0 0 5px rgba(0,0,0,0.2)'
                  }}
                >
                  Change Pokémon
                </button>
              )}
            </div>

            {/* 
              * EV Distribution Form
              ? Replaced with <EVForm /> component
            */}
            <EVForm
              evs={evs}
              setEvs={setEvs}
              region={region}
              setRegion={setRegion}
              showPopup={showPopup}
              togglePopup={utils.togglePopup}
              recomendations={recomendations}
              getRecommendations={utils.getRecommendations}
              maxEV={maxEV}
              handleChange={utils.handleChange}
            />

            {/* 
              * IV Distribution Form
              ? Replaced with <IVForm /> component
            */}
            <IVForm
              ivs={ivs}
              setIvs={setIvs}
              maxIV={maxIV}
              handleChange={utils.handleChange}
            />
          </div>

          {savedPokemon && (
            /* 
              * Saved Pokémon Information
              ? Replaced with <PokemonInfo /> component
            */            <PokemonInfo
              savedPokemon={savedPokemon}
              level={level}
              setLevel={setLevel}
              nature={nature}
              setNature={setNature}
              natureMultipliers={natureMultipliers}
              statMapping={statMapping}
              ivs={ivs}
              evs={evs}
              calculateHP={utils.calculateHP}
              calculateStat={utils.calculateStat}
              activeTab={activeTab}
              setActiveTab={setActiveTab}
              groupMovesByMethod={utils.groupMovesByMethod}
              getNatureLabel={utils.getNatureLabel}
              onSaveMoves={handleSaveMoves}
              item={item}
              setItem={setItem}
              isEditing={isEditing}
            />
          )}

          {/* 
            * Recommendation Popup
            ? Rendered as <RecommendationPopup /> component
          */}
          {showPopup && (
            <RecommendationPopup
              getRecommendations={utils.getRecommendations}
              togglePopup={utils.togglePopup}
            />
          )}
        </>
      )}
    </div>
  );
}

export default EVDistribution;

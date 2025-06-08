/* 
  ! Imports and Constants 
*/
import React, { useState, useEffect } from 'react';
import recomendations from '../data/recomend.json';
import natureMultipliers from '../data/natureMultipliers.json';
import '../App.css';
import RecommendationPopup from '../components/RecommendationPopup';
import EVForm from '../components/EVForm';
import IVForm from '../components/IVForm';
import PokemonInfo from '../components/PokemonInfo';
import { useTeam } from '../contexts/TeamContext';

/* 
  ! Main Component: EVDistribution 
*/
function EVDistribution({ savedPokemon, addToTeam }) {
  const { getCurrentPokemon, updateCurrentPokemonAnalysis, currentPokemonId } = useTeam();
  
  /* 
    * State Declarations 
  */
  const maxEV = 510;
  const maxIV = 186; // Maximum total IVs
  
  // Get current Pokemon from team context or use savedPokemon
  const currentTeamPokemon = getCurrentPokemon();
  const activePokemon = currentTeamPokemon || savedPokemon;
  
  // Initialize states with Pokemon data if available
  const [evs, setEvs] = useState(() => {
    if (activePokemon && activePokemon.evs) {
      return activePokemon.evs;
    }
    return {
      hp: 0,
      attack: 0,
      defense: 0,
      spAttack: 0,
      spDefense: 0,
      speed: 0,
    };
  });
  
  const [ivs, setIvs] = useState(() => {
    if (activePokemon && activePokemon.ivs) {
      return activePokemon.ivs;
    }
    return {
      hp: 0,
      attack: 0,
      defense: 0,
      spAttack: 0,
      spDefense: 0,
      speed: 0,
    };
  });
  
  const [region, setRegion] = useState('Unova');
  const [level, setLevel] = useState(() => activePokemon?.level || 70);
  const [nature, setNature] = useState(() => activePokemon?.nature || 'neutral');
  const [expandedTab, setExpandedTab] = useState(null);
  const [activeTab, setActiveTab] = useState('level-up');
  const [showPopup, setShowPopup] = useState(false);
  const [selectedMoves, setSelectedMoves] = useState(() => activePokemon?.selectedMoves || []);

  // Update states when active Pokemon changes
  useEffect(() => {
    if (activePokemon) {
      if (activePokemon.evs) setEvs(activePokemon.evs);
      if (activePokemon.ivs) setIvs(activePokemon.ivs);
      if (activePokemon.level) setLevel(activePokemon.level);
      if (activePokemon.nature) setNature(activePokemon.nature);
      if (activePokemon.selectedMoves) setSelectedMoves(activePokemon.selectedMoves);
    }
  }, [activePokemon]);

  // Sync changes back to team context
  useEffect(() => {
    if (currentTeamPokemon && currentPokemonId !== null) {
      const analysisData = {
        evs,
        ivs,
        level,
        nature,
        selectedMoves
      };
      
      // Debounce updates to avoid excessive saves
      const timeoutId = setTimeout(() => {
        updateCurrentPokemonAnalysis(analysisData);
      }, 500);
      
      return () => clearTimeout(timeoutId);
    }
  }, [evs, ivs, level, nature, selectedMoves, currentTeamPokemon, currentPokemonId, updateCurrentPokemonAnalysis]);

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

  // Enhanced addToTeam function that includes selected moves
  const addToTeamWithMoves = (pokemon) => {
    if (addToTeam) {
      // Add current analysis data to the pokemon object
      const pokemonWithAnalysisData = {
        ...pokemon,
        selectedMoves,
        evs,
        ivs,
        level,
        nature
      };
      addToTeam(pokemonWithAnalysisData);
    }
  };

  return (
    <div className="ev-container">
      <div className="ev-iv-column">
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

      {activePokemon ? (
        /* 
          * Saved Pokémon Information
          ? Replaced with <PokemonInfo /> component
        */
        <PokemonInfo
          savedPokemon={activePokemon}
          addToTeam={addToTeamWithMoves}
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
          initialSelectedMoves={selectedMoves}
        />
      ) : (
        <div style={{ 
          flex: 1, 
          border: '1px solid #ccc', 
          padding: '20px', 
          textAlign: 'center',
          backgroundColor: '#f9f9f9',
          borderRadius: '8px'
        }}>
          <h3 style={{ color: '#666', marginBottom: '15px' }}>No Pokemon Selected</h3>
          <p style={{ color: '#888', marginBottom: '20px' }}>
            Search for a Pokemon or select one from your team to begin analysis.
          </p>
          <div style={{ fontSize: '14px', color: '#999' }}>
            <p>• Use Pokemon Search to find and analyze any Pokemon</p>
            <p>• Use Team Builder to select a Pokemon from your team</p>
            <p>• Use Pokemon Roles to find Pokemon by competitive role</p>
          </div>
        </div>
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
    </div>
  );
}

export default EVDistribution;

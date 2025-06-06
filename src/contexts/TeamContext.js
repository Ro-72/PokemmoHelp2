import React, { createContext, useContext, useState, useEffect } from 'react';

const TeamContext = createContext();

export function useTeam() {
  const context = useContext(TeamContext);
  if (!context) {
    throw new Error('useTeam must be used within a TeamProvider');
  }
  return context;
}

export function TeamProvider({ children }) {
  // Initialize team with 6 slots
  const [team, setTeam] = useState(() => {
    try {
      const saved = localStorage.getItem('pokemonTeam');
      if (saved) {
        return JSON.parse(saved);
      }
    } catch (error) {
      console.error('Error loading team from localStorage:', error);
    }
    return Array(6).fill(null);
  });

  // Current Pokemon being analyzed
  const [currentPokemonId, setCurrentPokemonId] = useState(null);

  // Save to localStorage whenever team changes
  useEffect(() => {
    try {
      localStorage.setItem('pokemonTeam', JSON.stringify(team));
    } catch (error) {
      console.error('Error saving team to localStorage:', error);
    }
  }, [team]);

  // Add or update Pokemon in specific slot
  const updatePokemon = (slotIndex, pokemonData) => {
    if (slotIndex < 0 || slotIndex >= 6) return;
    
    setTeam(prevTeam => {
      const newTeam = [...prevTeam];
      
      // If updating existing Pokemon, merge data
      if (newTeam[slotIndex]) {
        newTeam[slotIndex] = {
          ...newTeam[slotIndex],
          ...pokemonData,
          slotIndex,
          lastUpdated: Date.now()
        };
      } else {
        // Creating new Pokemon
        newTeam[slotIndex] = {
          id: pokemonData.id,
          name: pokemonData.name,
          sprite: pokemonData.sprite || pokemonData.sprites?.front_default,
          types: pokemonData.types || [],
          baseStats: pokemonData.baseStats || {},
          stats: pokemonData.stats || [],
          moves: pokemonData.moves || [],
          selectedMoves: pokemonData.selectedMoves || [],
          level: pokemonData.level || 70,
          nature: pokemonData.nature || 'neutral',
          item: pokemonData.item || '',
          evs: pokemonData.evs || {
            hp: 0, attack: 0, defense: 0,
            spAttack: 0, spDefense: 0, speed: 0
          },
          ivs: pokemonData.ivs || {
            hp: 0, attack: 0, defense: 0,
            spAttack: 0, spDefense: 0, speed: 0
          },
          slotIndex,
          lastUpdated: Date.now(),
          ...pokemonData
        };
      }
      
      return newTeam;
    });
  };

  // Remove Pokemon from slot
  const removePokemon = (slotIndex) => {
    if (slotIndex < 0 || slotIndex >= 6) return;
    
    setTeam(prevTeam => {
      const newTeam = [...prevTeam];
      newTeam[slotIndex] = null;
      return newTeam;
    });

    // Clear current analysis if removing the current Pokemon
    if (currentPokemonId === slotIndex) {
      setCurrentPokemonId(null);
    }
  };

  // Clear entire team
  const clearTeam = () => {
    setTeam(Array(6).fill(null));
    setCurrentPokemonId(null);
  };

  // Get Pokemon by slot index
  const getPokemon = (slotIndex) => {
    if (slotIndex < 0 || slotIndex >= 6) return null;
    return team[slotIndex];
  };

  // Set current Pokemon for analysis
  const setCurrentPokemon = (slotIndex) => {
    if (slotIndex >= 0 && slotIndex < 6 && team[slotIndex]) {
      setCurrentPokemonId(slotIndex);
    }
  };

  // Get current Pokemon data
  const getCurrentPokemon = () => {
    if (currentPokemonId !== null && currentPokemonId >= 0 && currentPokemonId < 6) {
      return team[currentPokemonId];
    }
    return null;
  };

  // Update current Pokemon's analysis data (EVs, IVs, moves, etc.)
  const updateCurrentPokemonAnalysis = (analysisData) => {
    if (currentPokemonId !== null) {
      updatePokemon(currentPokemonId, analysisData);
    }
  };

  return (
    <TeamContext.Provider value={{
      team,
      updatePokemon,
      removePokemon,
      clearTeam,
      getPokemon,
      currentPokemonId,
      setCurrentPokemon,
      getCurrentPokemon,
      updateCurrentPokemonAnalysis
    }}>
      {children}
    </TeamContext.Provider>
  );
}

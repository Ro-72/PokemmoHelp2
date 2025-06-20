import React, { createContext, useState, useContext } from 'react';

// Create a context to store the Pokemon team
const PokemonContext = createContext();

// Custom hook to use the Pokemon context
export const usePokemonContext = () => useContext(PokemonContext);

// Provider component to wrap the application and provide the context
export const PokemonProvider = ({ children }) => {
  // State for the team of Pokemon (up to 6)
  const [team, setTeam] = useState(Array(6).fill(null));

  // Add a Pokemon to the team
  const addToTeam = (pokemon) => {
    // Check if the Pokemon has all required fields
    if (!pokemon.id || !pokemon.name) {
      console.error('Invalid Pokemon object:', pokemon);
      return false;
    }

    // Find the first empty slot
    const emptySlotIndex = team.findIndex(slot => slot === null);
    if (emptySlotIndex !== -1) {
      const newTeam = [...team];
      
      // Ensure Pokemon has all required fields with defaults if missing
      const completeData = {
        id: pokemon.id,
        name: pokemon.name,
        level: pokemon.level || 50,
        sprite: pokemon.sprite || pokemon.sprites?.front_default || '',
        nature: pokemon.nature || 'neutral',
        item: pokemon.item || '',
        types: pokemon.types || [],
        stats: pokemon.stats || {},
        ivs: pokemon.ivs || {},
        evs: pokemon.evs || {},
        selectedMoves: pokemon.selectedMoves || []
      };
      
      newTeam[emptySlotIndex] = completeData;
      setTeam(newTeam);
      return true;
    } else {
      console.warn('Team is full! Remove a Pokemon first.');
      return false;
    }
  };

  // Remove a Pokemon from the team
  const removePokemon = (slotIndex) => {
    if (slotIndex >= 0 && slotIndex < 6) {
      const newTeam = [...team];
      newTeam[slotIndex] = null;
      setTeam(newTeam);
      return true;
    }
    return false;
  };

  // Clear the entire team
  const clearTeam = () => {
    if (window.confirm('Are you sure you want to clear all Pokémon from your team?')) {
      setTeam(Array(6).fill(null));
      return true;
    }
    return false;
  };

  // Modify a Pokemon in the team
  const updatePokemon = (slotIndex, updatedData) => {
    if (slotIndex >= 0 && slotIndex < 6 && team[slotIndex]) {
      const newTeam = [...team];
      newTeam[slotIndex] = { ...newTeam[slotIndex], ...updatedData };
      setTeam(newTeam);
      return true;
    }
    return false;
  };

  // Context value to provide
  const contextValue = {
    team,
    setTeam,
    addToTeam,
    removePokemon,
    clearTeam,
    updatePokemon
  };

  return (
    <PokemonContext.Provider value={contextValue}>
      {children}
    </PokemonContext.Provider>
  );
};

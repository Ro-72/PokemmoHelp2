import React, { useState, useEffect } from 'react';
import completePokemonData from '../complete_pokemon_data.json';

const regions = [
  'All Regions',
  'Kanto',
  'Johto', 
  'Hoenn',
  'Sinnoh',
  'Unova',
  'Kalos',
  'Alola',
  'Galar'
];

// Extract unique roles from the complete data
const getAllRoles = () => {
  const allRoles = new Set();
  completePokemonData.pokemon.forEach(pokemon => {
    if (pokemon.roles && Array.isArray(pokemon.roles)) {
      pokemon.roles.forEach(role => allRoles.add(role));
    }
  });
  return ['All Roles', ...Array.from(allRoles).sort()];
};

function PokemonRoles({ pokemonList = [] }) {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedRegion, setSelectedRegion] = useState('All Regions');
  const [selectedRole, setSelectedRole] = useState('All Roles');
  const [filteredPokemon, setFilteredPokemon] = useState([]);
  const [suggestions, setSuggestions] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  const allRoles = getAllRoles();
  const allPokemon = completePokemonData.pokemon || [];

  // Handle autocomplete suggestions
  useEffect(() => {
    if (searchTerm.length > 0) {
      const filtered = allPokemon
        .filter(pokemon => 
          pokemon.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          pokemon.id?.toString() === searchTerm
        )
        .slice(0, 5);
      setSuggestions(filtered);
    } else {
      setSuggestions([]);
    }
  }, [searchTerm, allPokemon]);

  const handleSuggestionClick = (pokemon) => {
    setSearchTerm(pokemon.name);
    setSuggestions([]);
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setSuggestions([]);
  };

  // Load Pokemon by role from complete data
  const loadCompetitivePokemon = () => {
    if (selectedRole === 'All Roles') {
      alert('Please select a specific role first.');
      return;
    }

    setIsLoading(true);
    
    // Filter Pokemon that have the selected role
    const roleBasedPokemon = allPokemon.filter(pokemon => {
      if (!pokemon.roles || !Array.isArray(pokemon.roles)) return false;
      return pokemon.roles.includes(selectedRole);
    });

    console.log(`Found ${roleBasedPokemon.length} Pokemon with role: ${selectedRole}`);
    
    // Clear search term to show all results
    setSearchTerm('');
    setIsLoading(false);
  };

  useEffect(() => {
    let filtered = [...allPokemon];

    // Filter by search term (name or ID)
    if (searchTerm && !isLoading) {
      filtered = filtered.filter(pokemon => 
        pokemon.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        pokemon.id?.toString().includes(searchTerm)
      );
    }

    // Filter by region
    if (selectedRegion !== 'All Regions') {
      filtered = filtered.filter(pokemon => {
        return pokemon.region === selectedRegion;
      });
    }

    // Filter by selected role
    if (selectedRole !== 'All Roles') {
      filtered = filtered.filter(pokemon => 
        pokemon.roles && Array.isArray(pokemon.roles) && pokemon.roles.includes(selectedRole)
      );
    }

    setFilteredPokemon(filtered);
  }, [searchTerm, selectedRegion, selectedRole, isLoading, allPokemon]);

  const getRoleColor = (role) => {
    const colors = {
      'Physical Sweeper': '#FF6B6B',
      'Special Sweeper': '#4ECDC4',
      'Mixed Sweeper': '#45B7D1',
      'Physical Wall': '#96CEB4',
      'Special Wall': '#FFEAA7',
      'Tank': '#DDA0DD',
      'Glass Cannon': '#FFB347',
      'Revenge Killer': '#F08080',
      'Utility': '#98D8C8',
      'Supporter': '#AED6F1',
      'OU Viable': '#E74C3C',
      'UU Viable': '#F39C12',
      'PU Viable': '#27AE60'
    };
    return colors[role] || '#BDC3C7';
  };

  const getTypeColor = (typeName) => {
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
    return typeColors[typeName] || '#68A090';
  };

  return (
    <div style={{ padding: '20px', maxWidth: '1200px', margin: '0 auto' }}>
      <h2 style={{ textAlign: 'center', color: '#2C3E50', marginBottom: '30px' }}>
        Pokemon Competitive Roles
      </h2>

      {/* Filters */}
      <div style={{ 
        display: 'flex', 
        gap: '15px', 
        marginBottom: '30px', 
        flexWrap: 'wrap',
        justifyContent: 'center'
      }}>
        <div style={{ position: 'relative' }}>
          <form onSubmit={handleSearchSubmit}>
            <input
              type="text"
              placeholder="Search by name or ID..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{
                padding: '10px',
                border: '2px solid #BDC3C7',
                borderRadius: '5px',
                fontSize: '14px',
                minWidth: '200px'
              }}
            />
          </form>
          {suggestions.length > 0 && (
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
              {suggestions.map((pokemon, index) => (
                <li
                  key={index}
                  onClick={() => handleSuggestionClick(pokemon)}
                  style={{
                    padding: '8px 10px',
                    cursor: 'pointer',
                    borderBottom: '1px solid #ECF0F1',
                    fontSize: '14px'
                  }}
                  onMouseEnter={(e) => e.target.style.backgroundColor = '#F8F9FA'}
                  onMouseLeave={(e) => e.target.style.backgroundColor = 'white'}
                >
                  {pokemon.name} (#{pokemon.id})
                </li>
              ))}
            </ul>
          )}
        </div>
        
        <select
          value={selectedRegion}
          onChange={(e) => setSelectedRegion(e.target.value)}
          style={{
            padding: '10px',
            border: '2px solid #BDC3C7',
            borderRadius: '5px',
            fontSize: '14px'
          }}
        >
          {regions.map(region => (
            <option key={region} value={region}>{region}</option>
          ))}
        </select>

        <select
          value={selectedRole}
          onChange={(e) => setSelectedRole(e.target.value)}
          style={{
            padding: '10px',
            border: '2px solid #BDC3C7',
            borderRadius: '5px',
            fontSize: '14px'
          }}
        >
          {allRoles.map(role => (
            <option key={role} value={role}>{role}</option>
          ))}
        </select>

        <button
          onClick={loadCompetitivePokemon}
          disabled={selectedRole === 'All Roles'}
          style={{
            padding: '10px 15px',
            border: 'none',
            borderRadius: '5px',
            fontSize: '14px',
            backgroundColor: selectedRole === 'All Roles' ? '#BDC3C7' : '#3498DB',
            color: 'white',
            cursor: selectedRole === 'All Roles' ? 'not-allowed' : 'pointer',
            fontWeight: 'bold'
          }}
        >
          Load All {selectedRole}
        </button>
      </div>

      {/* Results count */}
      <p style={{ textAlign: 'center', color: '#7F8C8D', marginBottom: '20px' }}>
        Showing {filteredPokemon.length} Pokemon
      </p>

      {/* Pokemon Grid */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
        gap: '20px'
      }}>
        {filteredPokemon.map((pokemon, index) => (
          <div key={`${pokemon.id}-${index}`} style={{
            border: '2px solid #E0E0E0',
            borderRadius: '10px',
            padding: '15px',
            backgroundColor: '#FAFAFA',
            boxShadow: '0 2px 5px rgba(0,0,0,0.1)'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
              <h3 style={{ margin: 0, color: '#2C3E50', textTransform: 'capitalize' }}>{pokemon.name}</h3>
              <span style={{ 
                backgroundColor: '#3498DB', 
                color: 'white', 
                padding: '2px 8px', 
                borderRadius: '12px',
                fontSize: '12px'
              }}>
                #{pokemon.id}
              </span>
            </div>

            {/* Pokemon Image */}
            {pokemon.sprite && (
              <div style={{ textAlign: 'center', marginBottom: '10px' }}>
                <img 
                  src={pokemon.sprite} 
                  alt={pokemon.name}
                  style={{ width: '80px', height: '80px' }}
                />
              </div>
            )}

            {/* Types */}
            {pokemon.types && Array.isArray(pokemon.types) && (
              <div style={{ marginBottom: '10px', textAlign: 'center' }}>
                {pokemon.types.map((type, typeIndex) => (
                  <span
                    key={typeIndex}
                    style={{
                      backgroundColor: getTypeColor(type),
                      color: 'white',
                      padding: '2px 8px',
                      borderRadius: '12px',
                      fontSize: '11px',
                      marginRight: '5px',
                      textTransform: 'capitalize'
                    }}
                  >
                    {type}
                  </span>
                ))}
              </div>
            )}

            {/* Base Stats */}
            {pokemon.baseStats && (
              <div style={{ marginBottom: '15px' }}>
                <h4 style={{ margin: '0 0 8px 0', color: '#34495E', fontSize: '14px' }}>Base Stats:</h4>
                <div style={{ fontSize: '12px', color: '#7F8C8D' }}>
                  {typeof pokemon.baseStats === 'object' && pokemon.baseStats.total ? (
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span>Total:</span>
                      <span>{pokemon.baseStats.total}</span>
                    </div>
                  ) : (
                    Object.entries(pokemon.baseStats).map(([stat, value]) => (
                      <div key={stat} style={{ display: 'flex', justifyContent: 'space-between' }}>
                        <span>{stat.charAt(0).toUpperCase() + stat.slice(1).replace(/([A-Z])/g, ' $1')}:</span>
                        <span>{value}</span>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}

            {/* Key Moves */}
            {pokemon.moves && Array.isArray(pokemon.moves) && pokemon.moves.length > 0 && (
              <div style={{ marginBottom: '15px' }}>
                <h4 style={{ margin: '0 0 8px 0', color: '#34495E', fontSize: '14px' }}>Key Moves:</h4>
                <div style={{ fontSize: '11px', color: '#7F8C8D', maxHeight: '60px', overflowY: 'auto' }}>
                  {pokemon.moves.slice(0, 8).map((move, moveIndex) => (
                    <span
                      key={moveIndex}
                      style={{
                        display: 'inline-block',
                        backgroundColor: '#F0F0F0',
                        color: '#555',
                        padding: '2px 6px',
                        borderRadius: '8px',
                        fontSize: '10px',
                        margin: '2px'
                      }}
                    >
                      {typeof move === 'string' ? move : move.name || 'Unknown Move'}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Roles */}
            <div>
              <h4 style={{ margin: '0 0 8px 0', color: '#34495E', fontSize: '14px' }}>Competitive Roles:</h4>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '5px' }}>
                {pokemon.roles && Array.isArray(pokemon.roles) ? (
                  pokemon.roles.map((role, roleIndex) => (
                    <span
                      key={roleIndex}
                      style={{
                        backgroundColor: getRoleColor(role),
                        color: 'white',
                        padding: '3px 8px',
                        borderRadius: '12px',
                        fontSize: '11px',
                        fontWeight: 'bold'
                      }}
                    >
                      {role}
                    </span>
                  ))
                ) : (
                  <span style={{
                    backgroundColor: '#BDC3C7',
                    color: 'white',
                    padding: '3px 8px',
                    borderRadius: '12px',
                    fontSize: '11px',
                    fontWeight: 'bold'
                  }}>
                    No Role Data
                  </span>
                )}
              </div>
            </div>

            {/* Additional Info */}
            <div style={{ marginTop: '10px', fontSize: '12px', color: '#7F8C8D' }}>
              <div>Generation: {pokemon.generation || 'Unknown'}</div>
              <div>Region: {pokemon.region || 'Unknown'}</div>
              {pokemon.isLegendary && <div style={{ color: '#E74C3C', fontWeight: 'bold' }}>Legendary</div>}
              {pokemon.isMythical && <div style={{ color: '#9B59B6', fontWeight: 'bold' }}>Mythical</div>}
            </div>
          </div>
        ))}
      </div>

      {filteredPokemon.length === 0 && (
        <div style={{ textAlign: 'center', color: '#7F8C8D', marginTop: '50px' }}>
          <p>No Pokemon found matching your criteria.</p>
        </div>
      )}

      {/* Role Statistics */}
      <div style={{ marginTop: '50px', padding: '20px', backgroundColor: '#F8F9FA', borderRadius: '10px' }}>
        <h3 style={{ color: '#2C3E50', marginBottom: '20px' }}>Available Roles</h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '10px' }}>
          {allRoles.slice(1).map(role => {
            const count = allPokemon.filter(p => p.roles && p.roles.includes(role)).length;
            return (
              <div key={role} style={{ 
                padding: '8px', 
                backgroundColor: 'white', 
                borderRadius: '5px',
                borderLeft: `4px solid ${getRoleColor(role)}`,
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center'
              }}>
                <span style={{ fontSize: '12px', color: '#2C3E50' }}>{role}</span>
                <span style={{ 
                  fontSize: '12px', 
                  fontWeight: 'bold', 
                  color: getRoleColor(role),
                  backgroundColor: getRoleColor(role) + '20',
                  padding: '2px 6px',
                  borderRadius: '10px'
                }}>
                  {count}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

export default PokemonRoles;

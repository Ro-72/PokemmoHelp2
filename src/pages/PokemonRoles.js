import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import completePokemonData from '../complete_pokemon_data.json';
import pokemonMovesData from '../pokemon_moves.json';

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

const tiers = [
  'All Tiers',
  'OU Viable',
  'UU Viable', 
  'RU Viable',
  'NU Viable',
  'PU Viable',
  'Uber Viable',
  'LC Viable'
];

const statusTypes = [
  'All Status',
  'Regular',
  'Legendary',
  'Mythical'
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

function PokemonRoles({ setSavedPokemon }) {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedRegion, setSelectedRegion] = useState('All Regions');
  const [selectedRole, setSelectedRole] = useState('All Roles');
  const [selectedTier, setSelectedTier] = useState('All Tiers');
  const [selectedStatus, setSelectedStatus] = useState('All Status');
  const [filteredPokemon, setFilteredPokemon] = useState([]);
  const [suggestions, setSuggestions] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  
  const navigate = useNavigate();
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

    // Filter by tier (look for viable roles)
    if (selectedTier !== 'All Tiers') {
      filtered = filtered.filter(pokemon => {
        if (!pokemon.roles) return false;
        return pokemon.roles.some(role => role === selectedTier);
      });
    }

    // Filter by status (Legendary/Mythical)
    if (selectedStatus !== 'All Status') {
      filtered = filtered.filter(pokemon => {
        if (selectedStatus === 'Regular') {
          return !pokemon.isLegendary && !pokemon.isMythical;
        } else if (selectedStatus === 'Legendary') {
          return pokemon.isLegendary;
        } else if (selectedStatus === 'Mythical') {
          return pokemon.isMythical;
        }
        return true;
      });
    }

    setFilteredPokemon(filtered);
  }, [searchTerm, selectedRegion, selectedRole, selectedTier, selectedStatus, isLoading, allPokemon]);

  // Function to save Pokemon to distribution page
  const savePokemonToDistribution = async (pokemon) => {
    if (!setSavedPokemon) {
      console.error('setSavedPokemon function not provided');
      alert('Error: La función para guardar Pokemon no está disponible.');
      return;
    }

    if (pokemon) {
      const strategyUrl = `https://www.pokexperto.net/index2.php?seccion=nds/nationaldex/estrategia&pk=${pokemon.id}`;
      try {
        // Get moves from local JSON instead of API
        const movesRaw = pokemonMovesData[pokemon.name?.toLowerCase()]?.moves || [];
        // Map moves to the expected structure
        const moves = movesRaw.map(move => {
          // Determine method based on fields
          let method = 'unknown';
          if ('level' in move) method = 'level-up';
          else if (move.type === 'egg_moves') method = 'egg';
          else if (move.type === 'move_tutor') method = 'tutor';
          else if (move.type === 'move_learner_tools' || move.type === 'special_moves') method = 'machine';
          // Add more mappings if needed

          return {
            name: move.name || '(desconocido)', // Name is not present in your JSON, so fallback
            method,
            level: move.level ?? 'N/A',
            mtId: method === 'machine' ? move.id : null,
            breedingPartner: method === 'egg' ? (move.breedingPartner || null) : null,
            raw: move // For debugging
          };
        });

        // Show moves in the console for verification
        console.log('Movimientos extraídos:', moves);

        // Transform the complete Pokemon data to match the expected format from PokemonSearch
        const transformedPokemon = {
          id: pokemon.id,
          name: pokemon.name,
          sprites: {
            front_default: pokemon.sprite
          },
          stats: pokemon.baseStats ? [
            { stat: { name: 'hp' }, base_stat: pokemon.baseStats.hp || 0 },
            { stat: { name: 'attack' }, base_stat: pokemon.baseStats.attack || 0 },
            { stat: { name: 'defense' }, base_stat: pokemon.baseStats.defense || 0 },
            { stat: { name: 'special-attack' }, base_stat: pokemon.baseStats.specialAttack || 0 },
            { stat: { name: 'special-defense' }, base_stat: pokemon.baseStats.specialDefense || 0 },
            { stat: { name: 'speed' }, base_stat: pokemon.baseStats.speed || 0 }
          ] : [],
          types: pokemon.types ? pokemon.types.map(type => ({ type: { name: type } })) : [],
          strategyUrl,
          moves
        };

        console.log('Transformed Pokemon:', transformedPokemon);
        setSavedPokemon({ ...transformedPokemon }); // Add strategy URL and moves
        
        // Switch to EVs environment and navigate
        console.log('Navigating to EV distribution...');
        navigate('/ev-distribution');
        
      } catch (error) {
        console.error('Error al obtener los movimientos del Pokémon:', error);
        alert('Error al obtener los movimientos del Pokémon.');
      }
    }
  };

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

        <select
          value={selectedTier}
          onChange={(e) => setSelectedTier(e.target.value)}
          style={{
            padding: '10px',
            border: '2px solid #BDC3C7',
            borderRadius: '5px',
            fontSize: '14px'
          }}
        >
          {tiers.map(tier => (
            <option key={tier} value={tier}>{tier}</option>
          ))}
        </select>

        <select
          value={selectedStatus}
          onChange={(e) => setSelectedStatus(e.target.value)}
          style={{
            padding: '10px',
            border: '2px solid #BDC3C7',
            borderRadius: '5px',
            fontSize: '14px'
          }}
        >
          {statusTypes.map(status => (
            <option key={status} value={status}>{status}</option>
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
        gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
        gap: '20px'
      }}>
        {filteredPokemon.map((pokemon, index) => (
          <div key={`${pokemon.id}-${index}`} style={{
            border: '2px solid #E0E0E0',
            borderRadius: '10px',
            padding: '15px',
            backgroundColor: '#FAFAFA',
            boxShadow: '0 2px 5px rgba(0,0,0,0.1)',
            position: 'relative'
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
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '4px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span>HP:</span>
                      <span style={{ fontWeight: 'bold' }}>{pokemon.baseStats.hp || 0}</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span>Att:</span>
                      <span style={{ fontWeight: 'bold' }}>{pokemon.baseStats.attack || 0}</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span>Def:</span>
                      <span style={{ fontWeight: 'bold' }}>{pokemon.baseStats.defense || 0}</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span>SpA:</span>
                      <span style={{ fontWeight: 'bold' }}>{pokemon.baseStats.specialAttack || 0}</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span>SpD:</span>
                      <span style={{ fontWeight: 'bold' }}>{pokemon.baseStats.specialDefense || 0}</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span>Spe:</span>
                      <span style={{ fontWeight: 'bold' }}>{pokemon.baseStats.speed || 0}</span>
                    </div>
                  </div>
                  <div style={{ marginTop: '8px', textAlign: 'center', padding: '4px', backgroundColor: '#E8F4FD', borderRadius: '4px' }}>
                    <span style={{ fontWeight: 'bold', color: '#2C3E50' }}>
                      Total: {(pokemon.baseStats.hp || 0) + (pokemon.baseStats.attack || 0) + (pokemon.baseStats.defense || 0) + (pokemon.baseStats.specialAttack || 0) + (pokemon.baseStats.specialDefense || 0) + (pokemon.baseStats.speed || 0)}
                    </span>
                  </div>
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
            <div style={{ marginBottom: '15px' }}>
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
            <div style={{ marginBottom: '15px', fontSize: '12px', color: '#7F8C8D' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span>Generation: {pokemon.generation || 'Unknown'}</span>
                <span>Region: {pokemon.region || 'Unknown'}</span>
              </div>
              <div style={{ marginTop: '5px', textAlign: 'center' }}>
                {pokemon.isLegendary && (
                  <span style={{ 
                    color: '#E74C3C', 
                    fontWeight: 'bold', 
                    backgroundColor: '#FADBD8', 
                    padding: '2px 6px', 
                    borderRadius: '8px',
                    marginRight: '5px',
                    fontSize: '10px'
                  }}>
                    Legendary
                  </span>
                )}
                {pokemon.isMythical && (
                  <span style={{ 
                    color: '#9B59B6', 
                    fontWeight: 'bold', 
                    backgroundColor: '#F4ECF7', 
                    padding: '2px 6px', 
                    borderRadius: '8px',
                    fontSize: '10px'
                  }}>
                    Mythical
                  </span>
                )}
              </div>
            </div>

            {/* Add to Analysis Button */}
            <button
              onClick={() => savePokemonToDistribution(pokemon)}
              style={{
                width: '100%',
                padding: '10px',
                backgroundColor: '#27AE60',
                color: 'white',
                border: 'none',
                borderRadius: '5px',
                fontSize: '14px',
                fontWeight: 'bold',
                cursor: 'pointer',
                transition: 'background-color 0.3s'
              }}
              onMouseEnter={(e) => e.target.style.backgroundColor = '#229954'}
              onMouseLeave={(e) => e.target.style.backgroundColor = '#27AE60'}
            >
              Add to Analysis
            </button>
          </div>
        ))}
      </div>

      {filteredPokemon.length === 0 && (
        <div style={{ textAlign: 'center', color: '#7F8C8D', marginTop: '50px' }}>
          <p>No Pokemon found matching your criteria.</p>
        </div>
      )}
    </div>
  );
}

export default PokemonRoles;

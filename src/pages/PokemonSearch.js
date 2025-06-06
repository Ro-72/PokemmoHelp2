import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import pokemonMovesData from '../pokemon_moves.json'; // Adjust path as needed

function PokemonSearch({ setSavedPokemon, disableAutocomplete = false, onClose }) {
  const [searchTerm, setSearchTerm] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const [pokemonData, setPokemonData] = useState(null);
  const [allPokemon, setAllPokemon] = useState([]); // Store all Pokémon names
  const navigate = useNavigate();
  const inputRef = useRef(null);

  useEffect(() => {
    // Fetch all Pokémon names once
    fetch(`https://pokeapi.co/api/v2/pokemon?limit=1000`)
      .then(response => response.json())
      .then(data => setAllPokemon(data.results))
      .catch(() => setAllPokemon([]));
  }, []);

  useEffect(() => {
    if (!disableAutocomplete && searchTerm.length > 0) {
      const filtered = allPokemon
        .filter(pokemon => pokemon.name.toLowerCase().includes(searchTerm.toLowerCase()))
        .slice(0, 5); // Limit suggestions to 5
      setSuggestions(filtered);
    } else {
      setSuggestions([]);
    }
  }, [searchTerm, disableAutocomplete, allPokemon]);

  const handleSearch = () => {
    if (!searchTerm.trim()) {
      alert('Por favor, ingresa un nombre o ID de Pokémon antes de buscar.');
      return;
    }
    fetch(`https://pokeapi.co/api/v2/pokemon/${searchTerm.toLowerCase()}`)
      .then(response => {
        if (!response.ok) throw new Error('Pokémon no encontrado');
        return response.json();
      })
      .then(data => {
        setPokemonData(data);
        setSuggestions([]); // Clear suggestions after search
      })
      .catch(() => {
        setPokemonData(null);
        setSuggestions([]); // Clear suggestions even if search fails
      });
  };

  const handleSuggestionClick = (name) => {
    setSearchTerm(name);
    setSuggestions([]); // Clear suggestions
    fetch(`https://pokeapi.co/api/v2/pokemon/${name.toLowerCase()}`)
      .then(response => {
        if (!response.ok) throw new Error('Pokémon no encontrado');
        return response.json();
      })
      .then(data => {
        setPokemonData(data);
        setSuggestions([]); // Ensure suggestions are cleared after fetching
      })
      .catch(() => {
        setPokemonData(null);
        setSuggestions([]); // Ensure suggestions are cleared even if fetch fails
      });
  };

  // Add this helper function to normalize names for move lookup
  function getBasePokemonName(name) {
    if (!name) return '';
    // Remove dashes and anything after them for forms like "darmanitan-standard"
    // Also handle some common form patterns
    return name
      .toLowerCase()
      .replace(/-.*$/, '') // Remove everything after first dash
      .replace(/[^a-z0-9]/g, ''); // Remove non-alphanumeric chars for safety
  }

  const savePokemon = async () => {
    if (pokemonData) {
      const strategyUrl = `https://www.pokexperto.net/index2.php?seccion=nds/nationaldex/estrategia&pk=${pokemonData.id}`;
      try {
        // Use normalized name for move lookup
        const baseName = getBasePokemonName(pokemonData.name);
        const movesRaw = pokemonMovesData[baseName]?.moves || [];
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
            name: move.name || move.id || '(desconocido)', // Use move ID as fallback
            method,
            level: move.level ?? 'N/A',
            mtId: method === 'machine' ? move.id : null,
            breedingPartner: method === 'egg' ? (move.breedingPartner || null) : null,
            type: move.move_type || null, // Add move type from the data
            raw: move // For debugging
          };
        });

        // Show moves in the console for verification
        console.log('Movimientos extraídos:', moves);

        setSavedPokemon({ ...pokemonData, strategyUrl, moves }); // Add strategy URL and moves
        navigate('/ev-distribution'); // Redirigir a la página de distribución de EVs
        if (onClose) onClose(); // Cierra la ventana si se pasa la función
      } catch {
        alert('Error al obtener los movimientos del Pokémon.');
      }
    }
  };

  useEffect(() => {
    // Auto-select the input when the component is mounted/shown
    if (inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, []);

  return (
    <div>
      <h2>Buscar Pokémon</h2>
      <input
        ref={inputRef}
        type="text"
        placeholder="Ingresa el nombre o ID del Pokémon"
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        onKeyDown={e => {
          if (e.key === 'Enter') {
            e.preventDefault();
            handleSearch();
          }
        }}
      />
      <button onClick={handleSearch}>Buscar</button>
      {!disableAutocomplete && (
        <ul>
          {suggestions.map((pokemon, index) => (
            <li key={index} onClick={() => handleSuggestionClick(pokemon.name)}>
              {pokemon.name}
            </li>
          ))}
        </ul>
      )}
      {pokemonData && (
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', fontSize: '8px' }}>
          <div style={{ flex: 1, textAlign: 'center', marginRight: '10px' }}>
            <h3>{pokemonData.name}</h3>
            <img src={pokemonData.sprites.front_default} alt={pokemonData.name} />
            <p>ID: {pokemonData.id}</p>
          </div>
          <div style={{ flex: 2 }}>
            <h4>Estadísticas:</h4>
            {pokemonData.stats.map((stat, index) => (
              <div key={index} style={{ marginBottom: '10px' }}>
                <strong>{stat.stat.name.toUpperCase()}:</strong>
                <span style={{ marginLeft: '10px' }}>{stat.base_stat}</span>
              </div>
            ))}
          </div>
        </div>
      )}
      {pokemonData && <button onClick={savePokemon} style={{ marginTop: '10px' }}>Guardar</button>}
    </div>
  );
}

export default PokemonSearch;

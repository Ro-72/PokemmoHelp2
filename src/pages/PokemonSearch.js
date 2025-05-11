import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

function PokemonSearch({ setSavedPokemon, disableAutocomplete = false }) {
  const [searchTerm, setSearchTerm] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const [pokemonData, setPokemonData] = useState(null);
  const [allPokemon, setAllPokemon] = useState([]); // Store all Pokémon names
  const navigate = useNavigate();

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

  const savePokemon = async () => {
    if (pokemonData) {
      const strategyUrl = `https://www.pokexperto.net/index2.php?seccion=nds/nationaldex/estrategia&pk=${pokemonData.id}`;
      try {
        const response = await fetch(`https://pokeapi.co/api/v2/pokemon/${pokemonData.id}`);
        const data = await response.json();
        console.log('Movimientos completos:', data.moves); // Mostrar todos los datos de los movimientos en la consola

        const moves = await Promise.all(
          data.moves.map(async (move) => {
            const method = move.version_group_details?.[0]?.move_learn_method?.name || 'unknown';
            const level = move.version_group_details?.[0]?.level_learned_at || 'N/A';

            let mtId = null;
            let breedingPartner = null;

            if (method === 'machine') {
              // Fetch MT/MO details
              const machineResponse = await fetch(move.move.url);
              const machineData = await machineResponse.json();
              mtId = machineData.machines?.[0]?.machine?.name || 'N/A';
            }

            if (method === 'egg') {
              // Fetch breeding partner details
              const eggResponse = await fetch(move.move.url);
              const eggData = await eggResponse.json();
              breedingPartner = eggData.flavor_text_entries?.[0]?.flavor_text || 'N/A';
            }

            return {
              name: move.move.name,
              method,
              level,
              mtId,
              breedingPartner,
            };
          })
        );

        setSavedPokemon({ ...pokemonData, strategyUrl, moves }); // Add strategy URL and moves
        navigate('/ev-distribution'); // Redirigir a la página de distribución de EVs
      } catch {
        alert('Error al obtener los movimientos del Pokémon.');
      }
    }
  };

  return (
    <div>
      <h2>Buscar Pokémon</h2>
      <input
        type="text"
        placeholder="Ingresa el nombre o ID del Pokémon"
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
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

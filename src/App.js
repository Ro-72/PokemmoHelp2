import React, { useState } from 'react';
import { BrowserRouter as Router, Route, Link, Routes } from 'react-router-dom'; // Use Routes instead of Switch
import './App.css';
import EVDistribution from './pages/EVDistribution'; // Import the new page component
import PokemonSearch from './pages/PokemonSearch'; // Import the new component

function App() {
  const [savedPokemon, setSavedPokemon] = useState(null); // Estado global para el Pokémon guardado
  const [showPokemonSearch, setShowPokemonSearch] = useState(false); // Estado para mostrar la ventana emergente

  return (
    <Router>
      <div className="App">
        <header className="App-header">
          <h1>POKEMMO Helper</h1>
          <nav>
            <Link to="/" className="App-link">Home</Link>
            <Link to="/ev-distribution" className="App-link">Distribución de EVs</Link>
            <Link 
              to="#" 
              className="App-link" 
              onClick={() => setShowPokemonSearch(true)}
            >
              Buscar Pokémon
            </Link>
          </nav>
        </header>
        <main>
          <Routes>
            <Route path="/" element={
              <>
                <h2>Bienvenido a POKEMMO Helper</h2>
                <p>Selecciona una opción del menú para comenzar.</p>
              </>
            } />
            <Route path="/ev-distribution" element={<EVDistribution savedPokemon={savedPokemon} />} />
          </Routes>
        </main>
        {showPokemonSearch && (
          <>
            <div 
              style={{
                position: 'fixed',
                top: '50%',
                left: '50%',
                transform: 'translate(-50%, -50%)',
                width: '350px',
                height: '300px',
                backgroundColor: 'white',
                border: '1px solid black',
                borderRadius: '8px',
                boxShadow: '0 4px 8px rgba(0, 0, 0, 0.2)',
                zIndex: 1000,
                padding: '10px',
              }}
            >
              <button 
                style={{ float: 'right', cursor: 'pointer' }} 
                onClick={() => setShowPokemonSearch(false)}
              >
                ✖
              </button>
              <PokemonSearch setSavedPokemon={setSavedPokemon} disableAutocomplete={false} />
            </div>
            <div 
              style={{
                position: 'fixed',
                top: 0,
                left: 0,
                width: '100%',
                height: '100%',
                backgroundColor: 'rgba(0, 0, 0, 0.5)',
                zIndex: 999,
              }}
              onClick={() => setShowPokemonSearch(false)}
            />
          </>
        )}
      </div>
    </Router>
  );
}

export default App;

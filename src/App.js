import React, { useState } from 'react';
import { BrowserRouter as Router, Route, Link, Routes, useNavigate, useLocation } from 'react-router-dom';
import './App.css';
import EVDistribution from './pages/EVDistribution';
import PokemonSearch from './pages/PokemonSearch';
import BerriesPage from './pages/BerriesPage';
import PokemonRoles from './pages/PokemonRoles';

// Lista de bayas de ejemplo (puedes expandirla o cargarla de un JSON)
const berriesList = [
  { name: 'Cheri Berry', effect: 'Cura parálisis', growth: '24h', color: 'Roja' },
  { name: 'Chesto Berry', effect: 'Cura sueño', growth: '24h', color: 'Azul' },
  { name: 'Pecha Berry', effect: 'Cura envenenamiento', growth: '24h', color: 'Rosa' },
  { name: 'Oran Berry', effect: 'Restaura 10 PS', growth: '24h', color: 'Celeste' },
  { name: 'Sitrus Berry', effect: 'Restaura 25% PS', growth: '24h', color: 'Amarilla' },
  // ...agrega más bayas si lo deseas...
];

function AppWrapper() {
  const [savedPokemon, setSavedPokemon] = useState(null);
  const [showPokemonSearch, setShowPokemonSearch] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [workEnv, setWorkEnv] = useState('evs'); // 'evs' | 'berries' | 'roles'
  const [darkMode, setDarkMode] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  // Cambia de entorno y navega si es necesario
  const handleEnvChange = (env) => {
    setWorkEnv(env);
    setDrawerOpen(false);
    if (env === 'evs' && location.pathname !== '/ev-distribution') {
      navigate('/ev-distribution');
    }
    if (env === 'berries' && !location.pathname.startsWith('/berries')) {
      navigate('/berries/list');
    }
    if (env === 'roles' && location.pathname !== '/pokemon-roles') {
      navigate('/pokemon-roles');
    }
  };

  return (
    <div className={`App${darkMode ? ' dark-mode' : ''}`}>
      {/* Navigation Drawer Button */}
      <button
        style={{
          position: 'fixed',
          top: 15,
          left: 15,
          zIndex: 2001,
          background: '#282c34',
          color: 'white',
          border: 'none',
          borderRadius: '50%',
          width: '40px',
          height: '40px',
          fontSize: '24px',
          cursor: 'pointer',
          boxShadow: '0 2px 6px rgba(0,0,0,0.2)'
        }}
        onClick={() => setDrawerOpen(true)}
        aria-label="Abrir menú de entornos"
      >
        ☰
      </button>
      {/* Dark mode toggle button */}
      <button
        style={{
          position: 'fixed',
          top: 15,
          right: 15,
          zIndex: 2001,
          background: darkMode ? '#222' : '#eee',
          color: darkMode ? '#FFD600' : '#222',
          border: 'none',
          borderRadius: '50%',
          width: '40px',
          height: '40px',
          fontSize: '20px',
          cursor: 'pointer',
          boxShadow: '0 2px 6px rgba(0,0,0,0.2)'
        }}
        onClick={() => setDarkMode(dm => !dm)}
        aria-label="Toggle dark mode"
      >
        {darkMode ? '🌙' : '☀️'}
      </button>
      {/* Drawer */}
      {drawerOpen && (
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            width: '220px',
            height: '100%',
            background: darkMode ? '#23272b' : '#fff',
            color: darkMode ? '#e0e0e0' : '#222',
            boxShadow: '2px 0 8px rgba(0,0,0,0.15)',
            zIndex: 2002,
            display: 'flex',
            flexDirection: 'column',
            padding: '20px 10px 10px 10px'
          }}
        >
          <button
            style={{
              alignSelf: 'flex-end',
              background: 'none',
              border: 'none',
              fontSize: '20px',
              cursor: 'pointer',
              marginBottom: '20px',
              color: darkMode ? '#FFD600' : '#222'
            }}
            onClick={() => setDrawerOpen(false)}
            aria-label="Cerrar menú"
          >
            ✖
          </button>
          <h4>Entornos de trabajo</h4>
          <button
            style={{
              background: workEnv === 'evs' ? '#4caf50' : (darkMode ? '#23272b' : '#eee'),
              color: workEnv === 'evs' ? 'white' : (darkMode ? '#FFD600' : 'black'),
              border: 'none',
              borderRadius: '4px',
              padding: '10px',
              marginBottom: '10px',
              cursor: 'pointer',
              width: '100%',
              textAlign: 'left'
            }}
            onClick={() => handleEnvChange('evs')}
          >
            Entrenadores Values Pokémon
          </button>
          <button
            style={{
              background: workEnv === 'berries' ? '#4caf50' : (darkMode ? '#23272b' : '#eee'),
              color: workEnv === 'berries' ? 'white' : (darkMode ? '#FFD600' : 'black'),
              border: 'none',
              borderRadius: '4px',
              padding: '10px',
              marginBottom: '10px',
              cursor: 'pointer',
              width: '100%',
              textAlign: 'left'
            }}
            onClick={() => handleEnvChange('berries')}
          >
            Berries
          </button>
          <button
            style={{
              background: workEnv === 'roles' ? '#4caf50' : (darkMode ? '#23272b' : '#eee'),
              color: workEnv === 'roles' ? 'white' : (darkMode ? '#FFD600' : 'black'),
              border: 'none',
              borderRadius: '4px',
              padding: '10px',
              marginBottom: '10px',
              cursor: 'pointer',
              width: '100%',
              textAlign: 'left'
            }}
            onClick={() => handleEnvChange('roles')}
          >
            Pokemon Roles
          </button>
        </div>
      )}
      {/* Drawer Overlay */}
      {drawerOpen && (
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            width: '100vw',
            height: '100vh',
            background: 'rgba(0,0,0,0.2)',
            zIndex: 2000
          }}
          onClick={() => setDrawerOpen(false)}
        />
      )}
      <header className="App-header">
        <h1>POKEMMO Helper</h1>
        {workEnv === 'evs' && (
          <nav>
            <Link to="/ev-distribution" className="App-link">Distribución de EVs</Link>
            <Link
              to="#"
              className="App-link"
              onClick={() => setShowPokemonSearch(true)}
            >
              Buscar Pokémon
            </Link>
          </nav>
        )}
        {workEnv === 'berries' && (
          <nav>
            <Link to="/berries/list" className="App-link">Lista de Bayas</Link>
            <Link to="/berries/simulation" className="App-link">Simulación de Plantación</Link>
          </nav>
        )}
        {workEnv === 'roles' && (
          <nav>
            <Link to="/pokemon-roles" className="App-link">Pokemon Roles</Link>
          </nav>
        )}
      </header>
      <main>
        {workEnv === 'evs' ? (
          <Routes>
            <Route path="/ev-distribution" element={<EVDistribution savedPokemon={savedPokemon} />} />
            <Route path="*" element={<EVDistribution savedPokemon={savedPokemon} />} />
          </Routes>
        ) : workEnv === 'berries' ? (
          <Routes>
            <Route path="/berries/*" element={<BerriesPage />} />
            <Route path="*" element={<BerriesPage />} />
          </Routes>
        ) : (
          <Routes>
            <Route path="/pokemon-roles" element={<PokemonRoles pokemonList={[]} />} />
            <Route path="*" element={<PokemonRoles pokemonList={[]} />} />
          </Routes>
        )}
      </main>
      {workEnv === 'evs' && showPokemonSearch && (
        <>
          <div
            style={{
              position: 'fixed',
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -50%)',
              width: '350px',
              height: '300px',
              backgroundColor: darkMode ? '#23272b' : 'white',
              color: darkMode ? '#FFD600' : '#222',
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
            <PokemonSearch
              setSavedPokemon={setSavedPokemon}
              disableAutocomplete={false}
              onClose={() => setShowPokemonSearch(false)}
            />
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
  );
}

// Necesario para usar useNavigate en el componente principal
function App() {
  return (
    <Router>
      <AppWrapper />
    </Router>
  );
}

export default App;

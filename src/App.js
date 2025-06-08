import React, { useState } from 'react';
import { BrowserRouter as Router, Route, Link, Routes, useNavigate, useLocation } from 'react-router-dom';
import './App.css';
import EVDistribution from './pages/Analyser';
import PokemonSearch from './pages/PokemonSearch';
import BerriesPage from './pages/BerriesPage';
import PokemonRoles from './pages/PokemonRoles';
import TeamBuilder from './pages/TeamBuilder';
import { TeamProvider, useTeam } from './contexts/TeamContext';

function AppWrapper() {
  const [savedPokemon, setSavedPokemon] = useState(null);
  const [showPokemonSearch, setShowPokemonSearch] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [workEnv, setWorkEnv] = useState('evs'); // 'evs' | 'berries' | 'roles' | 'teambuilder'
  const [darkMode, setDarkMode] = useState(true);
  const navigate = useNavigate();
  const location = useLocation();
  const { team, updatePokemon, setCurrentPokemon } = useTeam();

  // Enhanced setSavedPokemon to also switch to EVs environment
  const handleSetSavedPokemon = (pokemon) => {
    setSavedPokemon(pokemon);
    if (workEnv !== 'evs') {
      setWorkEnv('evs');
    }
  };

  // Add Pokemon to team
  const addToTeam = (pokemon) => {
    const emptySlotIndex = team.findIndex(slot => slot === null);
    if (emptySlotIndex !== -1) {
      updatePokemon(emptySlotIndex, pokemon);
      alert(`${pokemon.name} added to team slot ${emptySlotIndex + 1}!`);
      
      // Switch to team builder environment
      setWorkEnv('teambuilder');
      navigate('/team-builder');
    } else { 
      alert('Team is full! Remove a Pokemon first.');
    }
  };

  // Enhanced add to team for analysis with slot selection
  const addToTeamFromAnalysis = (pokemon, preferredSlot = null) => {
    let targetSlot = preferredSlot;
    
    if (targetSlot === null || targetSlot < 0 || targetSlot >= 6 || team[targetSlot] !== null) {
      targetSlot = team.findIndex(slot => slot === null);
    }
    
    if (targetSlot !== -1) {
      updatePokemon(targetSlot, pokemon);
      setCurrentPokemon(targetSlot);
      alert(`${pokemon.name} added to team slot ${targetSlot + 1}!`);
      
      // Switch to team builder environment
      setWorkEnv('teambuilder');
      navigate('/team-builder');
    } else {
      alert('Team is full! Remove a Pokemon first.');
    }
  };

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
    if (env === 'teambuilder' && location.pathname !== '/team-builder') {
      navigate('/team-builder');
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
        aria-label="Open environments menu"
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
            aria-label="Close menu"
          >
            ✖
          </button>
          <h4>Work Environments</h4>
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
            Pokemon Analyser
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
          <button
            style={{
              background: workEnv === 'teambuilder' ? '#4caf50' : (darkMode ? '#23272b' : '#eee'),
              color: workEnv === 'teambuilder' ? 'white' : (darkMode ? '#FFD600' : 'black'),
              border: 'none',
              borderRadius: '4px',
              padding: '10px',
              marginBottom: '10px',
              cursor: 'pointer',
              width: '100%',
              textAlign: 'left'
            }}
            onClick={() => handleEnvChange('teambuilder')}
          >
            Team Builder
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
            <Link to="/ev-distribution" className="App-link">Distribution</Link>
            <Link
              to="#"
              className="App-link"
              onClick={() => setShowPokemonSearch(true)}
            >
              Search Pokemon
            </Link>
          </nav>
        )}
        {workEnv === 'berries' && (
          <nav>
            <Link to="/berries/list" className="App-link">Berry List</Link>
            <Link to="/berries/simulation" className="App-link">Planting Simulation</Link>
          </nav>
        )}
        {workEnv === 'roles' && (
          <nav>
            <Link to="/pokemon-roles" className="App-link">Pokemon Roles</Link>
          </nav>
        )}
        {workEnv === 'teambuilder' && (
          <nav>
            <Link to="/team-builder" className="App-link">Team Builder</Link>
          </nav>
        )}
      </header>
      <main>
        {workEnv === 'evs' ? (
          <Routes>
            <Route path="/ev-distribution" element={<EVDistribution savedPokemon={savedPokemon} addToTeam={addToTeamFromAnalysis} />} />
            <Route path="*" element={<EVDistribution savedPokemon={savedPokemon} addToTeam={addToTeamFromAnalysis} />} />
          </Routes>
        ) : workEnv === 'berries' ? (
          <Routes>
            <Route path="/berries/*" element={<BerriesPage />} />
            <Route path="*" element={<BerriesPage />} />
          </Routes>
        ) : workEnv === 'teambuilder' ? (
          <Routes>
            <Route path="/team-builder" element={<TeamBuilder setSavedPokemon={handleSetSavedPokemon} />} />
            <Route path="*" element={<TeamBuilder setSavedPokemon={handleSetSavedPokemon} />} />
          </Routes>
        ) : (
          <Routes>
            <Route path="/pokemon-roles" element={<PokemonRoles setSavedPokemon={handleSetSavedPokemon} addToTeam={addToTeam} />} />
            <Route path="*" element={<PokemonRoles setSavedPokemon={handleSetSavedPokemon} addToTeam={addToTeam} />} />
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
              setSavedPokemon={handleSetSavedPokemon}
              addToTeam={addToTeam}
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

// Wrap the main app with TeamProvider
function App() {
  return (
    <Router>
      <TeamProvider>
        <AppWrapper />
      </TeamProvider>
    </Router>
  );
}

export default App;

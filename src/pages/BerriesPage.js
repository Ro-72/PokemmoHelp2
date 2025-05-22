import React, { useEffect, useState } from 'react';
import { Routes, Route, useNavigate } from 'react-router-dom';
import BerriesList from './BerriesList';
import BerriesSimulation from './BerriesSimulation';

function BerriesPage() {
  const navigate = useNavigate();
  const [berriesList, setBerriesList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [darkMode, setDarkMode] = useState(false);

  useEffect(() => {
    // Detect dark mode from App container
    setDarkMode(document.querySelector('.App.dark-mode') !== null);
    const observer = new MutationObserver(() => {
      setDarkMode(document.querySelector('.App.dark-mode') !== null);
    });
    observer.observe(document.body, { attributes: true, subtree: true });
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    // Fetch berry list from PokéAPI
    async function fetchBerries() {
      setLoading(true);
      try {
        const res = await fetch('https://pokeapi.co/api/v2/berry?limit=64');
        const data = await res.json();
        // Fetch details for each berry
        const details = await Promise.all(
          data.results.map(async (berry) => {
            const berryRes = await fetch(berry.url);
            const berryData = await berryRes.json();
            // Get growth_time and effect (from item)
            let effect = '';
            let growth = berryData.growth_time + 'h';
            let sprite = '';
            // Fetch item for effect and sprite
            if (berryData.item?.url) {
              try {
                const itemRes = await fetch(berryData.item.url);
                const itemData = await itemRes.json();
                // Find effect in Spanish, fallback to English
                const effectEntry = itemData.effect_entries.find(e => e.language.name === 'es') ||
                                    itemData.effect_entries.find(e => e.language.name === 'en');
                effect = effectEntry ? effectEntry.short_effect : '';
                // Try to get the sprite from itemData.sprites.default
                sprite = itemData.sprites?.default || '';
              } catch {
                effect = '';
                sprite = '';
              }
            }
            return {
              name: berryData.name,
              effect,
              growth,
              sprite,
            };
          })
        );
        setBerriesList(details);
      } catch {
        setBerriesList([]);
      }
      setLoading(false);
    }
    fetchBerries();
  }, []);

  return (
    <div className={darkMode ? 'berries-page dark-mode' : 'berries-page'}>
      <Routes>
        <Route
          path="/list"
          element={
            loading
              ? <div className={darkMode ? 'berries-loading dark-mode' : 'berries-loading'}>Cargando bayas...</div>
              : <BerriesList berriesList={berriesList} />
          }
        />
        <Route
          path="/simulation"
          element={
            loading
              ? <div className={darkMode ? 'berries-loading dark-mode' : 'berries-loading'}>Cargando bayas...</div>
              : <BerriesSimulation berriesList={berriesList} darkMode={darkMode} />
          }
        />
        <Route
          path="*"
          element={
            loading
              ? <div className={darkMode ? 'berries-loading dark-mode' : 'berries-loading'}>Cargando bayas...</div>
              : <BerriesList berriesList={berriesList} />
          }
        />
      </Routes>
    </div>
  );
}

export default BerriesPage;

import React from 'react';

// Color palette for type/keyword highlighting
const keywordColors = [
  { keyword: 'electric', color: '#FFD600' },
  { keyword: 'paralysis', color: '#FFD600' },
  { keyword: 'fire', color: '#FF7043' },
  { keyword: 'burn', color: '#FF7043' },
  { keyword: 'water', color: '#29B6F6' },
  { keyword: 'ice', color: '#81D4FA' },
  { keyword: 'poison', color: '#AB47BC' },
  { keyword: 'psychic', color: '#F06292' },
  { keyword: 'grass', color: '#66BB6A' },
  { keyword: 'heal', color: '#43A047' },
  { keyword: 'restore', color: '#43A047' },
  { keyword: 'sleep', color: '#9575CD' },
  { keyword: 'flying', color: '#90CAF9' },
  { keyword: 'fly', color: '#90CAF9' },
  { keyword: 'fighting', color: '#D84315' },
  { keyword: 'fight', color: '#D84315' },
  { keyword: 'bug', color: '#AEEA00' },
  { keyword: 'rock', color: '#A1887F' },
  { keyword: 'ground', color: '#D7CCC8' },
  { keyword: 'dark', color: '#616161' },
  { keyword: 'ghost', color: '#7E57C2' },
  { keyword: 'dragon', color: '#1976D2' },
  { keyword: 'steel', color: '#90A4AE' },
  { keyword: 'fairy', color: '#F8BBD0' },
  { keyword: 'normal', color: '#BDBDBD' },
  { keyword: 'freeze', color: '#81D4FA' },
  { keyword: 'frozen', color: '#81D4FA' },
  { keyword: 'confusion', color: '#BA68C8' },
  { keyword: 'defense', color: '#FFA000' },
  { keyword: 'attack', color: '#C62828' },
  { keyword: 'speed', color: '#00B8D4' },
  { keyword: 'special', color: '#8D6E63' },
  { keyword: 'hp', color: '#43A047' },
  { keyword: 'health', color: '#43A047' },
  { keyword: 'status', color: '#FFB300' },
  { keyword: 'cure', color: '#43A047' },
  { keyword: 'restore', color: '#43A047' },
  { keyword: 'paralyze', color: '#FFD600' },
  { keyword: 'poisoning', color: '#AB47BC' },
  { keyword: 'burned', color: '#FF7043' },
  { keyword: 'asleep', color: '#9575CD' },
  { keyword: 'fainted', color: '#616161' },
  // Add more as needed
];

// Function to colorize keywords in effect text
function colorizeEffect(effect) {
  if (!effect) return '';
  let colored = effect;
  keywordColors.forEach(({ keyword, color }) => {
    const regex = new RegExp(`(${keyword})`, 'gi');
    colored = colored.replace(
      regex,
      `<span style="color: ${color}; font-weight: bold;">$1</span>`
    );
  });
  return colored;
}

// Helper to classify berries by effect description
function classifyBerry(effect) {
  if (!effect) return 'Other';
  const e = effect.toLowerCase();

  // Status healing
  if (
    e.includes('paralysis') || e.includes('burn') || e.includes('freeze') ||
    e.includes('sleep')  || e.includes('confusion') ||
    e.includes('status') || e.includes('cure') || e.includes('heal')
  ) {
    return 'Status Healing Berries';
  }

  // EV lowering
  if (
    (e.includes('ev') || e.includes('effort value') || e.includes('lower')) &&
    (e.includes('attack') || e.includes('defense') || e.includes('speed') || e.includes('special'))
  ) {
    return 'EV Lowering Berries';
  }

  // HP/Health restoring
  if (
    e.includes('restore') || e.includes('restores') || e.includes('hp') || e.includes('health')
  ) {
    return 'HP/Health Restoring Berries';
  }

  // Stat boosting
  if (
    e.includes('boost') || e.includes('raises') || e.includes('increase')
  ) {
    return 'Stat Boosting Berries';
  }

  // Super effective damage reduction (type resist berries)
  if (
    e.includes('super effective') || e.includes('supereffective') ||
    e.includes('is lessened') || e.includes('halve the') || e.includes('damage taken from a supereffective')
  ) {
    return 'Super-effective Berries';
  }
  
  // Recovery from flinching
  if (e.includes('flinch') || e.includes('flinching')) {
    return 'Flinch Recovery Berries';
  }

  // Other
  if (
    e.includes('contest') || e.includes('pokeblock') || e.includes('pofin') ||
    e.includes('pokémon contest') || e.includes('pokeblocks') || e.includes('pofins')
  ) {
    return 'Contest/Poffin Berries';
  }

  return 'Other';
}

// Group berries by category, and order: EV Lowering, Super-effective, then the rest
function groupBerries(berriesList) {
  const groups = {};
  let otherBerries = [];
  berriesList.forEach(b => {
    const group = classifyBerry(b.effect);
    if (group === 'Other') {
      otherBerries.push(b);
    } else {
      if (!groups[group]) groups[group] = [];
      groups[group].push(b);
    }
  });
  // Split "Other" into 'Other' and 'Super-effective Berries' if there are enough
  if (otherBerries.length > 0) {
    // Heuristic: put all berries with "super effective" or similar in 'Super-effective Berries'
    const superEff = [];
    const other = [];
    otherBerries.forEach(b => {
      const e = (b.effect || '').toLowerCase();
      if (
        e.includes('super effective') || e.includes('supereffective') ||
        e.includes('is lessened') || e.includes('halve the') || e.includes('damage taken from a supereffective')
      ) {
        superEff.push(b);
      } else {
        other.push(b);
      }
    });
    if (superEff.length > 0) groups['Super-effective Berries'] = superEff;
    if (other.length > 0) groups['Other'] = other;
  }
  // Order: EV Lowering, Super-effective, then the rest
  const ordered = {};
  if (groups['EV Lowering Berries']) {
    ordered['EV Lowering Berries'] = groups['EV Lowering Berries'];
  }
  if (groups['Super-effective Berries']) {
    ordered['Super-effective Berries'] = groups['Super-effective Berries'];
  }
  Object.keys(groups).forEach(key => {
    if (key !== 'EV Lowering Berries' && key !== 'Super-effective Berries') {
      ordered[key] = groups[key];
    }
  });
  return ordered;
}

function BerriesList({ berriesList }) {
  const groups = groupBerries(berriesList);

  // Render all groups in a single column, with EV and Super-effective first
  return (
    <div>
      <h3>Berry List</h3>
      <div style={{ maxWidth: 900, margin: '0 auto' }}>
        {Object.entries(groups).map(([group, berries]) => (
          <div key={group} style={{ marginBottom: '30px' }}>
            <h4 style={{ color: '#4caf50', marginBottom: '10px' }}>{group}</h4>
            <table style={{ margin: '0 auto', borderCollapse: 'collapse', minWidth: '320px' }}>
              <thead>
                <tr>
                  <th style={{ border: '1px solid #ccc', padding: '6px' }}>Name</th>
                  <th style={{ border: '1px solid #ccc', padding: '6px' }}>Effect</th>
                  <th style={{ border: '1px solid #ccc', padding: '6px' }}>Growth</th>
                </tr>
              </thead>
              <tbody>
                {berries.map((b, idx) => (
                  <tr key={idx}>
                    <td style={{ border: '1px solid #ccc', padding: '6px' }}>{b.name}</td>
                    <td
                      style={{ border: '1px solid #ccc', padding: '6px' }}
                      dangerouslySetInnerHTML={{ __html: colorizeEffect(b.effect) }}
                    />
                    <td style={{ border: '1px solid #ccc', padding: '6px' }}>{b.growth}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ))}
      </div>
    </div>
  );
}

export default BerriesList;

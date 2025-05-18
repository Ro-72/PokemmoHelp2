import React from 'react';

function RecommendationPopup({ getRecommendations, togglePopup }) {
  return (
    <div className="recommendation-popup smallpopup">
      <h4>Recomendaciones</h4>
      <ul>
        {getRecommendations().map(({ stat, regionData }) => (
          <li key={stat}>
            <strong>{stat.toUpperCase()}:</strong>
            <ul>
              {regionData.map((entry, index) => (
                <li key={index}>
                  <strong>Pokémon:</strong> {entry.pokemon} - <strong>Ubicación:</strong> {entry.location} ({entry.method}) - {entry.encounter}
                </li>
              ))}
            </ul>
          </li>
        ))}
      </ul>
      <button className="close-popup" onClick={togglePopup}>Cerrar</button>
    </div>
  );
}

export default RecommendationPopup;

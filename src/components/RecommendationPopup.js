import React from 'react';

function RecommendationPopup({ getRecommendations, togglePopup }) {
  return (
    <div className="popup-overlay" onClick={togglePopup}>
      <div className="popup-content" onClick={(e) => e.stopPropagation()}>
        <h3>EV Training Recommendations</h3>
        <button className="close-button" onClick={togglePopup}>
          ×
        </button>
        <div className="recommendations-list">
          {getRecommendations().map((recommendation, index) => (
            <div key={index} className="recommendation-item">
              <h4>{recommendation.stat.charAt(0).toUpperCase() + recommendation.stat.slice(1)}</h4>
              {recommendation.regionData.length > 0 ? (
                <ul>
                  {recommendation.regionData.map((item, idx) => (
                    <li key={idx}>
                      <strong>{item.pokemon}</strong> - {item.location} ({item.evYield} EVs)
                    </li>
                  ))}
                </ul>
              ) : (
                <p>No recommendations available for this region.</p>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default RecommendationPopup;

import React from 'react';

// Reusable component for "Add to Analysis" button
function AddToAnalysisButton({ pokemon, onClick, slotIndex, darkMode }) {
  return (
    <button
      onClick={() => slotIndex !== undefined ? onClick(pokemon, slotIndex) : onClick(pokemon)}
      style={{
        flex: 1,
        padding: slotIndex !== undefined ? '5px 10px' : '10px',
        backgroundColor: darkMode ? '#3498DB' : '#27AE60',
        color: 'white',
        border: 'none',
        borderRadius: '5px',
        fontSize: slotIndex !== undefined ? '12px' : '14px',
        fontWeight: 'bold',
        cursor: 'pointer',
        transition: 'background-color 0.3s'
      }}
      onMouseEnter={e => e.target.style.backgroundColor = darkMode ? '#2980B9' : '#229954'}
      onMouseLeave={e => e.target.style.backgroundColor = darkMode ? '#3498DB' : '#27AE60'}
    >
      Add to Analysis
    </button>
  );
}

export default AddToAnalysisButton;

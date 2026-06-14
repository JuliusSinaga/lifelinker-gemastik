import React from 'react';
import './BloodTypeChip.css';

const BloodTypeChip = ({ type, count, unit = 'Kantong' }) => {
  return (
    <div className="core-blood-chip-container">
      <div className="core-blood-chip">
        <span className="core-blood-chip-type">{type}</span>
      </div>
      {(count !== undefined) && (
        <div className="core-blood-chip-info">
          <span className="core-blood-chip-count">{count}</span>
          <span className="core-blood-chip-unit">{unit}</span>
        </div>
      )}
    </div>
  );
};

export default BloodTypeChip;

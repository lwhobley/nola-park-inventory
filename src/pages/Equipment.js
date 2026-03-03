import React, { useState, useEffect } from 'react';
import EquipmentMaintenance from '../components/EquipmentMaintenance';
import '../styles/pages.css';

function Equipment() {
  const [equipment, setEquipment] = useState([]);

  useEffect(() => {
    // Load equipment data from Supabase
  }, []);

  return (
    <div className="equipment-page">
      <h1>Equipment Maintenance</h1>
      <div className="equipment-controls">
        <button className="btn-primary">Add Equipment</button>
        <button className="btn-secondary">Schedule Maintenance</button>
      </div>
      <EquipmentMaintenance equipment={equipment} />
    </div>
  );
}

export default Equipment;

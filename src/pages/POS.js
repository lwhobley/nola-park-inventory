import React, { useState, useEffect } from 'react';
import PosIntegration from '../components/PosIntegration';
import '../styles/pages.css';

function POSPage() {
  const [posData, setPosData] = useState(null);
  const [syncStatus, setSyncStatus] = useState('idle');

  const handleSync = async () => {
    setSyncStatus('syncing');
    try {
      // Call POS service to sync data
      // await posService.syncSales();
      setSyncStatus('success');
    } catch (error) {
      setSyncStatus('error');
    }
  };

  return (
    <div className="pos-page">
      <h1>POS Integration</h1>
      <div className="pos-controls">
        <button 
          onClick={handleSync}
          disabled={syncStatus === 'syncing'}
          className="btn-primary"
        >
          {syncStatus === 'syncing' ? 'Syncing...' : 'Sync Now'}
        </button>
        <span className={`status-badge ${syncStatus}`}>
          {syncStatus.toUpperCase()}
        </span>
      </div>
      <PosIntegration posData={posData} />
    </div>
  );
}

export default POSPage;

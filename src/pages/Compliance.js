import React, { useState, useContext } from 'react';
import { InventoryContext } from '../context';
import ComplianceTracker from '../components/ComplianceTracker';
import '../styles/pages.css';

function Compliance() {
  const { inventory } = useContext(InventoryContext);
  const [complianceStatus, setComplianceStatus] = useState('pending');

  return (
    <div className="compliance-page">
      <h1>Compliance & Auditing</h1>
      <div className="compliance-overview">
        <div className="compliance-card">
          <h3>FSMA 204 Compliance</h3>
          <p className="status-badge fsma-compliant">Compliant</p>
        </div>
        <div className="compliance-card">
          <h3>Lot Tracking</h3>
          <p>Tracking {inventory.length} items</p>
        </div>
        <div className="compliance-card">
          <h3>Waste Documentation</h3>
          <p>0 items logged today</p>
        </div>
      </div>
      <ComplianceTracker inventory={inventory} />
    </div>
  );
}

export default Compliance;

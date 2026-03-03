// LocationSelector.js
import React, { useState } from 'react';

export function LocationSelector() {
  const [selectedLocation, setSelectedLocation] = useState(null);

  return (
    <div className="location-selector">
      <label>Select Location:</label>
      <select 
        value={selectedLocation || ''}
        onChange={(e) => setSelectedLocation(e.target.value)}
        className="location-select"
      >
        <option value="">All Locations</option>
        <option value="carousel">Carousel Gardens</option>
        <option value="biglake">Big Lake Snack Bar</option>
        <option value="cafedumond">Cafe Du Monde</option>
      </select>
    </div>
  );
}

// StockLevels.js
export function StockLevels({ inventory }) {
  return (
    <div className="stock-levels">
      <h2>Current Stock Levels</h2>
      {inventory && inventory.length > 0 ? (
        <div className="stock-list">
          {inventory.slice(0, 5).map((item) => (
            <div key={item.id} className="stock-item">
              <span className="item-name">{item.name}</span>
              <span className="item-stock">{item.stock_level}</span>
            </div>
          ))}
        </div>
      ) : (
        <p>No inventory data available</p>
      )}
    </div>
  );
}

// LowStockAlerts.js
export function LowStockAlerts({ inventory }) {
  const lowStockItems = inventory?.filter(
    (item) => item.stock_level <= item.reorder_point
  ) || [];

  return (
    <div className="low-stock-alerts">
      <h2>Low Stock Alerts</h2>
      {lowStockItems.length > 0 ? (
        <ul className="alert-list">
          {lowStockItems.map((item) => (
            <li key={item.id} className="alert-item">
              <strong>{item.name}</strong>: {item.stock_level} units
            </li>
          ))}
        </ul>
      ) : (
        <p className="no-alerts">All items are well stocked</p>
      )}
    </div>
  );
}

// WeatherWidget.js
export function WeatherWidget() {
  const [weather, setWeather] = useState(null);

  return (
    <div className="weather-widget">
      <h2>NOLA Weather</h2>
      {weather ? (
        <div className="weather-info">
          <p>Temperature: {weather.temp}°F</p>
          <p>Condition: {weather.condition}</p>
          <p>Impact: Affects inventory forecasting</p>
        </div>
      ) : (
        <p>Loading weather data...</p>
      )}
    </div>
  );
}

// PosIntegration.js
export function PosIntegration({ posData }) {
  return (
    <div className="pos-integration">
      <h2>POS Integration</h2>
      {posData ? (
        <div className="pos-data">
          <p>Connected POS System</p>
        </div>
      ) : (
        <p>Configure POS integration</p>
      )}
    </div>
  );
}

// VoiceAudit.js
export function VoiceAudit() {
  return (
    <div className="voice-audit">
      <h2>Voice Audit</h2>
      <button className="btn-primary">Start Voice Counting</button>
    </div>
  );
}

// EquipmentMaintenance.js
export function EquipmentMaintenance({ equipment }) {
  return (
    <div className="equipment-maintenance">
      <h2>Equipment Maintenance Schedule</h2>
      {equipment && equipment.length > 0 ? (
        <div className="equipment-list">
          {equipment.map((item) => (
            <div key={item.id} className="equipment-item">
              <h3>{item.name}</h3>
              <p>Last Maintenance: {item.last_maintenance}</p>
            </div>
          ))}
        </div>
      ) : (
        <p>No equipment records</p>
      )}
    </div>
  );
}

// CostAnalysis.js
export function CostAnalysis({ dateRange }) {
  return (
    <div className="cost-analysis">
      <h2>Cost Analysis - {dateRange}</h2>
      <div className="analysis-chart">
        <p>COGS Variance Analysis</p>
      </div>
    </div>
  );
}

// ComplianceTracker.js
export function ComplianceTracker({ inventory }) {
  return (
    <div className="compliance-tracker">
      <h2>Compliance Tracking</h2>
      <div className="compliance-items">
        <div className="compliance-item">
          <h3>FSMA 204 Lot Tracking</h3>
          <p>{inventory?.length || 0} items being tracked</p>
        </div>
        <div className="compliance-item">
          <h3>Waste Documentation</h3>
          <p>All waste logged and documented</p>
        </div>
      </div>
    </div>
  );
}

// ErrorBoundary.js
export class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    console.error('Error caught:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return <h1>Something went wrong. Please refresh the page.</h1>;
    }

    return this.props.children;
  }
}

export default {
  LocationSelector,
  StockLevels,
  LowStockAlerts,
  WeatherWidget,
  PosIntegration,
  VoiceAudit,
  EquipmentMaintenance,
  CostAnalysis,
  ComplianceTracker,
  ErrorBoundary,
};

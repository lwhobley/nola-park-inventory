import React, { useContext } from 'react';
import { AppContext, InventoryContext } from '../context';
import InventoryDashboard from '../components/InventoryDashboard';
import LocationSelector from '../components/LocationSelector';
import StockLevels from '../components/StockLevels';
import LowStockAlerts from '../components/LowStockAlerts';
import WeatherWidget from '../components/WeatherWidget';
import '../styles/pages.css';

function Dashboard() {
  const { appState } = useContext(AppContext);
  const { inventory } = useContext(InventoryContext);

  return (
    <div className="dashboard-page">
      <h1>Inventory Dashboard</h1>
      <LocationSelector />
      <div className="dashboard-grid">
        <div className="dashboard-main">
          <InventoryDashboard />
          <StockLevels inventory={inventory} />
        </div>
        <div className="dashboard-sidebar">
          <WeatherWidget />
          <LowStockAlerts inventory={inventory} />
        </div>
      </div>
    </div>
  );
}

export default Dashboard;

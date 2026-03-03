import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import './styles/App.css';
import { AuthContext } from './context/AuthContext';
import { InventoryContext } from './context/InventoryContext';
import { AppContext } from './context/AppContext';
import ErrorBoundary from './components/ErrorBoundary';

// Pages
import Dashboard from './pages/Dashboard';
import Inventory from './pages/Inventory';
import POS from './pages/POS';
import Compliance from './pages/Compliance';
import Equipment from './pages/Equipment';
import Reports from './pages/Reports';
import Settings from './pages/Settings';
import NotFound from './pages/NotFound';

function App() {
  const [auth, setAuth] = useState(null);
  const [inventory, setInventory] = useState([]);
  const [appState, setAppState] = useState({
    loading: false,
    error: null,
    selectedLocation: null,
  });

  useEffect(() => {
    // Initialize app
    // Check authentication
    // Load initial data
  }, []);

  return (
    <ErrorBoundary>
      <AuthContext.Provider value={{ auth, setAuth }}>
        <InventoryContext.Provider value={{ inventory, setInventory }}>
          <AppContext.Provider value={{ appState, setAppState }}>
            <Router>
              <div className="App">
                <Routes>
                  <Route path="/" element={<Dashboard />} />
                  <Route path="/inventory" element={<Inventory />} />
                  <Route path="/pos" element={<POS />} />
                  <Route path="/compliance" element={<Compliance />} />
                  <Route path="/equipment" element={<Equipment />} />
                  <Route path="/reports" element={<Reports />} />
                  <Route path="/settings" element={<Settings />} />
                  <Route path="*" element={<NotFound />} />
                </Routes>
              </div>
            </Router>
          </AppContext.Provider>
        </InventoryContext.Provider>
      </AuthContext.Provider>
    </ErrorBoundary>
  );
}

export default App;

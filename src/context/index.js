import React from 'react';

// Authentication Context
export const AuthContext = React.createContext({
  auth: null,
  setAuth: () => {},
});

// Inventory Context
export const InventoryContext = React.createContext({
  inventory: [],
  setInventory: () => {},
  loadInventory: async () => {},
});

// App Global Context
export const AppContext = React.createContext({
  appState: {
    loading: false,
    error: null,
    selectedLocation: null,
    setSelectedLocation: () => {},
  },
});

// Export provider components
export function AuthProvider({ children, value }) {
  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function InventoryProvider({ children, value }) {
  return (
    <InventoryContext.Provider value={value}>
      {children}
    </InventoryContext.Provider>
  );
}

export function AppProvider({ children, value }) {
  return (
    <AppContext.Provider value={value}>
      {children}
    </AppContext.Provider>
  );
}

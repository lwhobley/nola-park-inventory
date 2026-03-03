// AuthContext.js
import React from 'react';

export const AuthContext = React.createContext({
  auth: null,
  setAuth: () => {},
});

// InventoryContext.js
export const InventoryContext = React.createContext({
  inventory: [],
  setInventory: () => {},
});

// AppContext.js
export const AppContext = React.createContext({
  appState: {},
  setAppState: () => {},
});

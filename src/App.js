import React, { useState, useEffect, useMemo } from 'react';
import { Platform, View, Text, ActivityIndicator } from 'react-native';
import { AuthContext, InventoryContext, AppContext } from './context';
import ErrorBoundary from './components/ErrorBoundary';
import { useLoadingState } from './hooks/useLoadingState';

// Navigation
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';

// Pages/Screens
import Dashboard from './pages/Dashboard';
import Inventory from './pages/Inventory';
import POSScreen from './pages/POS';
import Compliance from './pages/Compliance';
import Equipment from './pages/Equipment';
import Reports from './pages/Reports';
import Settings from './pages/Settings';

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

function DashboardStack() {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: true,
        headerBackTitleVisible: false,
      }}
    >
      <Stack.Screen 
        name="DashboardScreen" 
        component={Dashboard}
        options={{ title: 'Dashboard' }}
      />
    </Stack.Navigator>
  );
}

function InventoryStack() {
  return (
    <Stack.Navigator>
      <Stack.Screen 
        name="InventoryScreen" 
        component={Inventory}
        options={{ title: 'Inventory' }}
      />
    </Stack.Navigator>
  );
}

function AppTabs() {
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: '#007bff',
        tabBarInactiveTintColor: '#999',
      }}
    >
      <Tab.Screen 
        name="Dashboard" 
        component={DashboardStack}
        options={{
          tabBarLabel: 'Dashboard',
        }}
      />
      <Tab.Screen 
        name="Inventory" 
        component={InventoryStack}
        options={{
          tabBarLabel: 'Inventory',
        }}
      />
      <Tab.Screen 
        name="POS" 
        component={POSScreen}
        options={{
          tabBarLabel: 'POS',
        }}
      />
      <Tab.Screen 
        name="Compliance" 
        component={Compliance}
        options={{
          tabBarLabel: 'Compliance',
        }}
      />
      <Tab.Screen 
        name="Settings" 
        component={Settings}
        options={{
          tabBarLabel: 'Settings',
        }}
      />
    </Tab.Navigator>
  );
}

function App() {
  const [auth, setAuth] = useState(null);
  const [inventory, setInventory] = useState([]);
  const { loading, setLoading, error, setError } = useLoadingState();
  const [selectedLocation, setSelectedLocation] = useState(null);
  const [initialized, setInitialized] = useState(false);

  // Initialize app
  useEffect(() => {
    const initializeApp = async () => {
      try {
        setLoading(true);
        
        // Try to load Supabase, but don't fail if it's not configured
        try {
          const { supabase } = await import('./services');
          const { data } = await supabase.auth.getSession();
          setAuth(data?.session?.user || null);
          
          // Load initial inventory if authenticated
          if (data?.session?.user) {
            await loadInventory();
          }
        } catch (supabaseError) {
          console.warn('Supabase not configured:', supabaseError.message);
          // Continue without authentication
          setAuth(null);
        }
      } catch (err) {
        console.error('App initialization error:', err);
        setError(err.message);
      } finally {
        setLoading(false);
        setInitialized(true);
      }
    };

    initializeApp();
  }, []);

  const loadInventory = async () => {
    try {
      const { supabase } = await import('./services');
      const { data, error } = await supabase
        .from('inventory_items')
        .select('*')
        .limit(100);
      
      if (error) throw error;
      setInventory(data || []);
    } catch (err) {
      console.warn('Failed to load inventory:', err.message);
      // Continue without inventory data
    }
  };

  const appState = useMemo(() => ({
    loading,
    error,
    selectedLocation,
    setSelectedLocation,
  }), [loading, error, selectedLocation]);

  // Show loading state while initializing
  if (!initialized) {
    return (
      <ErrorBoundary>
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#f5f5f5' }}>
          <ActivityIndicator size="large" color="#007bff" />
          <Text style={{ marginTop: 12, color: '#666', fontSize: 14 }}>
            Initializing App...
          </Text>
        </View>
      </ErrorBoundary>
    );
  }

  return (
    <ErrorBoundary>
      <AuthContext.Provider value={{ auth, setAuth }}>
        <InventoryContext.Provider value={{ inventory, setInventory, loadInventory }}>
          <AppContext.Provider value={{ appState }}>
            <NavigationContainer>
              {/* Always show AppTabs - app works with or without authentication */}
              <AppTabs />
            </NavigationContainer>
          </AppContext.Provider>
        </InventoryContext.Provider>
      </AuthContext.Provider>
    </ErrorBoundary>
  );
}

export default App;

/**
 * NOLA City Park Multi-Location Inventory & Operations Engine
 * Main App.js with Supabase, TanStack Query, and Real-time POS Integration
 * ============================================================================
 */

import React, { useEffect, useState } from 'react';
import { createClient } from '@supabase/supabase-js';
import { QueryClient, QueryClientProvider, useQueryClient, useQuery } from '@tanstack/react-query';
import { onPersist } from '@tanstack/react-query-persist-client';
import { createSyncStoragePersister } from '@tanstack/query-sync-storage-persister';

// Environment configuration
import config from './config.environment';

// Main Components
import AppNavigation from './navigation/AppNavigation';
import SplashScreen from './screens/SplashScreen';
import ErrorBoundary from './components/ErrorBoundary';
import OfflineIndicator from './components/OfflineIndicator';
import NotificationCenter from './components/NotificationCenter';

// ============================================================================
// 1. SUPABASE CLIENT INITIALIZATION
// ============================================================================

export const supabase = createClient(
  config.SUPABASE_URL,
  config.SUPABASE_ANON_KEY,
  {
    auth: {
      autoRefreshToken: true,
      persistSession: true,
      detectSessionInUrl: true,
    },
    realtime: {
      params: {
        eventsPerSecond: 10,
      },
    },
  }
);

// ============================================================================
// 2. TANSTACK QUERY SETUP WITH OFFLINE-FIRST CACHING
// ============================================================================

const localStoragePersister = createSyncStoragePersister({
  storage: typeof window !== 'undefined' ? window.localStorage : null,
});

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      gcTime: 1000 * 60 * 60 * 24, 
      staleTime: 1000 * 60 * 5, 
      retry: 3,
      networkMode: 'always', 
    },
    mutations: {
      retry: 1,
      networkMode: 'always',
    },
  },
});

onPersist({
  queryClient,
  persister: localStoragePersister,
  maxAge: 1000 * 60 * 60 * 24,
});

// ============================================================================
// 3. MAIN APP CONTENT COMPONENT
// ============================================================================

function AppContent() {
  const [isAppReady, setIsAppReady] = useState(false);
  const [appError, setAppError] = useState(null);
  const { isOnline } = useNetworkStatus();

  useEffect(() => {
    const initializeApp = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (session) setupRealtimeListeners();
        if (config.ENABLE_POS_SYNC) initPOSSync();
        await validateDatabaseSchema();
        setIsAppReady(true);
      } catch (error) {
        console.error('App initialization error:', error);
        setAppError(error.message);
      }
    };
    initializeApp();
  }, []);

  const setupRealtimeListeners = () => {
    const inventorySubscription = supabase
      .channel('inventory_updates')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'location_inventory' }, (payload) => {
          queryClient.invalidateQueries({ queryKey: ['location_inventory', payload.new.location_id] });
      }).subscribe();

    return { inventorySubscription };
  };

  const initPOSSync = async () => {
    setInterval(async () => { await syncPOSTransactions(); }, 1000 * 60 * 5);
  };

  const syncPOSTransactions = async () => { /* Logic existing in your file */ };

  const validateDatabaseSchema = async () => {
    const { error } = await supabase.from('organizations').select('id').limit(1);
    if (error) throw new Error('Database schema validation failed');
  };

  if (!isAppReady) return <SplashScreen />;

  if (appError) {
    return (
      <div style={{ padding: '20px' }}>
        <h2>App Initialization Error</h2>
        <p>{appError}</p>
        <button onClick={() => window.location.reload()}>Retry</button>
      </div>
    );
  }

  return (
    <>
      <OfflineIndicator isOnline={isOnline} />
      <AppNavigation />
      <NotificationCenter />
    </>
  );
}

// ============================================================================
// 4. ROOT APP (ONLY DEFAULT EXPORT)
// ============================================================================

export default function App() {
  return (
    <ErrorBoundary fallback={<h1>Application Error</h1>}>
      <QueryClientProvider client={queryClient}>
        <AuthProvider>
          <InventoryProvider>
            <POSIntegrationProvider>
              <AppContent />
            </POSIntegrationProvider>
          </InventoryProvider>
        </AuthProvider>
      </QueryClientProvider>
    </ErrorBoundary>
  );
}

// ============================================================================
// 5. SUPPORTING HOOKS & CONTEXTS (RE-DECLARED HERE FOR "MEGA-FILE" USAGE)
// ============================================================================

export const useNetworkStatus = () => {
  const [isOnline, setIsOnline] = useState(typeof navigator !== 'undefined' ? navigator.onLine : true);
  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);
  return { isOnline };
};

export const AuthContext = React.createContext();
export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
      setLoading(false);
    });
  }, []);
  return <AuthContext.Provider value={{ user, loading }}>{children}</AuthContext.Provider>;
};

export const InventoryContext = React.createContext();
export const InventoryProvider = ({ children }) => {
  return <InventoryContext.Provider value={{}}>{children}</InventoryContext.Provider>;
};

export const POSIntegrationContext = React.createContext();
export const POSIntegrationProvider = ({ children }) => {
  return <POSIntegrationContext.Provider value={{}}>{children}</POSIntegrationContext.Provider>;
};

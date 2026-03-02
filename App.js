/**
 * NOLA City Park Multi-Location Inventory & Operations Engine
 * Main App.js with Supabase, TanStack Query, and Real-time POS Integration
 * ============================================================================
 */

import React, { useEffect, useState } from 'react';
import { createClient } from '@supabase/supabase-js';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { onPersist } from '@tanstack/react-query-persist-client';
import { createSyncStoragePersister } from '@tanstack/query-sync-storage-persister';

// Environment configuration
import config from './config/environment';

// Main Components
import AppNavigation from './navigation/AppNavigation';
import SplashScreen from './screens/SplashScreen';
import ErrorBoundary from './components/ErrorBoundary';
import OfflineIndicator from './components/OfflineIndicator';
import NotificationCenter from './components/NotificationCenter';

// Hooks & Context
import { AuthProvider } from './context/AuthContext';
import { InventoryProvider } from './context/InventoryContext';
import { POSIntegrationProvider } from './context/POSIntegrationContext';
import { useNetworkStatus } from './hooks/useNetworkStatus';

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

// Local Storage Persister for Offline Cache
const localStoragePersister = createSyncStoragePersister({
  storage: typeof window !== 'undefined' ? window.localStorage : null,
});

// Query Client Configuration
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      gcTime: 1000 * 60 * 60 * 24, // 24 hour cache
      staleTime: 1000 * 60 * 5, // 5 minutes
      retry: 3,
      retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
      networkMode: 'always', // Try to fetch even when offline
    },
    mutations: {
      retry: 1,
      networkMode: 'always',
    },
  },
});

// Enable persistence on mount
onPersist({
  queryClient,
  persister: localStoragePersister,
  maxAge: 1000 * 60 * 60 * 24, // 24 hours
});

// ============================================================================
// 3. MAIN APP COMPONENT
// ============================================================================

function AppContent() {
  const [isAppReady, setIsAppReady] = useState(false);
  const [appError, setAppError] = useState(null);
  const { isOnline } = useNetworkStatus();

  useEffect(() => {
    initializeApp();
  }, []);

  const initializeApp = async () => {
    try {
      // 1. Initialize Supabase Auth
      const { data: { session } } = await supabase.auth.getSession();

      // 2. Set up real-time listeners
      if (session) {
        setupRealtimeListeners();
      }

      // 3. Initialize POS sync if not already running
      if (config.ENABLE_POS_SYNC) {
        initPOSSync();
      }

      // 4. Check for pending migrations / schema version
      await validateDatabaseSchema();

      setIsAppReady(true);
    } catch (error) {
      console.error('App initialization error:', error);
      setAppError(error.message);
    }
  };

  const setupRealtimeListeners = () => {
    // Real-time listener for inventory changes
    const inventorySubscription = supabase
      .channel('inventory_updates')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'location_inventory',
        },
        (payload) => {
          console.log('Inventory changed:', payload);
          // Invalidate related queries
          queryClient.invalidateQueries({
            queryKey: ['location_inventory', payload.new.location_id],
          });
        }
      )
      .subscribe();

    // Real-time listener for alerts
    const alertsSubscription = supabase
      .channel('alerts')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'alerts',
        },
        (payload) => {
          console.log('New alert:', payload.new);
          // Show notification
          NotificationCenter.show({
            type: 'alert',
            severity: payload.new.severity,
            message: payload.new.message,
          });
          queryClient.invalidateQueries({ queryKey: ['alerts'] });
        }
      )
      .subscribe();

    // Real-time listener for menu item status (Auto-86 sync)
    const menuItemStatusSubscription = supabase
      .channel('menu_item_status')
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'menu_item_status',
        },
        async (payload) => {
          console.log('Menu item status changed:', payload.new);
          // Trigger POS sync if not already synced
          if (!payload.new.synced_to_pos) {
            await syncMenuItemStatusToPOS(payload.new);
          }
        }
      )
      .subscribe();

    return {
      inventorySubscription,
      alertsSubscription,
      menuItemStatusSubscription,
    };
  };

  const syncMenuItemStatusToPOS = async (menuItemStatus) => {
    try {
      const { data: menuItem } = await supabase
        .from('menu_items')
        .select('location_id, pos_menu_id')
        .eq('id', menuItemStatus.menu_item_id)
        .single();

      const { data: posSystem } = await supabase
        .from('pos_systems')
        .select('system_type, api_key, api_secret')
        .eq('location_id', menuItem.location_id)
        .single();

      // Route to appropriate POS system
      let syncResult;
      if (posSystem.system_type === 'toast') {
        syncResult = await syncToastPOS(
          posSystem,
          menuItem.pos_menu_id,
          menuItemStatus.is_disabled_on_pos
        );
      } else if (posSystem.system_type === 'square') {
        syncResult = await syncSquarePOS(
          posSystem,
          menuItem.pos_menu_id,
          menuItemStatus.is_disabled_on_pos
        );
      }

      if (syncResult.success) {
        // Mark as synced
        await supabase
          .from('menu_item_status')
          .update({ synced_to_pos: true, last_sync_attempt: new Date() })
          .eq('id', menuItemStatus.id);
      }
    } catch (error) {
      console.error('POS sync error:', error);
    }
  };

  const syncToastPOS = async (posSystem, menuItemId, isDisabled) => {
    // POST to Toast API
    const endpoint = `${config.TOAST_API_BASE_URL}/v1/menus/items/${menuItemId}`;
    const response = await fetch(endpoint, {
      method: 'PATCH',
      headers: {
        'Authorization': `Bearer ${posSystem.api_key}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        disabled: isDisabled,
        disabledReason: isDisabled ? 'OUT_OF_STOCK' : null,
      }),
    });
    return {
      success: response.ok,
      data: await response.json(),
    };
  };

  const syncSquarePOS = async (posSystem, menuItemId, isDisabled) => {
    // POST to Square API
    const endpoint = `${config.SQUARE_API_BASE_URL}/v2/catalog/objects`;
    const response = await fetch(endpoint, {
      method: 'PUT',
      headers: {
        'Square-Version': '2024-01-18',
        'Authorization': `Bearer ${posSystem.api_key}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        idempotencyKey: `sync-${menuItemId}-${Date.now()}`,
        object: {
          id: menuItemId,
          type: 'ITEM',
          itemData: {
            available: !isDisabled,
          },
        },
      }),
    });
    return {
      success: response.ok,
      data: await response.json(),
    };
  };

  const initPOSSync = async () => {
    // Initialize polling for POS transactions
    // Sync every 5 minutes or on demand
    setInterval(async () => {
      await syncPOSTransactions();
    }, 1000 * 60 * 5);
  };

  const syncPOSTransactions = async () => {
    try {
      // Get all active locations
      const { data: locations } = await supabase
        .from('locations')
        .select('id, type')
        .eq('is_active', true);

      for (const location of locations) {
        // Get POS system for this location
        const { data: posSystem } = await supabase
          .from('pos_systems')
          .select('*')
          .eq('location_id', location.id)
          .eq('sync_enabled', true)
          .single();

        if (!posSystem) continue;

        // Fetch latest transactions from POS
        let transactions = [];
        if (posSystem.system_type === 'toast') {
          transactions = await fetchToastTransactions(posSystem);
        } else if (posSystem.system_type === 'square') {
          transactions = await fetchSquareTransactions(posSystem);
        }

        // Insert into pos_transactions table
        if (transactions.length > 0) {
          const { error } = await supabase
            .from('pos_transactions')
            .insert(
              transactions.map((t) => ({
                location_id: location.id,
                menu_item_id: t.menuItemId,
                transaction_id: t.id,
                quantity_sold: t.quantity,
                unit_price: t.unitPrice,
                total_amount: t.totalAmount,
                transaction_date: t.timestamp,
              }))
            );

          if (error) {
            console.error('Failed to insert POS transactions:', error);
          } else {
            console.log(`Synced ${transactions.length} transactions for location ${location.id}`);
          }
        }

        // Update last_sync_at
        await supabase
          .from('pos_systems')
          .update({ last_sync_at: new Date() })
          .eq('id', posSystem.id);
      }
    } catch (error) {
      console.error('POS sync error:', error);
    }
  };

  const fetchToastTransactions = async (posSystem) => {
    const since = new Date(Date.now() - 1000 * 60 * 30); // Last 30 minutes
    const response = await fetch(
      `${config.TOAST_API_BASE_URL}/v1/orders?since=${since.toISOString()}`,
      {
        headers: {
          'Authorization': `Bearer ${posSystem.api_key}`,
        },
      }
    );
    const data = await response.json();
    return data.orders || [];
  };

  const fetchSquareTransactions = async (posSystem) => {
    const since = new Date(Date.now() - 1000 * 60 * 30); // Last 30 minutes
    const response = await fetch(
      `${config.SQUARE_API_BASE_URL}/v2/orders/search`,
      {
        method: 'POST',
        headers: {
          'Square-Version': '2024-01-18',
          'Authorization': `Bearer ${posSystem.api_key}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          query: {
            filter: {
              dateTimeFilter: {
                createdAt: {
                  startAt: since.toISOString(),
                },
              },
            },
          },
        }),
      }
    );
    const data = await response.json();
    return data.orders || [];
  };

  const validateDatabaseSchema = async () => {
    // Check database version / schema compatibility
    try {
      const { data, error } = await supabase
        .from('organizations')
        .select('id')
        .limit(1);

      if (error) {
        throw new Error('Database schema validation failed');
      }
    } catch (error) {
      console.error('Schema validation failed:', error);
      throw error;
    }
  };

  if (!isAppReady) {
    return <SplashScreen />;
  }

  if (appError) {
    return (
      <ErrorBoundary
        fallback={
          <div style={{ padding: '20px' }}>
            <h2>App Initialization Error</h2>
            <p>{appError}</p>
            <button onClick={() => window.location.reload()}>Retry</button>
          </div>
        }
      />
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
// 4. ROOT APP WITH PROVIDERS
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
// 5. SUPPORTING FILES & HOOKS
// ============================================================================

/**
 * hooks/useNetworkStatus.js
 * Detects online/offline status
 */
export const useNetworkStatus = () => {
  const [isOnline, setIsOnline] = useState(
    typeof navigator !== 'undefined' ? navigator.onLine : true
  );

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

/**
 * context/AuthContext.js
 * Manages authentication state and user permissions
 */
export const AuthContext = React.createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [org, setOrg] = useState(null);
  const [permissions, setPermissions] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase.auth.onAuthStateChange(async (event, session) => {
      if (session?.user) {
        setUser(session.user);
        await loadUserOrgAndPermissions(session.user.id);
      } else {
        setUser(null);
        setOrg(null);
        setPermissions({});
      }
      setLoading(false);
    });
  }, []);

  const loadUserOrgAndPermissions = async (userId) => {
    const { data: userData } = await supabase
      .from('users')
      .select('*, organizations(*)')
      .eq('id', userId)
      .single();

    if (userData) {
      setOrg(userData.organizations);
      setPermissions({
        canViewInventory: userData.role !== 'tenant_operator',
        canEditInventory: userData.role === 'admin' || userData.role === 'manager',
        canViewFinancials: userData.role === 'admin',
        canManageTransfers: userData.role !== 'tenant_operator',
      });
    }
  };

  const signOut = async () => {
    await supabase.auth.signOut();
    setUser(null);
    setOrg(null);
  };

  return (
    <AuthContext.Provider
      value={{ user, org, permissions, loading, signOut }}
    >
      {children}
    </AuthContext.Provider>
  );
};

/**
 * context/InventoryContext.js
 * Manages inventory state, caching, and mutations
 */
export const InventoryContext = React.createContext();

export const InventoryProvider = ({ children }) => {
  const queryClient = useQueryClient();

  const useLocationInventory = (locationId) => {
    return useQuery({
      queryKey: ['location_inventory', locationId],
      queryFn: async () => {
        const { data, error } = await supabase
          .from('location_inventory')
          .select('*, inventory_items(*)')
          .eq('location_id', locationId);

        if (error) throw error;
        return data;
      },
      enabled: !!locationId,
    });
  };

  const useWasteLog = (locationId) => {
    return useQuery({
      queryKey: ['waste_log', locationId],
      queryFn: async () => {
        const { data, error } = await supabase
          .from('waste_log')
          .select('*')
          .eq('location_id', locationId)
          .order('recorded_at', { ascending: false });

        if (error) throw error;
        return data;
      },
      enabled: !!locationId,
    });
  };

  const addWasteRecord = async (locationId, itemId, quantity, reason) => {
    const { data, error } = await supabase
      .from('waste_log')
      .insert([
        {
          location_id: locationId,
          item_id: itemId,
          quantity_wasted: quantity,
          waste_reason: reason,
          recorded_at: new Date(),
        },
      ]);

    if (error) throw error;

    // Invalidate related queries
    queryClient.invalidateQueries({
      queryKey: ['location_inventory', locationId],
    });
    queryClient.invalidateQueries({
      queryKey: ['waste_log', locationId],
    });

    return data;
  };

  return (
    <InventoryContext.Provider
      value={{
        useLocationInventory,
        useWasteLog,
        addWasteRecord,
      }}
    >
      {children}
    </InventoryContext.Provider>
  );
};

/**
 * context/POSIntegrationContext.js
 * Manages POS integrations and transactions
 */
export const POSIntegrationContext = React.createContext();

export const POSIntegrationProvider = ({ children }) => {
  const queryClient = useQueryClient();

  const usePOSTransactions = (locationId, dateRange) => {
    return useQuery({
      queryKey: ['pos_transactions', locationId, dateRange],
      queryFn: async () => {
        let query = supabase
          .from('pos_transactions')
          .select('*')
          .eq('location_id', locationId)
          .order('transaction_date', { ascending: false });

        if (dateRange) {
          query = query
            .gte('transaction_date', dateRange.start)
            .lt('transaction_date', dateRange.end);
        }

        const { data, error } = await query;

        if (error) throw error;
        return data;
      },
      enabled: !!locationId,
    });
  };

  const syncMenuItemStatus = async (menuItemId, isDisabled) => {
    const { data, error } = await supabase
      .from('menu_item_status')
      .update({ is_disabled_on_pos: isDisabled, synced_to_pos: false })
      .eq('menu_item_id', menuItemId);

    if (error) throw error;

    queryClient.invalidateQueries({
      queryKey: ['menu_item_status'],
    });

    return data;
  };

  return (
    <POSIntegrationContext.Provider
      value={{
        usePOSTransactions,
        syncMenuItemStatus,
      }}
    >
      {children}
    </POSIntegrationContext.Provider>
  );
};

// ============================================================================
// 6. CUSTOM HOOKS
// ============================================================================

/**
 * useInventoryMovements.js
 * Record inventory movements (purchases, waste, transfers)
 */
export const useInventoryMovements = () => {
  const queryClient = useQueryClient();

  const recordMovement = async ({
    locationId,
    itemId,
    movementType,
    quantity,
    referenceId,
    notes,
  }) => {
    const { data, error } = await supabase
      .from('inventory_movements')
      .insert([
        {
          location_id: locationId,
          item_id: itemId,
          movement_type: movementType,
          quantity,
          reference_id: referenceId,
          notes,
          recorded_by: (await supabase.auth.getUser()).data.user.id,
          recorded_at: new Date(),
        },
      ]);

    if (error) throw error;

    // Invalidate inventory queries
    queryClient.invalidateQueries({
      queryKey: ['location_inventory', locationId],
    });

    return data;
  };

  return { recordMovement };
};

/**
 * useDemandForecast.js
 * Fetch AI-powered demand forecasts based on weather & historical data
 */
export const useDemandForecast = (locationId, itemId, forecastDate) => {
  return useQuery({
    queryKey: ['demand_forecast', locationId, itemId, forecastDate],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('demand_forecasts')
        .select('*')
        .eq('location_id', locationId)
        .eq('item_id', itemId)
        .eq('forecast_date', forecastDate)
        .single();

      if (error && error.code !== 'PGRST116') throw error;

      return data || null;
    },
  });
};

/**
 * useWeatherData.js
 * Fetch weather forecasts for dynamic stock alerts
 */
export const useWeatherData = (locationId, forecastDate) => {
  return useQuery({
    queryKey: ['weather_data', locationId, forecastDate],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('weather_data')
        .select('*')
        .eq('location_id', locationId)
        .eq('forecast_date', forecastDate)
        .single();

      if (error && error.code !== 'PGRST116') throw error;

      return data || null;
    },
  });
};

// ============================================================================
// 7. UTILITY FUNCTIONS
// ============================================================================

/**
 * calculateTheoreticalCOGS.js
 * Calculates COGS from POS sales vs actual physical stock
 */
export const calculateTheoreticalCOGS = async (
  locationId,
  startDate,
  endDate
) => {
  const { data: transactions, error: txError } = await supabase
    .from('pos_transactions')
    .select('menu_item_id, quantity_sold, unit_price')
    .eq('location_id', locationId)
    .gte('transaction_date', startDate)
    .lt('transaction_date', endDate);

  if (txError) throw txError;

  let totalCOGS = 0;

  for (const tx of transactions) {
    const { data: recipeLines } = await supabase
      .from('recipe_lines')
      .select('inventory_item_id, quantity_per_unit, unit_type')
      .eq('menu_item_id', tx.menu_item_id);

    for (const line of recipeLines) {
      const { data: item } = await supabase
        .from('inventory_items')
        .select('unit_cost')
        .eq('id', line.inventory_item_id)
        .single();

      totalCOGS +=
        line.quantity_per_unit * item.unit_cost * tx.quantity_sold;
    }
  }

  return totalCOGS;
};

/**
 * generatePurchaseOrder.js
 * Auto-generate POs based on current stock, lead times, and forecasts
 */
export const generatePurchaseOrder = async (locationId) => {
  const { data: inventory } = await supabase
    .from('location_inventory')
    .select('*, inventory_items(*)')
    .eq('location_id', locationId);

  const orders = [];

  for (const item of inventory) {
    if (item.quantity_on_hand <= item.inventory_items.reorder_point) {
      orders.push({
        item_id: item.inventory_items.id,
        quantity_to_order: item.inventory_items.reorder_quantity,
        supplier_id: item.inventory_items.supplier_id,
      });
    }
  }

  return orders;
};

/**
 * recordVoiceAudit.js
 * Voice-to-text inventory auditing for hands-free counting
 */
export const recordVoiceAudit = async (
  locationId,
  audioBlob,
  transcription
) => {
  // Upload audio to Supabase Storage
  const fileName = `audits/${locationId}/${Date.now()}.wav`;
  const { data: uploadData, error: uploadError } = await supabase.storage
    .from('voice_audits')
    .upload(fileName, audioBlob);

  if (uploadError) throw uploadError;

  // Insert audit record
  const { data: auditData, error: auditError } = await supabase
    .from('voice_audits')
    .insert([
      {
        location_id: locationId,
        audio_file_url: uploadData.path,
        transcription,
        started_by: (await supabase.auth.getUser()).data.user.id,
        status: 'in_progress',
      },
    ])
    .select()
    .single();

  if (auditError) throw auditError;

  return auditData;
};

export default App;

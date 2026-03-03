// api.js
export const api = {
  async fetchData(endpoint) {
    try {
      if (!endpoint) {
        throw new Error('Endpoint is required');
      }
      
      const response = await fetch(endpoint);
      
      if (!response.ok) {
        throw new Error(`API error: ${response.status} ${response.statusText}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error('API fetch error:', error);
      throw error; // Re-throw for caller to handle
    }
  },

  async postData(endpoint, data) {
    try {
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        throw new Error(`API error: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('API post error:', error);
      throw error;
    }
  },
};

// helpers.js
export const helpers = {
  formatCurrency(amount) {
    if (typeof amount !== 'number') {
      return '$0.00';
    }
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  },

  formatDate(date) {
    try {
      if (!date) return 'N/A';
      return new Intl.DateTimeFormat('en-US').format(new Date(date));
    } catch (error) {
      console.error('Date format error:', error);
      return 'Invalid Date';
    }
  },

  truncateString(str, length = 50) {
    if (!str || typeof str !== 'string') return '';
    return str.length > length ? str.substring(0, length) + '...' : str;
  },

  getStockStatus(currentStock, reorderPoint) {
    if (currentStock === 0) return 'out';
    if (currentStock <= reorderPoint) return 'low';
    return 'ok';
  },
};

// validators.js
export const validators = {
  isValidEmail(email) {
    if (!email || typeof email !== 'string') return false;
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
  },

  isValidPhone(phone) {
    if (!phone || typeof phone !== 'string') return false;
    const re = /^\+?1?\d{9,15}$/;
    return re.test(phone.replace(/\D/g, ''));
  },

  isValidSKU(sku) {
    if (!sku || typeof sku !== 'string') return false;
    return sku.trim().length > 0 && sku.length <= 100;
  },

  isValidNumber(value) {
    return !isNaN(parseFloat(value)) && isFinite(value);
  },
};

// constants.js
export const LOCATIONS = [
  { id: 'carousel', name: 'Carousel Gardens' },
  { id: 'biglake', name: 'Big Lake Snack Bar' },
  { id: 'cafedumond', name: 'Cafe Du Monde' },
];

export const CATEGORIES = [
  'Food',
  'Beverage',
  'Supplies',
  'Equipment',
];

export const STOCK_STATUS = {
  OK: 'ok',
  LOW: 'low',
  OUT: 'out',
};

export const STATUS_COLORS = {
  ok: '#28a745',
  low: '#ffc107',
  out: '#dc3545',
};

export const REPORT_TYPES = [
  { value: 'inventory', label: 'Inventory Report' },
  { value: 'sales', label: 'Sales Report' },
  { value: 'waste', label: 'Waste Report' },
  { value: 'cogs', label: 'COGS Analysis' },
  { value: 'compliance', label: 'Compliance Report' },
];

export const DATE_RANGES = [
  { value: 'week', label: 'This Week' },
  { value: 'month', label: 'This Month' },
  { value: 'quarter', label: 'This Quarter' },
  { value: 'year', label: 'This Year' },
];

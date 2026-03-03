// api.js
export const api = {
  async fetchData(endpoint) {
    try {
      const response = await fetch(endpoint);
      return await response.json();
    } catch (error) {
      console.error('API fetch error:', error);
      throw error;
    }
  },
};

// helpers.js
export const helpers = {
  formatCurrency(amount) {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  },

  formatDate(date) {
    return new Intl.DateTimeFormat('en-US').format(new Date(date));
  },

  truncateString(str, length = 50) {
    return str.length > length ? str.substring(0, length) + '...' : str;
  },
};

// validators.js
export const validators = {
  isValidEmail(email) {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
  },

  isValidPhone(phone) {
    const re = /^\+?1?\d{9,15}$/;
    return re.test(phone);
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

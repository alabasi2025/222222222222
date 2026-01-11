const API_BASE_URL = import.meta.env.VITE_API_URL || '/api';

// Generic API call function
async function apiCall<T>(endpoint: string, options?: RequestInit): Promise<T> {
  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...options?.headers,
    },
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: 'فشل الاتصال بالخادم' }));
    throw new Error(error.message || `HTTP error! status: ${response.status}`);
  }

  return response.json();
}

// Entities API
export const entitiesApi = {
  getAll: () => apiCall<any[]>('/entities'),
  getById: (id: string) => apiCall<any>(`/entities/${id}`),
  create: (data: any) => apiCall<any>('/entities', {
    method: 'POST',
    body: JSON.stringify(data),
  }),
  update: (id: string, data: any) => apiCall<any>(`/entities/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  }),
  delete: (id: string) => apiCall<void>(`/entities/${id}`, {
    method: 'DELETE',
  }),
};

// Accounts API
export const accountsApi = {
  getAll: () => apiCall<any[]>('/accounts'),
  getById: (id: string) => apiCall<any>(`/accounts/${id}`),
  getByEntity: (entityId: string) => apiCall<any[]>(`/accounts/entity/${entityId}`),
  create: (data: any) => apiCall<any>('/accounts', {
    method: 'POST',
    body: JSON.stringify(data),
  }),
  update: (id: string, data: any) => apiCall<any>(`/accounts/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  }),
  delete: (id: string) => apiCall<void>(`/accounts/${id}`, {
    method: 'DELETE',
  }),
};

// Cash Boxes API
export const cashBoxesApi = {
  getAll: () => apiCall<any[]>('/cash-boxes'),
  getById: (id: string) => apiCall<any>(`/cash-boxes/${id}`),
  getByEntity: (entityId: string) => apiCall<any[]>(`/cash-boxes?entityId=${entityId}`),
  create: (data: any) => apiCall<any>('/cash-boxes', {
    method: 'POST',
    body: JSON.stringify(data),
  }),
  update: (id: string, data: any) => apiCall<any>(`/cash-boxes/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  }),
  delete: (id: string) => apiCall<void>(`/cash-boxes/${id}`, {
    method: 'DELETE',
  }),
};

// Banks & Wallets API
export const banksWalletsApi = {
  getAll: () => apiCall<any[]>('/banks-wallets'),
  getById: (id: string) => apiCall<any>(`/banks-wallets/${id}`),
  getByEntity: (entityId: string) => apiCall<any[]>(`/banks-wallets?entityId=${entityId}`),
  create: (data: any) => apiCall<any>('/banks-wallets', {
    method: 'POST',
    body: JSON.stringify(data),
  }),
  update: (id: string, data: any) => apiCall<any>(`/banks-wallets/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  }),
  delete: (id: string) => apiCall<void>(`/banks-wallets/${id}`, {
    method: 'DELETE',
  }),
};

// Journal Entries API
export const journalEntriesApi = {
  getAll: () => apiCall<any[]>('/journal-entries'),
  getById: (id: string) => apiCall<any>(`/journal-entries/${id}`),
  getByEntity: (entityId: string) => apiCall<any[]>(`/journal-entries?entityId=${entityId}`),
  create: (data: any) => apiCall<any>('/journal-entries', {
    method: 'POST',
    body: JSON.stringify(data),
  }),
  update: (id: string, data: any) => apiCall<any>(`/journal-entries/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  }),
  delete: (id: string) => apiCall<void>(`/journal-entries/${id}`, {
    method: 'DELETE',
  }),
};

// Journal Entry Lines API
export const journalEntryLinesApi = {
  getAll: () => apiCall<any[]>('/journal-entry-lines'),
  getById: (id: string) => apiCall<any>(`/journal-entry-lines/${id}`),
  getByEntry: (entryId: string) => apiCall<any[]>(`/journal-entry-lines/entry/${entryId}`),
  create: (data: any) => apiCall<any>('/journal-entry-lines', {
    method: 'POST',
    body: JSON.stringify(data),
  }),
  update: (id: string, data: any) => apiCall<any>(`/journal-entry-lines/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  }),
  delete: (id: string) => apiCall<void>(`/journal-entry-lines/${id}`, {
    method: 'DELETE',
  }),
};


// Inventory (Items) API
export const inventoryApi = {
  getAll: () => apiCall<any[]>('/inventory'),
  getById: (id: string) => apiCall<any>(`/inventory/${id}`),
  getByEntity: (entityId: string) => apiCall<any[]>(`/inventory/entity/${entityId}`),
  create: (data: any) => apiCall<any>('/inventory', {
    method: 'POST',
    body: JSON.stringify(data),
  }),
  update: (id: string, data: any) => apiCall<any>(`/inventory/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  }),
  delete: (id: string) => apiCall<void>(`/inventory/${id}`, {
    method: 'DELETE',
  }),
};

// Warehouses API
export const warehousesApi = {
  getAll: () => apiCall<any[]>('/warehouses'),
  getById: (id: string) => apiCall<any>(`/warehouses/${id}`),
  getByEntity: (entityId: string) => apiCall<any[]>(`/warehouses/entity/${entityId}`),
  create: (data: any) => apiCall<any>('/warehouses', {
    method: 'POST',
    body: JSON.stringify(data),
  }),
  update: (id: string, data: any) => apiCall<any>(`/warehouses/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  }),
  delete: (id: string) => apiCall<void>(`/warehouses/${id}`, {
    method: 'DELETE',
  }),
};

// Item Categories API
export const itemCategoriesApi = {
  getAll: () => apiCall<any[]>('/item-categories'),
  getById: (id: string) => apiCall<any>(`/item-categories/${id}`),
  getByEntity: (entityId: string) => apiCall<any[]>(`/item-categories/entity/${entityId}`),
  create: (data: any) => apiCall<any>('/item-categories', {
    method: 'POST',
    body: JSON.stringify(data),
  }),
  update: (id: string, data: any) => apiCall<any>(`/item-categories/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  }),
  delete: (id: string) => apiCall<void>(`/item-categories/${id}`, {
    method: 'DELETE',
  }),
};

// Stock Movements API
export const stockMovementsApi = {
  getAll: () => apiCall<any[]>('/stock-movements'),
  getById: (id: string) => apiCall<any>(`/stock-movements/${id}`),
  getByEntity: (entityId: string) => apiCall<any[]>(`/stock-movements/entity/${entityId}`),
  getByItem: (itemId: string) => apiCall<any[]>(`/stock-movements/item/${itemId}`),
  getByWarehouse: (warehouseId: string) => apiCall<any[]>(`/stock-movements/warehouse/${warehouseId}`),
  create: (data: any) => apiCall<any>('/stock-movements', {
    method: 'POST',
    body: JSON.stringify(data),
  }),
};

// Item Stock API (stock levels per warehouse)
export const itemStockApi = {
  getByItem: (itemId: string) => apiCall<any[]>(`/item-stock/item/${itemId}`),
  getByWarehouse: (warehouseId: string) => apiCall<any[]>(`/item-stock/warehouse/${warehouseId}`),
  getByItemAndWarehouse: (itemId: string, warehouseId: string) => 
    apiCall<any>(`/item-stock/${itemId}/${warehouseId}`),
};

// Journal Entries API


// Dashboard API
export const dashboardApi = {
  getStats: () => apiCall<any>('/dashboard/stats'),
  getRevenueChart: () => apiCall<any[]>('/dashboard/charts/revenue'),
};

export const api = {
  get: <T>(url: string) => apiCall<T>(url),
  post: <T>(url: string, data: any) => apiCall<T>(url, { method: 'POST', body: JSON.stringify(data) }),
  put: <T>(url: string, data: any) => apiCall<T>(url, { method: 'PUT', body: JSON.stringify(data) }),
  delete: <T>(url: string) => apiCall<T>(url, { method: 'DELETE' }),
};

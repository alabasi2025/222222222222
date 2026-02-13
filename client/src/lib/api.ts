const API_BASE_URL = import.meta.env.VITE_API_URL || "/api";

// ===== Token Management =====
const TOKEN_KEY = "auth_token";
const REFRESH_TOKEN_KEY = "refresh_token";

export function getToken(): string | null {
  return localStorage.getItem(TOKEN_KEY);
}

export function getRefreshToken(): string | null {
  return localStorage.getItem(REFRESH_TOKEN_KEY);
}

export function setTokens(token: string, refreshToken?: string): void {
  localStorage.setItem(TOKEN_KEY, token);
  if (refreshToken) {
    localStorage.setItem(REFRESH_TOKEN_KEY, refreshToken);
  }
}

export function clearTokens(): void {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(REFRESH_TOKEN_KEY);
}

export function isAuthenticated(): boolean {
  return !!getToken();
}

// ===== Generic API Call Function =====
async function apiCall<T>(endpoint: string, options?: RequestInit): Promise<T> {
  const token = getToken();
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...(options?.headers as Record<string, string>),
  };

  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers,
  });

  // Handle 401 - Token expired
  if (response.status === 401) {
    const refreshToken = getRefreshToken();
    if (refreshToken) {
      try {
        const refreshResponse = await fetch(`${API_BASE_URL}/auth/refresh`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ refreshToken }),
        });
        if (refreshResponse.ok) {
          const data = await refreshResponse.json();
          setTokens(data.token, data.refreshToken);
          // Retry original request with new token
          headers["Authorization"] = `Bearer ${data.token}`;
          const retryResponse = await fetch(`${API_BASE_URL}${endpoint}`, {
            ...options,
            headers,
          });
          if (retryResponse.ok) {
            return retryResponse.json();
          }
        }
      } catch {
        // Refresh failed
      }
    }
    clearTokens();
    window.dispatchEvent(new CustomEvent("auth:logout"));
    throw new Error("انتهت صلاحية الجلسة. يرجى تسجيل الدخول مرة أخرى.");
  }

  if (!response.ok) {
    const error = await response
      .json()
      .catch(() => ({ message: "فشل الاتصال بالخادم" }));
    throw new Error(error.message || `HTTP error! status: ${response.status}`);
  }

  return response.json();
}

// ===== Auth API =====
export const authApi = {
  login: (username: string, password: string) =>
    apiCall<{ token: string; refreshToken: string; user: any }>("/auth/login", {
      method: "POST",
      body: JSON.stringify({ username, password }),
    }),
  logout: () => apiCall<void>("/auth/logout", { method: "POST" }),
  me: () => apiCall<any>("/auth/me"),
  setup: (data: {
    username: string;
    password: string;
    fullName: string;
    email?: string;
  }) =>
    apiCall<any>("/auth/setup", {
      method: "POST",
      body: JSON.stringify(data),
    }),
  changePassword: (currentPassword: string, newPassword: string) =>
    apiCall<void>("/auth/change-password", {
      method: "POST",
      body: JSON.stringify({ currentPassword, newPassword }),
    }),
  // Admin user management
  getUsers: () => apiCall<any[]>("/auth/users"),
  register: (data: {
    username: string;
    password: string;
    fullName: string;
    email?: string;
    role?: string;
    entityId?: string;
  }) =>
    apiCall<any>("/auth/register", {
      method: "POST",
      body: JSON.stringify(data),
    }),
  updateUser: (
    id: string,
    data: {
      fullName?: string;
      email?: string;
      role?: string;
      entityId?: string;
      isActive?: boolean;
    }
  ) =>
    apiCall<any>(`/auth/users/${id}`, {
      method: "PUT",
      body: JSON.stringify(data),
    }),
  resetPassword: (id: string, newPassword: string) =>
    apiCall<any>(`/auth/users/${id}/reset-password`, {
      method: "PUT",
      body: JSON.stringify({ newPassword }),
    }),
};

// ===== Entities API =====
export const entitiesApi = {
  getAll: () => apiCall<any[]>("/entities"),
  getById: (id: string) => apiCall<any>(`/entities/${id}`),
  create: (data: any) =>
    apiCall<any>("/entities", {
      method: "POST",
      body: JSON.stringify(data),
    }),
  update: (id: string, data: any) =>
    apiCall<any>(`/entities/${id}`, {
      method: "PUT",
      body: JSON.stringify(data),
    }),
  delete: (id: string) =>
    apiCall<void>(`/entities/${id}`, {
      method: "DELETE",
    }),
};

// ===== Accounts API =====
export const accountsApi = {
  getAll: () => apiCall<any[]>("/accounts"),
  getById: (id: string) => apiCall<any>(`/accounts/${id}`),
  getByEntity: (entityId: string) =>
    apiCall<any[]>(`/accounts/entity/${entityId}`),
  create: (data: any) =>
    apiCall<any>("/accounts", {
      method: "POST",
      body: JSON.stringify(data),
    }),
  update: (id: string, data: any) =>
    apiCall<any>(`/accounts/${id}`, {
      method: "PUT",
      body: JSON.stringify(data),
    }),
  delete: (id: string) =>
    apiCall<void>(`/accounts/${id}`, {
      method: "DELETE",
    }),
};

// ===== Cash Boxes API =====
export const cashBoxesApi = {
  getAll: () => apiCall<any[]>("/cash-boxes"),
  getById: (id: string) => apiCall<any>(`/cash-boxes/${id}`),
  getByEntity: (entityId: string) =>
    apiCall<any[]>(`/cash-boxes?entityId=${entityId}`),
  create: (data: any) =>
    apiCall<any>("/cash-boxes", {
      method: "POST",
      body: JSON.stringify(data),
    }),
  update: (id: string, data: any) =>
    apiCall<any>(`/cash-boxes/${id}`, {
      method: "PUT",
      body: JSON.stringify(data),
    }),
  delete: (id: string) =>
    apiCall<void>(`/cash-boxes/${id}`, {
      method: "DELETE",
    }),
};

// ===== Banks & Wallets API =====
export const banksWalletsApi = {
  getAll: () => apiCall<any[]>("/banks-wallets"),
  getById: (id: string) => apiCall<any>(`/banks-wallets/${id}`),
  getByEntity: (entityId: string) =>
    apiCall<any[]>(`/banks-wallets?entityId=${entityId}`),
  create: (data: any) =>
    apiCall<any>("/banks-wallets", {
      method: "POST",
      body: JSON.stringify(data),
    }),
  update: (id: string, data: any) =>
    apiCall<any>(`/banks-wallets/${id}`, {
      method: "PUT",
      body: JSON.stringify(data),
    }),
  delete: (id: string) =>
    apiCall<void>(`/banks-wallets/${id}`, {
      method: "DELETE",
    }),
};

// ===== Journal Entries API =====
export const journalEntriesApi = {
  getAll: (params?: { entityId?: string; page?: number; limit?: number }) => {
    const query = new URLSearchParams();
    if (params?.entityId) query.set("entityId", params.entityId);
    if (params?.page) query.set("page", String(params.page));
    if (params?.limit) query.set("limit", String(params.limit));
    return apiCall<any>(`/journal-entries?${query.toString()}`);
  },
  getById: (id: string) => apiCall<any>(`/journal-entries/${id}`),
  getByEntity: (entityId: string) =>
    apiCall<any[]>(`/journal-entries?entityId=${entityId}`),
  create: (data: any) =>
    apiCall<any>("/journal-entries", {
      method: "POST",
      body: JSON.stringify(data),
    }),
  update: (id: string, data: any) =>
    apiCall<any>(`/journal-entries/${id}`, {
      method: "PUT",
      body: JSON.stringify(data),
    }),
  delete: (id: string) =>
    apiCall<void>(`/journal-entries/${id}`, {
      method: "DELETE",
    }),
};

// ===== Payments API (Payment Vouchers) =====
export const paymentsApi = {
  getAll: (params?: {
    entityId?: string;
    type?: "in" | "out";
    page?: number;
    limit?: number;
  }) => {
    const query = new URLSearchParams();
    if (params?.entityId) query.set("entityId", params.entityId);
    if (params?.type) query.set("type", params.type);
    if (params?.page) query.set("page", String(params.page));
    if (params?.limit) query.set("limit", String(params.limit));
    return apiCall<any>(`/payments?${query.toString()}`);
  },
  getById: (id: string) => apiCall<any>(`/payments/${id}`),
  getByEntity: (entityId: string) =>
    apiCall<any[]>(`/payments?entityId=${entityId}`),
  getByType: (entityId: string, type: "in" | "out") =>
    apiCall<any[]>(`/payments?entityId=${entityId}&type=${type}`),
  create: (data: any) =>
    apiCall<any>("/payments", {
      method: "POST",
      body: JSON.stringify(data),
    }),
  update: (id: string, data: any) =>
    apiCall<any>(`/payments/${id}`, {
      method: "PUT",
      body: JSON.stringify(data),
    }),
  delete: (id: string) =>
    apiCall<void>(`/payments/${id}`, {
      method: "DELETE",
    }),
};

// ===== Journal Entry Lines API =====
export const journalEntryLinesApi = {
  getAll: () => apiCall<any[]>("/journal-entry-lines"),
  getById: (id: string) => apiCall<any>(`/journal-entry-lines/${id}`),
  getByEntry: (entryId: string) =>
    apiCall<any[]>(`/journal-entry-lines/entry/${entryId}`),
  create: (data: any) =>
    apiCall<any>("/journal-entry-lines", {
      method: "POST",
      body: JSON.stringify(data),
    }),
  update: (id: string, data: any) =>
    apiCall<any>(`/journal-entry-lines/${id}`, {
      method: "PUT",
      body: JSON.stringify(data),
    }),
  delete: (id: string) =>
    apiCall<void>(`/journal-entry-lines/${id}`, {
      method: "DELETE",
    }),
};

// ===== Inventory (Items) API =====
export const inventoryApi = {
  getAll: () => apiCall<any[]>("/inventory"),
  getById: (id: string) => apiCall<any>(`/inventory/${id}`),
  getByEntity: (entityId: string) =>
    apiCall<any[]>(`/inventory/entity/${entityId}`),
  create: (data: any) =>
    apiCall<any>("/inventory", {
      method: "POST",
      body: JSON.stringify(data),
    }),
  update: (id: string, data: any) =>
    apiCall<any>(`/inventory/${id}`, {
      method: "PUT",
      body: JSON.stringify(data),
    }),
  delete: (id: string) =>
    apiCall<void>(`/inventory/${id}`, {
      method: "DELETE",
    }),
};

// ===== Warehouses API =====
export const warehousesApi = {
  getAll: () => apiCall<any[]>("/warehouses"),
  getById: (id: string) => apiCall<any>(`/warehouses/${id}`),
  getByEntity: (entityId: string) =>
    apiCall<any[]>(`/warehouses/entity/${entityId}`),
  create: (data: any) =>
    apiCall<any>("/warehouses", {
      method: "POST",
      body: JSON.stringify(data),
    }),
  update: (id: string, data: any) =>
    apiCall<any>(`/warehouses/${id}`, {
      method: "PUT",
      body: JSON.stringify(data),
    }),
  delete: (id: string) =>
    apiCall<void>(`/warehouses/${id}`, {
      method: "DELETE",
    }),
};

// ===== Item Categories API =====
export const itemCategoriesApi = {
  getAll: () => apiCall<any[]>("/item-categories"),
  getById: (id: string) => apiCall<any>(`/item-categories/${id}`),
  getByEntity: (entityId: string) =>
    apiCall<any[]>(`/item-categories/entity/${entityId}`),
  create: (data: any) =>
    apiCall<any>("/item-categories", {
      method: "POST",
      body: JSON.stringify(data),
    }),
  update: (id: string, data: any) =>
    apiCall<any>(`/item-categories/${id}`, {
      method: "PUT",
      body: JSON.stringify(data),
    }),
  delete: (id: string) =>
    apiCall<void>(`/item-categories/${id}`, {
      method: "DELETE",
    }),
};

// ===== Stock Movements API =====
export const stockMovementsApi = {
  getAll: () => apiCall<any[]>("/stock-movements"),
  getById: (id: string) => apiCall<any>(`/stock-movements/${id}`),
  getByEntity: (entityId: string) =>
    apiCall<any[]>(`/stock-movements/entity/${entityId}`),
  getByItem: (itemId: string) =>
    apiCall<any[]>(`/stock-movements/item/${itemId}`),
  getByWarehouse: (warehouseId: string) =>
    apiCall<any[]>(`/stock-movements/warehouse/${warehouseId}`),
  create: (data: any) =>
    apiCall<any>("/stock-movements", {
      method: "POST",
      body: JSON.stringify(data),
    }),
  update: (id: string, data: any) =>
    apiCall<any>(`/stock-movements/${id}`, {
      method: "PUT",
      body: JSON.stringify(data),
    }),
  delete: (id: string) =>
    apiCall<void>(`/stock-movements/${id}`, {
      method: "DELETE",
    }),
};

// ===== Item Stock API =====
export const itemStockApi = {
  getByItem: (itemId: string) => apiCall<any[]>(`/item-stock/item/${itemId}`),
  getByWarehouse: (warehouseId: string) =>
    apiCall<any[]>(`/item-stock/warehouse/${warehouseId}`),
  getByItemAndWarehouse: (itemId: string, warehouseId: string) =>
    apiCall<any>(`/item-stock/${itemId}/${warehouseId}`),
};

// ===== Inter-Unit Transfers API =====
export const interUnitTransfersApi = {
  getAll: () => apiCall<any[]>("/inter-unit-transfers"),
  getById: (id: string) => apiCall<any>(`/inter-unit-transfers/${id}`),
  create: (data: any) =>
    apiCall<any>("/inter-unit-transfers", {
      method: "POST",
      body: JSON.stringify(data),
    }),
  update: (id: string, data: any) =>
    apiCall<any>(`/inter-unit-transfers/${id}`, {
      method: "PUT",
      body: JSON.stringify(data),
    }),
  delete: (id: string) =>
    apiCall<void>(`/inter-unit-transfers/${id}`, {
      method: "DELETE",
    }),
};

// ===== Dashboard API =====
export const dashboardApi = {
  getStats: () => apiCall<any>("/dashboard/stats"),
  getRevenueChart: () => apiCall<any[]>("/dashboard/charts/revenue"),
};

// ===== Customers API =====
export const customersApi = {
  getAll: (params?: { entityId?: string; page?: number; limit?: number }) => {
    const query = new URLSearchParams();
    if (params?.entityId) query.set("entityId", params.entityId);
    if (params?.page) query.set("page", String(params.page));
    if (params?.limit) query.set("limit", String(params.limit));
    return apiCall<any>(`/customers?${query.toString()}`);
  },
  getById: (id: string) => apiCall<any>(`/customers/${id}`),
  create: (data: any) =>
    apiCall<any>("/customers", {
      method: "POST",
      body: JSON.stringify(data),
    }),
  update: (id: string, data: any) =>
    apiCall<any>(`/customers/${id}`, {
      method: "PUT",
      body: JSON.stringify(data),
    }),
  delete: (id: string) =>
    apiCall<void>(`/customers/${id}`, {
      method: "DELETE",
    }),
};

// ===== Suppliers API =====
export const suppliersApi = {
  getAll: (params?: { entityId?: string; page?: number; limit?: number }) => {
    const query = new URLSearchParams();
    if (params?.entityId) query.set("entityId", params.entityId);
    if (params?.page) query.set("page", String(params.page));
    if (params?.limit) query.set("limit", String(params.limit));
    return apiCall<any>(`/suppliers?${query.toString()}`);
  },
  getById: (id: string) => apiCall<any>(`/suppliers/${id}`),
  create: (data: any) =>
    apiCall<any>("/suppliers", {
      method: "POST",
      body: JSON.stringify(data),
    }),
  update: (id: string, data: any) =>
    apiCall<any>(`/suppliers/${id}`, {
      method: "PUT",
      body: JSON.stringify(data),
    }),
  delete: (id: string) =>
    apiCall<void>(`/suppliers/${id}`, {
      method: "DELETE",
    }),
};

// ===== Contacts API =====
export const contactsApi = {
  getAll: (params?: { entityId?: string; page?: number; limit?: number }) => {
    const query = new URLSearchParams();
    if (params?.entityId) query.set("entityId", params.entityId);
    if (params?.page) query.set("page", String(params.page));
    if (params?.limit) query.set("limit", String(params.limit));
    return apiCall<any>(`/contacts?${query.toString()}`);
  },
  getById: (id: string) => apiCall<any>(`/contacts/${id}`),
  create: (data: any) =>
    apiCall<any>("/contacts", {
      method: "POST",
      body: JSON.stringify(data),
    }),
  update: (id: string, data: any) =>
    apiCall<any>(`/contacts/${id}`, {
      method: "PUT",
      body: JSON.stringify(data),
    }),
  delete: (id: string) =>
    apiCall<void>(`/contacts/${id}`, {
      method: "DELETE",
    }),
};

// ===== Currencies API =====
export const currenciesApi = {
  getAll: (params?: { entityId?: string }) => {
    const query = new URLSearchParams();
    if (params?.entityId) query.set("entityId", params.entityId);
    return apiCall<any>(`/currencies?${query.toString()}`);
  },
  getById: (id: string) => apiCall<any>(`/currencies/${id}`),
  create: (data: any) =>
    apiCall<any>("/currencies", {
      method: "POST",
      body: JSON.stringify(data),
    }),
  update: (id: string, data: any) =>
    apiCall<any>(`/currencies/${id}`, {
      method: "PUT",
      body: JSON.stringify(data),
    }),
  delete: (id: string) =>
    apiCall<void>(`/currencies/${id}`, {
      method: "DELETE",
    }),
};

// ===== Cost Centers API =====
export const costCentersApi = {
  getAll: (params?: { entityId?: string }) => {
    const query = new URLSearchParams();
    if (params?.entityId) query.set("entityId", params.entityId);
    return apiCall<any>(`/cost-centers?${query.toString()}`);
  },
  getById: (id: string) => apiCall<any>(`/cost-centers/${id}`),
  create: (data: any) =>
    apiCall<any>("/cost-centers", {
      method: "POST",
      body: JSON.stringify(data),
    }),
  update: (id: string, data: any) =>
    apiCall<any>(`/cost-centers/${id}`, {
      method: "PUT",
      body: JSON.stringify(data),
    }),
  delete: (id: string) =>
    apiCall<void>(`/cost-centers/${id}`, {
      method: "DELETE",
    }),
};

// ===== Fixed Assets API =====
export const fixedAssetsApi = {
  getAll: (params?: { entityId?: string; page?: number; limit?: number }) => {
    const query = new URLSearchParams();
    if (params?.entityId) query.set("entityId", params.entityId);
    if (params?.page) query.set("page", String(params.page));
    if (params?.limit) query.set("limit", String(params.limit));
    return apiCall<any>(`/fixed-assets?${query.toString()}`);
  },
  getById: (id: string) => apiCall<any>(`/fixed-assets/${id}`),
  create: (data: any) =>
    apiCall<any>("/fixed-assets", {
      method: "POST",
      body: JSON.stringify(data),
    }),
  update: (id: string, data: any) =>
    apiCall<any>(`/fixed-assets/${id}`, {
      method: "PUT",
      body: JSON.stringify(data),
    }),
  delete: (id: string) =>
    apiCall<void>(`/fixed-assets/${id}`, {
      method: "DELETE",
    }),
};

// ===== Budgets API =====
export const budgetsApi = {
  getAll: (params?: { entityId?: string; fiscalYear?: string }) => {
    const query = new URLSearchParams();
    if (params?.entityId) query.set("entityId", params.entityId);
    if (params?.fiscalYear) query.set("fiscalYear", params.fiscalYear);
    return apiCall<any>(`/budgets?${query.toString()}`);
  },
  getById: (id: string) => apiCall<any>(`/budgets/${id}`),
  create: (data: any) =>
    apiCall<any>("/budgets", {
      method: "POST",
      body: JSON.stringify(data),
    }),
  update: (id: string, data: any) =>
    apiCall<any>(`/budgets/${id}`, {
      method: "PUT",
      body: JSON.stringify(data),
    }),
  delete: (id: string) =>
    apiCall<void>(`/budgets/${id}`, {
      method: "DELETE",
    }),
};

// ===== Generic API Helper =====
export const api = {
  get: <T>(url: string) => apiCall<T>(url),
  post: <T>(url: string, data: any) =>
    apiCall<T>(url, { method: "POST", body: JSON.stringify(data) }),
  put: <T>(url: string, data: any) =>
    apiCall<T>(url, { method: "PUT", body: JSON.stringify(data) }),
  delete: <T>(url: string) => apiCall<T>(url, { method: "DELETE" }),
};

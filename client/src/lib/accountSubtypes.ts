export interface AccountSubtype {
  id: string;
  value: string;
  label: string;
  icon?: string;
  description?: string;
}

const defaultSubtypes: AccountSubtype[] = [
  { id: "general", value: "general", label: "عام", icon: "FileText", description: "نوع حساب عام" },
  { id: "cash_box", value: "cash_box", label: "صندوق", icon: "Wallet", description: "صندوق نقدي" },
  { id: "bank", value: "bank", label: "بنك", icon: "Landmark", description: "حساب بنكي" },
  { id: "wallet", value: "wallet", label: "محفظة", icon: "CreditCard", description: "محفظة إلكترونية" },
  { id: "exchange", value: "exchange", label: "صراف", icon: "Landmark", description: "صراف أو مكتب صرافة" },
  { id: "supplier", value: "supplier", label: "مورد", icon: "Users", description: "مورد (ذمم دائنة)" },
  { id: "customer", value: "customer", label: "عميل", icon: "User", description: "عميل (ذمم مدينة)" },
  { id: "employee", value: "employee", label: "موظف", icon: "User", description: "موظف" },
  { id: "warehouse", value: "warehouse", label: "مخزن", icon: "Store", description: "مخزن أو مستودع" },
];

const STORAGE_KEY_PREFIX = 'account_subtypes_';

// Get storage key for a specific entity
function getStorageKey(entityId: string | null | undefined): string {
  if (!entityId) return STORAGE_KEY_PREFIX + 'default';
  return STORAGE_KEY_PREFIX + entityId;
}

// Get account subtypes from localStorage for a specific entity or return defaults
export function getAccountSubtypes(entityId?: string | null): AccountSubtype[] {
  if (typeof window === 'undefined') return defaultSubtypes;
  
  if (!entityId) return defaultSubtypes;
  
  try {
    const storageKey = getStorageKey(entityId);
    const stored = localStorage.getItem(storageKey);
    if (stored) {
      const parsed = JSON.parse(stored);
      // Merge with defaults to ensure all default subtypes exist
      const merged = [...defaultSubtypes];
      parsed.forEach((subtype: AccountSubtype) => {
        const existingIndex = merged.findIndex(s => s.id === subtype.id);
        if (existingIndex >= 0) {
          merged[existingIndex] = subtype;
        } else {
          merged.push(subtype);
        }
      });
      return merged;
    }
  } catch (error) {
    console.error('Error loading account subtypes from localStorage:', error);
  }
  
  return defaultSubtypes;
}

// Save account subtypes to localStorage for a specific entity
export function saveAccountSubtypes(subtypes: AccountSubtype[], entityId: string | null | undefined): void {
  if (typeof window === 'undefined') return;
  if (!entityId) return;
  
  try {
    const storageKey = getStorageKey(entityId);
    localStorage.setItem(storageKey, JSON.stringify(subtypes));
  } catch (error) {
    console.error('Error saving account subtypes to localStorage:', error);
  }
}

// Get subtype map for use in components
export function getSubtypeMap(entityId?: string | null): Record<string, { label: string, icon?: string }> {
  const subtypes = getAccountSubtypes(entityId);
  return subtypes.reduce((acc, subtype) => {
    acc[subtype.value] = {
      label: subtype.label,
      icon: subtype.icon
    };
    return acc;
  }, {} as Record<string, { label: string, icon?: string }>);
}

// Delete all account subtypes for holding company (default)
export function deleteHoldingCompanySubtypes(): void {
  if (typeof window === 'undefined') return;
  try {
    const defaultKey = getStorageKey(null);
    localStorage.removeItem(defaultKey);
  } catch (error) {
    console.error('Error deleting holding company subtypes:', error);
  }
}

// Delete all account types for holding company (default)
export function deleteHoldingCompanyTypes(): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.removeItem('account_types_default');
    // Also remove any keys that might have been created with null/undefined
    Object.keys(localStorage).forEach(key => {
      if (key === 'account_types_default' || key === 'account_subtypes_default') {
        localStorage.removeItem(key);
      }
    });
  } catch (error) {
    console.error('Error deleting holding company types:', error);
  }
}

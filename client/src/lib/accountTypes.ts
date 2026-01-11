export interface AccountType {
  id: string;
  name: string;
  label: string;
  color: string;
  description?: string;
}

// Basic types that should be available in all units
const basicTypes: AccountType[] = [
  {
    id: "asset",
    name: "asset",
    label: "أصول",
    color: "bg-blue-100 text-blue-700 border-blue-200",
    description: "الأصول المملوكة للشركة"
  },
  {
    id: "liability",
    name: "liability",
    label: "خصوم",
    color: "bg-rose-100 text-rose-700 border-rose-200",
    description: "الالتزامات المالية على الشركة"
  },
  {
    id: "equity",
    name: "equity",
    label: "حقوق ملكية",
    color: "bg-purple-100 text-purple-700 border-purple-200",
    description: "حقوق المالكين في الشركة"
  },
  {
    id: "income",
    name: "income",
    label: "إيرادات",
    color: "bg-emerald-100 text-emerald-700 border-emerald-200",
    description: "الإيرادات المكتسبة من العمليات"
  },
  {
    id: "expense",
    name: "expense",
    label: "مصروفات",
    color: "bg-amber-100 text-amber-700 border-amber-200",
    description: "المصروفات المتكبدة في العمليات"
  },
];

// Custom types that were previously in defaultTypes (now only shown if added by unit)
const customTypes: AccountType[] = [
  {
    id: "employee_operations",
    name: "employee_operations",
    label: "أعمال الموظفين",
    color: "bg-cyan-100 text-cyan-700 border-cyan-200",
    description: "حسابات أعمال الموظفين"
  },
  {
    id: "accountant_operations",
    name: "accountant_operations",
    label: "أعمال المحاسب",
    color: "bg-indigo-100 text-indigo-700 border-indigo-200",
    description: "حسابات أعمال المحاسب"
  },
  {
    id: "abbasi_operations",
    name: "abbasi_operations",
    label: "أعمال العباسي",
    color: "bg-pink-100 text-pink-700 border-pink-200",
    description: "حسابات أعمال العباسي"
  },
];

// Legacy defaultTypes for backward compatibility (only used when no entityId)
const defaultTypes: AccountType[] = [...basicTypes, ...customTypes];

const STORAGE_KEY_PREFIX = 'account_types_';

// Get storage key for a specific entity
function getStorageKey(entityId: string | null | undefined): string {
  if (!entityId) return STORAGE_KEY_PREFIX + 'default';
  return STORAGE_KEY_PREFIX + entityId;
}

// Get account types from localStorage for a specific entity or return basic types only
export function getAccountTypes(entityId?: string | null): AccountType[] {
  if (typeof window === 'undefined') return basicTypes;
  
  if (!entityId) return basicTypes;
  
  try {
    const storageKey = getStorageKey(entityId);
    const stored = localStorage.getItem(storageKey);
    if (stored) {
      const parsed = JSON.parse(stored);
      // Start with basic types, then merge with saved types
      const merged = [...basicTypes];
      parsed.forEach((type: AccountType) => {
        const existingIndex = merged.findIndex(t => t.id === type.id);
        if (existingIndex >= 0) {
          // Update existing type (e.g., if basic type was customized)
          merged[existingIndex] = type;
        } else {
          // Add new custom type
          merged.push(type);
        }
      });
      return merged;
    }
  } catch (error) {
    console.error('Error loading account types from localStorage:', error);
  }
  
  // Return only basic types if no saved data exists for this entity
  return [...basicTypes];
}

// Save account types to localStorage for a specific entity
export function saveAccountTypes(types: AccountType[], entityId: string | null | undefined): void {
  if (typeof window === 'undefined') return;
  if (!entityId) return;
  
  try {
    const storageKey = getStorageKey(entityId);
    localStorage.setItem(storageKey, JSON.stringify(types));
  } catch (error) {
    console.error('Error saving account types to localStorage:', error);
  }
}

// Get type map for use in components
export function getTypeMap(entityId?: string | null): Record<string, { label: string, color: string }> {
  const types = getAccountTypes(entityId);
  return types.reduce((acc, type) => {
    acc[type.name] = {
      label: type.label,
      color: type.color
    };
    return acc;
  }, {} as Record<string, { label: string, color: string }>);
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

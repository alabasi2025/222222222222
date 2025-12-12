import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';

export type EntityType = 'holding' | 'unit' | 'branch';

export interface Entity {
  id: string;
  name: string;
  type: EntityType;
  parentId?: string | null;
  themeColor?: string; // Hex color code
  logo?: string; // URL or base64 string
}

// Define the initial entities data here to be shared
export const initialEntities: Entity[] = [
  { id: "UNIT-001", name: "وحدة أعمال الحديدة", type: "unit", parentId: null, themeColor: "#2563eb" }, // Blue
  { id: "UNIT-002", name: "وحدة العباسي خاص", type: "unit", parentId: null, themeColor: "#059669" }, // Emerald
  { id: "BR-001", name: "الفرع الرئيسي (العباسي خاص)", type: "branch", parentId: "UNIT-002", themeColor: "#059669" },
  { id: "BR-002", name: "الفرع الرئيسي (الحديدة)", type: "branch", parentId: "UNIT-001", themeColor: "#2563eb" },
  { id: "BR-003", name: "فرع الدهمية", type: "branch", parentId: "UNIT-001", themeColor: "#2563eb" },
  { id: "BR-004", name: "فرع الصبالية", type: "branch", parentId: "UNIT-001", themeColor: "#2563eb" },
  { id: "BR-005", name: "فرع غليل", type: "branch", parentId: "UNIT-001", themeColor: "#2563eb" },
];

interface EntityContextType {
  currentEntity: Entity;
  setCurrentEntity: (entity: Entity) => void;
  entities: Entity[];
  setEntities: (entities: Entity[]) => void;
  availableEntities: Entity[];
  isEntityVisible: (entityId: string) => boolean; 
  getThemeColor: (entityId?: string) => string;
  updateEntityLogo: (entityId: string, logo: string) => void;
}

const EntityContext = createContext<EntityContextType | undefined>(undefined);

export function EntityProvider({ children }: { children: ReactNode }) {
  const [entities, setEntities] = useState<Entity[]>(initialEntities);
  const [currentEntity, setCurrentEntity] = useState<Entity>(initialEntities[1]); // وحدة العباسي خاص

  // Update CSS variables when entity changes
  useEffect(() => {
    const color = getThemeColor(currentEntity.id);
    document.documentElement.style.setProperty('--primary', hexToHSL(color));
    // Also update ring color for focus states
    document.documentElement.style.setProperty('--ring', hexToHSL(color));
  }, [currentEntity]);

  // Helper to convert hex to HSL for Tailwind
  const hexToHSL = (hex: string) => {
    let r = 0, g = 0, b = 0;
    if (hex.length === 4) {
      r = parseInt("0x" + hex[1] + hex[1]);
      g = parseInt("0x" + hex[2] + hex[2]);
      b = parseInt("0x" + hex[3] + hex[3]);
    } else if (hex.length === 7) {
      r = parseInt("0x" + hex[1] + hex[2]);
      g = parseInt("0x" + hex[3] + hex[4]);
      b = parseInt("0x" + hex[5] + hex[6]);
    }
    
    r /= 255;
    g /= 255;
    b /= 255;
    
    const cmin = Math.min(r,g,b), cmax = Math.max(r,g,b), delta = cmax - cmin;
    let h = 0, s = 0, l = 0;
    
    if (delta === 0) h = 0;
    else if (cmax === r) h = ((g - b) / delta) % 6;
    else if (cmax === g) h = (b - r) / delta + 2;
    else h = (r - g) / delta + 4;
    
    h = Math.round(h * 60);
    if (h < 0) h += 360;
    
    l = (cmax + cmin) / 2;
    s = delta === 0 ? 0 : delta / (1 - Math.abs(2 * l - 1));
    
    s = +(s * 100).toFixed(1);
    l = +(l * 100).toFixed(1);
    
    return `${h} ${s}% ${l}%`;
  };

  const getThemeColor = (entityId?: string) => {
    const id = entityId || currentEntity.id;
    const entity = entities.find(e => e.id === id);
    
    // If entity has explicit color, use it
    if (entity?.themeColor) return entity.themeColor;
    
    // If branch, inherit from unit
    if (entity?.type === 'branch' && entity.parentId) {
      const parent = entities.find(e => e.id === entity.parentId);
      if (parent?.themeColor) return parent.themeColor;
    }
    
    return "#7c3aed"; // Default violet
  };

  const isEntityVisible = (entityId: string) => {
    if (currentEntity.type === 'holding') return true;

    const target = entities.find(e => e.id === entityId);
    if (!target) return false;

    if (currentEntity.type === 'unit') {
      if (target.id === currentEntity.id) return true;
      if (target.parentId === currentEntity.id) return true;
      return false;
    }

    if (currentEntity.type === 'branch') {
      return target.id === currentEntity.id;
    }

    return false;
  };

  const updateEntityLogo = (entityId: string, logo: string) => {
    setEntities(prev => prev.map(e => 
      e.id === entityId ? { ...e, logo } : e
    ));
    
    // Also update current entity if it's the one being modified
    if (currentEntity.id === entityId) {
      setCurrentEntity(prev => ({ ...prev, logo }));
    }
  };

  return (
    <EntityContext.Provider value={{ 
      currentEntity, 
      setCurrentEntity, 
      entities,
      setEntities,
      availableEntities: entities,
      isEntityVisible,
      getThemeColor,
      updateEntityLogo
    }}>
      {children}
    </EntityContext.Provider>
  );
}

export function useEntity() {
  const context = useContext(EntityContext);
  if (context === undefined) {
    throw new Error('useEntity must be used within an EntityProvider');
  }
  return context;
}

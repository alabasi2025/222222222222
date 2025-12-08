import React, { createContext, useContext, useState, ReactNode } from 'react';

export type EntityType = 'holding' | 'unit' | 'branch';

export interface Entity {
  id: string;
  name: string;
  type: EntityType;
  parentId?: string | null;
}

// Define the initial entities data here to be shared
export const initialEntities: Entity[] = [
  { id: "HOLD-001", name: "شركة أعمال العباسي", type: "holding", parentId: null },
  { id: "UNIT-001", name: "وحدة أعمال الحديدة", type: "unit", parentId: "HOLD-001" },
  { id: "UNIT-002", name: "وحدة العباسي خاص", type: "unit", parentId: "HOLD-001" },
  { id: "BR-001", name: "الفرع الرئيسي (العباسي خاص)", type: "branch", parentId: "UNIT-002" },
  { id: "BR-002", name: "الفرع الرئيسي (الحديدة)", type: "branch", parentId: "UNIT-001" },
  { id: "BR-003", name: "فرع الدهمية", type: "branch", parentId: "UNIT-001" },
  { id: "BR-004", name: "فرع الصبالية", type: "branch", parentId: "UNIT-001" },
  { id: "BR-005", name: "فرع غليل", type: "branch", parentId: "UNIT-001" },
];

interface EntityContextType {
  currentEntity: Entity;
  setCurrentEntity: (entity: Entity) => void;
  entities: Entity[];
  availableEntities: Entity[]; // Entities visible based on current selection (if we were to implement strict hierarchy navigation, but for switcher we usually show all allowed)
  // Helper to check if an entity belongs to the current context
  isEntityVisible: (entityId: string) => boolean; 
}

const EntityContext = createContext<EntityContextType | undefined>(undefined);

export function EntityProvider({ children }: { children: ReactNode }) {
  const [currentEntity, setCurrentEntity] = useState<Entity>(initialEntities[0]);

  // Logic to determine if an item should be visible based on current context
  const isEntityVisible = (entityId: string) => {
    // If holding company is selected, everything is visible
    if (currentEntity.type === 'holding') return true;

    // Find the target entity
    const target = initialEntities.find(e => e.id === entityId);
    if (!target) return false;

    // If unit is selected
    if (currentEntity.type === 'unit') {
      // Show the unit itself
      if (target.id === currentEntity.id) return true;
      // Show branches of this unit
      if (target.parentId === currentEntity.id) return true;
      return false;
    }

    // If branch is selected
    if (currentEntity.type === 'branch') {
      // Show only the branch itself
      return target.id === currentEntity.id;
    }

    return false;
  };

  return (
    <EntityContext.Provider value={{ 
      currentEntity, 
      setCurrentEntity, 
      entities: initialEntities,
      availableEntities: initialEntities,
      isEntityVisible
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

import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Building2, Building, Store, ChevronRight } from "lucide-react";
import { useEntity, Entity } from "@/contexts/EntityContext";
import { toast } from "sonner";

export default function EntitySelection() {
  const { entities, setCurrentEntity, getThemeColor } = useEntity();
  const [, setLocation] = useLocation();
  const [selectedEntityId, setSelectedEntityId] = useState<string | null>(null);

  // Load last selected entity from localStorage
  useEffect(() => {
    const lastSelected = localStorage.getItem('lastSelectedEntityId');
    if (lastSelected && entities.find(e => e.id === lastSelected)) {
      setSelectedEntityId(lastSelected);
    }
  }, [entities]);

  const handleSelectEntity = (entity: Entity) => {
    setSelectedEntityId(entity.id);
  };

  const handleConfirm = () => {
    if (!selectedEntityId) {
      toast.error("يرجى اختيار وحدة أو فرع");
      return;
    }

    const entity = entities.find(e => e.id === selectedEntityId);
    if (!entity) {
      toast.error("الوحدة المحددة غير موجودة");
      return;
    }

    setCurrentEntity(entity);
    toast.success(`تم اختيار ${entity.name}`);
    setLocation("/");
  };

  const getEntityIcon = (type: string) => {
    switch (type) {
      case 'holding':
        return Building2;
      case 'unit':
        return Building;
      case 'branch':
        return Store;
      default:
        return Building2;
    }
  };

  const getEntityTypeLabel = (type: string) => {
    switch (type) {
      case 'holding':
        return 'الشركة القابضة';
      case 'unit':
        return 'وحدة أعمال';
      case 'branch':
        return 'فرع';
      default:
        return type;
    }
  };

  // Group entities by type
  const holdingEntities = entities.filter(e => e.type === 'holding');
  const unitEntities = entities.filter(e => e.type === 'unit');
  const branchEntities = entities.filter(e => e.type === 'branch');

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background to-muted/20 p-4">
      <Card className="w-full max-w-4xl shadow-lg">
        <CardContent className="p-8">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold mb-2">اختر الوحدة أو الفرع</h1>
            <p className="text-muted-foreground">
              يرجى اختيار الوحدة أو الفرع الذي تريد العمل عليه
            </p>
          </div>

          <div className="space-y-6">
            {/* الشركة القابضة */}
            {holdingEntities.length > 0 && (
              <div>
                <h2 className="text-lg font-semibold mb-3 text-muted-foreground">الشركة القابضة</h2>
                <div className="grid gap-3">
                  {holdingEntities.map((entity) => {
                    const Icon = getEntityIcon(entity.type);
                    const isSelected = selectedEntityId === entity.id;
                    return (
                      <button
                        key={entity.id}
                        onClick={() => handleSelectEntity(entity)}
                        className={`w-full text-right p-4 rounded-lg border-2 transition-all ${
                          isSelected
                            ? 'border-primary bg-primary/5 shadow-md'
                            : 'border-border hover:border-primary/50 hover:bg-muted/50'
                        }`}
                        style={isSelected ? { borderColor: getThemeColor(entity.id) } : undefined}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-4 flex-1">
                            <div
                              className="w-12 h-12 rounded-lg flex items-center justify-center text-white"
                              style={{ backgroundColor: getThemeColor(entity.id) }}
                            >
                              <Icon className="w-6 h-6" />
                            </div>
                            <div className="flex-1">
                              <h3 className="font-semibold text-lg">{entity.name}</h3>
                              <p className="text-sm text-muted-foreground">{getEntityTypeLabel(entity.type)}</p>
                            </div>
                          </div>
                          {isSelected && (
                            <div className="w-6 h-6 rounded-full bg-primary flex items-center justify-center" style={{ backgroundColor: getThemeColor(entity.id) }}>
                              <ChevronRight className="w-4 h-4 text-white" />
                            </div>
                          )}
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* وحدات الأعمال */}
            {unitEntities.length > 0 && (
              <div>
                <h2 className="text-lg font-semibold mb-3 text-muted-foreground">وحدات الأعمال</h2>
                <div className="grid gap-3">
                  {unitEntities.map((entity) => {
                    const Icon = getEntityIcon(entity.type);
                    const isSelected = selectedEntityId === entity.id;
                    const branches = entities.filter(e => e.type === 'branch' && e.parentId === entity.id);
                    return (
                      <div key={entity.id}>
                        <button
                          onClick={() => handleSelectEntity(entity)}
                          className={`w-full text-right p-4 rounded-lg border-2 transition-all ${
                            isSelected
                              ? 'border-primary bg-primary/5 shadow-md'
                              : 'border-border hover:border-primary/50 hover:bg-muted/50'
                          }`}
                          style={isSelected ? { borderColor: getThemeColor(entity.id) } : undefined}
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-4 flex-1">
                              <div
                                className="w-12 h-12 rounded-lg flex items-center justify-center text-white"
                                style={{ backgroundColor: getThemeColor(entity.id) }}
                              >
                                <Icon className="w-6 h-6" />
                              </div>
                              <div className="flex-1">
                                <h3 className="font-semibold text-lg">{entity.name}</h3>
                                <p className="text-sm text-muted-foreground">
                                  {getEntityTypeLabel(entity.type)} {branches.length > 0 && `(${branches.length} فرع)`}
                                </p>
                              </div>
                            </div>
                            {isSelected && (
                              <div className="w-6 h-6 rounded-full bg-primary flex items-center justify-center" style={{ backgroundColor: getThemeColor(entity.id) }}>
                                <ChevronRight className="w-4 h-4 text-white" />
                              </div>
                            )}
                          </div>
                        </button>
                        {/* Show branches if unit is selected */}
                        {isSelected && branches.length > 0 && (
                          <div className="pr-4 mt-2 space-y-2">
                            {branches.map((branch) => {
                              const BranchIcon = getEntityIcon(branch.type);
                              const isBranchSelected = selectedEntityId === branch.id;
                              return (
                                <button
                                  key={branch.id}
                                  onClick={() => handleSelectEntity(branch)}
                                  className={`w-full text-right p-3 rounded-lg border transition-all ${
                                    isBranchSelected
                                      ? 'border-primary bg-primary/5 shadow-md'
                                      : 'border-border hover:border-primary/50 hover:bg-muted/50'
                                  }`}
                                  style={isBranchSelected ? { borderColor: getThemeColor(branch.id) } : undefined}
                                >
                                  <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-3 flex-1">
                                      <div
                                        className="w-10 h-10 rounded-lg flex items-center justify-center text-white"
                                        style={{ backgroundColor: getThemeColor(branch.id) }}
                                      >
                                        <BranchIcon className="w-5 h-5" />
                                      </div>
                                      <div className="flex-1">
                                        <h4 className="font-medium">{branch.name}</h4>
                                        <p className="text-xs text-muted-foreground">{getEntityTypeLabel(branch.type)}</p>
                                      </div>
                                    </div>
                                    {isBranchSelected && (
                                      <div className="w-5 h-5 rounded-full bg-primary flex items-center justify-center" style={{ backgroundColor: getThemeColor(branch.id) }}>
                                        <ChevronRight className="w-3 h-3 text-white" />
                                      </div>
                                    )}
                                  </div>
                                </button>
                              );
                            })}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* الفروع المستقلة (إن وجدت) */}
            {branchEntities.filter(b => !b.parentId).length > 0 && (
              <div>
                <h2 className="text-lg font-semibold mb-3 text-muted-foreground">الفروع</h2>
                <div className="grid gap-3">
                  {branchEntities.filter(b => !b.parentId).map((entity) => {
                    const Icon = getEntityIcon(entity.type);
                    const isSelected = selectedEntityId === entity.id;
                    return (
                      <button
                        key={entity.id}
                        onClick={() => handleSelectEntity(entity)}
                        className={`w-full text-right p-4 rounded-lg border-2 transition-all ${
                          isSelected
                            ? 'border-primary bg-primary/5 shadow-md'
                            : 'border-border hover:border-primary/50 hover:bg-muted/50'
                        }`}
                        style={isSelected ? { borderColor: getThemeColor(entity.id) } : undefined}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-4 flex-1">
                            <div
                              className="w-12 h-12 rounded-lg flex items-center justify-center text-white"
                              style={{ backgroundColor: getThemeColor(entity.id) }}
                            >
                              <Icon className="w-6 h-6" />
                            </div>
                            <div className="flex-1">
                              <h3 className="font-semibold text-lg">{entity.name}</h3>
                              <p className="text-sm text-muted-foreground">{getEntityTypeLabel(entity.type)}</p>
                            </div>
                          </div>
                          {isSelected && (
                            <div className="w-6 h-6 rounded-full bg-primary flex items-center justify-center" style={{ backgroundColor: getThemeColor(entity.id) }}>
                              <ChevronRight className="w-4 h-4 text-white" />
                            </div>
                          )}
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          <div className="mt-8 flex justify-center">
            <Button
              onClick={handleConfirm}
              disabled={!selectedEntityId}
              size="lg"
              className="px-8"
              style={selectedEntityId ? { backgroundColor: getThemeColor(selectedEntityId || '') } : undefined}
            >
              تأكيد الاختيار والدخول
              <ChevronRight className="w-4 h-4 mr-2" />
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}


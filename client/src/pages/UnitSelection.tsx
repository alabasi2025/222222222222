import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Building, ChevronRight, ArrowLeft } from "lucide-react";
import { useEntity, Entity } from "@/contexts/EntityContext";
import { toast } from "sonner";

export default function UnitSelection() {
  const { entities, setCurrentEntity, getThemeColor } = useEntity();
  const [, setLocation] = useLocation();
  const [selectedUnitId, setSelectedUnitId] = useState<string | null>(null);
  const [selectedHoldingId, setSelectedHoldingId] = useState<string | null>(null);

  // التحقق من تسجيل الدخول
  useEffect(() => {
    const isAuthenticated = localStorage.getItem("isAuthenticated") === "true";
    if (!isAuthenticated) {
      setLocation("/login");
    }
  }, [setLocation]);

  // Get selected holding from localStorage
  useEffect(() => {
    const holdingId = localStorage.getItem('selectedHoldingId');
    if (holdingId) {
      setSelectedHoldingId(holdingId);
    }
  }, []);

  // Get holding entity and its units
  const holdingEntity = selectedHoldingId ? entities.find(e => e.id === selectedHoldingId) : null;
  const unitEntities = selectedHoldingId 
    ? entities.filter(e => e.type === 'unit' && e.parentId === selectedHoldingId)
    : [];

  // Load last selected unit from localStorage
  useEffect(() => {
    const lastSelected = localStorage.getItem('lastSelectedUnitId');
    if (lastSelected && unitEntities.find(e => e.id === lastSelected)) {
      setSelectedUnitId(lastSelected);
    }
  }, [unitEntities]);

  const handleSelectUnit = (unit: Entity) => {
    setSelectedUnitId(unit.id);
  };

  const handleEnterWithHolding = () => {
    if (!holdingEntity) {
      toast.error("الشركة القابضة غير موجودة");
      return;
    }

    setCurrentEntity(holdingEntity);
    toast.success(`تم الدخول إلى ${holdingEntity.name}`);
    setLocation("/");
  };

  const handleEnterWithUnit = () => {
    if (!selectedUnitId) {
      toast.error("يرجى اختيار وحدة أو الدخول مباشرة للشركة");
      return;
    }

    const unit = unitEntities.find(e => e.id === selectedUnitId);
    if (!unit) {
      toast.error("الوحدة المحددة غير موجودة");
      return;
    }

    setCurrentEntity(unit);
    localStorage.setItem('lastSelectedUnitId', selectedUnitId);
    toast.success(`تم اختيار ${unit.name}`);
    setLocation("/");
  };

  const handleBack = () => {
    localStorage.removeItem('selectedHoldingId');
    setLocation("/select-company");
  };

  if (!holdingEntity) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardContent className="p-8 text-center">
            <p className="text-muted-foreground mb-4">الشركة القابضة غير موجودة</p>
            <Button onClick={handleBack}>العودة</Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 p-4" dir="rtl">
      <Card className="w-full max-w-3xl shadow-lg">
        <CardHeader className="text-center">
          <div className="mx-auto w-16 h-16 bg-primary rounded-full flex items-center justify-center mb-4">
            <Building className="w-8 h-8 text-primary-foreground" />
          </div>
          <CardTitle className="text-2xl font-bold">اختر الوحدة (اختياري)</CardTitle>
          <CardDescription>
            يمكنك اختيار وحدة محددة أو الدخول مباشرة للشركة القابضة: {holdingEntity.name}
          </CardDescription>
        </CardHeader>
        <CardContent className="p-8">
          {unitEntities.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-muted-foreground mb-6">لا توجد وحدات متاحة للشركة القابضة المختارة</p>
              <Button
                onClick={handleEnterWithHolding}
                size="lg"
                className="px-8"
                style={{ backgroundColor: getThemeColor(holdingEntity.id) }}
              >
                الدخول مباشرة للشركة القابضة
                <ChevronRight className="w-4 h-4 mr-2" />
              </Button>
            </div>
          ) : (
            <>
              <div className="space-y-4 mb-6">
                {unitEntities.map((unit) => {
                  const isSelected = selectedUnitId === unit.id;
                  return (
                    <button
                      key={unit.id}
                      onClick={() => handleSelectUnit(unit)}
                      className={`w-full text-right p-6 rounded-lg border-2 transition-all ${
                        isSelected
                          ? 'border-primary bg-primary/5 shadow-md'
                          : 'border-border hover:border-primary/50 hover:bg-muted/50'
                      }`}
                      style={isSelected ? { borderColor: getThemeColor(unit.id) } : undefined}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4 flex-1">
                          <div
                            className="w-16 h-16 rounded-lg flex items-center justify-center text-white"
                            style={{ backgroundColor: getThemeColor(unit.id) }}
                          >
                            <Building className="w-8 h-8" />
                          </div>
                          <div className="flex-1 text-right">
                            <h3 className="font-semibold text-xl mb-1">{unit.name}</h3>
                            <p className="text-sm text-muted-foreground">وحدة أعمال</p>
                          </div>
                        </div>
                        {isSelected && (
                          <div 
                            className="w-8 h-8 rounded-full flex items-center justify-center text-white"
                            style={{ backgroundColor: getThemeColor(unit.id) }}
                          >
                            <ChevronRight className="w-5 h-5" />
                          </div>
                        )}
                      </div>
                    </button>
                  );
                })}
              </div>

              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button
                  onClick={handleEnterWithHolding}
                  variant="outline"
                  size="lg"
                  className="px-8"
                >
                  <ArrowLeft className="w-4 h-4 ml-2" />
                  الدخول مباشرة للشركة القابضة
                </Button>
                <Button
                  onClick={handleEnterWithUnit}
                  size="lg"
                  className="px-8"
                  disabled={!selectedUnitId}
                  style={selectedUnitId ? { backgroundColor: getThemeColor(selectedUnitId || '') } : undefined}
                >
                  الدخول بالوحدة المختارة
                  <ChevronRight className="w-4 h-4 mr-2" />
                </Button>
              </div>
            </>
          )}

          <div className="mt-6 flex justify-center">
            <Button
              onClick={handleBack}
              variant="ghost"
              size="sm"
            >
              <ArrowLeft className="w-4 h-4 ml-2" />
              العودة لاختيار الشركة
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

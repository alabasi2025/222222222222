import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Building2, ChevronRight } from "lucide-react";
import { useEntity, Entity } from "@/contexts/EntityContext";
import { toast } from "sonner";

export default function CompanySelection() {
  const { entities, getThemeColor } = useEntity();
  const [, setLocation] = useLocation();
  const [selectedCompanyId, setSelectedCompanyId] = useState<string | null>(null);

  // التحقق من تسجيل الدخول
  useEffect(() => {
    const isAuthenticated = localStorage.getItem("isAuthenticated") === "true";
    if (!isAuthenticated) {
      setLocation("/login");
    }
  }, [setLocation]);

  // Get holding companies
  const holdingEntities = entities.filter(e => e.type === 'holding');

  // Load last selected company from localStorage
  useEffect(() => {
    const lastSelected = localStorage.getItem('lastSelectedHoldingId');
    if (lastSelected && holdingEntities.find(e => e.id === lastSelected)) {
      setSelectedCompanyId(lastSelected);
    }
  }, [entities, holdingEntities]);

  const handleSelectCompany = (company: Entity) => {
    setSelectedCompanyId(company.id);
  };

  const handleConfirm = () => {
    if (!selectedCompanyId) {
      toast.error("يرجى اختيار الشركة القابضة");
      return;
    }

    const company = holdingEntities.find(e => e.id === selectedCompanyId);
    if (!company) {
      toast.error("الشركة المحددة غير موجودة");
      return;
    }

    // حفظ الشركة المختارة في localStorage
    localStorage.setItem('lastSelectedHoldingId', selectedCompanyId);
    localStorage.setItem('selectedHoldingId', selectedCompanyId);

    // التحقق من وجود وحدات تابعة للشركة
    const units = entities.filter(e => e.type === 'unit' && e.parentId === selectedCompanyId);
    
    if (units.length > 0) {
      // إذا كانت هناك وحدات، اذهب إلى صفحة اختيار الوحدة
      setLocation("/select-unit");
    } else {
      // إذا لم تكن هناك وحدات، اذهب مباشرة للشركة
      toast.success(`تم اختيار ${company.name}`);
      setLocation("/");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 p-4" dir="rtl">
      <Card className="w-full max-w-2xl shadow-lg">
        <CardHeader className="text-center">
          <div className="mx-auto w-16 h-16 bg-primary rounded-full flex items-center justify-center mb-4">
            <Building2 className="w-8 h-8 text-primary-foreground" />
          </div>
          <CardTitle className="text-2xl font-bold">اختر الشركة القابضة</CardTitle>
          <CardDescription>
            يرجى اختيار الشركة القابضة التي تريد العمل عليها
          </CardDescription>
        </CardHeader>
        <CardContent className="p-8">
          {holdingEntities.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-muted-foreground">لا توجد شركات قابضة متاحة</p>
            </div>
          ) : (
            <div className="space-y-4">
              {holdingEntities.map((company) => {
                const isSelected = selectedCompanyId === company.id;
                return (
                  <button
                    key={company.id}
                    onClick={() => handleSelectCompany(company)}
                    className={`w-full text-right p-6 rounded-lg border-2 transition-all ${
                      isSelected
                        ? 'border-primary bg-primary/5 shadow-md'
                        : 'border-border hover:border-primary/50 hover:bg-muted/50'
                    }`}
                    style={isSelected ? { borderColor: getThemeColor(company.id) } : undefined}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4 flex-1">
                        <div
                          className="w-16 h-16 rounded-lg flex items-center justify-center text-white"
                          style={{ backgroundColor: getThemeColor(company.id) }}
                        >
                          <Building2 className="w-8 h-8" />
                        </div>
                        <div className="flex-1 text-right">
                          <h3 className="font-semibold text-xl mb-1">{company.name}</h3>
                          <p className="text-sm text-muted-foreground">الشركة القابضة</p>
                        </div>
                      </div>
                      {isSelected && (
                        <div 
                          className="w-8 h-8 rounded-full flex items-center justify-center text-white"
                          style={{ backgroundColor: getThemeColor(company.id) }}
                        >
                          <ChevronRight className="w-5 h-5" />
                        </div>
                      )}
                    </div>
                  </button>
                );
              })}
            </div>
          )}

          <div className="mt-8 flex justify-center">
            <Button
              onClick={handleConfirm}
              disabled={!selectedCompanyId}
              size="lg"
              className="px-8"
              style={selectedCompanyId ? { backgroundColor: getThemeColor(selectedCompanyId || '') } : undefined}
            >
              التالي
              <ChevronRight className="w-4 h-4 mr-2" />
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { 
  ArrowUpRight, 
  ArrowDownRight, 
  DollarSign, 
  CreditCard, 
  Activity,
  TrendingUp,
  Building2,
  Building,
  Store
} from "lucide-react";
import { useEntity } from "@/contexts/EntityContext";

export default function Home() {
  const { currentEntity, getThemeColor } = useEntity();

  // Helper to get entity type label
  const getEntityTypeLabel = () => {
    switch(currentEntity.type) {
      case 'holding': return 'الشركة القابضة';
      case 'unit': return 'وحدة الأعمال';
      case 'branch': return 'الفرع';
      default: return '';
    }
  };

  // Helper to get entity icon
  const EntityIcon = () => {
    switch(currentEntity.type) {
      case 'holding': return <Building2 className="h-6 w-6 text-white" />;
      case 'unit': return <Building className="h-6 w-6 text-white" />;
      case 'branch': return <Store className="h-6 w-6 text-white" />;
      default: return null;
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b pb-6">
        <div className="flex items-center gap-4">
          <div 
            className="p-3 rounded-xl shadow-sm transition-colors duration-300"
            style={{ backgroundColor: getThemeColor() }}
          >
            <EntityIcon />
          </div>
          <div>
            <h2 className="text-3xl font-bold tracking-tight">{currentEntity.name}</h2>
            <div className="flex items-center gap-2 mt-1">
              <span 
                className="text-xs px-2 py-0.5 rounded-full font-medium transition-colors duration-300"
                style={{ 
                  backgroundColor: `${getThemeColor()}20`, // 20 is roughly 12% opacity
                  color: getThemeColor()
                }}
              >
                {getEntityTypeLabel()}
              </span>
              <p className="text-muted-foreground text-sm">لوحة المعلومات العامة</p>
            </div>
          </div>
        </div>
        <div className="flex gap-2">
          <Button style={{ backgroundColor: getThemeColor() }}>تقرير جديد</Button>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card className="border-t-4" style={{ borderTopColor: getThemeColor() }}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">إجمالي الإيرادات</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">0.00 ر.س</div>
            <p className="text-xs text-muted-foreground mt-1">
              لا توجد بيانات لـ {currentEntity.name}
            </p>
          </CardContent>
        </Card>
        <Card className="border-t-4" style={{ borderTopColor: getThemeColor() }}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">المصروفات</CardTitle>
            <CreditCard className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">0.00 ر.س</div>
            <p className="text-xs text-muted-foreground mt-1">
              لا توجد بيانات لـ {currentEntity.name}
            </p>
          </CardContent>
        </Card>
        <Card className="border-t-4" style={{ borderTopColor: getThemeColor() }}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">صافي الربح</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">0.00 ر.س</div>
            <p className="text-xs text-muted-foreground mt-1">
              لا توجد بيانات لـ {currentEntity.name}
            </p>
          </CardContent>
        </Card>
        <Card className="border-t-4" style={{ borderTopColor: getThemeColor() }}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">الفواتير المستحقة</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">0.00 ر.س</div>
            <p className="text-xs text-muted-foreground mt-1">
              0 فواتير لـ {currentEntity.name}
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        <Card className="col-span-4">
          <CardHeader>
            <CardTitle>نظرة عامة - {currentEntity.name}</CardTitle>
          </CardHeader>
          <CardContent className="pl-2">
            <div 
              className="h-[350px] flex items-center justify-center text-muted-foreground rounded-md border border-dashed transition-colors duration-300"
              style={{ backgroundColor: `${getThemeColor()}08` }}
            >
              لا توجد بيانات كافية لعرض الرسم البياني لهذا الكيان
            </div>
          </CardContent>
        </Card>
        <Card className="col-span-3">
          <CardHeader>
            <CardTitle>التدفق النقدي</CardTitle>
            <div className="text-sm text-muted-foreground">
              حركة النقد لـ {currentEntity.name} خلال الشهر الحالي
            </div>
          </CardHeader>
          <CardContent>
            <div 
              className="h-[350px] flex items-center justify-center text-muted-foreground rounded-md border border-dashed transition-colors duration-300"
              style={{ backgroundColor: `${getThemeColor()}08` }}
            >
              لا توجد بيانات كافية لعرض الرسم البياني لهذا الكيان
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

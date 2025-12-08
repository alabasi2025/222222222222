import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { 
  ArrowUpRight, 
  ArrowDownRight, 
  DollarSign, 
  CreditCard, 
  Activity,
  TrendingUp
} from "lucide-react";

export default function Home() {
  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">لوحة المعلومات</h2>
          <p className="text-muted-foreground mt-1">نظرة عامة على الأداء المالي لشركتك</p>
        </div>
        <div className="flex gap-2">
          <Button>تقرير جديد</Button>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">إجمالي الإيرادات</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">0.00 ر.س</div>
            <p className="text-xs text-muted-foreground mt-1">
              لا توجد بيانات
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">المصروفات</CardTitle>
            <CreditCard className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">0.00 ر.س</div>
            <p className="text-xs text-muted-foreground mt-1">
              لا توجد بيانات
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">صافي الربح</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">0.00 ر.س</div>
            <p className="text-xs text-muted-foreground mt-1">
              لا توجد بيانات
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">الفواتير المستحقة</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">0.00 ر.س</div>
            <p className="text-xs text-muted-foreground mt-1">
              0 فواتير
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        <Card className="col-span-4">
          <CardHeader>
            <CardTitle>نظرة عامة</CardTitle>
          </CardHeader>
          <CardContent className="pl-2">
            <div className="h-[350px] flex items-center justify-center text-muted-foreground bg-muted/10 rounded-md border border-dashed">
              لا توجد بيانات كافية لعرض الرسم البياني
            </div>
          </CardContent>
        </Card>
        <Card className="col-span-3">
          <CardHeader>
            <CardTitle>التدفق النقدي</CardTitle>
            <div className="text-sm text-muted-foreground">
              حركة النقد خلال الشهر الحالي
            </div>
          </CardHeader>
          <CardContent>
            <div className="h-[350px] flex items-center justify-center text-muted-foreground bg-muted/10 rounded-md border border-dashed">
              لا توجد بيانات كافية لعرض الرسم البياني
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

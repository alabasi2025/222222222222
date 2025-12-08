import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
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
  Store,
  Plus,
  Network,
  ArrowRight
} from "lucide-react";
import { useEntity } from "@/contexts/EntityContext";
import { Link } from "wouter";

export default function Home() {
  const { currentEntity, getThemeColor } = useEntity();

  // Helper to get entity type label
  const getEntityTypeLabel = () => {
    switch(currentEntity.type) {
      case 'holding': return 'الشركة القابضة';
      case 'unit': return 'وحدة أعمال';
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

      {/* Quick Actions Section - New Addition */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card className="bg-muted/30 border-dashed">
          <CardHeader className="pb-3">
            <CardTitle className="text-base font-medium flex items-center gap-2">
              <Network className="w-4 h-4 text-primary" />
              إدارة الهيكل التنظيمي
            </CardTitle>
            <CardDescription>الوصول السريع لإدارة الوحدات والفروع</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col gap-2">
              <Link href="/organization">
                <Button variant="outline" className="w-full justify-between group">
                  <span>عرض الهيكل التنظيمي</span>
                  <ArrowRight className="w-4 h-4 text-muted-foreground group-hover:translate-x-1 transition-transform" />
                </Button>
              </Link>
              
              {currentEntity.type === 'holding' && (
                <Link href="/organization">
                  <Button className="w-full justify-between" variant="secondary">
                    <span>إضافة وحدة أعمال جديدة</span>
                    <Plus className="w-4 h-4" />
                  </Button>
                </Link>
              )}
              
              {(currentEntity.type === 'unit' || currentEntity.type === 'branch') && (
                <Link href="/organization">
                  <Button className="w-full justify-between" variant="secondary">
                    <span>إضافة فرع جديد</span>
                    <Plus className="w-4 h-4" />
                  </Button>
                </Link>
              )}
            </div>
          </CardContent>
        </Card>

        <Card className="md:col-span-2 bg-gradient-to-br from-primary/5 to-transparent border-none shadow-sm">
          <CardHeader>
            <CardTitle className="text-lg">مرحباً بك في {currentEntity.name}</CardTitle>
            <CardDescription>
              {currentEntity.type === 'holding' 
                ? 'يمكنك إدارة جميع وحدات الأعمال والفروع التابعة للمجموعة من هنا.' 
                : currentEntity.type === 'unit'
                ? 'يمكنك متابعة أداء الفروع التابعة لهذه الوحدة وإدارتها.'
                : 'يمكنك إدارة العمليات اليومية للفرع ومتابعة الأداء المالي.'}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex gap-4 text-sm text-muted-foreground">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-green-500"></div>
                النظام يعمل بكفاءة
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-blue-500"></div>
                آخر تحديث: منذ دقيقة
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card className="border-t-4" style={{ borderTopColor: getThemeColor() }}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">إجمالي الإيرادات</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">45,231.89 ر.س</div>
            <p className="text-xs text-emerald-600 flex items-center mt-1">
              <TrendingUp className="w-3 h-3 mr-1" />
              +20.1% من الشهر الماضي
            </p>
          </CardContent>
        </Card>
        <Card className="border-t-4" style={{ borderTopColor: getThemeColor() }}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">المصروفات</CardTitle>
            <CreditCard className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">12,234.00 ر.س</div>
            <p className="text-xs text-rose-600 flex items-center mt-1">
              <ArrowDownRight className="w-3 h-3 mr-1" />
              +4.5% من الشهر الماضي
            </p>
          </CardContent>
        </Card>
        <Card className="border-t-4" style={{ borderTopColor: getThemeColor() }}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">صافي الربح</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">32,997.89 ر.س</div>
            <p className="text-xs text-emerald-600 flex items-center mt-1">
              <ArrowUpRight className="w-3 h-3 mr-1" />
              +12.2% من الشهر الماضي
            </p>
          </CardContent>
        </Card>
        <Card className="border-t-4" style={{ borderTopColor: getThemeColor() }}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">الفواتير المستحقة</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">573.00 ر.س</div>
            <p className="text-xs text-muted-foreground mt-1">
              +201 منذ آخر ساعة
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        <Card className="col-span-4">
          <CardHeader>
            <CardTitle>نظرة عامة - {currentEntity.name}</CardTitle>
            <CardDescription>مقارنة الإيرادات والمصروفات للأشهر الستة الماضية</CardDescription>
          </CardHeader>
          <CardContent className="pl-2">
            <div 
              className="h-[350px] w-full relative overflow-hidden rounded-md"
            >
              {/* Simulated Chart Visual */}
              <div className="absolute bottom-0 left-0 right-0 h-full flex items-end justify-between px-4 pb-4 gap-2">
                {[35, 45, 30, 60, 75, 50, 65].map((h, i) => (
                  <div key={i} className="w-full bg-gradient-to-t from-primary/20 to-primary/5 rounded-t-md relative group" style={{ height: `${h}%` }}>
                    <div 
                      className="absolute top-0 left-0 right-0 h-1 bg-primary/50 rounded-full"
                    ></div>
                    <div className="absolute -bottom-6 left-1/2 -translate-x-1/2 text-xs text-muted-foreground">
                      {['يناير', 'فبراير', 'مارس', 'أبريل', 'مايو', 'يونيو', 'يوليو'][i]}
                    </div>
                  </div>
                ))}
                
                {/* Overlay Area Chart Effect */}
                <svg className="absolute bottom-0 left-0 right-0 w-full h-full pointer-events-none opacity-30" preserveAspectRatio="none">
                  <path d="M0,350 L0,200 C50,150 100,250 150,100 C200,50 250,150 300,200 C350,250 400,150 450,180 C500,210 550,180 600,150 L600,350 Z" fill={getThemeColor()} />
                </svg>
              </div>
              
              {/* Y-Axis Labels */}
              <div className="absolute left-0 top-0 bottom-8 w-12 flex flex-col justify-between text-[10px] text-muted-foreground py-2 px-1 text-left">
                <span>10000 ر.س</span>
                <span>7500 ر.س</span>
                <span>5000 ر.س</span>
                <span>2500 ر.س</span>
                <span>0 ر.س</span>
              </div>
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
            <div className="h-[350px] flex items-end justify-between gap-4 px-2 pb-6">
              {[65, 45, 80, 45].map((h, i) => (
                <div key={i} className="flex-1 flex flex-col justify-end h-full group">
                  <div 
                    className="w-full rounded-t-md transition-all duration-500 hover:opacity-80"
                    style={{ 
                      height: `${h}%`, 
                      backgroundColor: '#22c55e' // Green for cash flow
                    }}
                  ></div>
                  <span className="text-xs text-center mt-2 text-muted-foreground">أسبوع {i+1}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

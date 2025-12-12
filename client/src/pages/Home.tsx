import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  ArrowUpRight, 
  ArrowDownRight, 
  DollarSign, 
  CreditCard, 
  Activity,
  TrendingUp,
  TrendingDown,
  Building2,
  Building,
  Store,
  Plus,
  Network,
  ArrowRight,
  ArrowLeft,
  Wallet,
  Receipt,
  ShoppingCart,
  Users,
  FileText,
  Clock,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Sparkles
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

  // Mock data for recent transactions
  const recentTransactions = [
    { id: 1, name: "شركة التقنية الحديثة", invoice: "INV-001", date: "2025-01-15", amount: "1,200.00", status: "paid" },
    { id: 2, name: "مؤسسة البناء", invoice: "INV-002", date: "2025-01-14", amount: "3,450.00", status: "pending" },
    { id: 3, name: "سوبر ماركت السلام", invoice: "INV-003", date: "2025-01-12", amount: "850.00", status: "paid" },
    { id: 4, name: "مطعم النخيل", invoice: "INV-004", date: "2025-01-10", amount: "2,100.00", status: "cancelled" },
    { id: 5, name: "مكتبة المعرفة", invoice: "INV-005", date: "2025-01-08", amount: "450.00", status: "paid" },
  ];

  const getStatusBadge = (status: string) => {
    switch(status) {
      case 'paid':
        return <Badge className="bg-emerald-500/10 text-emerald-600 hover:bg-emerald-500/20 border-emerald-500/20"><CheckCircle2 className="w-3 h-3 mr-1" />مدفوع</Badge>;
      case 'pending':
        return <Badge className="bg-amber-500/10 text-amber-600 hover:bg-amber-500/20 border-amber-500/20"><Clock className="w-3 h-3 mr-1" />مستحق</Badge>;
      case 'cancelled':
        return <Badge className="bg-rose-500/10 text-rose-600 hover:bg-rose-500/20 border-rose-500/20"><XCircle className="w-3 h-3 mr-1" />ملغى</Badge>;
      default:
        return null;
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      {/* Hero Section with Gradient */}
      <div className="relative overflow-hidden rounded-2xl border bg-gradient-to-br from-primary/10 via-primary/5 to-transparent p-8">
        <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-primary/5 rounded-full blur-3xl"></div>
        
        <div className="relative flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
          <div className="flex items-center gap-4">
            <div 
              className="p-4 rounded-2xl shadow-lg transition-all duration-300 hover:scale-105"
              style={{ 
                backgroundColor: getThemeColor(),
                boxShadow: `0 10px 40px -10px ${getThemeColor()}40`
              }}
            >
              <EntityIcon />
            </div>
            <div>
              <div className="flex items-center gap-3 mb-2">
                <h1 className="text-4xl font-bold tracking-tight bg-gradient-to-br from-foreground to-foreground/70 bg-clip-text">
                  {currentEntity.name}
                </h1>
                <Sparkles className="w-5 h-5 text-primary animate-pulse" />
              </div>
              <div className="flex items-center gap-3">
                <Badge 
                  className="text-xs font-medium border-0"
                  style={{ 
                    backgroundColor: `${getThemeColor()}20`,
                    color: getThemeColor()
                  }}
                >
                  {getEntityTypeLabel()}
                </Badge>
                <span className="text-sm text-muted-foreground">لوحة التحكم الرئيسية</span>
              </div>
            </div>
          </div>
          <div className="flex gap-3">
            <Button 
              variant="outline" 
              className="gap-2 hover:bg-primary/5"
            >
              <FileText className="w-4 h-4" />
              التقارير
            </Button>
            <Button 
              className="gap-2 shadow-lg"
              style={{ 
                backgroundColor: getThemeColor(),
                boxShadow: `0 4px 14px 0 ${getThemeColor()}40`
              }}
            >
              <Plus className="w-4 h-4" />
              إجراء جديد
            </Button>
          </div>
        </div>
      </div>

      {/* Stats Cards with Enhanced Design */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card className="border-0 shadow-lg hover:shadow-xl transition-all duration-300 bg-gradient-to-br from-emerald-50 to-white dark:from-emerald-950/20 dark:to-background overflow-hidden group">
          <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/10 rounded-full blur-2xl group-hover:scale-150 transition-transform duration-500"></div>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 relative">
            <CardTitle className="text-sm font-medium text-muted-foreground">إجمالي الإيرادات</CardTitle>
            <div className="p-2 rounded-lg bg-emerald-500/10">
              <DollarSign className="h-5 w-5 text-emerald-600" />
            </div>
          </CardHeader>
          <CardContent className="relative">
            <div className="text-3xl font-bold text-emerald-600">45,231.89 ر.س</div>
            <div className="flex items-center gap-1 mt-2">
              <TrendingUp className="w-4 h-4 text-emerald-600" />
              <span className="text-sm font-medium text-emerald-600">+20.1%</span>
              <span className="text-xs text-muted-foreground">من الشهر الماضي</span>
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-lg hover:shadow-xl transition-all duration-300 bg-gradient-to-br from-rose-50 to-white dark:from-rose-950/20 dark:to-background overflow-hidden group">
          <div className="absolute top-0 right-0 w-32 h-32 bg-rose-500/10 rounded-full blur-2xl group-hover:scale-150 transition-transform duration-500"></div>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 relative">
            <CardTitle className="text-sm font-medium text-muted-foreground">المصروفات</CardTitle>
            <div className="p-2 rounded-lg bg-rose-500/10">
              <CreditCard className="h-5 w-5 text-rose-600" />
            </div>
          </CardHeader>
          <CardContent className="relative">
            <div className="text-3xl font-bold text-rose-600">12,234.00 ر.س</div>
            <div className="flex items-center gap-1 mt-2">
              <TrendingDown className="w-4 h-4 text-rose-600" />
              <span className="text-sm font-medium text-rose-600">+4.5%</span>
              <span className="text-xs text-muted-foreground">من الشهر الماضي</span>
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-lg hover:shadow-xl transition-all duration-300 bg-gradient-to-br from-blue-50 to-white dark:from-blue-950/20 dark:to-background overflow-hidden group">
          <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/10 rounded-full blur-2xl group-hover:scale-150 transition-transform duration-500"></div>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 relative">
            <CardTitle className="text-sm font-medium text-muted-foreground">صافي الربح</CardTitle>
            <div className="p-2 rounded-lg bg-blue-500/10">
              <TrendingUp className="h-5 w-5 text-blue-600" />
            </div>
          </CardHeader>
          <CardContent className="relative">
            <div className="text-3xl font-bold text-blue-600">32,997.89 ر.س</div>
            <div className="flex items-center gap-1 mt-2">
              <TrendingUp className="w-4 h-4 text-blue-600" />
              <span className="text-sm font-medium text-blue-600">+12.2%</span>
              <span className="text-xs text-muted-foreground">من الشهر الماضي</span>
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-lg hover:shadow-xl transition-all duration-300 bg-gradient-to-br from-amber-50 to-white dark:from-amber-950/20 dark:to-background overflow-hidden group">
          <div className="absolute top-0 right-0 w-32 h-32 bg-amber-500/10 rounded-full blur-2xl group-hover:scale-150 transition-transform duration-500"></div>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 relative">
            <CardTitle className="text-sm font-medium text-muted-foreground">الفواتير المستحقة</CardTitle>
            <div className="p-2 rounded-lg bg-amber-500/10">
              <Activity className="h-5 w-5 text-amber-600" />
            </div>
          </CardHeader>
          <CardContent className="relative">
            <div className="text-3xl font-bold text-amber-600">573.00 ر.س</div>
            <div className="flex items-center gap-1 mt-2">
              <AlertCircle className="w-4 h-4 text-amber-600" />
              <span className="text-sm font-medium text-amber-600">+201</span>
              <span className="text-xs text-muted-foreground">منذ آخر ساعة</span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts Section */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        <Card className="col-span-4 border-0 shadow-lg">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-xl">نظرة عامة</CardTitle>
                <CardDescription className="mt-1">مقارنة الإيرادات والمصروفات للأشهر الستة الماضية</CardDescription>
              </div>
              <Button variant="outline" size="sm" className="gap-2">
                <FileText className="w-4 h-4" />
                تصدير
              </Button>
            </div>
          </CardHeader>
          <CardContent className="pl-2">
            <div className="h-[350px] w-full relative overflow-hidden rounded-lg bg-gradient-to-br from-muted/30 to-transparent">
              {/* Enhanced Chart Visual */}
              <div className="absolute bottom-0 left-0 right-0 h-full flex items-end justify-between px-8 pb-8 gap-3">
                {[35, 45, 30, 60, 75, 50, 65].map((h, i) => (
                  <div key={i} className="w-full relative group cursor-pointer">
                    <div 
                      className="w-full rounded-t-xl transition-all duration-500 hover:opacity-80 relative overflow-hidden"
                      style={{ 
                        height: `${h}%`,
                        background: `linear-gradient(to top, ${getThemeColor()}, ${getThemeColor()}80)`
                      }}
                    >
                      <div className="absolute inset-0 bg-gradient-to-t from-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
                    </div>
                    <div className="absolute -bottom-8 left-1/2 -translate-x-1/2 text-xs text-muted-foreground whitespace-nowrap">
                      {['يناير', 'فبراير', 'مارس', 'أبريل', 'مايو', 'يونيو', 'يوليو'][i]}
                    </div>
                  </div>
                ))}
              </div>
              
              {/* Y-Axis Labels */}
              <div className="absolute left-0 top-0 bottom-12 w-16 flex flex-col justify-between text-xs text-muted-foreground py-4 px-2">
                <span>10000 ر.س</span>
                <span>7500 ر.س</span>
                <span>5000 ر.س</span>
                <span>2500 ر.س</span>
                <span>0 ر.س</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="col-span-3 border-0 shadow-lg">
          <CardHeader>
            <CardTitle className="text-xl">التدفق النقدي</CardTitle>
            <CardDescription className="mt-1">حركة النقد خلال الشهر الحالي</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[350px] flex items-end justify-between gap-4 px-4 pb-8">
              {[65, 45, 80, 45].map((h, i) => (
                <div key={i} className="flex-1 flex flex-col justify-end h-full group cursor-pointer">
                  <div 
                    className="w-full rounded-t-xl transition-all duration-500 hover:scale-105 relative overflow-hidden"
                    style={{ 
                      height: `${h}%`,
                      background: 'linear-gradient(to top, #22c55e, #86efac)'
                    }}
                  >
                    <div className="absolute inset-0 bg-gradient-to-t from-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
                  </div>
                  <span className="text-xs text-center mt-3 text-muted-foreground font-medium">أسبوع {i+1}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Transactions & Bank Accounts */}
      <div className="grid gap-4 md:grid-cols-2">
        <Card className="border-0 shadow-lg">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-xl flex items-center gap-2">
                  <Receipt className="w-5 h-5 text-primary" />
                  آخر المعاملات
                </CardTitle>
                <CardDescription className="mt-1">أحدث الفواتير والمدفوعات المسجلة</CardDescription>
              </div>
              <Button variant="ghost" size="sm" className="gap-2 text-primary">
                عرض الكل
                <ArrowLeft className="w-4 h-4" />
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {recentTransactions.map((transaction) => (
                <div 
                  key={transaction.id}
                  className="flex items-center justify-between p-3 rounded-lg hover:bg-muted/50 transition-colors cursor-pointer group"
                >
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-primary/10 group-hover:bg-primary/20 transition-colors">
                      <FileText className="w-4 h-4 text-primary" />
                    </div>
                    <div>
                      <p className="font-medium text-sm">{transaction.name}</p>
                      <p className="text-xs text-muted-foreground">{transaction.invoice} • {transaction.date}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="text-right">
                      <p className="font-bold text-sm">{transaction.amount} ر.س</p>
                      {getStatusBadge(transaction.status)}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-lg">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-xl flex items-center gap-2">
                  <Wallet className="w-5 h-5 text-primary" />
                  حسابات البنوك
                </CardTitle>
                <CardDescription className="mt-1">الأرصدة الحالية</CardDescription>
              </div>
              <Button variant="ghost" size="sm" className="gap-2 text-primary">
                <Plus className="w-4 h-4" />
                إضافة
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="p-4 rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 text-white relative overflow-hidden group cursor-pointer hover:scale-[1.02] transition-transform">
                <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-2xl"></div>
                <div className="relative">
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <p className="text-sm opacity-90">البنك الأهلي</p>
                      <p className="text-xs opacity-75 mt-1">**** **** **** 4582</p>
                    </div>
                    <Badge className="bg-white/20 text-white border-0 hover:bg-white/30">نشط</Badge>
                  </div>
                  <div>
                    <p className="text-3xl font-bold">24,500.00 ر.س</p>
                  </div>
                </div>
              </div>

              <div className="p-4 rounded-xl bg-gradient-to-br from-emerald-500 to-emerald-600 text-white relative overflow-hidden group cursor-pointer hover:scale-[1.02] transition-transform">
                <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-2xl"></div>
                <div className="relative">
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <p className="text-sm opacity-90">الصندوق النقدي</p>
                      <p className="text-xs opacity-75 mt-1">الخزينة الرئيسية</p>
                    </div>
                  </div>
                  <div>
                    <p className="text-3xl font-bold">3,250.00 ر.س</p>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card className="border-0 shadow-lg bg-gradient-to-br from-primary/5 to-transparent">
        <CardHeader>
          <CardTitle className="text-xl flex items-center gap-2">
            <Network className="w-5 h-5 text-primary" />
            إجراءات سريعة
          </CardTitle>
          <CardDescription>الوصول السريع للعمليات الشائعة</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <Button variant="outline" className="h-auto flex-col gap-2 p-4 hover:bg-primary/5 hover:border-primary/20">
              <Receipt className="w-6 h-6 text-primary" />
              <span className="text-sm">فاتورة جديدة</span>
            </Button>
            <Button variant="outline" className="h-auto flex-col gap-2 p-4 hover:bg-primary/5 hover:border-primary/20">
              <ShoppingCart className="w-6 h-6 text-primary" />
              <span className="text-sm">مشتريات</span>
            </Button>
            <Button variant="outline" className="h-auto flex-col gap-2 p-4 hover:bg-primary/5 hover:border-primary/20">
              <Users className="w-6 h-6 text-primary" />
              <span className="text-sm">عميل جديد</span>
            </Button>
            <Button variant="outline" className="h-auto flex-col gap-2 p-4 hover:bg-primary/5 hover:border-primary/20">
              <FileText className="w-6 h-6 text-primary" />
              <span className="text-sm">قيد يومية</span>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

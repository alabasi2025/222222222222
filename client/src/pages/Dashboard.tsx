import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { DollarSign, CreditCard, Activity, TrendingUp, FileText, Loader2 } from "lucide-react";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { dashboardApi } from "../lib/api";

export default function Dashboard() {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    itemsCount: 0,
    warehousesCount: 0,
    bankAccountsCount: 0,
    totalBankBalance: 0,
    recentActivity: [] as any[]
  });
  const [revenueData, setRevenueData] = useState<any[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [statsData, chartData] = await Promise.all([
          dashboardApi.getStats(),
          dashboardApi.getRevenueChart()
        ]);
        setStats(statsData);
        setRevenueData(chartData);
      } catch (error) {
        console.error("Failed to fetch dashboard data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="flex h-[50vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">لوحة المعلومات</h2>
          <p className="text-muted-foreground mt-1">نظرة عامة على الأداء المالي لشركتك</p>
        </div>
        <div className="flex gap-2">
          <button className="px-4 py-2 bg-primary text-primary-foreground rounded-md text-sm font-medium hover:bg-primary/90 transition-colors">
            تقرير جديد
          </button>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">إجمالي الأصناف</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.itemsCount}</div>
            <p className="text-xs text-muted-foreground flex items-center mt-1">
              صنف مسجل
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">المستودعات</CardTitle>
            <CreditCard className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.warehousesCount}</div>
            <p className="text-xs text-muted-foreground flex items-center mt-1">
              مستودع نشط
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">رصيد الحسابات</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{Number(stats.totalBankBalance).toLocaleString()} ر.س</div>
             <p className="text-xs text-muted-foreground flex items-center mt-1">
              في {stats.bankAccountsCount} حسابات
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">نشاط المخزون</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.recentActivity.length}</div>
            <p className="text-xs text-muted-foreground mt-1">
              حركات أخيرة
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        <Card className="col-span-4">
          <CardHeader>
            <CardTitle>نظرة عامة</CardTitle>
            <CardDescription>الإيرادات والمصروفات (بيانات توضيحية)</CardDescription>
          </CardHeader>
          <CardContent className="pl-2">
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={revenueData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorIncome" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="var(--color-primary)" stopOpacity={0.8}/>
                      <stop offset="95%" stopColor="var(--color-primary)" stopOpacity={0}/>
                    </linearGradient>
                    <linearGradient id="colorExpense" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="var(--color-destructive)" stopOpacity={0.8}/>
                      <stop offset="95%" stopColor="var(--color-destructive)" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <XAxis dataKey="name" stroke="#888888" fontSize={12} tickLine={false} axisLine={false} />
                  <YAxis stroke="#888888" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(value) => `${value} ر.س`} />
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--color-border)" />
                  <Tooltip 
                    contentStyle={{ backgroundColor: 'var(--color-card)', borderRadius: '8px', border: '1px solid var(--color-border)' }}
                    itemStyle={{ color: 'var(--color-foreground)' }}
                  />
                  <Area type="monotone" dataKey="income" stroke="var(--color-primary)" fillOpacity={1} fill="url(#colorIncome)" name="الإيرادات" />
                  <Area type="monotone" dataKey="expense" stroke="var(--color-destructive)" fillOpacity={1} fill="url(#colorExpense)" name="المصروفات" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
        <Card className="col-span-3">
          <CardHeader>
            <CardTitle>آخر النشاطات</CardTitle>
            <CardDescription>أحدث حركات المخزون</CardDescription>
          </CardHeader>
          <CardContent>
             <div className="space-y-4">
              {stats.recentActivity.length > 0 ? (
                stats.recentActivity.map((item, i) => (
                  <div key={i} className="flex items-center justify-between p-2 hover:bg-muted/50 rounded-lg transition-colors">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                        <FileText className="w-5 h-5" />
                      </div>
                      <div>
                        <p className="font-medium">{item.type === 'in' ? 'إدخال مخزني' : 'صرف مخزني'}</p>
                        <p className="text-xs text-muted-foreground overflow-hidden text-ellipsis whitespace-nowrap max-w-[150px]">
                          {item.id} • {new Date(item.createdAt).toLocaleDateString('ar-SA')}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-bold">{Number(item.quantity).toLocaleString()} وحدة</p>
                      <span className={`text-xs px-2 py-0.5 rounded-full ${
                        item.type === 'in' ? "bg-emerald-100 text-emerald-700" : "bg-rose-100 text-rose-700"
                      }`}>
                        {item.type === 'in' ? 'وارد' : 'صادر'}
                      </span>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center text-muted-foreground py-8">
                  لا توجد نشاطات حديثة
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

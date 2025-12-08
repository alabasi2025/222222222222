import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { 
  ArrowUpRight, 
  ArrowDownRight, 
  DollarSign, 
  CreditCard, 
  Activity,
  TrendingUp,
  FileText,
  Wallet
} from "lucide-react";
import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  BarChart,
  Bar
} from "recharts";

const data = [
  { name: 'يناير', income: 4000, expense: 2400 },
  { name: 'فبراير', income: 3000, expense: 1398 },
  { name: 'مارس', income: 2000, expense: 9800 },
  { name: 'أبريل', income: 2780, expense: 3908 },
  { name: 'مايو', income: 1890, expense: 4800 },
  { name: 'يونيو', income: 2390, expense: 3800 },
  { name: 'يوليو', income: 3490, expense: 4300 },
];

const cashFlowData = [
  { name: 'أسبوع 1', value: 4000 },
  { name: 'أسبوع 2', value: 3000 },
  { name: 'أسبوع 3', value: 5000 },
  { name: 'أسبوع 4', value: 2780 },
];

export default function Dashboard() {
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
            <CardTitle className="text-sm font-medium">إجمالي الإيرادات</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">45,231.89 ر.س</div>
            <p className="text-xs text-muted-foreground flex items-center mt-1">
              <span className="text-emerald-500 flex items-center mr-1">
                +20.1% <ArrowUpRight className="h-3 w-3 ml-0.5" />
              </span>
              من الشهر الماضي
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">المصروفات</CardTitle>
            <CreditCard className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">12,234.00 ر.س</div>
            <p className="text-xs text-muted-foreground flex items-center mt-1">
              <span className="text-rose-500 flex items-center mr-1">
                +4.5% <ArrowDownRight className="h-3 w-3 ml-0.5" />
              </span>
              من الشهر الماضي
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">صافي الربح</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">32,997.89 ر.س</div>
            <p className="text-xs text-muted-foreground flex items-center mt-1">
              <span className="text-emerald-500 flex items-center mr-1">
                +12.2% <ArrowUpRight className="h-3 w-3 ml-0.5" />
              </span>
              من الشهر الماضي
            </p>
          </CardContent>
        </Card>
        <Card>
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
            <CardTitle>نظرة عامة</CardTitle>
            <CardDescription>مقارنة الإيرادات والمصروفات للأشهر الستة الماضية</CardDescription>
          </CardHeader>
          <CardContent className="pl-2">
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={data} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
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
            <CardTitle>التدفق النقدي</CardTitle>
            <CardDescription>حركة النقد خلال الشهر الحالي</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={cashFlowData}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--color-border)" />
                  <XAxis dataKey="name" stroke="#888888" fontSize={12} tickLine={false} axisLine={false} />
                  <Tooltip 
                    cursor={{fill: 'transparent'}}
                    contentStyle={{ backgroundColor: 'var(--color-card)', borderRadius: '8px', border: '1px solid var(--color-border)' }}
                  />
                  <Bar dataKey="value" fill="var(--color-secondary)" radius={[4, 4, 0, 0]} name="التدفق" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <Card className="col-span-2">
          <CardHeader>
            <CardTitle>آخر المعاملات</CardTitle>
            <CardDescription>أحدث الفواتير والمدفوعات المسجلة</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {[
                { id: "INV-001", client: "شركة التقنية الحديثة", amount: "1,200.00", status: "مدفوع", date: "2025-01-15" },
                { id: "INV-002", client: "مؤسسة البناء", amount: "3,450.00", status: "مستحق", date: "2025-01-14" },
                { id: "INV-003", client: "سوبر ماركت السلام", amount: "850.00", status: "مدفوع", date: "2025-01-12" },
                { id: "INV-004", client: "مطعم النخيل", amount: "2,100.00", status: "ملغى", date: "2025-01-10" },
                { id: "INV-005", client: "مكتبة المعرفة", amount: "450.00", status: "مدفوع", date: "2025-01-08" },
              ].map((item, i) => (
                <div key={i} className="flex items-center justify-between p-2 hover:bg-muted/50 rounded-lg transition-colors">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                      <FileText className="w-5 h-5" />
                    </div>
                    <div>
                      <p className="font-medium">{item.client}</p>
                      <p className="text-xs text-muted-foreground">{item.id} • {item.date}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-bold">{item.amount} ر.س</p>
                    <span className={`text-xs px-2 py-0.5 rounded-full ${
                      item.status === "مدفوع" ? "bg-emerald-100 text-emerald-700" :
                      item.status === "مستحق" ? "bg-amber-100 text-amber-700" :
                      "bg-rose-100 text-rose-700"
                    }`}>
                      {item.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>حسابات البنوك</CardTitle>
            <CardDescription>الأرصدة الحالية</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="p-4 border rounded-lg bg-card hover:shadow-sm transition-shadow">
                <div className="flex justify-between items-start mb-2">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 bg-blue-100 rounded flex items-center justify-center text-blue-600">
                      <CreditCard className="w-4 h-4" />
                    </div>
                    <div>
                      <p className="font-medium text-sm">البنك الأهلي</p>
                      <p className="text-xs text-muted-foreground">**** 4582</p>
                    </div>
                  </div>
                  <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded">نشط</span>
                </div>
                <p className="text-xl font-bold mt-2">24,500.00 ر.س</p>
              </div>
              
              <div className="p-4 border rounded-lg bg-card hover:shadow-sm transition-shadow">
                <div className="flex justify-between items-start mb-2">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 bg-purple-100 rounded flex items-center justify-center text-purple-600">
                      <Wallet className="w-4 h-4" />
                    </div>
                    <div>
                      <p className="font-medium text-sm">الصندوق النقدي</p>
                      <p className="text-xs text-muted-foreground">الخزينة الرئيسية</p>
                    </div>
                  </div>
                </div>
                <p className="text-xl font-bold mt-2">3,250.00 ر.س</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

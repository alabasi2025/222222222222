import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { 
  Plus, 
  Search, 
  Filter, 
  Download, 
  MoreHorizontal,
  Wallet,
  ArrowUpRight,
  ArrowDownLeft,
  History
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

// Mock data based on Chart of Accounts
const cashBoxes = [
  { id: "1111", name: "الصندوق الرئيسي", balance: 15000.00, currency: "SAR", status: "active", lastTransaction: "2023-11-15" },
  { id: "1113", name: "صندوق الفرع - الرياض", balance: 5200.00, currency: "SAR", status: "active", lastTransaction: "2023-11-14" },
  { id: "1114", name: "صندوق الفرع - جدة", balance: 3150.00, currency: "SAR", status: "active", lastTransaction: "2023-11-12" },
  { id: "1115", name: "العهدة النثرية", balance: 500.00, currency: "SAR", status: "active", lastTransaction: "2023-11-10" },
];

const recentTransactions = [
  { id: "TRX-001", date: "2023-11-15", description: "مقبوضات مبيعات نقدية", amount: 2500.00, type: "in", box: "الصندوق الرئيسي" },
  { id: "TRX-002", date: "2023-11-14", description: "شراء قرطاسية", amount: 150.00, type: "out", box: "العهدة النثرية" },
  { id: "TRX-003", date: "2023-11-14", description: "تحويل من البنك", amount: 5000.00, type: "in", box: "صندوق الفرع - الرياض" },
  { id: "TRX-004", date: "2023-11-13", description: "مصروفات صيانة", amount: 350.00, type: "out", box: "صندوق الفرع - جدة" },
];

export default function CashBoxes() {
  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">الصناديق والعهد</h2>
          <p className="text-muted-foreground mt-1">إدارة الصناديق النقدية والعهد ومتابعة أرصدتها</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm">
            <Download className="w-4 h-4 ml-2" />
            تصدير
          </Button>
          <Button size="sm">
            <Plus className="w-4 h-4 ml-2" />
            صندوق جديد
          </Button>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">إجمالي النقدية</CardTitle>
            <Wallet className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">23,850.00 ر.س</div>
            <p className="text-xs text-muted-foreground mt-1">
              +12.5% من الشهر الماضي
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">المقبوضات (اليوم)</CardTitle>
            <ArrowDownLeft className="h-4 w-4 text-emerald-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-emerald-600">2,500.00 ر.س</div>
            <p className="text-xs text-muted-foreground mt-1">
              5 عمليات استلام
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">المصروفات (اليوم)</CardTitle>
            <ArrowUpRight className="h-4 w-4 text-rose-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-rose-600">150.00 ر.س</div>
            <p className="text-xs text-muted-foreground mt-1">
              2 عمليات صرف
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="flex flex-col sm:flex-row gap-4 items-center justify-between bg-card p-4 rounded-lg border shadow-sm">
        <div className="relative w-full sm:w-96">
          <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input placeholder="بحث عن صندوق..." className="pr-9" />
        </div>
        <div className="flex gap-2 w-full sm:w-auto">
          <Button variant="outline" size="sm" className="flex-1 sm:flex-none">
            <Filter className="w-4 h-4 ml-2" />
            تصفية
          </Button>
        </div>
      </div>

      <div className="grid gap-8 md:grid-cols-3">
        <div className="md:col-span-2 space-y-4">
          <h3 className="text-lg font-semibold flex items-center gap-2">
            <Wallet className="w-5 h-5 text-primary" />
            قائمة الصناديق
          </h3>
          <div className="rounded-md border bg-card shadow-sm overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>اسم الصندوق</TableHead>
                  <TableHead>الرصيد الحالي</TableHead>
                  <TableHead>آخر حركة</TableHead>
                  <TableHead>الحالة</TableHead>
                  <TableHead className="text-left">إجراءات</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {cashBoxes.map((box) => (
                  <TableRow key={box.id} className="hover:bg-muted/50 transition-colors">
                    <TableCell>
                      <div className="font-medium">{box.name}</div>
                      <div className="text-xs text-muted-foreground">#{box.id}</div>
                    </TableCell>
                    <TableCell>
                      <span className="font-bold text-emerald-600">
                        {box.balance.toLocaleString()} {box.currency}
                      </span>
                    </TableCell>
                    <TableCell className="text-muted-foreground text-sm">
                      {box.lastTransaction}
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className="bg-emerald-50 text-emerald-700 border-emerald-200">
                        نشط
                      </Badge>
                    </TableCell>
                    <TableCell className="text-left">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" className="h-8 w-8 p-0">
                            <span className="sr-only">Open menu</span>
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuLabel>الإجراءات</DropdownMenuLabel>
                          <DropdownMenuItem>كشف حساب</DropdownMenuItem>
                          <DropdownMenuItem>سند قبض</DropdownMenuItem>
                          <DropdownMenuItem>سند صرف</DropdownMenuItem>
                          <DropdownMenuItem>تحويل أموال</DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem>تعديل البيانات</DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </div>

        <div className="space-y-4">
          <h3 className="text-lg font-semibold flex items-center gap-2">
            <History className="w-5 h-5 text-primary" />
            آخر الحركات
          </h3>
          <div className="space-y-3">
            {recentTransactions.map((trx) => (
              <div key={trx.id} className="bg-card p-3 rounded-lg border shadow-sm flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center ${trx.type === 'in' ? 'bg-emerald-100 text-emerald-600' : 'bg-rose-100 text-rose-600'}`}>
                    {trx.type === 'in' ? <ArrowDownLeft className="w-4 h-4" /> : <ArrowUpRight className="w-4 h-4" />}
                  </div>
                  <div>
                    <p className="text-sm font-medium">{trx.description}</p>
                    <p className="text-xs text-muted-foreground">{trx.box} • {trx.date}</p>
                  </div>
                </div>
                <span className={`text-sm font-bold ${trx.type === 'in' ? 'text-emerald-600' : 'text-rose-600'}`}>
                  {trx.type === 'in' ? '+' : '-'}{trx.amount.toLocaleString()}
                </span>
              </div>
            ))}
            <Button variant="ghost" className="w-full text-muted-foreground text-sm">
              عرض كل الحركات
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

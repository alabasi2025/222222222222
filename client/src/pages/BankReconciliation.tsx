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
  CheckCircle2,
  XCircle,
  AlertCircle,
  Upload,
  Landmark
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

const transactions = [
  { id: "TRX-001", date: "2025-01-20", description: "تحويل وارد - شركة الأفق", amount: 15000.00, type: "credit", status: "matched", bankDate: "2025-01-20" },
  { id: "TRX-002", date: "2025-01-19", description: "سداد فاتورة كهرباء", amount: -450.00, type: "debit", status: "matched", bankDate: "2025-01-19" },
  { id: "TRX-003", date: "2025-01-18", description: "شيك رقم 1055 - مورد أثاث", amount: -5000.00, type: "debit", status: "pending", bankDate: null },
  { id: "TRX-004", date: "2025-01-18", description: "إيداع نقدي - مبيعات الفرع", amount: 8500.00, type: "credit", status: "matched", bankDate: "2025-01-18" },
  { id: "TRX-005", date: "2025-01-15", description: "رسوم بنكية", amount: -25.00, type: "debit", status: "unmatched", bankDate: "2025-01-15" },
];

const statusMap: Record<string, { label: string, color: string, icon: any }> = {
  matched: { label: "مطابق", color: "bg-emerald-100 text-emerald-700 border-emerald-200", icon: CheckCircle2 },
  pending: { label: "معلق", color: "bg-amber-100 text-amber-700 border-amber-200", icon: AlertCircle },
  unmatched: { label: "غير مطابق", color: "bg-rose-100 text-rose-700 border-rose-200", icon: XCircle },
};

export default function BankReconciliation() {
  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">تسوية البنك</h2>
          <p className="text-muted-foreground mt-1">مطابقة العمليات البنكية وإدارة الشيكات</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm">
            <Upload className="w-4 h-4 ml-2" />
            استيراد كشف حساب
          </Button>
          <Button size="sm">
            <CheckCircle2 className="w-4 h-4 ml-2" />
            بدء التسوية
          </Button>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">رصيد الدفاتر</CardTitle>
            <Landmark className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">45,231.89 ر.س</div>
            <p className="text-xs text-muted-foreground">كما في 20 يناير 2025</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">رصيد البنك</CardTitle>
            <Landmark className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">50,231.89 ر.س</div>
            <p className="text-xs text-muted-foreground">وفقاً لآخر كشف حساب</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">الفرق (معلقات)</CardTitle>
            <AlertCircle className="h-4 w-4 text-amber-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-amber-600">-5,000.00 ر.س</div>
            <p className="text-xs text-muted-foreground">شيكات لم تصرف بعد</p>
          </CardContent>
        </Card>
      </div>

      <div className="flex flex-col sm:flex-row gap-4 items-center justify-between bg-card p-4 rounded-lg border shadow-sm">
        <div className="relative w-full sm:w-96">
          <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input placeholder="بحث في العمليات..." className="pr-9" />
        </div>
        <div className="flex gap-2 w-full sm:w-auto">
          <Button variant="outline" size="sm" className="flex-1 sm:flex-none">
            <Filter className="w-4 h-4 ml-2" />
            تصفية
          </Button>
          <select className="h-9 rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50">
            <option>جميع الحالات</option>
            <option>مطابق</option>
            <option>معلق</option>
            <option>غير مطابق</option>
          </select>
        </div>
      </div>

      <div className="rounded-md border bg-card shadow-sm overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[100px]">المرجع</TableHead>
              <TableHead>تاريخ العملية</TableHead>
              <TableHead className="w-[40%]">الوصف</TableHead>
              <TableHead>المبلغ</TableHead>
              <TableHead>تاريخ البنك</TableHead>
              <TableHead>الحالة</TableHead>
              <TableHead className="text-left">إجراءات</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {transactions.map((trx) => {
              const status = statusMap[trx.status];
              const StatusIcon = status.icon;
              
              return (
                <TableRow key={trx.id} className="hover:bg-muted/50 transition-colors">
                  <TableCell className="font-medium">{trx.id}</TableCell>
                  <TableCell>{trx.date}</TableCell>
                  <TableCell>{trx.description}</TableCell>
                  <TableCell className={`font-bold ${trx.amount > 0 ? "text-emerald-600" : "text-rose-600"}`}>
                    {trx.amount > 0 ? "+" : ""}{trx.amount.toLocaleString()} ر.س
                  </TableCell>
                  <TableCell>{trx.bankDate || "-"}</TableCell>
                  <TableCell>
                    <Badge variant="outline" className={`${status.color} gap-1 pl-2 pr-2 py-0.5 font-normal`}>
                      <StatusIcon className="w-3 h-3" />
                      {status.label}
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
                        <DropdownMenuItem>مطابقة يدوية</DropdownMenuItem>
                        <DropdownMenuItem>عرض القيد</DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem className="text-destructive">استبعاد</DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}

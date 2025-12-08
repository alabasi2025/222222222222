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
  ShoppingCart,
  CheckCircle2,
  Clock,
  AlertCircle,
  Truck
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

const purchases = [
  { id: "PUR-2025-001", supplier: "شركة التوريدات العالمية", date: "2025-01-18", amount: 15000.00, status: "received", items: 12 },
  { id: "PUR-2025-002", supplier: "مصنع الأثاث الحديث", date: "2025-01-16", amount: 8450.00, status: "pending", items: 5 },
  { id: "PUR-2025-003", supplier: "مؤسسة التقنية", date: "2025-01-15", amount: 3200.00, status: "ordered", items: 8 },
  { id: "PUR-2025-004", supplier: "شركة الورق والطباعة", date: "2025-01-10", amount: 1200.00, status: "received", items: 20 },
  { id: "PUR-2025-005", supplier: "موردين الإلكترونيات", date: "2025-01-05", amount: 25000.00, status: "overdue", items: 15 },
];

const statusMap: Record<string, { label: string, color: string, icon: any }> = {
  received: { label: "تم الاستلام", color: "bg-emerald-100 text-emerald-700 border-emerald-200", icon: CheckCircle2 },
  pending: { label: "قيد الانتظار", color: "bg-amber-100 text-amber-700 border-amber-200", icon: Clock },
  ordered: { label: "تم الطلب", color: "bg-blue-100 text-blue-700 border-blue-200", icon: Truck },
  overdue: { label: "متأخر", color: "bg-rose-100 text-rose-700 border-rose-200", icon: AlertCircle },
};

export default function Purchases() {
  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">المشتريات</h2>
          <p className="text-muted-foreground mt-1">إدارة أوامر الشراء والفواتير من الموردين</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm">
            <Download className="w-4 h-4 ml-2" />
            تصدير
          </Button>
          <Button size="sm">
            <Plus className="w-4 h-4 ml-2" />
            فاتورة شراء جديدة
          </Button>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row gap-4 items-center justify-between bg-card p-4 rounded-lg border shadow-sm">
        <div className="relative w-full sm:w-96">
          <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input placeholder="بحث برقم الفاتورة أو اسم المورد..." className="pr-9" />
        </div>
        <div className="flex gap-2 w-full sm:w-auto">
          <Button variant="outline" size="sm" className="flex-1 sm:flex-none">
            <Filter className="w-4 h-4 ml-2" />
            تصفية
          </Button>
          <select className="h-9 rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50">
            <option>جميع الحالات</option>
            <option>تم الاستلام</option>
            <option>قيد الانتظار</option>
            <option>تم الطلب</option>
          </select>
        </div>
      </div>

      <div className="rounded-md border bg-card shadow-sm overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[120px]">رقم الفاتورة</TableHead>
              <TableHead>المورد</TableHead>
              <TableHead>التاريخ</TableHead>
              <TableHead>عدد الأصناف</TableHead>
              <TableHead>المبلغ الإجمالي</TableHead>
              <TableHead>الحالة</TableHead>
              <TableHead className="text-left">إجراءات</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {purchases.map((purchase) => {
              const status = statusMap[purchase.status];
              const StatusIcon = status.icon;
              
              return (
                <TableRow key={purchase.id} className="hover:bg-muted/50 transition-colors">
                  <TableCell className="font-medium">{purchase.id}</TableCell>
                  <TableCell>{purchase.supplier}</TableCell>
                  <TableCell>{purchase.date}</TableCell>
                  <TableCell>{purchase.items}</TableCell>
                  <TableCell className="font-bold">{purchase.amount.toLocaleString()} ر.س</TableCell>
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
                        <DropdownMenuItem>عرض التفاصيل</DropdownMenuItem>
                        <DropdownMenuItem>تعديل الفاتورة</DropdownMenuItem>
                        <DropdownMenuItem>تسجيل استلام</DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem className="text-destructive">حذف</DropdownMenuItem>
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

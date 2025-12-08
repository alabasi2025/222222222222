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
  FileText,
  CheckCircle2,
  Clock,
  AlertCircle
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

const journals = [
  { id: "JV-2025-001", date: "2025-01-18", type: "opening", description: "القيد الافتتاحي للسنة المالية", total: 150000.00, status: "posted" },
  { id: "JV-2025-002", date: "2025-01-17", type: "depreciation", description: "إهلاك الأصول الثابتة - يناير", total: 2500.00, status: "draft" },
  { id: "JV-2025-003", date: "2025-01-16", type: "adjustment", description: "تسوية حساب البنك", total: 150.00, status: "posted" },
  { id: "JV-2025-004", date: "2025-01-15", type: "salary", description: "استحقاق رواتب يناير", total: 45000.00, status: "posted" },
  { id: "JV-2025-005", date: "2025-01-10", type: "expense", description: "مصروفات نثرية", total: 350.00, status: "cancelled" },
];

const statusMap: Record<string, { label: string, color: string, icon: any }> = {
  posted: { label: "مرحل", color: "bg-emerald-100 text-emerald-700 border-emerald-200", icon: CheckCircle2 },
  draft: { label: "مسودة", color: "bg-slate-100 text-slate-700 border-slate-200", icon: FileText },
  cancelled: { label: "ملغى", color: "bg-rose-100 text-rose-700 border-rose-200", icon: AlertCircle },
};

const typeMap: Record<string, string> = {
  opening: "قيد افتتاحي",
  depreciation: "إهلاك",
  adjustment: "تسوية",
  salary: "رواتب",
  expense: "مصروفات",
  general: "عام"
};

export default function JournalEntries() {
  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">قيود اليومية</h2>
          <p className="text-muted-foreground mt-1">إدارة القيود المحاسبية والعمليات اليدوية</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm">
            <Download className="w-4 h-4 ml-2" />
            تصدير
          </Button>
          <Button size="sm">
            <Plus className="w-4 h-4 ml-2" />
            قيد جديد
          </Button>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row gap-4 items-center justify-between bg-card p-4 rounded-lg border shadow-sm">
        <div className="relative w-full sm:w-96">
          <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input placeholder="بحث برقم القيد أو الوصف..." className="pr-9" />
        </div>
        <div className="flex gap-2 w-full sm:w-auto">
          <Button variant="outline" size="sm" className="flex-1 sm:flex-none">
            <Filter className="w-4 h-4 ml-2" />
            تصفية
          </Button>
          <select className="h-9 rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50">
            <option>جميع الحالات</option>
            <option>مرحل</option>
            <option>مسودة</option>
          </select>
        </div>
      </div>

      <div className="rounded-md border bg-card shadow-sm overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[120px]">رقم القيد</TableHead>
              <TableHead>التاريخ</TableHead>
              <TableHead>النوع</TableHead>
              <TableHead className="w-[40%]">الوصف</TableHead>
              <TableHead>الإجمالي</TableHead>
              <TableHead>الحالة</TableHead>
              <TableHead className="text-left">إجراءات</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {journals.map((journal) => {
              const status = statusMap[journal.status];
              const StatusIcon = status.icon;
              
              return (
                <TableRow key={journal.id} className="hover:bg-muted/50 transition-colors">
                  <TableCell className="font-medium">{journal.id}</TableCell>
                  <TableCell>{journal.date}</TableCell>
                  <TableCell>
                    <Badge variant="secondary" className="font-normal">
                      {typeMap[journal.type] || journal.type}
                    </Badge>
                  </TableCell>
                  <TableCell>{journal.description}</TableCell>
                  <TableCell className="font-bold">{journal.total.toLocaleString()} ر.س</TableCell>
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
                        <DropdownMenuItem>تكرار القيد</DropdownMenuItem>
                        <DropdownMenuItem>عكس القيد</DropdownMenuItem>
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

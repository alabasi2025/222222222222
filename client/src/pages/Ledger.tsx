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
  Search, 
  Filter, 
  Download, 
  Calendar,
  BookOpen
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const ledgerEntries = [
  { id: "JE-2025-001", date: "2025-01-18", account: "المبيعات", description: "فاتورة مبيعات #INV-001", debit: 0, credit: 1200.00 },
  { id: "JE-2025-001", date: "2025-01-18", account: "المدينون", description: "فاتورة مبيعات #INV-001", debit: 1200.00, credit: 0 },
  { id: "JE-2025-002", date: "2025-01-17", account: "المخزون", description: "شراء بضاعة #PUR-001", debit: 15000.00, credit: 0 },
  { id: "JE-2025-002", date: "2025-01-17", account: "البنك", description: "شراء بضاعة #PUR-001", debit: 0, credit: 15000.00 },
  { id: "JE-2025-003", date: "2025-01-16", account: "مصروفات الكهرباء", description: "فاتورة كهرباء يناير", debit: 450.00, credit: 0 },
  { id: "JE-2025-003", date: "2025-01-16", account: "الصندوق", description: "فاتورة كهرباء يناير", debit: 0, credit: 450.00 },
];

export default function Ledger() {
  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">دفتر الأستاذ العام</h2>
          <p className="text-muted-foreground mt-1">سجل جميع القيود المحاسبية والحركات المالية</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm">
            <Download className="w-4 h-4 ml-2" />
            تصدير PDF
          </Button>
          <Button variant="outline" size="sm">
            <Download className="w-4 h-4 ml-2" />
            تصدير Excel
          </Button>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">إجمالي المدين</CardTitle>
            <BookOpen className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">16,650.00 ر.س</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">إجمالي الدائن</CardTitle>
            <BookOpen className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">16,650.00 ر.س</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">عدد القيود</CardTitle>
            <BookOpen className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">3</div>
          </CardContent>
        </Card>
      </div>

      <div className="flex flex-col sm:flex-row gap-4 items-center justify-between bg-card p-4 rounded-lg border shadow-sm">
        <div className="relative w-full sm:w-96">
          <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input placeholder="بحث في الوصف أو الحساب..." className="pr-9" />
        </div>
        <div className="flex gap-2 w-full sm:w-auto">
          <Button variant="outline" size="sm" className="flex-1 sm:flex-none">
            <Calendar className="w-4 h-4 ml-2" />
            الفترة
          </Button>
          <Button variant="outline" size="sm" className="flex-1 sm:flex-none">
            <Filter className="w-4 h-4 ml-2" />
            تصفية الحسابات
          </Button>
        </div>
      </div>

      <div className="rounded-md border bg-card shadow-sm overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[120px]">التاريخ</TableHead>
              <TableHead className="w-[150px]">رقم القيد</TableHead>
              <TableHead>الحساب</TableHead>
              <TableHead>البيان</TableHead>
              <TableHead className="text-left">مدين</TableHead>
              <TableHead className="text-left">دائن</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {ledgerEntries.map((entry, index) => (
              <TableRow key={index} className="hover:bg-muted/50 transition-colors">
                <TableCell>{entry.date}</TableCell>
                <TableCell className="font-medium text-xs text-muted-foreground">{entry.id}</TableCell>
                <TableCell className="font-medium">{entry.account}</TableCell>
                <TableCell>{entry.description}</TableCell>
                <TableCell className="text-left font-mono">
                  {entry.debit > 0 ? entry.debit.toLocaleString() : "-"}
                </TableCell>
                <TableCell className="text-left font-mono">
                  {entry.credit > 0 ? entry.credit.toLocaleString() : "-"}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}

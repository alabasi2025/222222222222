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
  FolderTree,
  ChevronRight,
  ChevronDown,
  Folder,
  FileText
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
import { useState } from "react";

// Mock data for Chart of Accounts
const accountsData = [
  { id: "1000", name: "الأصول", type: "asset", level: 1, balance: 450000.00, hasChildren: true, expanded: true },
  { id: "1100", name: "الأصول المتداولة", type: "asset", level: 2, balance: 150000.00, hasChildren: true, expanded: true },
  { id: "1110", name: "النقد وما في حكمه", type: "asset", level: 3, balance: 50000.00, hasChildren: true, expanded: true },
  { id: "1111", name: "الصندوق الرئيسي", type: "asset", level: 4, balance: 15000.00, hasChildren: false },
  { id: "1112", name: "البنك الأهلي", type: "asset", level: 4, balance: 35000.00, hasChildren: false },
  { id: "1120", name: "العملاء", type: "asset", level: 3, balance: 45000.00, hasChildren: false },
  { id: "1130", name: "المخزون", type: "asset", level: 3, balance: 55000.00, hasChildren: false },
  { id: "1200", name: "الأصول الثابتة", type: "asset", level: 2, balance: 300000.00, hasChildren: true, expanded: false },
  { id: "2000", name: "الخصوم", type: "liability", level: 1, balance: 120000.00, hasChildren: true, expanded: true },
  { id: "2100", name: "الخصوم المتداولة", type: "liability", level: 2, balance: 45000.00, hasChildren: true, expanded: true },
  { id: "2110", name: "الموردين", type: "liability", level: 3, balance: 25000.00, hasChildren: false },
  { id: "3000", name: "حقوق الملكية", type: "equity", level: 1, balance: 330000.00, hasChildren: true, expanded: false },
  { id: "4000", name: "الإيرادات", type: "income", level: 1, balance: 85000.00, hasChildren: true, expanded: false },
  { id: "5000", name: "المصروفات", type: "expense", level: 1, balance: 35000.00, hasChildren: true, expanded: false },
];

const typeMap: Record<string, { label: string, color: string }> = {
  asset: { label: "أصول", color: "bg-blue-100 text-blue-700 border-blue-200" },
  liability: { label: "خصوم", color: "bg-rose-100 text-rose-700 border-rose-200" },
  equity: { label: "حقوق ملكية", color: "bg-purple-100 text-purple-700 border-purple-200" },
  income: { label: "إيرادات", color: "bg-emerald-100 text-emerald-700 border-emerald-200" },
  expense: { label: "مصروفات", color: "bg-amber-100 text-amber-700 border-amber-200" },
};

export default function ChartOfAccounts() {
  const [accounts, setAccounts] = useState(accountsData);

  const toggleExpand = (id: string) => {
    setAccounts(accounts.map(acc => 
      acc.id === id ? { ...acc, expanded: !acc.expanded } : acc
    ));
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">شجرة الحسابات</h2>
          <p className="text-muted-foreground mt-1">الهيكل التنظيمي للحسابات المالية</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm">
            <Download className="w-4 h-4 ml-2" />
            تصدير
          </Button>
          <Button size="sm">
            <Plus className="w-4 h-4 ml-2" />
            حساب جديد
          </Button>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row gap-4 items-center justify-between bg-card p-4 rounded-lg border shadow-sm">
        <div className="relative w-full sm:w-96">
          <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input placeholder="بحث برقم الحساب أو الاسم..." className="pr-9" />
        </div>
        <div className="flex gap-2 w-full sm:w-auto">
          <Button variant="outline" size="sm" className="flex-1 sm:flex-none">
            <Filter className="w-4 h-4 ml-2" />
            تصفية
          </Button>
          <Button variant="outline" size="sm" className="flex-1 sm:flex-none">
            <FolderTree className="w-4 h-4 ml-2" />
            طي الكل
          </Button>
        </div>
      </div>

      <div className="rounded-md border bg-card shadow-sm overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[400px]">اسم الحساب</TableHead>
              <TableHead>الرمز</TableHead>
              <TableHead>النوع</TableHead>
              <TableHead>الرصيد الحالي</TableHead>
              <TableHead className="text-left">إجراءات</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {accounts.map((account) => {
              const type = typeMap[account.type];
              
              // Simple logic to hide children if parent is collapsed (for demo purposes)
              // In a real app, this would be recursive or tree-based
              
              return (
                <TableRow key={account.id} className="hover:bg-muted/50 transition-colors">
                  <TableCell>
                    <div 
                      className="flex items-center gap-2" 
                      style={{ paddingRight: `${(account.level - 1) * 24}px` }}
                    >
                      {account.hasChildren ? (
                        <button onClick={() => toggleExpand(account.id)} className="p-1 hover:bg-muted rounded">
                          {account.expanded ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
                        </button>
                      ) : (
                        <span className="w-6" />
                      )}
                      {account.hasChildren ? (
                        <Folder className="w-4 h-4 text-blue-500" />
                      ) : (
                        <FileText className="w-4 h-4 text-muted-foreground" />
                      )}
                      <span className={account.hasChildren ? "font-semibold" : ""}>{account.name}</span>
                    </div>
                  </TableCell>
                  <TableCell className="font-mono text-muted-foreground">{account.id}</TableCell>
                  <TableCell>
                    <Badge variant="outline" className={`${type.color} font-normal`}>
                      {type.label}
                    </Badge>
                  </TableCell>
                  <TableCell className="font-bold font-mono">
                    {account.balance.toLocaleString()} ر.س
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
                        <DropdownMenuItem>إضافة حساب فرعي</DropdownMenuItem>
                        <DropdownMenuItem>تعديل</DropdownMenuItem>
                        <DropdownMenuItem>كشف حساب</DropdownMenuItem>
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

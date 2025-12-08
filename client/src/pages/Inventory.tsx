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
  Package,
  AlertTriangle,
  ArrowUpRight,
  ArrowDownRight
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
import { Progress } from "@/components/ui/progress";

const products = [
  { id: "PRD-001", name: "لابتوب ديل XPS 15", category: "إلكترونيات", stock: 12, minStock: 5, price: 8500.00, status: "in_stock" },
  { id: "PRD-002", name: "طابعة ليزر HP", category: "أجهزة مكتبية", stock: 3, minStock: 5, price: 1200.00, status: "low_stock" },
  { id: "PRD-003", name: "شاشة سامسونج 27 بوصة", category: "إلكترونيات", stock: 0, minStock: 3, price: 1800.00, status: "out_of_stock" },
  { id: "PRD-004", name: "ماوس لاسلكي لوجيتك", category: "ملحقات", stock: 45, minStock: 10, price: 150.00, status: "in_stock" },
  { id: "PRD-005", name: "كيبورد ميكانيكي", category: "ملحقات", stock: 8, minStock: 5, price: 450.00, status: "in_stock" },
  { id: "PRD-006", name: "مكتب خشبي فاخر", category: "أثاث", stock: 2, minStock: 2, price: 3500.00, status: "low_stock" },
];

const statusMap: Record<string, { label: string, color: string }> = {
  in_stock: { label: "متوفر", color: "bg-emerald-100 text-emerald-700 border-emerald-200" },
  low_stock: { label: "منخفض", color: "bg-amber-100 text-amber-700 border-amber-200" },
  out_of_stock: { label: "نفذت الكمية", color: "bg-rose-100 text-rose-700 border-rose-200" },
};

export default function Inventory() {
  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">المخزون</h2>
          <p className="text-muted-foreground mt-1">إدارة المنتجات ومراقبة مستويات المخزون</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm">
            <Download className="w-4 h-4 ml-2" />
            تصدير
          </Button>
          <Button size="sm">
            <Plus className="w-4 h-4 ml-2" />
            منتج جديد
          </Button>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <div className="bg-card p-4 rounded-lg border shadow-sm flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-muted-foreground">إجمالي المنتجات</p>
            <h3 className="text-2xl font-bold mt-1">1,240</h3>
          </div>
          <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center text-primary">
            <Package className="w-5 h-5" />
          </div>
        </div>
        <div className="bg-card p-4 rounded-lg border shadow-sm flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-muted-foreground">قيمة المخزون</p>
            <h3 className="text-2xl font-bold mt-1">345,200 ر.س</h3>
          </div>
          <div className="w-10 h-10 bg-emerald-100 rounded-full flex items-center justify-center text-emerald-600">
            <ArrowUpRight className="w-5 h-5" />
          </div>
        </div>
        <div className="bg-card p-4 rounded-lg border shadow-sm flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-muted-foreground">تنبيهات المخزون</p>
            <h3 className="text-2xl font-bold mt-1 text-amber-600">12</h3>
          </div>
          <div className="w-10 h-10 bg-amber-100 rounded-full flex items-center justify-center text-amber-600">
            <AlertTriangle className="w-5 h-5" />
          </div>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row gap-4 items-center justify-between bg-card p-4 rounded-lg border shadow-sm">
        <div className="relative w-full sm:w-96">
          <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input placeholder="بحث باسم المنتج أو الرمز..." className="pr-9" />
        </div>
        <div className="flex gap-2 w-full sm:w-auto">
          <Button variant="outline" size="sm" className="flex-1 sm:flex-none">
            <Filter className="w-4 h-4 ml-2" />
            تصفية
          </Button>
          <select className="h-9 rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50">
            <option>جميع الفئات</option>
            <option>إلكترونيات</option>
            <option>أثاث</option>
            <option>ملحقات</option>
          </select>
        </div>
      </div>

      <div className="rounded-md border bg-card shadow-sm overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[100px]">الرمز</TableHead>
              <TableHead>اسم المنتج</TableHead>
              <TableHead>الفئة</TableHead>
              <TableHead>السعر</TableHead>
              <TableHead>المخزون</TableHead>
              <TableHead>الحالة</TableHead>
              <TableHead className="text-left">إجراءات</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {products.map((product) => {
              const status = statusMap[product.status];
              const stockPercentage = Math.min((product.stock / (product.minStock * 3)) * 100, 100);
              
              return (
                <TableRow key={product.id} className="hover:bg-muted/50 transition-colors">
                  <TableCell className="font-medium">{product.id}</TableCell>
                  <TableCell className="font-semibold">{product.name}</TableCell>
                  <TableCell>{product.category}</TableCell>
                  <TableCell>{product.price.toLocaleString()} ر.س</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <span className="w-8 text-sm">{product.stock}</span>
                      <Progress value={stockPercentage} className="w-20 h-2" />
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline" className={`${status.color} font-normal`}>
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
                        <DropdownMenuItem>تعديل المنتج</DropdownMenuItem>
                        <DropdownMenuItem>حركة المخزون</DropdownMenuItem>
                        <DropdownMenuItem>تعديل السعر</DropdownMenuItem>
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

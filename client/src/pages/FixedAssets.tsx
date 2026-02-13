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
import { Plus, Search, Filter, Download, MoreHorizontal, Monitor, Truck, Building2, Calculator } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";

const assets = [
  { id: "AST-001", name: "سيارة تويوتا هايلكس", category: "vehicles", purchaseDate: "2024-01-15", cost: 85000.00, currentValue: 68000.00, status: "active" },
  { id: "AST-002", name: "لابتوب ماك بوك برو", category: "electronics", purchaseDate: "2024-02-01", cost: 12000.00, currentValue: 9500.00, status: "active" },
  { id: "AST-003", name: "أثاث مكتبي - مكتب المدير", category: "furniture", purchaseDate: "2023-12-10", cost: 15000.00, currentValue: 11250.00, status: "active" },
  { id: "AST-004", name: "مكيف سبليت - غرفة الاجتماعات", category: "fixtures", purchaseDate: "2024-03-20", cost: 4500.00, currentValue: 3800.00, status: "maintenance" },
  { id: "AST-005", name: "طابعة ليزر مركزية", category: "electronics", purchaseDate: "2024-01-05", cost: 8500.00, currentValue: 0.00, status: "disposed" },
];

const categoryMap: Record<string, { label: string, icon: any }> = {
  vehicles: { label: "سيارات", icon: Truck },
  electronics: { label: "أجهزة إلكترونية", icon: Monitor },
  furniture: { label: "أثاث", icon: Building2 },
  fixtures: { label: "تجهيزات", icon: Building2 },
};

const statusMap: Record<string, { label: string, color: string }> = {
  active: { label: "نشط", color: "bg-emerald-100 text-emerald-700 border-emerald-200" },
  maintenance: { label: "صيانة", color: "bg-amber-100 text-amber-700 border-amber-200" },
  disposed: { label: "مستبعد", color: "bg-slate-100 text-slate-700 border-slate-200" },
};

export default function FixedAssets() {
  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">الأصول الثابتة</h2>
          <p className="text-muted-foreground mt-1">إدارة الأصول، الإهلاك، والاستبعادات</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm">
            <Calculator className="w-4 h-4 ml-2" />
            حساب الإهلاك
          </Button>
          <Button size="sm">
            <Plus className="w-4 h-4 ml-2" />
            أصل جديد
          </Button>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        <div className="bg-card p-4 rounded-lg border shadow-sm">
          <div className="text-sm font-medium text-muted-foreground">إجمالي قيمة الأصول (شراء)</div>
          <div className="text-2xl font-bold mt-2">125,000.00 ر.س</div>
        </div>
        <div className="bg-card p-4 rounded-lg border shadow-sm">
          <div className="text-sm font-medium text-muted-foreground">القيمة الدفترية الحالية</div>
          <div className="text-2xl font-bold mt-2 text-blue-600">92,550.00 ر.س</div>
        </div>
        <div className="bg-card p-4 rounded-lg border shadow-sm">
          <div className="text-sm font-medium text-muted-foreground">مجمع الإهلاك</div>
          <div className="text-2xl font-bold mt-2 text-amber-600">32,450.00 ر.س</div>
        </div>
        <div className="bg-card p-4 rounded-lg border shadow-sm">
          <div className="text-sm font-medium text-muted-foreground">عدد الأصول النشطة</div>
          <div className="text-2xl font-bold mt-2">4</div>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row gap-4 items-center justify-between bg-card p-4 rounded-lg border shadow-sm">
        <div className="relative w-full sm:w-96">
          <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input placeholder="بحث باسم الأصل أو الرقم..." className="pr-9" />
        </div>
        <div className="flex gap-2 w-full sm:w-auto">
          <Button variant="outline" size="sm" className="flex-1 sm:flex-none">
            <Filter className="w-4 h-4 ml-2" />
            تصفية
          </Button>
          <Button variant="outline" size="sm" className="flex-1 sm:flex-none">
            <Download className="w-4 h-4 ml-2" />
            تصدير
          </Button>
        </div>
      </div>

      <div className="rounded-md border bg-card shadow-sm overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[100px]">الرمز</TableHead>
              <TableHead>اسم الأصل</TableHead>
              <TableHead>التصنيف</TableHead>
              <TableHead>تاريخ الشراء</TableHead>
              <TableHead>تكلفة الشراء</TableHead>
              <TableHead>القيمة الحالية</TableHead>
              <TableHead>الحالة</TableHead>
              <TableHead className="text-left">إجراءات</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {assets.map((asset) => {
              const category = categoryMap[asset.category] || { label: asset.category, icon: Building2 };
              const status = statusMap[asset.status];
              const CategoryIcon = category.icon;
              
              return (
                <TableRow key={asset.id} className="hover:bg-muted/50 transition-colors">
                  <TableCell className="font-medium">{asset.id}</TableCell>
                  <TableCell className="font-semibold">{asset.name}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <CategoryIcon className="w-4 h-4" />
                      <span>{category.label}</span>
                    </div>
                  </TableCell>
                  <TableCell>{asset.purchaseDate}</TableCell>
                  <TableCell>{asset.cost.toLocaleString()} ر.س</TableCell>
                  <TableCell className="font-bold text-blue-600">{asset.currentValue.toLocaleString()} ر.س</TableCell>
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
                        <DropdownMenuItem>عرض التفاصيل</DropdownMenuItem>
                        <DropdownMenuItem>سجل الإهلاك</DropdownMenuItem>
                        <DropdownMenuItem>صيانة</DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem className="text-destructive">استبعاد/بيع</DropdownMenuItem>
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

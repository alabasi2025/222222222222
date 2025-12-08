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
  Target,
  TrendingUp,
  TrendingDown,
  Building,
  Briefcase
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

const costCenters = [
  { id: "CC-100", name: "الفرع الرئيسي - الرياض", type: "branch", budget: 500000, actual: 320000, variance: 180000, status: "active" },
  { id: "CC-101", name: "فرع جدة", type: "branch", budget: 300000, actual: 280000, variance: 20000, status: "warning" },
  { id: "CC-200", name: "مشروع برج المملكة", type: "project", budget: 1200000, actual: 450000, variance: 750000, status: "active" },
  { id: "CC-201", name: "مشروع تطوير الموقع", type: "project", budget: 50000, actual: 55000, variance: -5000, status: "over_budget" },
  { id: "CC-300", name: "قسم التسويق", type: "department", budget: 100000, actual: 45000, variance: 55000, status: "active" },
];

const typeMap: Record<string, { label: string, icon: any }> = {
  branch: { label: "فرع", icon: Building },
  project: { label: "مشروع", icon: Target },
  department: { label: "قسم", icon: Briefcase },
};

const statusMap: Record<string, { label: string, color: string }> = {
  active: { label: "ضمن الميزانية", color: "bg-emerald-100 text-emerald-700 border-emerald-200" },
  warning: { label: "قريب من الحد", color: "bg-amber-100 text-amber-700 border-amber-200" },
  over_budget: { label: "تجاوز الميزانية", color: "bg-rose-100 text-rose-700 border-rose-200" },
};

export default function CostCenters() {
  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">مراكز التكلفة</h2>
          <p className="text-muted-foreground mt-1">تتبع المصروفات والإيرادات حسب المشاريع والفروع</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm">
            <Download className="w-4 h-4 ml-2" />
            تقرير الأداء
          </Button>
          <Button size="sm">
            <Plus className="w-4 h-4 ml-2" />
            مركز جديد
          </Button>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <div className="bg-card p-4 rounded-lg border shadow-sm">
          <div className="flex justify-between items-start">
            <div>
              <div className="text-sm font-medium text-muted-foreground">إجمالي الميزانية المعتمدة</div>
              <div className="text-2xl font-bold mt-2">2,150,000 ر.س</div>
            </div>
            <div className="p-2 bg-blue-100 rounded-full">
              <Target className="w-5 h-5 text-blue-600" />
            </div>
          </div>
        </div>
        <div className="bg-card p-4 rounded-lg border shadow-sm">
          <div className="flex justify-between items-start">
            <div>
              <div className="text-sm font-medium text-muted-foreground">المصروف الفعلي</div>
              <div className="text-2xl font-bold mt-2 text-rose-600">1,150,000 ر.س</div>
            </div>
            <div className="p-2 bg-rose-100 rounded-full">
              <TrendingDown className="w-5 h-5 text-rose-600" />
            </div>
          </div>
        </div>
        <div className="bg-card p-4 rounded-lg border shadow-sm">
          <div className="flex justify-between items-start">
            <div>
              <div className="text-sm font-medium text-muted-foreground">المتبقي من الميزانية</div>
              <div className="text-2xl font-bold mt-2 text-emerald-600">1,000,000 ر.س</div>
            </div>
            <div className="p-2 bg-emerald-100 rounded-full">
              <TrendingUp className="w-5 h-5 text-emerald-600" />
            </div>
          </div>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row gap-4 items-center justify-between bg-card p-4 rounded-lg border shadow-sm">
        <div className="relative w-full sm:w-96">
          <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input placeholder="بحث باسم المركز أو المشروع..." className="pr-9" />
        </div>
        <div className="flex gap-2 w-full sm:w-auto">
          <Button variant="outline" size="sm" className="flex-1 sm:flex-none">
            <Filter className="w-4 h-4 ml-2" />
            تصفية
          </Button>
        </div>
      </div>

      <div className="rounded-md border bg-card shadow-sm overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[100px]">الرمز</TableHead>
              <TableHead>اسم المركز</TableHead>
              <TableHead>النوع</TableHead>
              <TableHead className="w-[200px]">استهلاك الميزانية</TableHead>
              <TableHead>الميزانية</TableHead>
              <TableHead>الفعلي</TableHead>
              <TableHead>الحالة</TableHead>
              <TableHead className="text-left">إجراءات</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {costCenters.map((center) => {
              const type = typeMap[center.type];
              const status = statusMap[center.status];
              const TypeIcon = type.icon;
              const percentage = Math.min(100, Math.max(0, (center.actual / center.budget) * 100));
              
              return (
                <TableRow key={center.id} className="hover:bg-muted/50 transition-colors">
                  <TableCell className="font-medium">{center.id}</TableCell>
                  <TableCell className="font-semibold">{center.name}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <TypeIcon className="w-4 h-4" />
                      <span>{type.label}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="space-y-1">
                      <div className="flex justify-between text-xs">
                        <span>{percentage.toFixed(1)}%</span>
                      </div>
                      <Progress value={percentage} className={`h-2 ${percentage > 100 ? "bg-rose-200" : ""}`} />
                    </div>
                  </TableCell>
                  <TableCell>{center.budget.toLocaleString()}</TableCell>
                  <TableCell className="font-bold">{center.actual.toLocaleString()}</TableCell>
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
                        <DropdownMenuItem>تحليل المصروفات</DropdownMenuItem>
                        <DropdownMenuItem>تعديل الميزانية</DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem className="text-destructive">إغلاق المركز</DropdownMenuItem>
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

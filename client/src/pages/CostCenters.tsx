import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Plus,
  Search,
  Download,
  MoreHorizontal,
  Target,
  TrendingUp,
  TrendingDown,
  Building,
  Briefcase,
  Save,
  Loader2,
  Pencil,
  Trash2,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { useState, useEffect, useCallback } from "react";
import { toast } from "sonner";
import { useEntity } from "@/contexts/EntityContext";
import { costCentersApi } from "@/lib/api";

const typeMap: Record<string, { label: string; icon: any }> = {
  branch: { label: "فرع", icon: Building },
  project: { label: "مشروع", icon: Target },
  department: { label: "قسم", icon: Briefcase },
};

const statusMap: Record<string, { label: string; color: string }> = {
  active: {
    label: "ضمن الميزانية",
    color: "bg-emerald-100 text-emerald-700 border-emerald-200",
  },
  warning: {
    label: "قريب من الحد",
    color: "bg-amber-100 text-amber-700 border-amber-200",
  },
  over_budget: {
    label: "تجاوز الميزانية",
    color: "bg-rose-100 text-rose-700 border-rose-200",
  },
};

export default function CostCenters() {
  const { currentEntity, getThemeColor } = useEntity();
  const [costCenters, setCostCenters] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [newCenter, setNewCenter] = useState({
    name: "",
    code: "",
    centerType: "branch",
    budget: "",
    description: "",
  });

  const loadData = useCallback(async () => {
    if (!currentEntity) return;
    setIsLoading(true);
    try {
      const response = await costCentersApi.getAll({
        entityId: currentEntity.id,
      });
      const data = Array.isArray(response)
        ? response
        : (response as any)?.data || [];
      setCostCenters(data);
    } catch {
      setCostCenters([]);
    } finally {
      setIsLoading(false);
    }
  }, [currentEntity]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  if (!currentEntity) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-muted-foreground">الرجاء اختيار كيان أولاً</p>
      </div>
    );
  }

  const filteredCenters = costCenters.filter(
    (c: any) =>
      c.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.code?.includes(searchTerm)
  );

  const totalBudget = costCenters.reduce(
    (sum: number, c: any) => sum + Number(c.budget || 0),
    0
  );
  const totalActual = costCenters.reduce(
    (sum: number, c: any) => sum + Number(c.actualSpent || 0),
    0
  );
  const totalRemaining = totalBudget - totalActual;

  const handleAdd = async () => {
    if (!newCenter.name || !newCenter.code) {
      toast.error("يرجى تعبئة الاسم والرمز");
      return;
    }
    setIsSaving(true);
    try {
      await costCentersApi.create({
        entityId: currentEntity.id,
        name: newCenter.name,
        code: newCenter.code,
        centerType: newCenter.centerType,
        budget: newCenter.budget || "0",
        description: newCenter.description || null,
        status: "active",
      });
      toast.success("تم إضافة مركز التكلفة بنجاح");
      setIsAddOpen(false);
      setNewCenter({
        name: "",
        code: "",
        centerType: "branch",
        budget: "",
        description: "",
      });
      loadData();
    } catch {
      toast.error("فشل إضافة مركز التكلفة");
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("هل أنت متأكد من حذف مركز التكلفة؟")) return;
    try {
      await costCentersApi.delete(id);
      toast.success("تم حذف مركز التكلفة");
      loadData();
    } catch {
      toast.error("فشل حذف مركز التكلفة");
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">مراكز التكلفة</h2>
          <p className="text-muted-foreground mt-1">
            تتبع المصروفات والإيرادات لـ{" "}
            <span className="font-bold" style={{ color: getThemeColor() }}>
              {currentEntity.name}
            </span>
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm">
            <Download className="w-4 h-4 ml-2" />
            تقرير الأداء
          </Button>
          <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
            <DialogTrigger asChild>
              <Button size="sm" style={{ backgroundColor: getThemeColor() }}>
                <Plus className="w-4 h-4 ml-2" />
                مركز جديد
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>إضافة مركز تكلفة جديد</DialogTitle>
                <DialogDescription>
                  إضافة مركز تكلفة لـ {currentEntity.name}
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label className="text-right">الرمز *</Label>
                  <Input
                    value={newCenter.code}
                    onChange={e =>
                      setNewCenter({ ...newCenter, code: e.target.value })
                    }
                    className="col-span-3"
                    placeholder="CC-100"
                  />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label className="text-right">الاسم *</Label>
                  <Input
                    value={newCenter.name}
                    onChange={e =>
                      setNewCenter({ ...newCenter, name: e.target.value })
                    }
                    className="col-span-3"
                  />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label className="text-right">النوع</Label>
                  <Select
                    value={newCenter.centerType}
                    onValueChange={v =>
                      setNewCenter({ ...newCenter, centerType: v })
                    }
                  >
                    <SelectTrigger className="col-span-3">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="branch">فرع</SelectItem>
                      <SelectItem value="project">مشروع</SelectItem>
                      <SelectItem value="department">قسم</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label className="text-right">الميزانية</Label>
                  <Input
                    type="number"
                    value={newCenter.budget}
                    onChange={e =>
                      setNewCenter({ ...newCenter, budget: e.target.value })
                    }
                    className="col-span-3"
                  />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label className="text-right">الوصف</Label>
                  <Input
                    value={newCenter.description}
                    onChange={e =>
                      setNewCenter({
                        ...newCenter,
                        description: e.target.value,
                      })
                    }
                    className="col-span-3"
                  />
                </div>
              </div>
              <DialogFooter>
                <Button
                  onClick={handleAdd}
                  disabled={isSaving}
                  style={{ backgroundColor: getThemeColor() }}
                >
                  {isSaving ? (
                    <Loader2 className="w-4 h-4 ml-2 animate-spin" />
                  ) : (
                    <Save className="w-4 h-4 ml-2" />
                  )}
                  حفظ
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <div className="bg-card p-4 rounded-lg border shadow-sm">
          <div className="flex justify-between items-start">
            <div>
              <div className="text-sm font-medium text-muted-foreground">
                إجمالي الميزانية المعتمدة
              </div>
              <div className="text-2xl font-bold mt-2">
                {totalBudget.toLocaleString()} ر.ي
              </div>
            </div>
            <div className="p-2 bg-blue-100 rounded-full">
              <Target className="w-5 h-5 text-blue-600" />
            </div>
          </div>
        </div>
        <div className="bg-card p-4 rounded-lg border shadow-sm">
          <div className="flex justify-between items-start">
            <div>
              <div className="text-sm font-medium text-muted-foreground">
                المصروف الفعلي
              </div>
              <div className="text-2xl font-bold mt-2 text-rose-600">
                {totalActual.toLocaleString()} ر.ي
              </div>
            </div>
            <div className="p-2 bg-rose-100 rounded-full">
              <TrendingDown className="w-5 h-5 text-rose-600" />
            </div>
          </div>
        </div>
        <div className="bg-card p-4 rounded-lg border shadow-sm">
          <div className="flex justify-between items-start">
            <div>
              <div className="text-sm font-medium text-muted-foreground">
                المتبقي من الميزانية
              </div>
              <div className="text-2xl font-bold mt-2 text-emerald-600">
                {totalRemaining.toLocaleString()} ر.ي
              </div>
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
          <Input
            placeholder="بحث باسم المركز أو الرمز..."
            className="pr-9"
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
          />
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
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={8} className="text-center py-8">
                  <Loader2 className="w-6 h-6 animate-spin mx-auto text-muted-foreground" />
                </TableCell>
              </TableRow>
            ) : filteredCenters.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={8}
                  className="text-center py-8 text-muted-foreground"
                >
                  لا توجد مراكز تكلفة. قم بإضافة مركز جديد.
                </TableCell>
              </TableRow>
            ) : (
              filteredCenters.map((center: any) => {
                const type = typeMap[center.centerType] || typeMap.branch;
                const budget = Number(center.budget || 0);
                const actual = Number(center.actualSpent || 0);
                const percentage =
                  budget > 0 ? Math.min(100, (actual / budget) * 100) : 0;
                const centerStatus =
                  percentage > 100
                    ? "over_budget"
                    : percentage > 85
                      ? "warning"
                      : "active";
                const status = statusMap[center.status || centerStatus];
                const TypeIcon = type.icon;

                return (
                  <TableRow
                    key={center.id}
                    className="hover:bg-muted/50 transition-colors"
                  >
                    <TableCell className="font-medium">{center.code}</TableCell>
                    <TableCell className="font-semibold">
                      {center.name}
                    </TableCell>
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
                        <Progress
                          value={percentage}
                          className={`h-2 ${percentage > 100 ? "bg-rose-200" : ""}`}
                        />
                      </div>
                    </TableCell>
                    <TableCell>{budget.toLocaleString()}</TableCell>
                    <TableCell className="font-bold">
                      {actual.toLocaleString()}
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant="outline"
                        className={`${status?.color || ""} font-normal`}
                      >
                        {status?.label || "نشط"}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-left">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" className="h-8 w-8 p-0">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuLabel>الإجراءات</DropdownMenuLabel>
                          <DropdownMenuItem>
                            <Pencil className="w-4 h-4 ml-2" />
                            تعديل
                          </DropdownMenuItem>
                          <DropdownMenuItem>تحليل المصروفات</DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem
                            className="text-destructive"
                            onClick={() => handleDelete(center.id)}
                          >
                            <Trash2 className="w-4 h-4 ml-2" />
                            حذف
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}

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
  Monitor,
  Truck,
  Building2,
  Calculator,
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
import { useState, useEffect, useCallback } from "react";
import { toast } from "sonner";
import { useEntity } from "@/contexts/EntityContext";
import { fixedAssetsApi } from "@/lib/api";

const categoryMap: Record<string, { label: string; icon: any }> = {
  vehicles: { label: "سيارات", icon: Truck },
  electronics: { label: "أجهزة إلكترونية", icon: Monitor },
  furniture: { label: "أثاث", icon: Building2 },
  fixtures: { label: "تجهيزات", icon: Building2 },
  equipment: { label: "معدات", icon: Calculator },
};

const statusMap: Record<string, { label: string; color: string }> = {
  active: {
    label: "نشط",
    color: "bg-emerald-100 text-emerald-700 border-emerald-200",
  },
  maintenance: {
    label: "صيانة",
    color: "bg-amber-100 text-amber-700 border-amber-200",
  },
  disposed: {
    label: "مستبعد",
    color: "bg-slate-100 text-slate-700 border-slate-200",
  },
};

export default function FixedAssets() {
  const { currentEntity, getThemeColor } = useEntity();
  const [assets, setAssets] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [newAsset, setNewAsset] = useState({
    name: "",
    assetCode: "",
    category: "electronics",
    purchaseDate: "",
    purchaseCost: "",
    depreciationRate: "10",
    usefulLifeYears: "5",
  });

  const loadData = useCallback(async () => {
    if (!currentEntity) return;
    setIsLoading(true);
    try {
      const response = await fixedAssetsApi.getAll({
        entityId: currentEntity.id,
      });
      const data = Array.isArray(response)
        ? response
        : (response as any)?.data || [];
      setAssets(data);
    } catch {
      setAssets([]);
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

  const filteredAssets = assets.filter(
    (a: any) =>
      a.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      a.assetCode?.includes(searchTerm)
  );

  const totalCost = assets.reduce(
    (sum: number, a: any) => sum + Number(a.purchaseCost || 0),
    0
  );
  const totalCurrentValue = assets.reduce(
    (sum: number, a: any) =>
      sum + Number(a.currentValue || a.purchaseCost || 0),
    0
  );
  const totalDepreciation = totalCost - totalCurrentValue;
  const activeCount = assets.filter((a: any) => a.status === "active").length;

  const handleAdd = async () => {
    if (!newAsset.name || !newAsset.assetCode) {
      toast.error("يرجى تعبئة الاسم والرمز");
      return;
    }
    setIsSaving(true);
    try {
      await fixedAssetsApi.create({
        entityId: currentEntity.id,
        name: newAsset.name,
        assetCode: newAsset.assetCode,
        category: newAsset.category,
        purchaseDate:
          newAsset.purchaseDate || new Date().toISOString().split("T")[0],
        purchaseCost: newAsset.purchaseCost || "0",
        currentValue: newAsset.purchaseCost || "0",
        depreciationRate: newAsset.depreciationRate || "10",
        usefulLifeYears: parseInt(newAsset.usefulLifeYears) || 5,
        status: "active",
      });
      toast.success("تم إضافة الأصل بنجاح");
      setIsAddOpen(false);
      setNewAsset({
        name: "",
        assetCode: "",
        category: "electronics",
        purchaseDate: "",
        purchaseCost: "",
        depreciationRate: "10",
        usefulLifeYears: "5",
      });
      loadData();
    } catch {
      toast.error("فشل إضافة الأصل");
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("هل أنت متأكد من حذف هذا الأصل؟")) return;
    try {
      await fixedAssetsApi.delete(id);
      toast.success("تم حذف الأصل");
      loadData();
    } catch {
      toast.error("فشل حذف الأصل");
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">الأصول الثابتة</h2>
          <p className="text-muted-foreground mt-1">
            إدارة الأصول لـ{" "}
            <span className="font-bold" style={{ color: getThemeColor() }}>
              {currentEntity.name}
            </span>
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm">
            <Calculator className="w-4 h-4 ml-2" />
            حساب الإهلاك
          </Button>
          <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
            <DialogTrigger asChild>
              <Button size="sm" style={{ backgroundColor: getThemeColor() }}>
                <Plus className="w-4 h-4 ml-2" />
                أصل جديد
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>إضافة أصل ثابت جديد</DialogTitle>
                <DialogDescription>
                  إضافة أصل لـ {currentEntity.name}
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label className="text-right">الرمز *</Label>
                  <Input
                    value={newAsset.assetCode}
                    onChange={e =>
                      setNewAsset({ ...newAsset, assetCode: e.target.value })
                    }
                    className="col-span-3"
                    placeholder="AST-001"
                  />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label className="text-right">الاسم *</Label>
                  <Input
                    value={newAsset.name}
                    onChange={e =>
                      setNewAsset({ ...newAsset, name: e.target.value })
                    }
                    className="col-span-3"
                  />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label className="text-right">التصنيف</Label>
                  <Select
                    value={newAsset.category}
                    onValueChange={v =>
                      setNewAsset({ ...newAsset, category: v })
                    }
                  >
                    <SelectTrigger className="col-span-3">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="vehicles">سيارات</SelectItem>
                      <SelectItem value="electronics">
                        أجهزة إلكترونية
                      </SelectItem>
                      <SelectItem value="furniture">أثاث</SelectItem>
                      <SelectItem value="fixtures">تجهيزات</SelectItem>
                      <SelectItem value="equipment">معدات</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label className="text-right">تاريخ الشراء</Label>
                  <Input
                    type="date"
                    value={newAsset.purchaseDate}
                    onChange={e =>
                      setNewAsset({ ...newAsset, purchaseDate: e.target.value })
                    }
                    className="col-span-3"
                  />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label className="text-right">تكلفة الشراء</Label>
                  <Input
                    type="number"
                    value={newAsset.purchaseCost}
                    onChange={e =>
                      setNewAsset({ ...newAsset, purchaseCost: e.target.value })
                    }
                    className="col-span-3"
                  />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label className="text-right">نسبة الإهلاك %</Label>
                  <Input
                    type="number"
                    value={newAsset.depreciationRate}
                    onChange={e =>
                      setNewAsset({
                        ...newAsset,
                        depreciationRate: e.target.value,
                      })
                    }
                    className="col-span-3"
                  />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label className="text-right">العمر الإنتاجي (سنوات)</Label>
                  <Input
                    type="number"
                    value={newAsset.usefulLifeYears}
                    onChange={e =>
                      setNewAsset({
                        ...newAsset,
                        usefulLifeYears: e.target.value,
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

      <div className="grid gap-4 md:grid-cols-4">
        <div className="bg-card p-4 rounded-lg border shadow-sm">
          <div className="text-sm font-medium text-muted-foreground">
            إجمالي قيمة الأصول (شراء)
          </div>
          <div className="text-2xl font-bold mt-2">
            {totalCost.toLocaleString()} ر.ي
          </div>
        </div>
        <div className="bg-card p-4 rounded-lg border shadow-sm">
          <div className="text-sm font-medium text-muted-foreground">
            القيمة الدفترية الحالية
          </div>
          <div className="text-2xl font-bold mt-2 text-blue-600">
            {totalCurrentValue.toLocaleString()} ر.ي
          </div>
        </div>
        <div className="bg-card p-4 rounded-lg border shadow-sm">
          <div className="text-sm font-medium text-muted-foreground">
            مجمع الإهلاك
          </div>
          <div className="text-2xl font-bold mt-2 text-amber-600">
            {totalDepreciation.toLocaleString()} ر.ي
          </div>
        </div>
        <div className="bg-card p-4 rounded-lg border shadow-sm">
          <div className="text-sm font-medium text-muted-foreground">
            عدد الأصول النشطة
          </div>
          <div className="text-2xl font-bold mt-2">{activeCount}</div>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row gap-4 items-center justify-between bg-card p-4 rounded-lg border shadow-sm">
        <div className="relative w-full sm:w-96">
          <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="بحث باسم الأصل أو الرمز..."
            className="pr-9"
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
          />
        </div>
        <Button variant="outline" size="sm">
          <Download className="w-4 h-4 ml-2" />
          تصدير
        </Button>
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
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={8} className="text-center py-8">
                  <Loader2 className="w-6 h-6 animate-spin mx-auto text-muted-foreground" />
                </TableCell>
              </TableRow>
            ) : filteredAssets.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={8}
                  className="text-center py-8 text-muted-foreground"
                >
                  لا توجد أصول ثابتة. قم بإضافة أصل جديد.
                </TableCell>
              </TableRow>
            ) : (
              filteredAssets.map((asset: any) => {
                const category = categoryMap[asset.category] || {
                  label: asset.category,
                  icon: Building2,
                };
                const status = statusMap[asset.status] || statusMap.active;
                const CategoryIcon = category.icon;

                return (
                  <TableRow
                    key={asset.id}
                    className="hover:bg-muted/50 transition-colors"
                  >
                    <TableCell className="font-medium">
                      {asset.assetCode}
                    </TableCell>
                    <TableCell className="font-semibold">
                      {asset.name}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <CategoryIcon className="w-4 h-4" />
                        <span>{category.label}</span>
                      </div>
                    </TableCell>
                    <TableCell>{asset.purchaseDate}</TableCell>
                    <TableCell>
                      {Number(asset.purchaseCost || 0).toLocaleString()} ر.ي
                    </TableCell>
                    <TableCell className="font-bold text-blue-600">
                      {Number(asset.currentValue || 0).toLocaleString()} ر.ي
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant="outline"
                        className={`${status.color} font-normal`}
                      >
                        {status.label}
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
                          <DropdownMenuItem>سجل الإهلاك</DropdownMenuItem>
                          <DropdownMenuItem>صيانة</DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem
                            className="text-destructive"
                            onClick={() => handleDelete(asset.id)}
                          >
                            <Trash2 className="w-4 h-4 ml-2" />
                            استبعاد/حذف
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

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
import { Plus, Search, Download, MoreHorizontal, Warehouse, MapPin, User, Pencil, Trash2, Eye, Save, Package, TrendingUp } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import {Card, CardContent} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useState, useEffect } from "react";
import { toast } from "sonner";
import { useEntity } from "@/contexts/EntityContext";
import { warehousesApi } from "@/lib/api";

interface WarehouseType {
  id: string;
  code: string;
  name: string;
  address?: string;
  manager?: string;
  phone?: string;
  type: 'main' | 'sub' | 'transit';
  isActive: boolean;
  itemsCount: number;
  totalValue: number;
}

const typeMap: Record<string, { label: string, color: string }> = {
  main: { label: "رئيسي", color: "bg-blue-100 text-blue-700 border-blue-200" },
  sub: { label: "فرعي", color: "bg-green-100 text-green-700 border-green-200" },
  transit: { label: "عبور", color: "bg-orange-100 text-orange-700 border-orange-200" },
};

export default function Warehouses() {
  const { currentEntity, getThemeColor } = useEntity();
  
  const [warehouses, setWarehouses] = useState<WarehouseType[]>([]);
  const [loading, setLoading] = useState(true);
  const [isNewOpen, setIsNewOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [editingWarehouse, setEditingWarehouse] = useState<WarehouseType | null>(null);
  const [searchTerm, setSearchTerm] = useState("");

  const [newWarehouse, setNewWarehouse] = useState({
    code: "",
    name: "",
    address: "",
    manager: "",
    phone: "",
    type: "main",
  });

  useEffect(() => {
    loadData();
   
  }, [currentEntity]);

  if (!currentEntity) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-muted-foreground">الرجاء اختيار كيان أولاً</p>
      </div>
    );
  }


  const loadData = async () => {
    try {
      setLoading(true);
      const data = await warehousesApi.getByEntity(currentEntity.id);
      setWarehouses(data);
    } catch (error) {
      console.error('Failed to load warehouses:', error);
      toast.error("فشل تحميل بيانات المستودعات");
    } finally {
      setLoading(false);
    }
  };

  const handleAdd = async () => {
    if (!newWarehouse.code || !newWarehouse.name) {
      toast.error("يرجى إدخال رمز واسم المستودع");
      return;
    }

    try {
      const data = {
        ...newWarehouse,
        id: `WH-${Date.now()}`,
        entityId: currentEntity.id,
        isActive: true,
        itemsCount: 0,
        totalValue: 0,
      };
      
      await warehousesApi.create(data);
      toast.success("تم إضافة المستودع بنجاح");
      setIsNewOpen(false);
      setNewWarehouse({
        code: "",
        name: "",
        address: "",
        manager: "",
        phone: "",
        type: "main",
      });
      loadData();
    } catch {
      toast.error("فشل في إضافة المستودع");
    }
  };

  const handleEdit = async () => {
    if (!editingWarehouse) return;

    try {
      await warehousesApi.update(editingWarehouse.id, editingWarehouse);
      toast.success("تم تحديث المستودع بنجاح");
      setIsEditOpen(false);
      setEditingWarehouse(null);
      loadData();
    } catch {
      toast.error("فشل في تحديث المستودع");
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("هل أنت متأكد من حذف هذا المستودع؟")) return;

    try {
      await warehousesApi.delete(id);
      toast.success("تم حذف المستودع بنجاح");
      loadData();
    } catch {
      toast.error("فشل في حذف المستودع");
    }
  };

  const filteredWarehouses = warehouses.filter(wh =>
    wh.name.includes(searchTerm) || wh.code.includes(searchTerm)
  );

  const totalWarehouses = warehouses.length;
  const totalItems = warehouses.reduce((sum, wh) => sum + wh.itemsCount, 0);
  const totalValue = warehouses.reduce((sum, wh) => sum + wh.totalValue, 0);

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">المستودعات</h2>
          <p className="text-muted-foreground mt-1">
            إدارة المستودعات والمواقع لـ <span className="font-bold" style={{ color: getThemeColor() }}>{currentEntity.name}</span>
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm">
            <Download className="w-4 h-4 ml-2" />
            تصدير
          </Button>
          <Dialog open={isNewOpen} onOpenChange={setIsNewOpen}>
            <DialogTrigger asChild>
              <Button size="sm" style={{ backgroundColor: getThemeColor() }}>
                <Plus className="w-4 h-4 ml-2" />
                مستودع جديد
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-lg">
              <DialogHeader>
                <DialogTitle>إضافة مستودع جديد</DialogTitle>
                <DialogDescription>
                  أدخل بيانات المستودع الجديد
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>رمز المستودع *</Label>
                    <Input
                      value={newWarehouse.code}
                      onChange={(e) => setNewWarehouse({ ...newWarehouse, code: e.target.value })}
                      placeholder="WH-001"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>نوع المستودع</Label>
                    <Select
                      value={newWarehouse.type}
                      onValueChange={(value) => setNewWarehouse({ ...newWarehouse, type: value })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="main">رئيسي</SelectItem>
                        <SelectItem value="sub">فرعي</SelectItem>
                        <SelectItem value="transit">عبور</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>اسم المستودع *</Label>
                  <Input
                    value={newWarehouse.name}
                    onChange={(e) => setNewWarehouse({ ...newWarehouse, name: e.target.value })}
                    placeholder="المستودع الرئيسي"
                  />
                </div>
                <div className="space-y-2">
                  <Label>العنوان</Label>
                  <Input
                    value={newWarehouse.address}
                    onChange={(e) => setNewWarehouse({ ...newWarehouse, address: e.target.value })}
                    placeholder="العنوان الكامل"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>المسؤول</Label>
                    <Input
                      value={newWarehouse.manager}
                      onChange={(e) => setNewWarehouse({ ...newWarehouse, manager: e.target.value })}
                      placeholder="اسم المسؤول"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>الهاتف</Label>
                    <Input
                      value={newWarehouse.phone}
                      onChange={(e) => setNewWarehouse({ ...newWarehouse, phone: e.target.value })}
                      placeholder="05xxxxxxxx"
                      dir="ltr"
                    />
                  </div>
                </div>
              </div>
              <DialogFooter>
                <Button onClick={handleAdd} style={{ backgroundColor: getThemeColor() }}>
                  <Save className="w-4 h-4 ml-2" />
                  حفظ
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Statistics */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">عدد المستودعات</p>
              <h3 className="text-2xl font-bold mt-1">{totalWarehouses}</h3>
              <p className="text-xs text-muted-foreground">مستودع نشط</p>
            </div>
            <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center text-blue-600">
              <Warehouse className="w-6 h-6" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">إجمالي الأصناف</p>
              <h3 className="text-2xl font-bold mt-1">{totalItems}</h3>
              <p className="text-xs text-muted-foreground">صنف في المستودعات</p>
            </div>
            <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center text-green-600">
              <Package className="w-6 h-6" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">إجمالي القيمة</p>
              <h3 className="text-2xl font-bold mt-1 text-emerald-600">{totalValue.toLocaleString()} ر.س</h3>
              <p className="text-xs text-muted-foreground">قيمة المخزون</p>
            </div>
            <div className="w-12 h-12 bg-emerald-100 rounded-full flex items-center justify-center text-emerald-600">
              <TrendingUp className="w-6 h-6" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Search */}
      <Card>
        <CardContent className="p-4">
          <div className="relative w-full sm:w-96">
            <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input 
              placeholder="بحث باسم أو رمز المستودع..." 
              className="pr-9"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </CardContent>
      </Card>

      {/* Table */}
      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[100px]">الرمز</TableHead>
                <TableHead>اسم المستودع</TableHead>
                <TableHead>النوع</TableHead>
                <TableHead>العنوان</TableHead>
                <TableHead>المسؤول</TableHead>
                <TableHead>عدد الأصناف</TableHead>
                <TableHead>القيمة</TableHead>
                <TableHead className="text-left">إجراءات</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={8} className="text-center py-8">
                    <div className="flex items-center justify-center">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                    </div>
                  </TableCell>
                </TableRow>
              ) : filteredWarehouses.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} className="text-center py-8 text-muted-foreground">
                    لا توجد مستودعات مسجلة. قم بإضافة مستودع جديد.
                  </TableCell>
                </TableRow>
              ) : (
                filteredWarehouses.map((wh) => {
                  const type = typeMap[wh.type];
                  return (
                    <TableRow key={wh.id} className="hover:bg-muted/50 transition-colors">
                      <TableCell className="font-mono text-sm">{wh.code}</TableCell>
                      <TableCell className="font-semibold">{wh.name}</TableCell>
                      <TableCell>
                        <Badge variant="outline" className={`${type.color} font-normal`}>
                          {type.label}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {wh.address ? (
                          <div className="flex items-center gap-1 text-sm">
                            <MapPin className="w-3 h-3 text-muted-foreground" />
                            {wh.address}
                          </div>
                        ) : '-'}
                      </TableCell>
                      <TableCell>
                        {wh.manager ? (
                          <div className="flex items-center gap-1 text-sm">
                            <User className="w-3 h-3 text-muted-foreground" />
                            {wh.manager}
                          </div>
                        ) : '-'}
                      </TableCell>
                      <TableCell>{wh.itemsCount}</TableCell>
                      <TableCell className="font-medium">{wh.totalValue ? wh.totalValue.toLocaleString() : '-'} ر.س</TableCell>
                      <TableCell className="text-left">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" className="h-8 w-8 p-0">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuLabel>الإجراءات</DropdownMenuLabel>
                            <DropdownMenuItem onClick={() => {
                              setEditingWarehouse(wh);
                              setIsEditOpen(true);
                            }}>
                              <Pencil className="w-4 h-4 ml-2" />
                              تعديل
                            </DropdownMenuItem>
                            <DropdownMenuItem>
                              <Eye className="w-4 h-4 ml-2" />
                              عرض المخزون
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem 
                              className="text-destructive"
                              onClick={() => handleDelete(wh.id)}
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
        </CardContent>
      </Card>

      {/* Edit Dialog */}
      <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>تعديل المستودع</DialogTitle>
          </DialogHeader>
          {editingWarehouse && (
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>رمز المستودع</Label>
                  <Input
                    value={editingWarehouse.code}
                    onChange={(e) => setEditingWarehouse({ ...editingWarehouse, code: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label>نوع المستودع</Label>
                  <Select
                    value={editingWarehouse.type}
                    onValueChange={(value: any) => setEditingWarehouse({ ...editingWarehouse, type: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="main">رئيسي</SelectItem>
                      <SelectItem value="sub">فرعي</SelectItem>
                      <SelectItem value="transit">عبور</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="space-y-2">
                <Label>اسم المستودع</Label>
                <Input
                  value={editingWarehouse.name}
                  onChange={(e) => setEditingWarehouse({ ...editingWarehouse, name: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label>العنوان</Label>
                <Input
                  value={editingWarehouse.address || ""}
                  onChange={(e) => setEditingWarehouse({ ...editingWarehouse, address: e.target.value })}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>المسؤول</Label>
                  <Input
                    value={editingWarehouse.manager || ""}
                    onChange={(e) => setEditingWarehouse({ ...editingWarehouse, manager: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label>الهاتف</Label>
                  <Input
                    value={editingWarehouse.phone || ""}
                    onChange={(e) => setEditingWarehouse({ ...editingWarehouse, phone: e.target.value })}
                    dir="ltr"
                  />
                </div>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button onClick={handleEdit} style={{ backgroundColor: getThemeColor() }}>
              <Save className="w-4 h-4 ml-2" />
              حفظ التعديلات
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

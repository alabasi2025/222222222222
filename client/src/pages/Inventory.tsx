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
  Pencil,
  Trash2,
  Eye,
  Save,
  Barcode,
  Layers
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
import { inventoryApi, warehousesApi, itemCategoriesApi } from "@/lib/api";

interface Item {
  id: string;
  code: string;
  name: string;
  nameEn?: string;
  barcode?: string;
  categoryId?: string;
  categoryName?: string;
  unitId?: string;
  unitName?: string;
  type: 'stock' | 'service' | 'consumable';
  purchasePrice: number;
  salePrice: number;
  minStock: number;
  maxStock?: number;
  reorderPoint: number;
  taxRate: number;
  currentStock: number;
  stockValue: number;
  description?: string;
  isActive: boolean;
}

interface Category {
  id: string;
  name: string;
  parentId?: string;
}

interface Warehouse {
  id: string;
  name: string;
  code: string;
}

const statusMap: Record<string, { label: string, color: string }> = {
  in_stock: { label: "متوفر", color: "bg-emerald-100 text-emerald-700 border-emerald-200" },
  low_stock: { label: "منخفض", color: "bg-amber-100 text-amber-700 border-amber-200" },
  out_of_stock: { label: "نفذت الكمية", color: "bg-rose-100 text-rose-700 border-rose-200" },
};

const typeMap: Record<string, { label: string, color: string }> = {
  stock: { label: "مخزون", color: "bg-blue-100 text-blue-700 border-blue-200" },
  service: { label: "خدمة", color: "bg-purple-100 text-purple-700 border-purple-200" },
  consumable: { label: "مستهلك", color: "bg-orange-100 text-orange-700 border-orange-200" },
};

export default function Inventory() {
  const { currentEntity, getThemeColor } = useEntity();
  
  const [items, setItems] = useState<Item[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [warehouses, setWarehouses] = useState<Warehouse[]>([]);
  const [loading, setLoading] = useState(true);
  const [isNewItemOpen, setIsNewItemOpen] = useState(false);
  const [isEditItemOpen, setIsEditItemOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<Item | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterCategory, setFilterCategory] = useState("all");
  const [filterType, setFilterType] = useState("all");

  const [newItem, setNewItem] = useState({
    code: "",
    name: "",
    nameEn: "",
    barcode: "",
    categoryId: "",
    type: "stock",
    purchasePrice: 0,
    salePrice: 0,
    minStock: 0,
    maxStock: 0,
    reorderPoint: 0,
    taxRate: 15,
    description: "",
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
      const [itemsData, categoriesData, warehousesData] = await Promise.all([
        inventoryApi.getByEntity(currentEntity.id),
        itemCategoriesApi.getByEntity(currentEntity.id),
        warehousesApi.getByEntity(currentEntity.id),
      ]);
      setItems(itemsData);
      setCategories(categoriesData);
      setWarehouses(warehousesData);
    } catch (error) {
      console.error('Failed to load inventory data:', error);
      toast.error("فشل تحميل بيانات المخزون");
    } finally {
      setLoading(false);
    }
  };

  const getStockStatus = (item: Item) => {
    if (item.type === 'service') return null;
    if (item.currentStock <= 0) return 'out_of_stock';
    if (item.currentStock <= item.reorderPoint) return 'low_stock';
    return 'in_stock';
  };

  const handleAddItem = async () => {
    if (!newItem.code || !newItem.name) {
      toast.error("يرجى إدخال رمز واسم الصنف");
      return;
    }

    try {
      const itemData = {
        ...newItem,
        id: `ITM-${Date.now()}`,
        entityId: currentEntity.id,
        currentStock: 0,
        stockValue: 0,
        isActive: true,
      };
      
      await inventoryApi.create(itemData);
      toast.success("تم إضافة الصنف بنجاح");
      setIsNewItemOpen(false);
      setNewItem({
        code: "",
        name: "",
        nameEn: "",
        barcode: "",
        categoryId: "",
        type: "stock",
        purchasePrice: 0,
        salePrice: 0,
        minStock: 0,
        maxStock: 0,
        reorderPoint: 0,
        taxRate: 15,
        description: "",
      });
      loadData();
    } catch (error) {
      toast.error("فشل في إضافة الصنف");
    }
  };

  const handleEditItem = async () => {
    if (!editingItem) return;

    try {
      await inventoryApi.update(editingItem.id, editingItem);
      toast.success("تم تحديث الصنف بنجاح");
      setIsEditItemOpen(false);
      setEditingItem(null);
      loadData();
    } catch (error) {
      toast.error("فشل في تحديث الصنف");
    }
  };

  const handleDeleteItem = async (id: string) => {
    if (!confirm("هل أنت متأكد من حذف هذا الصنف؟")) return;

    try {
      await inventoryApi.delete(id);
      toast.success("تم حذف الصنف بنجاح");
      loadData();
    } catch (error) {
      toast.error("فشل في حذف الصنف");
    }
  };

  // Filter items
  const filteredItems = items.filter(item => {
    const matchesSearch = item.name.includes(searchTerm) || 
                         item.code.includes(searchTerm) ||
                         (item.barcode && item.barcode.includes(searchTerm));
    const matchesCategory = filterCategory === "all" || item.categoryId === filterCategory;
    const matchesType = filterType === "all" || item.type === filterType;
    return matchesSearch && matchesCategory && matchesType;
  });

  // Statistics
  const totalItems = items.length;
  const totalStockValue = items.reduce((sum, item) => sum + (item.stockValue || 0), 0);
  const lowStockItems = items.filter(item => {
    const status = getStockStatus(item);
    return status === 'low_stock' || status === 'out_of_stock';
  }).length;

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">المخزون</h2>
          <p className="text-muted-foreground mt-1">
            إدارة الأصناف والمنتجات لـ <span className="font-bold" style={{ color: getThemeColor() }}>{currentEntity.name}</span>
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm">
            <Download className="w-4 h-4 ml-2" />
            تصدير
          </Button>
          <Dialog open={isNewItemOpen} onOpenChange={setIsNewItemOpen}>
            <DialogTrigger asChild>
              <Button size="sm" style={{ backgroundColor: getThemeColor() }}>
                <Plus className="w-4 h-4 ml-2" />
                صنف جديد
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>إضافة صنف جديد</DialogTitle>
                <DialogDescription>
                  أدخل بيانات الصنف الجديد
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="code">رمز الصنف *</Label>
                    <Input
                      id="code"
                      value={newItem.code}
                      onChange={(e) => setNewItem({ ...newItem, code: e.target.value })}
                      placeholder="SKU-001"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="barcode">الباركود</Label>
                    <Input
                      id="barcode"
                      value={newItem.barcode}
                      onChange={(e) => setNewItem({ ...newItem, barcode: e.target.value })}
                      placeholder="6281234567890"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">اسم الصنف (عربي) *</Label>
                    <Input
                      id="name"
                      value={newItem.name}
                      onChange={(e) => setNewItem({ ...newItem, name: e.target.value })}
                      placeholder="اسم الصنف"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="nameEn">اسم الصنف (إنجليزي)</Label>
                    <Input
                      id="nameEn"
                      value={newItem.nameEn}
                      onChange={(e) => setNewItem({ ...newItem, nameEn: e.target.value })}
                      placeholder="Item Name"
                      dir="ltr"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="category">الفئة</Label>
                    <Select
                      value={newItem.categoryId}
                      onValueChange={(value) => setNewItem({ ...newItem, categoryId: value })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="اختر الفئة" />
                      </SelectTrigger>
                      <SelectContent>
                        {categories.map((cat) => (
                          <SelectItem key={cat.id} value={cat.id}>{cat.name}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="type">نوع الصنف</Label>
                    <Select
                      value={newItem.type}
                      onValueChange={(value) => setNewItem({ ...newItem, type: value })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="stock">مخزون</SelectItem>
                        <SelectItem value="service">خدمة</SelectItem>
                        <SelectItem value="consumable">مستهلك</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="purchasePrice">سعر الشراء</Label>
                    <Input
                      id="purchasePrice"
                      type="number"
                      value={newItem.purchasePrice}
                      onChange={(e) => setNewItem({ ...newItem, purchasePrice: parseFloat(e.target.value) || 0 })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="salePrice">سعر البيع</Label>
                    <Input
                      id="salePrice"
                      type="number"
                      value={newItem.salePrice}
                      onChange={(e) => setNewItem({ ...newItem, salePrice: parseFloat(e.target.value) || 0 })}
                    />
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="minStock">الحد الأدنى</Label>
                    <Input
                      id="minStock"
                      type="number"
                      value={newItem.minStock}
                      onChange={(e) => setNewItem({ ...newItem, minStock: parseFloat(e.target.value) || 0 })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="maxStock">الحد الأقصى</Label>
                    <Input
                      id="maxStock"
                      type="number"
                      value={newItem.maxStock}
                      onChange={(e) => setNewItem({ ...newItem, maxStock: parseFloat(e.target.value) || 0 })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="reorderPoint">نقطة إعادة الطلب</Label>
                    <Input
                      id="reorderPoint"
                      type="number"
                      value={newItem.reorderPoint}
                      onChange={(e) => setNewItem({ ...newItem, reorderPoint: parseFloat(e.target.value) || 0 })}
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="taxRate">نسبة الضريبة (%)</Label>
                  <Input
                    id="taxRate"
                    type="number"
                    value={newItem.taxRate}
                    onChange={(e) => setNewItem({ ...newItem, taxRate: parseFloat(e.target.value) || 0 })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="description">الوصف</Label>
                  <Input
                    id="description"
                    value={newItem.description}
                    onChange={(e) => setNewItem({ ...newItem, description: e.target.value })}
                    placeholder="وصف الصنف"
                  />
                </div>
              </div>
              <DialogFooter>
                <Button onClick={handleAddItem} style={{ backgroundColor: getThemeColor() }}>
                  <Save className="w-4 h-4 ml-2" />
                  حفظ
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">إجمالي الأصناف</p>
              <h3 className="text-2xl font-bold mt-1">{totalItems}</h3>
              <p className="text-xs text-muted-foreground">صنف مسجل</p>
            </div>
            <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center text-blue-600">
              <Package className="w-6 h-6" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">قيمة المخزون</p>
              <h3 className="text-2xl font-bold mt-1 text-emerald-600">{totalStockValue.toLocaleString()} ر.س</h3>
              <p className="text-xs text-muted-foreground">إجمالي القيمة</p>
            </div>
            <div className="w-12 h-12 bg-emerald-100 rounded-full flex items-center justify-center text-emerald-600">
              <ArrowUpRight className="w-6 h-6" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">تنبيهات المخزون</p>
              <h3 className="text-2xl font-bold mt-1 text-amber-600">{lowStockItems}</h3>
              <p className="text-xs text-muted-foreground">صنف يحتاج تعبئة</p>
            </div>
            <div className="w-12 h-12 bg-amber-100 rounded-full flex items-center justify-center text-amber-600">
              <AlertTriangle className="w-6 h-6" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">الفئات</p>
              <h3 className="text-2xl font-bold mt-1">{categories.length}</h3>
              <p className="text-xs text-muted-foreground">فئة مسجلة</p>
            </div>
            <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center text-purple-600">
              <Layers className="w-6 h-6" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
            <div className="relative w-full sm:w-96">
              <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input 
                placeholder="بحث باسم الصنف أو الرمز أو الباركود..." 
                className="pr-9"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <div className="flex gap-2 w-full sm:w-auto">
              <Select value={filterCategory} onValueChange={setFilterCategory}>
                <SelectTrigger className="w-[150px]">
                  <SelectValue placeholder="الفئة" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">جميع الفئات</SelectItem>
                  {categories.map((cat) => (
                    <SelectItem key={cat.id} value={cat.id}>{cat.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select value={filterType} onValueChange={setFilterType}>
                <SelectTrigger className="w-[120px]">
                  <SelectValue placeholder="النوع" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">الكل</SelectItem>
                  <SelectItem value="stock">مخزون</SelectItem>
                  <SelectItem value="service">خدمة</SelectItem>
                  <SelectItem value="consumable">مستهلك</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Items Table */}
      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[100px]">الرمز</TableHead>
                <TableHead>اسم الصنف</TableHead>
                <TableHead>الفئة</TableHead>
                <TableHead>النوع</TableHead>
                <TableHead>سعر الشراء</TableHead>
                <TableHead>سعر البيع</TableHead>
                <TableHead>المخزون</TableHead>
                <TableHead>الحالة</TableHead>
                <TableHead className="text-left">إجراءات</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={9} className="text-center py-8">
                    <div className="flex items-center justify-center">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                    </div>
                  </TableCell>
                </TableRow>
              ) : filteredItems.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={9} className="text-center py-8 text-muted-foreground">
                    لا توجد أصناف مسجلة لـ {currentEntity.name}. قم بإضافة صنف جديد.
                  </TableCell>
                </TableRow>
              ) : (
                filteredItems.map((item) => {
                  const stockStatus = getStockStatus(item);
                  const status = stockStatus ? statusMap[stockStatus] : null;
                  const type = typeMap[item.type];
                  const stockPercentage = item.maxStock ? Math.min((item.currentStock / item.maxStock) * 100, 100) : 0;
                  
                  return (
                    <TableRow key={item.id} className="hover:bg-muted/50 transition-colors">
                      <TableCell className="font-mono text-sm">{item.code}</TableCell>
                      <TableCell>
                        <div>
                          <p className="font-semibold">{item.name}</p>
                          {item.barcode && (
                            <p className="text-xs text-muted-foreground flex items-center gap-1">
                              <Barcode className="w-3 h-3" />
                              {item.barcode}
                            </p>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>{item.categoryName || '-'}</TableCell>
                      <TableCell>
                        <Badge variant="outline" className={`${type.color} font-normal`}>
                          {type.label}
                        </Badge>
                      </TableCell>
                      <TableCell>{item.purchasePrice.toLocaleString()} ر.س</TableCell>
                      <TableCell>{item.salePrice.toLocaleString()} ر.س</TableCell>
                      <TableCell>
                        {item.type === 'stock' ? (
                          <div className="flex items-center gap-2">
                            <span className="w-10 text-sm font-medium">{item.currentStock}</span>
                            <Progress value={stockPercentage} className="w-16 h-2" />
                          </div>
                        ) : (
                          <span className="text-muted-foreground">-</span>
                        )}
                      </TableCell>
                      <TableCell>
                        {status ? (
                          <Badge variant="outline" className={`${status.color} font-normal`}>
                            {status.label}
                          </Badge>
                        ) : (
                          <span className="text-muted-foreground">-</span>
                        )}
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
                            <DropdownMenuItem onClick={() => {
                              setEditingItem(item);
                              setIsEditItemOpen(true);
                            }}>
                              <Pencil className="w-4 h-4 ml-2" />
                              تعديل
                            </DropdownMenuItem>
                            <DropdownMenuItem>
                              <Eye className="w-4 h-4 ml-2" />
                              عرض التفاصيل
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem 
                              className="text-destructive"
                              onClick={() => handleDeleteItem(item.id)}
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
      <Dialog open={isEditItemOpen} onOpenChange={setIsEditItemOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>تعديل الصنف</DialogTitle>
            <DialogDescription>
              تعديل بيانات الصنف
            </DialogDescription>
          </DialogHeader>
          {editingItem && (
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>رمز الصنف</Label>
                  <Input
                    value={editingItem.code}
                    onChange={(e) => setEditingItem({ ...editingItem, code: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label>الباركود</Label>
                  <Input
                    value={editingItem.barcode || ""}
                    onChange={(e) => setEditingItem({ ...editingItem, barcode: e.target.value })}
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>اسم الصنف (عربي)</Label>
                  <Input
                    value={editingItem.name}
                    onChange={(e) => setEditingItem({ ...editingItem, name: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label>اسم الصنف (إنجليزي)</Label>
                  <Input
                    value={editingItem.nameEn || ""}
                    onChange={(e) => setEditingItem({ ...editingItem, nameEn: e.target.value })}
                    dir="ltr"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>سعر الشراء</Label>
                  <Input
                    type="number"
                    value={editingItem.purchasePrice}
                    onChange={(e) => setEditingItem({ ...editingItem, purchasePrice: parseFloat(e.target.value) || 0 })}
                  />
                </div>
                <div className="space-y-2">
                  <Label>سعر البيع</Label>
                  <Input
                    type="number"
                    value={editingItem.salePrice}
                    onChange={(e) => setEditingItem({ ...editingItem, salePrice: parseFloat(e.target.value) || 0 })}
                  />
                </div>
              </div>
              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label>الحد الأدنى</Label>
                  <Input
                    type="number"
                    value={editingItem.minStock}
                    onChange={(e) => setEditingItem({ ...editingItem, minStock: parseFloat(e.target.value) || 0 })}
                  />
                </div>
                <div className="space-y-2">
                  <Label>الحد الأقصى</Label>
                  <Input
                    type="number"
                    value={editingItem.maxStock || 0}
                    onChange={(e) => setEditingItem({ ...editingItem, maxStock: parseFloat(e.target.value) || 0 })}
                  />
                </div>
                <div className="space-y-2">
                  <Label>نقطة إعادة الطلب</Label>
                  <Input
                    type="number"
                    value={editingItem.reorderPoint}
                    onChange={(e) => setEditingItem({ ...editingItem, reorderPoint: parseFloat(e.target.value) || 0 })}
                  />
                </div>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button onClick={handleEditItem} style={{ backgroundColor: getThemeColor() }}>
              <Save className="w-4 h-4 ml-2" />
              حفظ التعديلات
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

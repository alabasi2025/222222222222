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
  Download, 
  MoreHorizontal,
  ArrowDownToLine,
  ArrowUpFromLine,
  ArrowLeftRight,
  RefreshCw,
  Eye,
  Save,
  Package,
  TrendingUp,
  TrendingDown,
  Calendar
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
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
import { Textarea } from "@/components/ui/textarea";
import { useState, useEffect } from "react";
import { toast } from "sonner";
import { useEntity } from "@/contexts/EntityContext";
import { stockMovementsApi, inventoryApi, warehousesApi } from "@/lib/api";

interface Movement {
  id: string;
  itemId: string;
  itemName: string;
  itemCode: string;
  warehouseId: string;
  warehouseName: string;
  toWarehouseId?: string;
  toWarehouseName?: string;
  type: 'in' | 'out' | 'transfer' | 'adjustment' | 'return';
  quantity: number;
  unitCost: number;
  totalCost: number;
  reference?: string;
  referenceType?: string;
  notes?: string;
  date: string;
  createdBy?: string;
}

interface Item {
  id: string;
  code: string;
  name: string;
}

interface Warehouse {
  id: string;
  code: string;
  name: string;
}

const typeMap: Record<string, { label: string, color: string, icon: any }> = {
  in: { label: "وارد", color: "bg-emerald-100 text-emerald-700 border-emerald-200", icon: ArrowDownToLine },
  out: { label: "صادر", color: "bg-rose-100 text-rose-700 border-rose-200", icon: ArrowUpFromLine },
  transfer: { label: "تحويل", color: "bg-blue-100 text-blue-700 border-blue-200", icon: ArrowLeftRight },
  adjustment: { label: "تسوية", color: "bg-amber-100 text-amber-700 border-amber-200", icon: RefreshCw },
  return: { label: "مرتجع", color: "bg-purple-100 text-purple-700 border-purple-200", icon: ArrowDownToLine },
};

export default function StockMovements() {
  const { currentEntity, getThemeColor } = useEntity();
  const [movements, setMovements] = useState<Movement[]>([]);
  const [items, setItems] = useState<Item[]>([]);
  const [warehouses, setWarehouses] = useState<Warehouse[]>([]);
  const [loading, setLoading] = useState(true);
  const [isNewOpen, setIsNewOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterType, setFilterType] = useState("all");

  const [newMovement, setNewMovement] = useState({
    itemId: "",
    warehouseId: "",
    toWarehouseId: "",
    type: "in",
    quantity: 0,
    unitCost: 0,
    reference: "",
    notes: "",
    date: new Date().toISOString().split('T')[0],
  });

  useEffect(() => {
    loadData();
  }, [currentEntity]);

  const loadData = async () => {
    try {
      setLoading(true);
      const [movementsData, itemsData, warehousesData] = await Promise.all([
        stockMovementsApi.getByEntity(currentEntity.id),
        inventoryApi.getByEntity(currentEntity.id),
        warehousesApi.getByEntity(currentEntity.id),
      ]);
      setMovements(movementsData);
      setItems(itemsData);
      setWarehouses(warehousesData);
    } catch (error) {
      console.error('Failed to load data:', error);
      toast.error("فشل تحميل حركات المخزون");
    } finally {
      setLoading(false);
    }
  };

  const handleAdd = async () => {
    if (!newMovement.itemId || !newMovement.warehouseId || newMovement.quantity <= 0) {
      toast.error("يرجى إدخال جميع البيانات المطلوبة");
      return;
    }

    if (newMovement.type === 'transfer' && !newMovement.toWarehouseId) {
      toast.error("يرجى اختيار المستودع المستلم للتحويل");
      return;
    }

    try {
      const item = items.find(i => i.id === newMovement.itemId);
      const warehouse = warehouses.find(w => w.id === newMovement.warehouseId);
      const toWarehouse = warehouses.find(w => w.id === newMovement.toWarehouseId);

      const data = {
        ...newMovement,
        id: `MOV-${Date.now()}`,
        entityId: currentEntity.id,
        itemName: item?.name,
        itemCode: item?.code,
        warehouseName: warehouse?.name,
        toWarehouseName: toWarehouse?.name,
        totalCost: newMovement.quantity * newMovement.unitCost,
      };
      
      await stockMovementsApi.create(data);
      toast.success("تم تسجيل الحركة بنجاح");
      setIsNewOpen(false);
      setNewMovement({
        itemId: "",
        warehouseId: "",
        toWarehouseId: "",
        type: "in",
        quantity: 0,
        unitCost: 0,
        reference: "",
        notes: "",
        date: new Date().toISOString().split('T')[0],
      });
      loadData();
    } catch (error) {
      toast.error("فشل في تسجيل الحركة");
    }
  };

  const filteredMovements = movements.filter(mov => {
    const matchesSearch = mov.itemName.includes(searchTerm) || 
                         mov.itemCode.includes(searchTerm) ||
                         (mov.reference && mov.reference.includes(searchTerm));
    const matchesType = filterType === "all" || mov.type === filterType;
    return matchesSearch && matchesType;
  });

  // Statistics
  const totalIn = movements.filter(m => m.type === 'in' || m.type === 'return').reduce((sum, m) => sum + m.totalCost, 0);
  const totalOut = movements.filter(m => m.type === 'out').reduce((sum, m) => sum + Math.abs(m.totalCost), 0);
  const totalMovements = movements.length;

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">حركات المخزون</h2>
          <p className="text-muted-foreground mt-1">
            تتبع الوارد والصادر والتحويلات لـ <span className="font-bold" style={{ color: getThemeColor() }}>{currentEntity.name}</span>
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
                حركة جديدة
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-lg">
              <DialogHeader>
                <DialogTitle>تسجيل حركة مخزون</DialogTitle>
                <DialogDescription>
                  سجل حركة وارد أو صادر أو تحويل
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>نوع الحركة *</Label>
                    <Select
                      value={newMovement.type}
                      onValueChange={(value) => setNewMovement({ ...newMovement, type: value })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="in">وارد</SelectItem>
                        <SelectItem value="out">صادر</SelectItem>
                        <SelectItem value="transfer">تحويل</SelectItem>
                        <SelectItem value="adjustment">تسوية</SelectItem>
                        <SelectItem value="return">مرتجع</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>التاريخ *</Label>
                    <Input
                      type="date"
                      value={newMovement.date}
                      onChange={(e) => setNewMovement({ ...newMovement, date: e.target.value })}
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>الصنف *</Label>
                  <Select
                    value={newMovement.itemId}
                    onValueChange={(value) => setNewMovement({ ...newMovement, itemId: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="اختر الصنف" />
                    </SelectTrigger>
                    <SelectContent>
                      {items.map((item) => (
                        <SelectItem key={item.id} value={item.id}>
                          {item.code} - {item.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>{newMovement.type === 'transfer' ? 'من مستودع *' : 'المستودع *'}</Label>
                  <Select
                    value={newMovement.warehouseId}
                    onValueChange={(value) => setNewMovement({ ...newMovement, warehouseId: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="اختر المستودع" />
                    </SelectTrigger>
                    <SelectContent>
                      {warehouses.map((wh) => (
                        <SelectItem key={wh.id} value={wh.id}>
                          {wh.code} - {wh.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                {newMovement.type === 'transfer' && (
                  <div className="space-y-2">
                    <Label>إلى مستودع *</Label>
                    <Select
                      value={newMovement.toWarehouseId}
                      onValueChange={(value) => setNewMovement({ ...newMovement, toWarehouseId: value })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="اختر المستودع المستلم" />
                      </SelectTrigger>
                      <SelectContent>
                        {warehouses.filter(wh => wh.id !== newMovement.warehouseId).map((wh) => (
                          <SelectItem key={wh.id} value={wh.id}>
                            {wh.code} - {wh.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                )}
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>الكمية *</Label>
                    <Input
                      type="number"
                      value={newMovement.quantity}
                      onChange={(e) => setNewMovement({ ...newMovement, quantity: parseFloat(e.target.value) || 0 })}
                      min="0"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>سعر الوحدة</Label>
                    <Input
                      type="number"
                      value={newMovement.unitCost}
                      onChange={(e) => setNewMovement({ ...newMovement, unitCost: parseFloat(e.target.value) || 0 })}
                      min="0"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>المرجع</Label>
                  <Input
                    value={newMovement.reference}
                    onChange={(e) => setNewMovement({ ...newMovement, reference: e.target.value })}
                    placeholder="رقم الفاتورة أو أمر الشراء"
                  />
                </div>
                <div className="space-y-2">
                  <Label>ملاحظات</Label>
                  <Textarea
                    value={newMovement.notes}
                    onChange={(e) => setNewMovement({ ...newMovement, notes: e.target.value })}
                    placeholder="ملاحظات إضافية"
                    rows={2}
                  />
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
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">إجمالي الحركات</p>
              <h3 className="text-2xl font-bold mt-1">{totalMovements}</h3>
              <p className="text-xs text-muted-foreground">حركة مسجلة</p>
            </div>
            <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center text-blue-600">
              <Package className="w-6 h-6" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">إجمالي الوارد</p>
              <h3 className="text-2xl font-bold mt-1 text-emerald-600">{totalIn.toLocaleString()} ر.س</h3>
              <p className="text-xs text-muted-foreground">قيمة المشتريات</p>
            </div>
            <div className="w-12 h-12 bg-emerald-100 rounded-full flex items-center justify-center text-emerald-600">
              <TrendingUp className="w-6 h-6" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">إجمالي الصادر</p>
              <h3 className="text-2xl font-bold mt-1 text-rose-600">{totalOut.toLocaleString()} ر.س</h3>
              <p className="text-xs text-muted-foreground">قيمة المبيعات</p>
            </div>
            <div className="w-12 h-12 bg-rose-100 rounded-full flex items-center justify-center text-rose-600">
              <TrendingDown className="w-6 h-6" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">صافي الحركة</p>
              <h3 className={`text-2xl font-bold mt-1 ${totalIn - totalOut >= 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
                {(totalIn - totalOut).toLocaleString()} ر.س
              </h3>
              <p className="text-xs text-muted-foreground">الفرق</p>
            </div>
            <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center text-purple-600">
              <ArrowLeftRight className="w-6 h-6" />
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
                placeholder="بحث بالصنف أو المرجع..." 
                className="pr-9"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <div className="flex gap-2 w-full sm:w-auto">
              <Select value={filterType} onValueChange={setFilterType}>
                <SelectTrigger className="w-[150px]">
                  <SelectValue placeholder="نوع الحركة" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">جميع الحركات</SelectItem>
                  <SelectItem value="in">وارد</SelectItem>
                  <SelectItem value="out">صادر</SelectItem>
                  <SelectItem value="transfer">تحويل</SelectItem>
                  <SelectItem value="adjustment">تسوية</SelectItem>
                  <SelectItem value="return">مرتجع</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Table */}
      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>التاريخ</TableHead>
                <TableHead>النوع</TableHead>
                <TableHead>الصنف</TableHead>
                <TableHead>المستودع</TableHead>
                <TableHead>الكمية</TableHead>
                <TableHead>سعر الوحدة</TableHead>
                <TableHead>الإجمالي</TableHead>
                <TableHead>المرجع</TableHead>
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
              ) : filteredMovements.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={9} className="text-center py-8 text-muted-foreground">
                    لا توجد حركات مسجلة. قم بإضافة حركة جديدة.
                  </TableCell>
                </TableRow>
              ) : (
                filteredMovements.map((mov) => {
                  const type = typeMap[mov.type];
                  const TypeIcon = type.icon;
                  return (
                    <TableRow key={mov.id} className="hover:bg-muted/50 transition-colors">
                      <TableCell>
                        <div className="flex items-center gap-1 text-sm">
                          <Calendar className="w-3 h-3 text-muted-foreground" />
                          {mov.date}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className={`${type.color} font-normal`}>
                          <TypeIcon className="w-3 h-3 ml-1" />
                          {type.label}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div>
                          <p className="font-semibold">{mov.itemName}</p>
                          <p className="text-xs text-muted-foreground">{mov.itemCode}</p>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div>
                          <p>{mov.warehouseName}</p>
                          {mov.type === 'transfer' && mov.toWarehouseName && (
                            <p className="text-xs text-muted-foreground">← {mov.toWarehouseName}</p>
                          )}
                        </div>
                      </TableCell>
                      <TableCell className={`font-medium ${mov.type === 'out' ? 'text-rose-600' : mov.type === 'in' || mov.type === 'return' ? 'text-emerald-600' : ''}`}>
                        {mov.type === 'out' ? '-' : mov.type === 'in' || mov.type === 'return' ? '+' : ''}{Math.abs(mov.quantity)}
                      </TableCell>
                      <TableCell>{mov.unitCost.toLocaleString()} ر.س</TableCell>
                      <TableCell className={`font-medium ${mov.totalCost < 0 ? 'text-rose-600' : 'text-emerald-600'}`}>
                        {mov.totalCost.toLocaleString()} ر.س
                      </TableCell>
                      <TableCell>
                        {mov.reference || '-'}
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
                              <Eye className="w-4 h-4 ml-2" />
                              عرض التفاصيل
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
    </div>
  );
}

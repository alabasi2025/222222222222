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
  ShoppingCart,
  CheckCircle2,
  Clock,
  AlertCircle,
  Truck,
  Save
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

// Initial clean data
const purchases: any[] = [];

const statusMap: Record<string, { label: string, color: string, icon: any }> = {
  received: { label: "تم الاستلام", color: "bg-emerald-100 text-emerald-700 border-emerald-200", icon: CheckCircle2 },
  pending: { label: "قيد الانتظار", color: "bg-amber-100 text-amber-700 border-amber-200", icon: Clock },
  ordered: { label: "تم الطلب", color: "bg-blue-100 text-blue-700 border-blue-200", icon: Truck },
  overdue: { label: "متأخر", color: "bg-rose-100 text-rose-700 border-rose-200", icon: AlertCircle },
};

export default function Purchases() {
  const { currentEntity, getThemeColor } = useEntity();
  const [isNewOpen, setIsNewOpen] = useState(false);
  const [items, setItems] = useState<any[]>([]);
  const [warehouses, setWarehouses] = useState<any[]>([]);
  const [suppliers, setSuppliers] = useState<any[]>([]);
  const [purchases, setPurchases] = useState<any[]>([]);

  const [newPurchase, setNewPurchase] = useState({
    supplierId: "",
    itemId: "",
    warehouseId: "",
    quantity: 0,
    unitCost: 0,
    reference: "",
    notes: "",
    date: new Date().toISOString().split('T')[0],
  });

  useEffect(() => {
    loadData();
    loadSuppliers();
    loadPurchases();
  }, [currentEntity]);

  const loadSuppliers = () => {
    try {
      // Load suppliers from localStorage (saved from Contacts page)
      const savedSuppliers = localStorage.getItem('suppliers');
      if (savedSuppliers) {
        const suppliersList = JSON.parse(savedSuppliers);
        // Filter suppliers by current entity
        const filteredSuppliers = suppliersList.filter((s: any) => {
          if (currentEntity.type === 'holding') return true;
          return s.entityId === currentEntity.id;
        });
        setSuppliers(filteredSuppliers);
      }
    } catch (error) {
      console.error('Failed to load suppliers:', error);
    }
  };

  const loadData = async () => {
    try {
      const [itemsData, warehousesData] = await Promise.all([
        inventoryApi.getByEntity(currentEntity.id),
        warehousesApi.getByEntity(currentEntity.id),
      ]);
      setItems(itemsData);
      setWarehouses(warehousesData);
    } catch (error) {
      console.error('Failed to load data:', error);
    }
  };

  const loadPurchases = async () => {
    try {
      // Load stock movements with referenceType = 'purchase'
      const movements = await stockMovementsApi.getByEntity(currentEntity.id);
      const purchaseMovements = movements.filter((m: any) => m.referenceType === 'purchase');
      
      // Group by reference (invoice number) to combine multiple items in one invoice
      const purchaseMap = new Map<string, any>();
      
      // Load suppliers for lookup
      const savedSuppliers = localStorage.getItem('suppliers');
      const suppliersList = savedSuppliers ? JSON.parse(savedSuppliers) : [];
      
      for (const movement of purchaseMovements) {
        const ref = movement.reference || movement.id;
        if (!purchaseMap.has(ref)) {
          // Try to extract supplier from notes or use default
          let supplierName = 'غير محدد';
          
          // Check if notes contains supplier info (format: "supplierId:SUP-xxx")
          if (movement.notes) {
            const supplierMatch = movement.notes.match(/supplierId:([A-Z0-9-]+)/);
            if (supplierMatch) {
              const supplierId = supplierMatch[1];
              const supplier = suppliersList.find((s: any) => s.id === supplierId);
              if (supplier) supplierName = supplier.name;
            }
          }
          
          purchaseMap.set(ref, {
            id: ref,
            reference: ref,
            supplier: supplierName,
            date: new Date(movement.date).toLocaleDateString('ar-SA'),
            items: 1,
            amount: movement.totalCost || 0,
            status: 'received', // Default status
            movements: [movement],
          });
        } else {
          const purchase = purchaseMap.get(ref)!;
          purchase.items += 1;
          purchase.amount += movement.totalCost || 0;
          purchase.movements.push(movement);
        }
      }
      
      const purchasesList = Array.from(purchaseMap.values());
      // Sort by date descending
      purchasesList.sort((a, b) => new Date(b.movements[0].date).getTime() - new Date(a.movements[0].date).getTime());
      setPurchases(purchasesList);
    } catch (error) {
      console.error('Failed to load purchases:', error);
    }
  };

  const handleAddPurchase = async () => {
    if (!newPurchase.itemId || !newPurchase.warehouseId || newPurchase.quantity <= 0) {
      toast.error("يرجى إدخال الصنف والمستودع والكمية");
      return;
    }

    try {
      const item = items.find(i => i.id === newPurchase.itemId);
      const warehouse = warehouses.find(w => w.id === newPurchase.warehouseId);

      // Create stock movement for purchase
      // Include supplierId in notes if provided
      let notes = newPurchase.notes || '';
      if (newPurchase.supplierId) {
        notes = notes ? `${notes} supplierId:${newPurchase.supplierId}` : `supplierId:${newPurchase.supplierId}`;
      }
      
      const movementData = {
        id: `PUR-${Date.now()}`,
        entityId: currentEntity.id,
        itemId: newPurchase.itemId,
        warehouseId: newPurchase.warehouseId,
        type: 'in',
        quantity: newPurchase.quantity,
        unitCost: newPurchase.unitCost || 0,
        totalCost: newPurchase.quantity * (newPurchase.unitCost || 0),
        reference: newPurchase.reference || `PUR-INV-${Date.now()}`,
        referenceType: 'purchase',
        notes: notes,
        date: new Date(newPurchase.date).toISOString(),
      };
      
      await stockMovementsApi.create(movementData);
      toast.success("تم إنشاء فاتورة المشتريات بنجاح");
      setIsNewOpen(false);
      setNewPurchase({
        supplierId: "",
        itemId: "",
        warehouseId: "",
        quantity: 0,
        unitCost: 0,
        reference: "",
        notes: "",
        date: new Date().toISOString().split('T')[0],
      });
      // Reload purchases list
      await loadPurchases();
    } catch (error) {
      console.error('Failed to create purchase:', error);
      toast.error("فشل في إنشاء فاتورة المشتريات");
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">المشتريات</h2>
          <p className="text-muted-foreground mt-1">إدارة أوامر الشراء والفواتير من الموردين</p>
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
                فاتورة شراء جديدة
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-lg">
              <DialogHeader>
                <DialogTitle>فاتورة شراء جديدة</DialogTitle>
                <DialogDescription>
                  إضافة فاتورة شراء جديدة من مورد
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>التاريخ *</Label>
                    <Input
                      type="date"
                      value={newPurchase.date}
                      onChange={(e) => setNewPurchase({ ...newPurchase, date: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>رقم الفاتورة</Label>
                    <Input
                      value={newPurchase.reference}
                      onChange={(e) => setNewPurchase({ ...newPurchase, reference: e.target.value })}
                      placeholder="رقم فاتورة المورد"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>المورد</Label>
                  <Select
                    value={newPurchase.supplierId || undefined}
                    onValueChange={(value) => setNewPurchase({ ...newPurchase, supplierId: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="اختر المورد" />
                    </SelectTrigger>
                    <SelectContent>
                      {suppliers.length === 0 ? (
                        <div className="px-2 py-1.5 text-sm text-muted-foreground">
                          لا توجد موردين مسجلين
                        </div>
                      ) : (
                        suppliers.map((supplier) => (
                          <SelectItem key={supplier.id} value={supplier.id}>
                            {supplier.name} {supplier.phone ? `- ${supplier.phone}` : ''}
                          </SelectItem>
                        ))
                      )}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>الصنف *</Label>
                  <Select
                    value={newPurchase.itemId}
                    onValueChange={(value) => setNewPurchase({ ...newPurchase, itemId: value })}
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
                  <Label>المستودع *</Label>
                  <Select
                    value={newPurchase.warehouseId}
                    onValueChange={(value) => setNewPurchase({ ...newPurchase, warehouseId: value })}
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
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>الكمية *</Label>
                    <Input
                      type="number"
                      value={newPurchase.quantity}
                      onChange={(e) => setNewPurchase({ ...newPurchase, quantity: parseFloat(e.target.value) || 0 })}
                      min="0"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>سعر الوحدة</Label>
                    <Input
                      type="number"
                      value={newPurchase.unitCost}
                      onChange={(e) => setNewPurchase({ ...newPurchase, unitCost: parseFloat(e.target.value) || 0 })}
                      min="0"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>ملاحظات</Label>
                  <Textarea
                    value={newPurchase.notes}
                    onChange={(e) => setNewPurchase({ ...newPurchase, notes: e.target.value })}
                    placeholder="ملاحظات إضافية"
                    rows={2}
                  />
                </div>
              </div>
              <DialogFooter>
                <Button onClick={handleAddPurchase} style={{ backgroundColor: getThemeColor() }}>
                  <Save className="w-4 h-4 ml-2" />
                  حفظ
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row gap-4 items-center justify-between bg-card p-4 rounded-lg border shadow-sm">
        <div className="relative w-full sm:w-96">
          <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input placeholder="بحث برقم الفاتورة أو اسم المورد..." className="pr-9" />
        </div>
        <div className="flex gap-2 w-full sm:w-auto">
          <Button variant="outline" size="sm" className="flex-1 sm:flex-none">
            <Filter className="w-4 h-4 ml-2" />
            تصفية
          </Button>
          <select className="h-9 rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50">
            <option>جميع الحالات</option>
            <option>تم الاستلام</option>
            <option>قيد الانتظار</option>
            <option>تم الطلب</option>
          </select>
        </div>
      </div>

      <div className="rounded-md border bg-card shadow-sm overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[120px]">رقم الفاتورة</TableHead>
              <TableHead>المورد</TableHead>
              <TableHead>التاريخ</TableHead>
              <TableHead>عدد الأصناف</TableHead>
              <TableHead>المبلغ الإجمالي</TableHead>
              <TableHead>الحالة</TableHead>
              <TableHead className="text-left">إجراءات</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {purchases.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                  لا توجد فواتير شراء مسجلة. قم بإنشاء فاتورة شراء جديدة للبدء.
                </TableCell>
              </TableRow>
            ) : (
              purchases.map((purchase) => {
                const status = statusMap[purchase.status];
                const StatusIcon = status.icon;
                
                return (
                  <TableRow key={purchase.id} className="hover:bg-muted/50 transition-colors">
                    <TableCell className="font-medium">{purchase.id}</TableCell>
                    <TableCell>{purchase.supplier}</TableCell>
                    <TableCell>{purchase.date}</TableCell>
                    <TableCell>{purchase.items}</TableCell>
                    <TableCell className="font-bold">{purchase.amount.toLocaleString()} ر.س</TableCell>
                    <TableCell>
                      <Badge variant="outline" className={`${status.color} gap-1 pl-2 pr-2 py-0.5 font-normal`}>
                        <StatusIcon className="w-3 h-3" />
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
                          <DropdownMenuItem>تعديل الفاتورة</DropdownMenuItem>
                          <DropdownMenuItem>تسجيل استلام</DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem className="text-destructive">حذف</DropdownMenuItem>
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

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
  Save,
  Pencil,
  Trash2,
  Printer
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
import { stockMovementsApi, inventoryApi, warehousesApi, cashBoxesApi, banksWalletsApi } from "@/lib/api";

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
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [editingPurchase, setEditingPurchase] = useState<any>(null);
  const [viewingPurchase, setViewingPurchase] = useState<any>(null);
  const [items, setItems] = useState<any[]>([]);
  const [warehouses, setWarehouses] = useState<any[]>([]);
  const [suppliers, setSuppliers] = useState<any[]>([]);
  const [purchases, setPurchases] = useState<any[]>([]);
  const [cashBoxes, setCashBoxes] = useState<any[]>([]);
  const [banksWallets, setBanksWallets] = useState<any[]>([]);

  const [newPurchase, setNewPurchase] = useState({
    supplierId: "",
    itemId: "",
    warehouseId: "",
    quantity: 0,
    unitCost: 0,
    reference: "",
    notes: "",
    date: new Date().toISOString().split('T')[0],
    currency: "YER",
    invoiceType: "credit", // "credit" (أجلاً) or "cash" (نقداً)
    paymentMethod: "", // "cash", "bank", "exchange", "wallet"
    paymentAccountId: "", // ID of cash box, bank, exchange, or wallet
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
        // Remove duplicates by id (keep first occurrence)
        const uniqueSuppliers = filteredSuppliers.filter((supplier: any, index: number, self: any[]) =>
          index === self.findIndex((s: any) => s.id === supplier.id)
        );
        setSuppliers(uniqueSuppliers);
      }
    } catch (error) {
      console.error('Failed to load suppliers:', error);
    }
  };

  const loadData = async () => {
    try {
      const [itemsData, warehousesData, cashBoxesData, banksWalletsData] = await Promise.all([
        inventoryApi.getByEntity(currentEntity.id),
        warehousesApi.getByEntity(currentEntity.id),
        cashBoxesApi.getByEntity(currentEntity.id),
        banksWalletsApi.getByEntity(currentEntity.id),
      ]);
      setItems(itemsData);
      setWarehouses(warehousesData);
      setCashBoxes(cashBoxesData.filter((box: any) => box.isActive !== false));
      setBanksWallets(banksWalletsData.filter((item: any) => item.isActive !== false));
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
          let currency = 'YER'; // Default currency
          if (movement.notes) {
            const supplierMatch = movement.notes.match(/supplierId:([A-Z0-9-]+)/);
            if (supplierMatch) {
              const supplierId = supplierMatch[1];
              const supplier = suppliersList.find((s: any) => s.id === supplierId);
              if (supplier) supplierName = supplier.name;
            }
            // Extract currency from notes (format: "currency:YER")
            const currencyMatch = movement.notes.match(/currency:([A-Z]+)/);
            if (currencyMatch) {
              currency = currencyMatch[1];
            }
          }
          
          purchaseMap.set(ref, {
            id: ref,
            reference: ref,
            supplier: supplierName,
            date: new Date(movement.date).toLocaleDateString('ar-SA'),
            items: 1,
            amount: movement.totalCost || 0,
            currency: currency,
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
    if (!newPurchase.supplierId) {
      toast.error("يرجى تحديد المورد");
      return;
    }
    if (!newPurchase.itemId || !newPurchase.warehouseId || newPurchase.quantity <= 0) {
      toast.error("يرجى إدخال الصنف والمستودع والكمية");
      return;
    }
    if (newPurchase.invoiceType === "cash" && (!newPurchase.paymentMethod || !newPurchase.paymentAccountId)) {
      toast.error("يرجى تحديد طريقة الدفع والحساب");
      return;
    }

    try {
      const item = items.find(i => i.id === newPurchase.itemId);
      const warehouse = warehouses.find(w => w.id === newPurchase.warehouseId);

      // Get supplier to find its chart account
      const supplier = suppliers.find(s => s.id === newPurchase.supplierId);
      const supplierAccountId = supplier?.chartAccountId || null;

      // Create stock movement for purchase
      // Include supplierId, supplierAccountId, invoiceType, paymentMethod, paymentAccountId, and currency in notes
      let notes = newPurchase.notes || '';
      if (newPurchase.supplierId) {
        notes = notes ? `${notes} supplierId:${newPurchase.supplierId}` : `supplierId:${newPurchase.supplierId}`;
      }
      if (supplierAccountId) {
        notes = notes ? `${notes} supplierAccountId:${supplierAccountId}` : `supplierAccountId:${supplierAccountId}`;
      }
      if (newPurchase.invoiceType) {
        notes = notes ? `${notes} invoiceType:${newPurchase.invoiceType}` : `invoiceType:${newPurchase.invoiceType}`;
      }
      if (newPurchase.paymentMethod) {
        notes = notes ? `${notes} paymentMethod:${newPurchase.paymentMethod}` : `paymentMethod:${newPurchase.paymentMethod}`;
      }
      if (newPurchase.paymentAccountId) {
        notes = notes ? `${notes} paymentAccountId:${newPurchase.paymentAccountId}` : `paymentAccountId:${newPurchase.paymentAccountId}`;
      }
      if (newPurchase.currency) {
        notes = notes ? `${notes} currency:${newPurchase.currency}` : `currency:${newPurchase.currency}`;
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
        currency: "YER",
        invoiceType: "credit",
        paymentMethod: "",
        paymentAccountId: "",
      });
      // Reload purchases list
      await loadPurchases();
    } catch (error) {
      console.error('Failed to create purchase:', error);
      toast.error("فشل في إنشاء فاتورة المشتريات");
    }
  };

  const handleDeletePurchase = async (purchaseId: string) => {
    if (!confirm("هل أنت متأكد من حذف فاتورة المشتريات هذه؟ سيتم عكس الكميات في المخزون.")) {
      return;
    }

    try {
      // Get all movements for this purchase (by reference)
      const purchase = purchases.find(p => p.id === purchaseId);
      if (!purchase || !purchase.movements) {
        toast.error("فاتورة المشتريات غير موجودة");
        return;
      }

      // Delete all movements for this purchase
      for (const movement of purchase.movements) {
        await stockMovementsApi.delete(movement.id);
      }

      toast.success("تم حذف فاتورة المشتريات بنجاح");
      await loadPurchases();
    } catch (error: any) {
      console.error('Failed to delete purchase:', error);
      toast.error(error.message || "فشل في حذف فاتورة المشتريات");
    }
  };

  const openEditDialog = (purchase: any) => {
    // For simplicity, we'll edit the first movement (most purchases have one item)
    // In a real app, you might want to show all items in the purchase
    if (purchase.movements && purchase.movements.length > 0) {
      const firstMovement = purchase.movements[0];
      const notes = firstMovement.notes || '';
      
      // Extract all fields from notes
      const supplierMatch = notes.match(/supplierId:([A-Z0-9-]+)/);
      const supplierId = supplierMatch ? supplierMatch[1] : "";
      
      const currencyMatch = notes.match(/currency:([A-Z]+)/);
      const currency = currencyMatch ? currencyMatch[1] : "YER";
      
      const invoiceTypeMatch = notes.match(/invoiceType:([a-z]+)/);
      const invoiceType = invoiceTypeMatch ? invoiceTypeMatch[1] : "credit";
      
      const paymentMethodMatch = notes.match(/paymentMethod:([a-z]+)/);
      const paymentMethod = paymentMethodMatch ? paymentMethodMatch[1] : "";
      
      const paymentAccountIdMatch = notes.match(/paymentAccountId:([A-Z0-9-]+)/);
      const paymentAccountId = paymentAccountIdMatch ? paymentAccountIdMatch[1] : "";
      
      // Clean notes from metadata
      let cleanNotes = notes;
      cleanNotes = cleanNotes.replace(/supplierId:[A-Z0-9-]+/g, '');
      cleanNotes = cleanNotes.replace(/currency:[A-Z]+/g, '');
      cleanNotes = cleanNotes.replace(/invoiceType:[a-z]+/g, '');
      cleanNotes = cleanNotes.replace(/paymentMethod:[a-z]+/g, '');
      cleanNotes = cleanNotes.replace(/paymentAccountId:[A-Z0-9-]+/g, '');
      cleanNotes = cleanNotes.trim();
      
      setEditingPurchase({
        ...purchase,
        movementId: firstMovement.id,
        supplierId: supplierId,
        itemId: firstMovement.itemId,
        warehouseId: firstMovement.warehouseId,
        quantity: firstMovement.quantity,
        unitCost: firstMovement.unitCost || 0,
        reference: firstMovement.reference || purchase.id,
        notes: cleanNotes,
        date: new Date(firstMovement.date).toISOString().split('T')[0],
        currency: currency,
        invoiceType: invoiceType,
        paymentMethod: paymentMethod,
        paymentAccountId: paymentAccountId,
      });
      setIsEditOpen(true);
    }
  };

  const handleEditPurchase = async () => {
    if (!editingPurchase || !editingPurchase.supplierId) {
      toast.error("يرجى تحديد المورد");
      return;
    }
    if (!editingPurchase.itemId || !editingPurchase.warehouseId || editingPurchase.quantity <= 0) {
      toast.error("يرجى إدخال الصنف والمستودع والكمية");
      return;
    }
    if (editingPurchase.invoiceType === "cash" && (!editingPurchase.paymentMethod || !editingPurchase.paymentAccountId)) {
      toast.error("يرجى تحديد طريقة الدفع والحساب");
      return;
    }

    try {
      let notes = editingPurchase.notes || '';
      if (editingPurchase.supplierId) {
        notes = notes ? `${notes} supplierId:${editingPurchase.supplierId}` : `supplierId:${editingPurchase.supplierId}`;
      }
      if (editingPurchase.invoiceType) {
        notes = notes ? `${notes} invoiceType:${editingPurchase.invoiceType}` : `invoiceType:${editingPurchase.invoiceType}`;
      }
      if (editingPurchase.paymentMethod) {
        notes = notes ? `${notes} paymentMethod:${editingPurchase.paymentMethod}` : `paymentMethod:${editingPurchase.paymentMethod}`;
      }
      if (editingPurchase.paymentAccountId) {
        notes = notes ? `${notes} paymentAccountId:${editingPurchase.paymentAccountId}` : `paymentAccountId:${editingPurchase.paymentAccountId}`;
      }
      if (editingPurchase.currency) {
        notes = notes ? `${notes} currency:${editingPurchase.currency}` : `currency:${editingPurchase.currency}`;
      }

      const updatedMovement = {
        itemId: editingPurchase.itemId,
        warehouseId: editingPurchase.warehouseId,
        quantity: editingPurchase.quantity,
        unitCost: editingPurchase.unitCost || 0,
        totalCost: editingPurchase.quantity * (editingPurchase.unitCost || 0),
        reference: editingPurchase.reference,
        notes: notes,
        date: new Date(editingPurchase.date).toISOString(),
      };

      await stockMovementsApi.update(editingPurchase.movementId, updatedMovement);
      toast.success("تم تحديث فاتورة المشتريات بنجاح");
      setIsEditOpen(false);
      setEditingPurchase(null);
      await loadPurchases();
    } catch (error: any) {
      console.error('Failed to update purchase:', error);
      toast.error(error.message || "فشل في تحديث فاتورة المشتريات");
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
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
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
                  <Label>المورد *</Label>
                  <Select
                    value={newPurchase.supplierId || "none"}
                    onValueChange={(value) => setNewPurchase({ ...newPurchase, supplierId: value === "none" ? "" : value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="اختر المورد" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">لا يوجد</SelectItem>
                      {suppliers.map((supplier) => (
                        <SelectItem key={supplier.id} value={supplier.id}>
                          {supplier.name} {supplier.phone ? `- ${supplier.phone}` : ''}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>العملة *</Label>
                    <Select
                      value={newPurchase.currency}
                      onValueChange={(value) => setNewPurchase({ ...newPurchase, currency: value })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="YER">ريال يمني (YER)</SelectItem>
                        <SelectItem value="SAR">ريال سعودي (SAR)</SelectItem>
                        <SelectItem value="USD">دولار أمريكي (USD)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>نوع الفاتورة *</Label>
                    <Select
                      value={newPurchase.invoiceType}
                      onValueChange={(value) => {
                        setNewPurchase({ 
                          ...newPurchase, 
                          invoiceType: value,
                          paymentMethod: value === "credit" ? "" : "",
                          paymentAccountId: ""
                        });
                      }}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="credit">أجلاً</SelectItem>
                        <SelectItem value="cash">نقداً</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                {newPurchase.invoiceType === "cash" && (
                  <div className="space-y-2">
                    <Label>طريقة الدفع *</Label>
                    <Select
                      value={newPurchase.paymentMethod || "none"}
                      onValueChange={(value) => setNewPurchase({ ...newPurchase, paymentMethod: value === "none" ? "" : value, paymentAccountId: "" })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="اختر طريقة الدفع" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="none">لا يوجد</SelectItem>
                        <SelectItem value="cash">نقداً (صناديق)</SelectItem>
                        <SelectItem value="bank">بنك</SelectItem>
                        <SelectItem value="exchange">صراف</SelectItem>
                        <SelectItem value="wallet">محفظة</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                )}
                {newPurchase.invoiceType === "cash" && newPurchase.paymentMethod && newPurchase.paymentMethod !== "none" && (
                  <div className="space-y-2">
                    <Label>
                      {newPurchase.paymentMethod === "cash" && "الصندوق"}
                      {newPurchase.paymentMethod === "bank" && "البنك"}
                      {newPurchase.paymentMethod === "exchange" && "الصراف"}
                      {newPurchase.paymentMethod === "wallet" && "المحفظة"}
                      {" *"}
                    </Label>
                    <Select
                      value={newPurchase.paymentAccountId || "none"}
                      onValueChange={(value) => setNewPurchase({ ...newPurchase, paymentAccountId: value === "none" ? "" : value })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder={`اختر ${newPurchase.paymentMethod === "cash" ? "الصندوق" : newPurchase.paymentMethod === "bank" ? "البنك" : newPurchase.paymentMethod === "exchange" ? "الصراف" : "المحفظة"}`} />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="none">لا يوجد</SelectItem>
                        {newPurchase.paymentMethod === "cash" && cashBoxes.map((box) => (
                          <SelectItem key={box.id} value={box.id}>
                            {box.name}
                          </SelectItem>
                        ))}
                        {newPurchase.paymentMethod === "bank" && banksWallets.filter((item: any) => item.type === 'bank').map((item) => (
                          <SelectItem key={item.id} value={item.id}>
                            {item.name}
                          </SelectItem>
                        ))}
                        {newPurchase.paymentMethod === "exchange" && banksWallets.filter((item: any) => item.type === 'exchange').map((item) => (
                          <SelectItem key={item.id} value={item.id}>
                            {item.name}
                          </SelectItem>
                        ))}
                        {newPurchase.paymentMethod === "wallet" && banksWallets.filter((item: any) => item.type === 'wallet').map((item) => (
                          <SelectItem key={item.id} value={item.id}>
                            {item.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                )}
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
                <div className="grid grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label>الكمية *</Label>
                    <Input
                      type="number"
                      value={newPurchase.quantity}
                      onChange={(e) => setNewPurchase({ ...newPurchase, quantity: parseFloat(e.target.value) || 0 })}
                      min="0"
                      step="0.01"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>سعر الوحدة</Label>
                    <Input
                      type="number"
                      value={newPurchase.unitCost}
                      onChange={(e) => setNewPurchase({ ...newPurchase, unitCost: parseFloat(e.target.value) || 0 })}
                      min="0"
                      step="0.01"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>إجمالي الفاتورة</Label>
                    <Input
                      type="number"
                      value={(newPurchase.quantity * newPurchase.unitCost).toFixed(2)}
                      readOnly
                      className="bg-muted"
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

          <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>تعديل فاتورة المشتريات</DialogTitle>
                <DialogDescription>
                  تعديل بيانات فاتورة المشتريات
                </DialogDescription>
              </DialogHeader>
              {editingPurchase && (
                <div className="grid gap-4 py-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>التاريخ *</Label>
                      <Input
                        type="date"
                        value={editingPurchase.date}
                        onChange={(e) => setEditingPurchase({ ...editingPurchase, date: e.target.value })}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>رقم الفاتورة</Label>
                      <Input
                        value={editingPurchase.reference || ""}
                        onChange={(e) => setEditingPurchase({ ...editingPurchase, reference: e.target.value })}
                        placeholder="رقم فاتورة المورد"
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label>المورد *</Label>
                    <Select
                      value={editingPurchase.supplierId || "none"}
                      onValueChange={(value) => setEditingPurchase({ ...editingPurchase, supplierId: value === "none" ? "" : value })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="اختر المورد" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="none">لا يوجد</SelectItem>
                        {suppliers.map((supplier) => (
                          <SelectItem key={supplier.id} value={supplier.id}>
                            {supplier.name} {supplier.phone ? `- ${supplier.phone}` : ''}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>العملة *</Label>
                      <Select
                        value={editingPurchase.currency || "YER"}
                        onValueChange={(value) => setEditingPurchase({ ...editingPurchase, currency: value })}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="YER">ريال يمني (YER)</SelectItem>
                          <SelectItem value="SAR">ريال سعودي (SAR)</SelectItem>
                          <SelectItem value="USD">دولار أمريكي (USD)</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label>نوع الفاتورة *</Label>
                      <Select
                        value={editingPurchase.invoiceType || "credit"}
                        onValueChange={(value) => {
                          setEditingPurchase({ 
                            ...editingPurchase, 
                            invoiceType: value,
                            paymentMethod: value === "credit" ? "" : "",
                            paymentAccountId: ""
                          });
                        }}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="credit">أجلاً</SelectItem>
                          <SelectItem value="cash">نقداً</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  {editingPurchase.invoiceType === "cash" && (
                    <div className="space-y-2">
                      <Label>طريقة الدفع *</Label>
                      <Select
                        value={editingPurchase.paymentMethod || "none"}
                        onValueChange={(value) => setEditingPurchase({ ...editingPurchase, paymentMethod: value === "none" ? "" : value, paymentAccountId: "" })}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="اختر طريقة الدفع" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="none">لا يوجد</SelectItem>
                          <SelectItem value="cash">نقداً (صناديق)</SelectItem>
                          <SelectItem value="bank">بنك</SelectItem>
                          <SelectItem value="exchange">صراف</SelectItem>
                          <SelectItem value="wallet">محفظة</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  )}
                  {editingPurchase.invoiceType === "cash" && editingPurchase.paymentMethod && editingPurchase.paymentMethod !== "none" && (
                    <div className="space-y-2">
                      <Label>
                        {editingPurchase.paymentMethod === "cash" && "الصندوق"}
                        {editingPurchase.paymentMethod === "bank" && "البنك"}
                        {editingPurchase.paymentMethod === "exchange" && "الصراف"}
                        {editingPurchase.paymentMethod === "wallet" && "المحفظة"}
                        {" *"}
                      </Label>
                      <Select
                        value={editingPurchase.paymentAccountId || "none"}
                        onValueChange={(value) => setEditingPurchase({ ...editingPurchase, paymentAccountId: value === "none" ? "" : value })}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder={`اختر ${editingPurchase.paymentMethod === "cash" ? "الصندوق" : editingPurchase.paymentMethod === "bank" ? "البنك" : editingPurchase.paymentMethod === "exchange" ? "الصراف" : "المحفظة"}`} />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="none">لا يوجد</SelectItem>
                          {editingPurchase.paymentMethod === "cash" && cashBoxes.map((box) => (
                            <SelectItem key={box.id} value={box.id}>
                              {box.name}
                            </SelectItem>
                          ))}
                          {editingPurchase.paymentMethod === "bank" && banksWallets.filter((item: any) => item.type === 'bank').map((item) => (
                            <SelectItem key={item.id} value={item.id}>
                              {item.name}
                            </SelectItem>
                          ))}
                          {editingPurchase.paymentMethod === "exchange" && banksWallets.filter((item: any) => item.type === 'exchange').map((item) => (
                            <SelectItem key={item.id} value={item.id}>
                              {item.name}
                            </SelectItem>
                          ))}
                          {editingPurchase.paymentMethod === "wallet" && banksWallets.filter((item: any) => item.type === 'wallet').map((item) => (
                            <SelectItem key={item.id} value={item.id}>
                              {item.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  )}
                  <div className="space-y-2">
                    <Label>المستودع *</Label>
                    <Select
                      value={editingPurchase.warehouseId}
                      onValueChange={(value) => setEditingPurchase({ ...editingPurchase, warehouseId: value })}
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
                  <div className="space-y-2">
                    <Label>الصنف *</Label>
                    <Select
                      value={editingPurchase.itemId}
                      onValueChange={(value) => setEditingPurchase({ ...editingPurchase, itemId: value })}
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
                      value={editingPurchase.warehouseId}
                      onValueChange={(value) => setEditingPurchase({ ...editingPurchase, warehouseId: value })}
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
                  <div className="grid grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <Label>الكمية *</Label>
                      <Input
                        type="number"
                        value={editingPurchase.quantity}
                        onChange={(e) => setEditingPurchase({ ...editingPurchase, quantity: parseFloat(e.target.value) || 0 })}
                        min="0"
                        step="0.01"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>سعر الوحدة</Label>
                      <Input
                        type="number"
                        value={editingPurchase.unitCost}
                        onChange={(e) => setEditingPurchase({ ...editingPurchase, unitCost: parseFloat(e.target.value) || 0 })}
                        min="0"
                        step="0.01"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>إجمالي الفاتورة</Label>
                      <Input
                        type="number"
                        value={(editingPurchase.quantity * (editingPurchase.unitCost || 0)).toFixed(2)}
                        readOnly
                        className="bg-muted"
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label>ملاحظات</Label>
                    <Textarea
                      value={editingPurchase.notes || ""}
                      onChange={(e) => setEditingPurchase({ ...editingPurchase, notes: e.target.value })}
                      placeholder="ملاحظات إضافية"
                      rows={2}
                    />
                  </div>
                </div>
              )}
              <DialogFooter>
                <Button onClick={handleEditPurchase} style={{ backgroundColor: getThemeColor() }}>
                  <Save className="w-4 h-4 ml-2" />
                  حفظ التعديلات
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
                    <TableCell className="font-bold">
                      {purchase.amount.toLocaleString()} {purchase.currency === 'YER' ? 'ر.ي' : purchase.currency === 'SAR' ? 'ر.س' : purchase.currency === 'USD' ? '$' : purchase.currency || 'ر.ي'}
                    </TableCell>
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
                          <DropdownMenuItem onClick={() => {
                            setViewingPurchase(purchase);
                            setIsDetailOpen(true);
                          }}>
                            عرض التفاصيل
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => openEditDialog(purchase)}>
                            <Pencil className="w-4 h-4 ml-2" />
                            تعديل الفاتورة
                          </DropdownMenuItem>
                          <DropdownMenuItem>تسجيل استلام</DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem 
                            className="text-destructive"
                            onClick={() => handleDeletePurchase(purchase.id)}
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

      <Dialog open={isDetailOpen} onOpenChange={setIsDetailOpen}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto print-content">
          <DialogHeader className="no-print">
            <DialogTitle>تفاصيل فاتورة المشتريات</DialogTitle>
            <DialogDescription>
              عرض تفاصيل فاتورة المشتريات
            </DialogDescription>
          </DialogHeader>
          {/* Print Header */}
          <div className="hidden print:block text-center mb-6 pb-4 border-b-2">
            <h1 className="text-3xl font-bold mb-2">{currentEntity.name}</h1>
            <p className="text-xl text-muted-foreground">فاتورة مشتريات</p>
          </div>
          {viewingPurchase && (
            <div className="grid gap-4 py-4 print-content">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-muted-foreground">رقم الفاتورة</Label>
                  <p className="font-semibold">{viewingPurchase.id}</p>
                </div>
                <div>
                  <Label className="text-muted-foreground">التاريخ</Label>
                  <p className="font-semibold">{viewingPurchase.date}</p>
                </div>
              </div>
              <div>
                <Label className="text-muted-foreground">المورد</Label>
                <p className="font-semibold">{viewingPurchase.supplier}</p>
              </div>
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <Label className="text-muted-foreground">عدد الأصناف</Label>
                  <p className="font-semibold">{viewingPurchase.items}</p>
                </div>
                <div>
                  <Label className="text-muted-foreground">المبلغ الإجمالي</Label>
                  <p className="font-semibold">
                    {viewingPurchase.amount.toLocaleString()} {viewingPurchase.currency === 'YER' ? 'ر.ي' : viewingPurchase.currency === 'SAR' ? 'ر.س' : viewingPurchase.currency === 'USD' ? '$' : viewingPurchase.currency || 'ر.ي'}
                  </p>
                </div>
                <div>
                  <Label className="text-muted-foreground">الحالة</Label>
                  <Badge variant="outline" className={`${statusMap[viewingPurchase.status]?.color || ''} gap-1 pl-2 pr-2 py-0.5 font-normal`}>
                    {statusMap[viewingPurchase.status]?.label || viewingPurchase.status}
                  </Badge>
                </div>
              </div>
              {viewingPurchase.movements && viewingPurchase.movements.length > 0 && (
                <div>
                  <Label className="text-muted-foreground mb-2 block">الأصناف</Label>
                  <div className="border rounded-md">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>الصنف</TableHead>
                          <TableHead>المستودع</TableHead>
                          <TableHead>الكمية</TableHead>
                          <TableHead>سعر الوحدة</TableHead>
                          <TableHead>الإجمالي</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {viewingPurchase.movements.map((movement: any) => {
                          const item = items.find(i => i.id === movement.itemId);
                          const warehouse = warehouses.find(w => w.id === movement.warehouseId);
                          return (
                            <TableRow key={movement.id}>
                              <TableCell>{item ? `${item.code} - ${item.name}` : movement.itemId}</TableCell>
                              <TableCell>{warehouse ? `${warehouse.code} - ${warehouse.name}` : movement.warehouseId}</TableCell>
                              <TableCell>{movement.quantity}</TableCell>
                              <TableCell>{movement.unitCost?.toLocaleString() || 0}</TableCell>
                              <TableCell>{movement.totalCost?.toLocaleString() || 0}</TableCell>
                            </TableRow>
                          );
                        })}
                      </TableBody>
                    </Table>
                  </div>
                </div>
              )}
            </div>
          )}
          <DialogFooter className="flex gap-2 sm:gap-0">
            <Button 
              variant="outline" 
              onClick={() => {
                window.print();
              }}
              className="print:hidden"
            >
              <Printer className="w-4 h-4 ml-2" />
              طباعة
            </Button>
            <Button variant="outline" onClick={() => setIsDetailOpen(false)}>
              إغلاق
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

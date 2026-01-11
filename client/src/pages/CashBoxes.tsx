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
  Wallet,
  ArrowUpRight,
  ArrowDownLeft,
  History,
  Save,
  Pencil,
  Trash2
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
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
import { Checkbox } from "@/components/ui/checkbox";
import { useState, useEffect } from "react";
import { toast } from "sonner";
import { useEntity } from "@/contexts/EntityContext";
import { cashBoxesApi, accountsApi } from "@/lib/api";

// Initial clean data
const initialCashBoxes: any[] = [
  {
    id: "CB-001",
    entityId: "UNIT-001",
    name: "صندوق التحصيل والتوريد الدهمية",
    balance: 0.00,
    currency: "YER",
    type: "cash_box",
    accountId: "2.1",
    branchId: "BR-003",
    responsiblePerson: "",
    status: "active",
    lastTransaction: "-"
  },
  {
    id: "CB-002",
    entityId: "UNIT-001",
    name: "صندوق التحصيل والتوريد الصبالية",
    balance: 0.00,
    currency: "YER",
    type: "cash_box",
    accountId: "2.2",
    branchId: "BR-004",
    responsiblePerson: "",
    status: "active",
    lastTransaction: "-"
  },
  {
    id: "CB-003",
    entityId: "UNIT-001",
    name: "صندوق التحصيل والتوريد غليل",
    balance: 0.00,
    currency: "YER",
    type: "cash_box",
    accountId: "2.3",
    branchId: "BR-005",
    responsiblePerson: "",
    status: "active",
    lastTransaction: "-"
  }
];
const recentTransactions: any[] = [];

export default function CashBoxes() {
  const { currentEntity } = useEntity();
  const [cashBoxes, setCashBoxes] = useState<any[]>([]);
  const [accounts, setAccounts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isNewBoxOpen, setIsNewBoxOpen] = useState(false);
  const [isEditBoxOpen, setIsEditBoxOpen] = useState(false);
  const [editingBox, setEditingBox] = useState<any>(null);

  const [newBox, setNewBox] = useState({
    name: "",
    currencies: ["YER", "SAR", "USD"] as string[], // Multiple currencies support
    defaultCurrency: "YER", // Default currency
    type: "cash_box", // cash_box or petty_cash
    accountId: "", // حساب من الدليل
    branchId: "", // الفرع المربوط
    responsiblePerson: "" // مسؤول الصندوق
  });

  // Load data from API
  useEffect(() => {
    loadData();
  }, [currentEntity.id]);

  const loadData = async () => {
    try {
      setLoading(true);
      // Pass entityId to API to filter on backend instead of fetching all data
      const [boxesData, accountsData] = await Promise.all([
        currentEntity?.id ? cashBoxesApi.getByEntity(currentEntity.id) : cashBoxesApi.getAll(),
        accountsApi.getAll()
      ]);
      
      // Normalize old format to new format
      const normalizedBoxes = boxesData.map((box: any) => ({
        ...box,
        currencies: box.currencies || (box.currency ? [box.currency] : ["YER", "SAR", "USD"]),
        defaultCurrency: box.defaultCurrency || box.currency || "YER"
      }));
      
      setCashBoxes(normalizedBoxes);
      setAccounts(accountsData);
    } catch (error) {
      console.error('Failed to load data:', error);
      toast.error('فشل تحميل البيانات');
    } finally {
      setLoading(false);
    }
  };

  // Get cash accounts from chart of accounts
  const allCashAccounts = accounts.filter(account => 
    (account.subtype === 'cash_box' || account.subtype === 'cash') && 
    !account.isGroup && 
    account.entityId === currentEntity.id
  );

  // Filter available accounts (exclude already linked accounts)
  const getAvailableCashAccounts = (excludeBoxId?: string) => {
    const linkedAccountIds = cashBoxes
      .filter(box => box.id !== excludeBoxId && box.accountId) // استثناء الصندوق الحالي عند التعديل
      .map(box => box.accountId);
    return allCashAccounts.filter(account => !linkedAccountIds.includes(account.id));
  };

  // Load currencies from selected account
  useEffect(() => {
    if (newBox.accountId && newBox.accountId !== "none") {
      const selectedAccount = accounts.find(acc => acc.id === newBox.accountId);
      if (selectedAccount && selectedAccount.currencies) {
        setNewBox(prev => ({
          ...prev,
          currencies: selectedAccount.currencies || ["YER", "SAR", "USD"],
          defaultCurrency: selectedAccount.defaultCurrency || selectedAccount.currencies[0] || "YER"
        }));
      }
    }
  }, [newBox.accountId, accounts]);

  // Filter cash boxes based on current entity
  // In a real app, this would be a backend query. Here we filter by an 'entityId' property we'll add.
  const visibleCashBoxes = cashBoxes.filter(box => {
    // الشركة القابضة ليس لها صناديق
    if (currentEntity.type === 'holding') return false;
    
    // فقط عرض صناديق الوحدة الحالية
    if (box.entityId !== currentEntity.id) return false;
    
    return true;
  });

  const handleAddBox = async () => {
    if (!newBox.name) {
      toast.error("يرجى إدخال اسم الصندوق");
      return;
    }
    if (newBox.currencies.length === 0) {
      toast.error("يرجى اختيار عملة واحدة على الأقل");
      return;
    }

    try {
      const box = {
        id: `CB-${Date.now()}`, // Generate ID
        entityId: currentEntity.id,
        name: newBox.name,
        balance: 0.00,
        currencies: newBox.currencies, // Multiple currencies
        defaultCurrency: newBox.defaultCurrency, // Default currency
        type: newBox.type,
        accountId: newBox.accountId && newBox.accountId !== "none" ? newBox.accountId : null,
        branchId: newBox.branchId && newBox.branchId !== "main" ? newBox.branchId : null,
        responsible: newBox.responsiblePerson || null,
        isActive: true
      };

      console.log('Creating cash box with data:', box);
      await cashBoxesApi.create(box);
      toast.success(`تم إضافة الصندوق بنجاح (${newBox.currencies.length} عملة)`);
      await loadData();
      setIsNewBoxOpen(false);
      setNewBox({ 
        name: "", 
        currencies: ["YER", "SAR", "USD"], 
        defaultCurrency: "YER",
        type: "cash_box", 
        accountId: "", 
        branchId: "", 
        responsiblePerson: "" 
      });
    } catch (error: any) {
      console.error('Failed to add cash box:', error);
      toast.error(error.message || 'فشل إضافة الصندوق');
    }
  };

  const handleEditBox = async () => {
    if (!editingBox || !editingBox.name) {
      toast.error("يرجى إدخال اسم الصندوق");
      return;
    }
    
    const currencies = editingBox.currencies || (editingBox.currency ? [editingBox.currency] : ["YER", "SAR", "USD"]);
    if (currencies.length === 0) {
      toast.error("يرجى اختيار عملة واحدة على الأقل");
      return;
    }

    try {
      // Map fields to match schema
      const boxData = {
        ...editingBox,
        currencies: currencies,
        defaultCurrency: editingBox.defaultCurrency || currencies[0],
        accountId: editingBox.accountId && editingBox.accountId !== "none" ? editingBox.accountId : null,
        branchId: editingBox.branchId && editingBox.branchId !== "main" ? editingBox.branchId : null,
        responsible: editingBox.responsiblePerson || editingBox.responsible || null,
        isActive: editingBox.status === "active" ? true : (editingBox.isActive !== undefined ? editingBox.isActive : true)
      };
      
      // Remove fields that don't exist in schema
      delete boxData.status;
      delete boxData.lastTransaction;
      delete boxData.responsiblePerson;
      delete boxData.currency;
      
      console.log('Updating cash box with data:', boxData);
      await cashBoxesApi.update(editingBox.id, boxData);
      toast.success(`تم تحديث بيانات الصندوق بنجاح (${currencies.length} عملة)`);
      await loadData();
      setIsEditBoxOpen(false);
      setEditingBox(null);
    } catch (error: any) {
      console.error('Failed to update cash box:', error);
      toast.error(error.message || 'فشل تحديث الصندوق');
    }
  };

  const handleDeleteBox = async (id: string) => {
    const box = cashBoxes.find(b => b.id === id);
    if (box && box.balance !== 0) {
      toast.error("لا يمكن حذف صندوق يحتوي على رصيد. يرجى تصفير الرصيد أولاً.");
      return;
    }

    if (confirm("هل أنت متأكد من حذف هذا الصندوق؟")) {
      try {
        await cashBoxesApi.delete(id);
        toast.success("تم حذف الصندوق بنجاح");
        await loadData();
      } catch (error: any) {
        console.error('Failed to delete cash box:', error);
        toast.error(error.message || 'فشل حذف الصندوق');
      }
    }
  };

  const openEditDialog = (box: any) => {
    // Normalize old format to new format
    const normalizedBox = {
      ...box,
      currencies: box.currencies || (box.currency ? [box.currency] : ["YER", "SAR", "USD"]),
      defaultCurrency: box.defaultCurrency || box.currency || "YER"
    };
    setEditingBox(normalizedBox);
    setIsEditBoxOpen(true);
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">الصناديق والعهد</h2>
          <p className="text-muted-foreground mt-1">
            إدارة الصناديق النقدية والعهد لـ <span className="font-bold text-primary">{currentEntity.name}</span>
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm">
            <Download className="w-4 h-4 ml-2" />
            تصدير
          </Button>
          
          <Dialog open={isNewBoxOpen} onOpenChange={setIsNewBoxOpen}>
            <DialogTrigger asChild>
              <Button size="sm" className="bg-orange-600 hover:bg-orange-700 text-white">
                <Plus className="w-4 h-4 ml-2" />
                صندوق جديد
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>إضافة صندوق / عهدة جديدة</DialogTitle>
                <DialogDescription>
                  سيتم إضافة الصندوق إلى: <span className="font-bold">{currentEntity.name}</span>
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="name" className="text-right">اسم الصندوق</Label>
                  <Input 
                    id="name" 
                    value={newBox.name}
                    onChange={(e) => setNewBox({...newBox, name: e.target.value})}
                    className="col-span-3" 
                    placeholder="مثال: صندوق المبيعات الرئيسي"
                  />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="type" className="text-right">النوع</Label>
                  <Select 
                    value={newBox.type} 
                    onValueChange={(v) => setNewBox({...newBox, type: v})}
                  >
                    <SelectTrigger className="col-span-3">
                      <SelectValue placeholder="اختر النوع" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="cash_box">صندوق نقدي</SelectItem>
                      <SelectItem value="petty_cash">عهدة موظف</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="accountId" className="text-right">حساب من الدليل</Label>
                  <Select 
                    value={newBox.accountId || "none"} 
                    onValueChange={(v) => setNewBox({...newBox, accountId: v === "none" ? "" : v})}
                  >
                    <SelectTrigger className="col-span-3">
                      <SelectValue placeholder="اختر الحساب المربوط" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">لا يوجد حساب</SelectItem>
                      {getAvailableCashAccounts().map(account => (
                        <SelectItem key={account.id} value={account.id}>
                          {account.id} - {account.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="accountId" className="text-right">حساب من الدليل</Label>
                  <Select 
                    value={newBox.accountId || "none"} 
                    onValueChange={(v) => setNewBox({...newBox, accountId: v === "none" ? "" : v})}
                  >
                    <SelectTrigger className="col-span-3">
                      <SelectValue placeholder="اختر الحساب المربوط" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">لا يوجد حساب</SelectItem>
                      {getAvailableCashAccounts().map(account => (
                        <SelectItem key={account.id} value={account.id}>
                          {account.id} - {account.name}
                          {account.currencies && account.currencies.length > 0 && (
                            <span className="text-xs text-muted-foreground"> ({account.currencies.join(", ")})</span>
                          )}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid grid-cols-4 items-start gap-4">
                  <Label className="text-right mt-2">العملات المسموح بها</Label>
                  <div className="col-span-3 space-y-2">
                    {(["YER", "SAR", "USD"] as const).map((currency) => {
                      const currencyLabels = {
                        YER: "ريال يمني (YER)",
                        SAR: "ريال سعودي (SAR)",
                        USD: "دولار أمريكي (USD)"
                      };
                      return (
                        <div key={currency} className="flex items-center space-x-2 space-x-reverse">
                          <Checkbox 
                            id={`new-${currency.toLowerCase()}`}
                            checked={newBox.currencies.includes(currency)}
                            onCheckedChange={(checked) => {
                              if (checked) {
                                setNewBox(prev => ({ 
                                  ...prev, 
                                  currencies: [...prev.currencies, currency],
                                  defaultCurrency: prev.currencies.length === 0 ? currency : prev.defaultCurrency
                                }));
                              } else {
                                setNewBox(prev => {
                                  const newCurrencies = prev.currencies.filter(c => c !== currency);
                                  return { 
                                    ...prev, 
                                    currencies: newCurrencies,
                                    defaultCurrency: prev.defaultCurrency === currency && newCurrencies.length > 0 
                                      ? newCurrencies[0] 
                                      : (prev.defaultCurrency === currency && newCurrencies.length === 0 ? "" : prev.defaultCurrency)
                                  };
                                });
                              }
                            }}
                          />
                          <label htmlFor={`new-${currency.toLowerCase()}`} className="text-sm font-medium cursor-pointer">
                            {currencyLabels[currency]}
                          </label>
                        </div>
                      );
                    })}
                    {newBox.currencies.length > 0 && (
                      <div className="mt-2">
                        <Label className="text-sm text-muted-foreground">العملة الافتراضية:</Label>
                        <Select 
                          value={newBox.defaultCurrency} 
                          onValueChange={(v) => setNewBox({...newBox, defaultCurrency: v})}
                        >
                          <SelectTrigger className="mt-1">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {newBox.currencies.map(currency => (
                              <SelectItem key={currency} value={currency}>
                                {currency === "YER" ? "ريال يمني" : currency === "SAR" ? "ريال سعودي" : "دولار أمريكي"} ({currency})
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    )}
                  </div>
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="branchId" className="text-right">الفرع المربوط</Label>
                  <Select 
                    value={newBox.branchId} 
                    onValueChange={(v) => setNewBox({...newBox, branchId: v})}
                  >
                    <SelectTrigger className="col-span-3">
                      <SelectValue placeholder="اختر الفرع" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="main">الفرع الرئيسي</SelectItem>
                      <SelectItem value="branch1">فرع 1</SelectItem>
                      <SelectItem value="branch2">فرع 2</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="responsiblePerson" className="text-right">مسؤول الصندوق</Label>
                  <Input 
                    id="responsiblePerson" 
                    value={newBox.responsiblePerson}
                    onChange={(e) => setNewBox({...newBox, responsiblePerson: e.target.value})}
                    className="col-span-3" 
                    placeholder="مثال: محمد أحمد"
                  />
                </div>
              </div>
              <DialogFooter>
                <Button onClick={handleAddBox}>
                  <Save className="w-4 h-4 ml-2" />
                  حفظ الصندوق
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>

          {/* Edit Dialog */}
          <Dialog open={isEditBoxOpen} onOpenChange={setIsEditBoxOpen}>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>تعديل بيانات الصندوق</DialogTitle>
                <DialogDescription>
                  تعديل اسم الصندوق أو العملة.
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="edit-name" className="text-right">اسم الصندوق</Label>
                  <Input 
                    id="edit-name" 
                    value={editingBox?.name || ""}
                    onChange={(e) => setEditingBox((prev: any) => prev ? {...prev, name: e.target.value} : null)}
                    className="col-span-3" 
                  />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="edit-accountId" className="text-right">حساب من الدليل</Label>
                  <Select 
                    value={editingBox?.accountId || "none"} 
                    onValueChange={(v) => {
                      const selectedAccount = accounts.find(acc => acc.id === v);
                      setEditingBox((prev: any) => {
                        if (!prev) return null;
                        const updated = {...prev, accountId: v === "none" ? null : v};
                        if (selectedAccount && selectedAccount.currencies) {
                          updated.currencies = selectedAccount.currencies;
                          updated.defaultCurrency = selectedAccount.defaultCurrency || selectedAccount.currencies[0] || "YER";
                        }
                        return updated;
                      });
                    }}
                  >
                    <SelectTrigger className="col-span-3">
                      <SelectValue placeholder="اختر الحساب المربوط" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">لا يوجد حساب</SelectItem>
                      {getAvailableCashAccounts(editingBox?.id).map(account => (
                        <SelectItem key={account.id} value={account.id}>
                          {account.id} - {account.name}
                          {account.currencies && account.currencies.length > 0 && (
                            <span className="text-xs text-muted-foreground"> ({account.currencies.join(", ")})</span>
                          )}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid grid-cols-4 items-start gap-4">
                  <Label className="text-right mt-2">العملات المسموح بها</Label>
                  <div className="col-span-3 space-y-2">
                    {(["YER", "SAR", "USD"] as const).map((currency) => {
                      const currencyLabels = {
                        YER: "ريال يمني (YER)",
                        SAR: "ريال سعودي (SAR)",
                        USD: "دولار أمريكي (USD)"
                      };
                      const currentCurrencies = editingBox?.currencies || (editingBox?.currency ? [editingBox.currency] : ["YER", "SAR", "USD"]);
                      return (
                        <div key={currency} className="flex items-center space-x-2 space-x-reverse">
                          <Checkbox 
                            id={`edit-${currency.toLowerCase()}`}
                            checked={currentCurrencies.includes(currency)}
                            onCheckedChange={(checked) => {
                              if (checked) {
                                setEditingBox((prev: any) => {
                                  if (!prev) return null;
                                  const newCurrencies = [...(prev.currencies || (prev.currency ? [prev.currency] : ["YER", "SAR", "USD"])), currency];
                                  return {
                                    ...prev,
                                    currencies: newCurrencies,
                                    defaultCurrency: (prev.currencies || []).length === 0 ? currency : prev.defaultCurrency || prev.currency || "YER"
                                  };
                                });
                              } else {
                                setEditingBox((prev: any) => {
                                  if (!prev) return null;
                                  const currentCurrencies = prev.currencies || (prev.currency ? [prev.currency] : ["YER", "SAR", "USD"]);
                                  const newCurrencies = currentCurrencies.filter((c: string) => c !== currency);
                                  return {
                                    ...prev,
                                    currencies: newCurrencies,
                                    defaultCurrency: (prev.defaultCurrency || prev.currency || "YER") === currency && newCurrencies.length > 0
                                      ? newCurrencies[0]
                                      : (prev.defaultCurrency || prev.currency || "YER")
                                  };
                                });
                              }
                            }}
                          />
                          <label htmlFor={`edit-${currency.toLowerCase()}`} className="text-sm font-medium cursor-pointer">
                            {currencyLabels[currency]}
                          </label>
                        </div>
                      );
                    })}
                    {editingBox && (editingBox.currencies || editingBox.currency) && (
                      <div className="mt-2">
                        <Label className="text-sm text-muted-foreground">العملة الافتراضية:</Label>
                        <Select 
                          value={editingBox.defaultCurrency || editingBox.currency || "YER"} 
                          onValueChange={(v) => setEditingBox((prev: any) => prev ? {...prev, defaultCurrency: v} : null)}
                        >
                          <SelectTrigger className="mt-1">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {(editingBox.currencies || (editingBox.currency ? [editingBox.currency] : ["YER", "SAR", "USD"])).map((currency: string) => (
                              <SelectItem key={currency} value={currency}>
                                {currency === "YER" ? "ريال يمني" : currency === "SAR" ? "ريال سعودي" : "دولار أمريكي"} ({currency})
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    )}
                  </div>
                </div>
              </div>
              <DialogFooter>
                <Button onClick={handleEditBox}>
                  <Save className="w-4 h-4 ml-2" />
                  حفظ التعديلات
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">إجمالي النقدية</CardTitle>
            <Wallet className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">0.00 ر.س</div>
            <p className="text-xs text-muted-foreground mt-1">
              لا توجد بيانات
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">المقبوضات (اليوم)</CardTitle>
            <ArrowDownLeft className="h-4 w-4 text-emerald-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-emerald-600">0.00 ر.س</div>
            <p className="text-xs text-muted-foreground mt-1">
              0 عمليات استلام
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">المصروفات (اليوم)</CardTitle>
            <ArrowUpRight className="h-4 w-4 text-rose-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-rose-600">0.00 ر.س</div>
            <p className="text-xs text-muted-foreground mt-1">
              0 عمليات صرف
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="flex flex-col sm:flex-row gap-4 items-center justify-between bg-card p-4 rounded-lg border shadow-sm">
        <div className="relative w-full sm:w-96">
          <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input placeholder="بحث عن صندوق..." className="pr-9" />
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
              <TableHead className="w-[250px]">اسم الصندوق</TableHead>
              <TableHead>النوع</TableHead>
              <TableHead>العملات</TableHead>
              <TableHead>الرصيد الحالي</TableHead>
              <TableHead>آخر حركة</TableHead>
              <TableHead>الحالة</TableHead>
              <TableHead className="text-left">إجراءات</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {visibleCashBoxes.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                  لا توجد صناديق مسجلة لـ {currentEntity.name}. قم بإضافة صندوق جديد.
                </TableCell>
              </TableRow>
            ) : (
              visibleCashBoxes.map((box) => {
                const currencies = box.currencies || (box.currency ? [box.currency] : ["YER", "SAR", "USD"]);
                const currencyLabels: { [key: string]: string } = {
                  YER: "ريال يمني",
                  SAR: "ريال سعودي",
                  USD: "دولار"
                };
                return (
                <TableRow key={box.id} className="hover:bg-muted/50 transition-colors">
                  <TableCell className="font-medium">
                    <div className="flex items-center gap-2">
                      <Wallet className="w-4 h-4 text-muted-foreground" />
                      {box.name}
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline">
                      {box.type === 'petty_cash' ? 'عهدة' : 'صندوق نقدي'}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-1 flex-wrap">
                      {currencies.map((currency: string) => (
                        <Badge key={currency} variant={currency === (box.defaultCurrency || box.currency || "YER") ? "default" : "outline"} className="text-xs">
                          {currency}
                        </Badge>
                      ))}
                    </div>
                  </TableCell>
                  <TableCell>
                    <span className="font-bold text-emerald-600">
                      {typeof box.balance === 'number' ? box.balance.toLocaleString() : parseFloat(box.balance || '0').toLocaleString()} {(box.defaultCurrency || box.currency || "YER")}
                    </span>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <History className="w-3 h-3" />
                      {box.lastTransaction || "-"}
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="secondary" className="bg-emerald-50 text-emerald-700 border-emerald-200">
                      {box.status === 'active' ? 'نشط' : 'مغلق'}
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
                        <DropdownMenuItem>كشف حساب</DropdownMenuItem>
                        <DropdownMenuItem>جرد الصندوق</DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem onClick={() => openEditDialog(box)}>
                          <Pencil className="w-4 h-4 ml-2" />
                          تعديل البيانات
                        </DropdownMenuItem>
                        <DropdownMenuItem 
                          className="text-destructive"
                          onClick={() => handleDeleteBox(box.id)}
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

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
  Landmark,
  Wallet,
  Smartphone,
  Building2,
  Save,
  Pencil,
  Trash2,
  Eye,
  CreditCard,
  ChevronDown,
  ChevronUp
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
import { banksWalletsApi, accountsApi } from "@/lib/api";

// Multi-currency account structure
interface CurrencyBalance {
  currency: string;
  balance: number;
}

interface BankWalletAccount {
  id: string;
  entityId: string;
  name: string;
  type: string;
  accountType: string;
  accountNumber: string;
  chartAccountId: string | null; // ربط بحساب في دليل الحسابات
  currencies: string[]; // العملات المسموح بها (changed from allowedCurrencies)
  balances?: CurrencyBalance[]; // الأرصدة بالعملات المختلفة (optional)
  isActive: boolean; // Changed from status
  balance?: string | number; // الرصيد من قاعدة البيانات (optional for backward compatibility)
  // Legacy fields for backward compatibility
  allowedCurrencies?: string[];
  status?: string;
  lastTransaction?: string;
}

// Account interface for chart of accounts
interface Account {
  id: string;
  name: string;
  type: string;
  subtype?: string;
  entityId?: string;
  parentId?: string | null;
  isGroup?: boolean;
  [key: string]: any; // Allow additional properties
}

// Initial data for Al-Abbasi Unit
const initialBanksWallets: BankWalletAccount[] = [];


export default function BanksWallets() {
  const { currentEntity, getThemeColor } = useEntity();
  
  const [banksWallets, setBanksWallets] = useState<BankWalletAccount[]>([]);
  const [accounts, setAccounts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isNewItemOpen, setIsNewItemOpen] = useState(false);
  const [isEditItemOpen, setIsEditItemOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<BankWalletAccount | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterType, setFilterType] = useState("all");
  const [expandedRows, setExpandedRows] = useState<Set<string>>(new Set());

  const [newItem, setNewItem] = useState({
    name: "",
    type: "bank",
    accountType: "current",
    accountNumber: "",
    chartAccountId: "",
    currencies: ["YER", "SAR", "USD"] as string[]
  });

  // Load data from API
  useEffect(() => {
    loadData();
  }, [currentEntity?.id]);

  // Load currencies from selected account when account is selected
  useEffect(() => {
    if (newItem.chartAccountId && newItem.chartAccountId !== "none") {
      const selectedAccount = accounts.find(acc => acc.id === newItem.chartAccountId);
      if (selectedAccount && selectedAccount.currencies) {
        setNewItem(prev => ({
          ...prev,
          currencies: selectedAccount.currencies || ["YER", "SAR", "USD"],
          // Keep existing currencies if account doesn't have currencies defined
        }));
      }
    }
  }, [newItem.chartAccountId, accounts]);

  // Reset chartAccountId when type changes (because accounts are filtered by type)
  useEffect(() => {
    if (newItem.chartAccountId && newItem.chartAccountId !== "none") {
      const selectedAccount = accounts.find(acc => acc.id === newItem.chartAccountId);
      // If selected account doesn't match the new type, reset it
      if (selectedAccount) {
        const expectedSubtype = newItem.type === 'bank' ? 'bank' : 
                              newItem.type === 'wallet' ? 'wallet' : 
                              newItem.type === 'exchange' ? 'exchange' : null;
        
        if (expectedSubtype && selectedAccount.subtype !== expectedSubtype) {
          setNewItem(prev => ({ ...prev, chartAccountId: "" }));
        }
      }
    }
  }, [newItem.type, accounts]);

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
      // Pass entityId to API to filter on backend instead of fetching all data
      const [walletsData, accountsData] = await Promise.all([
        currentEntity?.id ? banksWalletsApi.getByEntity(currentEntity.id) : banksWalletsApi.getAll(),
        accountsApi.getAll()
      ]);
      
      // Convert old format to new format if needed
      const normalizedWallets = walletsData.map((item: any) => ({
        ...item,
        currencies: item.currencies || item.allowedCurrencies || [],
        isActive: item.isActive !== undefined ? item.isActive : (item.status === "active" || String(item.status) === "true")
      }));
      
      setBanksWallets(normalizedWallets);
      setAccounts(accountsData);
    } catch (error) {
      console.error('Failed to load data:', error);
      toast.error('فشل تحميل البيانات');
    } finally {
      setLoading(false);
    }
  };

  // Toggle row expansion
  const toggleRow = (id: string) => {
    const newExpanded = new Set(expandedRows);
    if (newExpanded.has(id)) {
      newExpanded.delete(id);
    } else {
      newExpanded.add(id);
    }
    setExpandedRows(newExpanded);
  };

  // Get bank/wallet/exchange accounts from chart of accounts filtered by type
  const getAccountsByType = (type: string) => {
    let subtypeFilter: string[] = [];
    
    if (type === 'bank') {
      subtypeFilter = ['bank'];
    } else if (type === 'wallet') {
      subtypeFilter = ['wallet'];
    } else if (type === 'exchange') {
      subtypeFilter = ['exchange'];
    } else {
      // Default: show all types
      subtypeFilter = ['bank', 'wallet', 'exchange'];
    }
    
    return accounts.filter(account => 
      subtypeFilter.includes(account.subtype || '') && 
      !account.isGroup && 
      account.entityId === currentEntity.id
    );
  };

  // Filter available accounts (exclude already linked accounts) based on type
  const getAvailableBankAccounts = (type?: string, excludeItemId?: string) => {
    const typeToFilter = type || newItem.type;
    const accountsByType = getAccountsByType(typeToFilter);
    
    const linkedAccountIds = banksWallets
      .filter(item => item.id !== excludeItemId && item.chartAccountId) // استثناء الحساب الحالي عند التعديل
      .map(item => item.chartAccountId);
    
    return accountsByType.filter(account => !linkedAccountIds.includes(account.id));
  };

  // Filter items
  // Data is already filtered by backend, but we still filter in frontend for safety
  const visibleItems = banksWallets.filter(item => {
    // الشركة القابضة ليس لها حسابات
    if (currentEntity?.type === 'holding') return false;
    
    // فقط عرض حسابات الوحدة الحالية
    if (item.entityId !== currentEntity?.id) return false;
    const matchesSearch = item.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                         (item.accountNumber || '').includes(searchTerm);
    const matchesTypeFilter = filterType === "all" || item.type === filterType;
    return matchesSearch && matchesTypeFilter;
  });

  const handleAddItem = async () => {
    if (!newItem.name) {
      toast.error("يرجى إدخال الاسم");
      return;
    }
    if (newItem.currencies.length === 0) {
      toast.error("يرجى اختيار عملة واحدة على الأقل");
      return;
    }

    try {
      const item = {
        id: `BW-${Date.now()}`, // Generate ID
        entityId: currentEntity.id,
        name: newItem.name,
        type: newItem.type,
        accountType: newItem.accountType,
        accountNumber: newItem.accountNumber || null,
        chartAccountId: newItem.chartAccountId && newItem.chartAccountId !== "none" ? newItem.chartAccountId : null,
        currencies: newItem.currencies, // Changed from allowedCurrencies
        balance: 0.00, // Single balance field in schema
        isActive: true // Changed from status
      };

      console.log('Creating bank/wallet with data:', item);
      await banksWalletsApi.create(item);
      toast.success(`تم الإضافة بنجاح (${newItem.currencies.length} عملة)`);
      await loadData();
      setIsNewItemOpen(false);
      setNewItem({ 
        name: "", 
        type: "bank", 
        accountType: "current", 
        accountNumber: "",
        chartAccountId: "",
        currencies: ["YER", "SAR", "USD"]
      });
    } catch (error: any) {
      console.error('Failed to add bank/wallet:', error);
      toast.error(error.message || 'فشل الإضافة');
    }
  };

  const handleEditItem = async () => {
    if (!editingItem || !editingItem.name) {
      toast.error("يرجى إدخال الاسم");
      return;
    }
    const currencies = editingItem.currencies || editingItem.allowedCurrencies || [];
    if (currencies.length === 0) {
      toast.error("يرجى اختيار عملة واحدة على الأقل");
      return;
    }

    try {
      // Map fields to match schema
      const updated = {
        ...editingItem,
        chartAccountId: editingItem.chartAccountId && editingItem.chartAccountId !== "none" ? editingItem.chartAccountId : null,
        currencies: currencies, // Use currencies or fallback to allowedCurrencies
        isActive: editingItem.isActive !== undefined ? editingItem.isActive : true // Changed from status
      };
      
      // Remove fields that don't exist in schema
      delete updated.balances;
      delete updated.status;
      delete updated.lastTransaction;
      delete updated.allowedCurrencies;
      
      console.log('Updating bank/wallet with data:', updated);
      await banksWalletsApi.update(updated.id, updated);
      toast.success("تم التحديث بنجاح");
      await loadData();
      setIsEditItemOpen(false);
      setEditingItem(null);
    } catch (error: any) {
      console.error('Failed to update bank/wallet:', error);
      toast.error(error.message || 'فشل التحديث');
    }
  };

  const handleDeleteItem = async (id: string) => {
    const item = banksWallets.find(b => b.id === id);
    if (item && item.balance && parseFloat(item.balance.toString()) !== 0) {
      toast.error("لا يمكن الحذف. يحتوي على رصيد. يرجى تصفير الرصيد أولاً.");
      return;
    }

    if (confirm("هل أنت متأكد من الحذف؟")) {
      try {
        await banksWalletsApi.delete(id);
        toast.success("تم الحذف بنجاح");
        await loadData();
      } catch (error: any) {
        console.error('Failed to delete bank/wallet:', error);
        toast.error(error.message || 'فشل الحذف');
      }
    }
  };

  const openEditDialog = (item: BankWalletAccount) => {
    // Convert old format to new format
    const itemToEdit = {
      ...item,
      currencies: item.currencies || item.allowedCurrencies || [],
      isActive: item.isActive !== undefined ? item.isActive : (item.status === "active" || String(item.status) === "true")
    };
    // Remove old fields
    delete itemToEdit.allowedCurrencies;
    delete itemToEdit.status;
    delete itemToEdit.lastTransaction;
    delete itemToEdit.balances;
    setEditingItem(itemToEdit);
    setIsEditItemOpen(true);
  };

  const toggleCurrency = (currency: string, isNew: boolean = false) => {
    if (isNew) {
      setNewItem(prev => {
        const currencies = prev.currencies.includes(currency)
          ? prev.currencies.filter(c => c !== currency)
          : [...prev.currencies, currency];
        return { ...prev, currencies: currencies };
      });
    } else if (editingItem) {
      setEditingItem(prev => {
        if (!prev) return null;
        const currentCurrencies = prev.currencies || prev.allowedCurrencies || [];
        const currencies = currentCurrencies.includes(currency)
          ? currentCurrencies.filter(c => c !== currency)
          : [...currentCurrencies, currency];
        return { ...prev, currencies: currencies, allowedCurrencies: undefined };
      });
    }
  };

  const getTypeLabel = (type: string) => {
    switch(type) {
      case 'bank': return 'بنك';
      case 'wallet': return 'محفظة';
      case 'exchange': return 'صرافة';
      default: return type;
    }
  };

  const getAccountTypeLabel = (accountType: string) => {
    switch(accountType) {
      case 'current': return 'حساب جاري';
      case 'savings': return 'حساب توفير';
      case 'wallet': return 'محفظة';
      default: return accountType;
    }
  };

  const getTypeIcon = (type: string) => {
    switch(type) {
      case 'bank': return <Landmark className="w-4 h-4" />;
      case 'wallet': return <Smartphone className="w-4 h-4" />;
      case 'exchange': return <Building2 className="w-4 h-4" />;
      default: return <Wallet className="w-4 h-4" />;
    }
  };

  const getTypeBadgeColor = (type: string) => {
    switch(type) {
      case 'bank': return 'bg-blue-500/10 text-blue-600 border-blue-500/20';
      case 'wallet': return 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20';
      case 'exchange': return 'bg-amber-500/10 text-amber-600 border-amber-500/20';
      default: return 'bg-gray-500/10 text-gray-600 border-gray-500/20';
    }
  };

  const getCurrencyBadgeColor = (currency: string) => {
    switch(currency) {
      case 'YER': return 'bg-green-500/10 text-green-600 border-green-500/20';
      case 'SAR': return 'bg-blue-500/10 text-blue-600 border-blue-500/20';
      case 'USD': return 'bg-purple-500/10 text-purple-600 border-purple-500/20';
      default: return 'bg-gray-500/10 text-gray-600 border-gray-500/20';
    }
  };

  // Statistics
  const bankCount = visibleItems.filter(i => i.type === 'bank').length;
  const walletCount = visibleItems.filter(i => i.type === 'wallet').length;
  const exchangeCount = visibleItems.filter(i => i.type === 'exchange').length;

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">البنوك والمحافظ</h2>
          <p className="text-muted-foreground mt-1">
            إدارة الحسابات البنكية والمحافظ الإلكترونية لـ <span className="font-bold" style={{ color: getThemeColor() }}>{currentEntity.name}</span>
          </p>
          <p className="text-xs text-muted-foreground mt-1">
            كل حساب يدعم عملات متعددة مع إمكانية تحديد العملات المسموح بها
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
                إضافة جديد
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>إضافة بنك / محفظة جديدة</DialogTitle>
                <DialogDescription>
                  إضافة حساب متعدد العملات إلى: <span className="font-bold">{currentEntity.name}</span>
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="name" className="text-right">الاسم</Label>
                  <Input 
                    id="name" 
                    value={newItem.name}
                    onChange={(e) => setNewItem({...newItem, name: e.target.value})}
                    className="col-span-3" 
                    placeholder="مثال: بنك الكريمي"
                  />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="type" className="text-right">النوع</Label>
                  <Select 
                    value={newItem.type} 
                    onValueChange={(v) => setNewItem({...newItem, type: v})}
                  >
                    <SelectTrigger className="col-span-3">
                      <SelectValue placeholder="اختر النوع" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="bank">بنك</SelectItem>
                      <SelectItem value="wallet">محفظة إلكترونية</SelectItem>
                      <SelectItem value="exchange">صرافة</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="accountType" className="text-right">نوع الحساب</Label>
                  <Select 
                    value={newItem.accountType} 
                    onValueChange={(v) => setNewItem({...newItem, accountType: v})}
                  >
                    <SelectTrigger className="col-span-3">
                      <SelectValue placeholder="اختر نوع الحساب" />
                    </SelectTrigger>
                    <SelectContent>
                      {newItem.type === 'wallet' ? (
                        <SelectItem value="wallet">محفظة</SelectItem>
                      ) : (
                        <>
                          <SelectItem value="current">حساب جاري</SelectItem>
                          <SelectItem value="savings">حساب توفير</SelectItem>
                        </>
                      )}
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="accountNumber" className="text-right">رقم الحساب</Label>
                  <Input 
                    id="accountNumber" 
                    value={newItem.accountNumber}
                    onChange={(e) => setNewItem({...newItem, accountNumber: e.target.value})}
                    className="col-span-3" 
                    placeholder="مثال: 774424555"
                  />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="chartAccountId" className="text-right">حساب من الدليل</Label>
                  <Select 
                    value={newItem.chartAccountId || "none"} 
                    onValueChange={(v) => setNewItem({...newItem, chartAccountId: v === "none" ? "" : v})}
                  >
                    <SelectTrigger className="col-span-3">
                      <SelectValue placeholder="اختر الحساب المربوط" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">لا يوجد حساب</SelectItem>
                      {getAvailableBankAccounts(newItem.type).length === 0 ? (
                        <SelectItem value="no-accounts" disabled>
                          لا توجد حسابات من نوع {newItem.type === 'bank' ? 'بنك' : newItem.type === 'wallet' ? 'محفظة' : 'صرافة'} في الدليل
                        </SelectItem>
                      ) : (
                        getAvailableBankAccounts(newItem.type).map(account => (
                          <SelectItem key={account.id} value={account.id}>
                            {account.id} - {account.name}
                            {account.currencies && account.currencies.length > 0 && (
                              <span className="text-xs text-muted-foreground"> ({account.currencies.join(", ")})</span>
                            )}
                          </SelectItem>
                        ))
                      )}
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid grid-cols-4 items-start gap-4">
                  <Label className="text-right mt-2">العملات المسموح بها</Label>
                  <div className="col-span-3 space-y-2">
                    <div className="flex items-center space-x-2 space-x-reverse">
                      <Checkbox 
                        id="new-yer" 
                        checked={newItem.currencies.includes("YER")}
                        onCheckedChange={() => toggleCurrency("YER", true)}
                      />
                      <label htmlFor="new-yer" className="text-sm font-medium cursor-pointer">
                        ريال يمني (YER)
                      </label>
                    </div>
                    <div className="flex items-center space-x-2 space-x-reverse">
                      <Checkbox 
                        id="new-sar" 
                        checked={newItem.currencies.includes("SAR")}
                        onCheckedChange={() => toggleCurrency("SAR", true)}
                      />
                      <label htmlFor="new-sar" className="text-sm font-medium cursor-pointer">
                        ريال سعودي (SAR)
                      </label>
                    </div>
                    <div className="flex items-center space-x-2 space-x-reverse">
                      <Checkbox 
                        id="new-usd" 
                        checked={newItem.currencies.includes("USD")}
                        onCheckedChange={() => toggleCurrency("USD", true)}
                      />
                      <label htmlFor="new-usd" className="text-sm font-medium cursor-pointer">
                        دولار أمريكي (USD)
                      </label>
                    </div>
                  </div>
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
        <Card className="border-0 shadow-lg bg-gradient-to-br from-blue-50 to-white dark:from-blue-950/20 dark:to-background">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">البنوك</CardTitle>
            <Landmark className="h-5 w-5 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-blue-600">{bankCount}</div>
            <p className="text-xs text-muted-foreground mt-1">حساب بنكي</p>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-lg bg-gradient-to-br from-emerald-50 to-white dark:from-emerald-950/20 dark:to-background">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">المحافظ</CardTitle>
            <Smartphone className="h-5 w-5 text-emerald-600" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-emerald-600">{walletCount}</div>
            <p className="text-xs text-muted-foreground mt-1">محفظة إلكترونية</p>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-lg bg-gradient-to-br from-amber-50 to-white dark:from-amber-950/20 dark:to-background">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">الصرافات</CardTitle>
            <Building2 className="h-5 w-5 text-amber-600" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-amber-600">{exchangeCount}</div>
            <p className="text-xs text-muted-foreground mt-1">صرافة</p>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-lg bg-gradient-to-br from-purple-50 to-white dark:from-purple-950/20 dark:to-background">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">الإجمالي</CardTitle>
            <CreditCard className="h-5 w-5 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-purple-600">{visibleItems.length}</div>
            <p className="text-xs text-muted-foreground mt-1">حساب متعدد العملات</p>
          </CardContent>
        </Card>
      </div>

      {/* Filters and Search */}
      <Card className="border-0 shadow-lg">
        <CardContent className="pt-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="بحث بالاسم أو رقم الحساب..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pr-10"
              />
            </div>
            <Select value={filterType} onValueChange={setFilterType}>
              <SelectTrigger className="w-[200px]">
                <Filter className="w-4 h-4 ml-2" />
                <SelectValue placeholder="تصفية حسب النوع" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">الكل</SelectItem>
                <SelectItem value="bank">البنوك فقط</SelectItem>
                <SelectItem value="wallet">المحافظ فقط</SelectItem>
                <SelectItem value="exchange">الصرافات فقط</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Table */}
      <Card className="border-0 shadow-lg">
        <CardContent className="pt-6">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="text-right w-12"></TableHead>
                <TableHead className="text-right">الاسم</TableHead>
                <TableHead className="text-right">النوع</TableHead>
                <TableHead className="text-right">نوع الحساب</TableHead>
                <TableHead className="text-right">رقم الحساب</TableHead>
                <TableHead className="text-right">العملات المسموح بها</TableHead>
                <TableHead className="text-right">الحالة</TableHead>
                <TableHead className="text-right">الإجراءات</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {visibleItems.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} className="text-center py-8 text-muted-foreground">
                    لا توجد بيانات
                  </TableCell>
                </TableRow>
              ) : (
                visibleItems.map((item) => (
                  <>
                    <TableRow key={item.id} className="hover:bg-muted/50">
                      <TableCell>
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          onClick={() => toggleRow(item.id)}
                          className="p-0 h-8 w-8"
                        >
                          {expandedRows.has(item.id) ? (
                            <ChevronUp className="w-4 h-4" />
                          ) : (
                            <ChevronDown className="w-4 h-4" />
                          )}
                        </Button>
                      </TableCell>
                      <TableCell className="font-medium">
                        <div className="flex items-center gap-2">
                          {getTypeIcon(item.type)}
                          {item.name}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge className={getTypeBadgeColor(item.type)}>
                          {getTypeLabel(item.type)}
                        </Badge>
                      </TableCell>
                      <TableCell>{getAccountTypeLabel(item.accountType)}</TableCell>
                      <TableCell className="font-mono text-sm">{item.accountNumber || '-'}</TableCell>
                      <TableCell>
                        <div className="flex gap-1 flex-wrap">
                          {(item.currencies || item.allowedCurrencies || []).map((currency: string) => (
                            <Badge key={currency} className={getCurrencyBadgeColor(currency)}>
                              {currency}
                            </Badge>
                          ))}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge className={item.isActive !== false ? "bg-emerald-500/10 text-emerald-600 border-emerald-500/20" : "bg-gray-500/10 text-gray-600 border-gray-500/20"}>
                          {item.isActive !== false ? "نشط" : "غير نشط"}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm">
                              <MoreHorizontal className="w-4 h-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuLabel>الإجراءات</DropdownMenuLabel>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem onClick={() => openEditDialog(item)}>
                              <Pencil className="w-4 h-4 ml-2" />
                              تعديل
                            </DropdownMenuItem>
                            <DropdownMenuItem>
                              <Eye className="w-4 h-4 ml-2" />
                              عرض التفاصيل
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem 
                              onClick={() => handleDeleteItem(item.id)}
                              className="text-red-600"
                            >
                              <Trash2 className="w-4 h-4 ml-2" />
                              حذف
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                    {expandedRows.has(item.id) && (
                      <TableRow key={`${item.id}-details`} className="bg-muted/30">
                        <TableCell colSpan={8}>
                          <div className="p-4 space-y-2">
                            <h4 className="font-semibold text-sm mb-3">العملات المسموح بها:</h4>
                            <div className="grid grid-cols-3 gap-4">
                              {(item.currencies || item.allowedCurrencies || []).map((currency: string) => (
                                <Card key={currency} className="border-0 shadow-sm">
                                  <CardContent className="pt-4">
                                    <div className="flex items-center justify-between">
                                      <div>
                                        <p className="text-xs text-muted-foreground mb-1">{currency}</p>
                                        <p className="text-2xl font-bold">{item.balance || 0}</p>
                                      </div>
                                      <Badge className={getCurrencyBadgeColor(currency)}>
                                        {currency}
                                      </Badge>
                                    </div>
                                  </CardContent>
                                </Card>
                              ))}
                            </div>
                          </div>
                        </TableCell>
                      </TableRow>
                    )}
                  </>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Edit Dialog */}
      <Dialog open={isEditItemOpen} onOpenChange={setIsEditItemOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>تعديل البيانات</DialogTitle>
            <DialogDescription>
              تعديل بيانات الحساب والعملات المسموح بها
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="edit-name" className="text-right">الاسم</Label>
              <Input 
                id="edit-name" 
                value={editingItem?.name || ""}
                onChange={(e) => setEditingItem((prev) => prev ? {...prev, name: e.target.value} : null)}
                className="col-span-3" 
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="edit-accountNumber" className="text-right">رقم الحساب</Label>
              <Input 
                id="edit-accountNumber" 
                value={editingItem?.accountNumber || ""}
                onChange={(e) => setEditingItem((prev) => prev ? {...prev, accountNumber: e.target.value} : null)}
                className="col-span-3" 
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="edit-chartAccountId" className="text-right">حساب من الدليل</Label>
              <Select 
                value={editingItem?.chartAccountId || "none"} 
                onValueChange={(v) => {
                  const selectedAccount = accounts.find(acc => acc.id === v);
                  setEditingItem((prev: any) => {
                    if (!prev) return null;
                    const updated = {...prev, chartAccountId: v === "none" ? null : v};
                    if (selectedAccount && selectedAccount.currencies) {
                      updated.currencies = selectedAccount.currencies;
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
                  {getAvailableBankAccounts(editingItem?.type, editingItem?.id).length === 0 ? (
                    <SelectItem value="no-accounts" disabled>
                      لا توجد حسابات من نوع {editingItem?.type === 'bank' ? 'بنك' : editingItem?.type === 'wallet' ? 'محفظة' : 'صرافة'} في الدليل
                    </SelectItem>
                  ) : (
                    getAvailableBankAccounts(editingItem?.type, editingItem?.id).map(account => (
                      <SelectItem key={account.id} value={account.id}>
                        {account.id} - {account.name}
                        {account.currencies && account.currencies.length > 0 && (
                          <span className="text-xs text-muted-foreground"> ({account.currencies.join(", ")})</span>
                        )}
                      </SelectItem>
                    ))
                  )}
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-4 items-start gap-4">
              <Label className="text-right mt-2">العملات المسموح بها</Label>
              <div className="col-span-3 space-y-2">
                <div className="flex items-center space-x-2 space-x-reverse">
                  <Checkbox 
                    id="edit-yer" 
                    checked={(editingItem?.currencies || editingItem?.allowedCurrencies || []).includes("YER")}
                    onCheckedChange={() => toggleCurrency("YER", false)}
                  />
                  <label htmlFor="edit-yer" className="text-sm font-medium cursor-pointer">
                    ريال يمني (YER)
                  </label>
                </div>
                <div className="flex items-center space-x-2 space-x-reverse">
                  <Checkbox 
                    id="edit-sar" 
                    checked={(editingItem?.currencies || editingItem?.allowedCurrencies || []).includes("SAR")}
                    onCheckedChange={() => toggleCurrency("SAR", false)}
                  />
                  <label htmlFor="edit-sar" className="text-sm font-medium cursor-pointer">
                    ريال سعودي (SAR)
                  </label>
                </div>
                <div className="flex items-center space-x-2 space-x-reverse">
                  <Checkbox 
                    id="edit-usd" 
                    checked={(editingItem?.currencies || editingItem?.allowedCurrencies || []).includes("USD")}
                    onCheckedChange={() => toggleCurrency("USD", false)}
                  />
                  <label htmlFor="edit-usd" className="text-sm font-medium cursor-pointer">
                    دولار أمريكي (USD)
                  </label>
                </div>
              </div>
            </div>
          </div>
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

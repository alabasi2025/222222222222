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
import { useState } from "react";
import { toast } from "sonner";
import { useEntity } from "@/contexts/EntityContext";
import { initialAccountsData } from "./ChartOfAccounts";

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
  chartAccountId: string; // ربط بحساب في دليل الحسابات
  allowedCurrencies: string[]; // العملات المسموح بها
  balances: CurrencyBalance[]; // الأرصدة بالعملات المختلفة
  status: string;
  lastTransaction: string;
}

// Initial data for Al-Abbasi Unit
const initialBanksWallets: BankWalletAccount[] = [
  {
    id: "1",
    entityId: "UNIT-002",
    name: "الحوشبي للصرافة",
    type: "exchange",
    accountType: "current",
    accountNumber: "",
    chartAccountId: "1.2",
    allowedCurrencies: ["YER", "SAR", "USD"],
    balances: [
      { currency: "YER", balance: 0.00 },
      { currency: "SAR", balance: 0.00 },
      { currency: "USD", balance: 0.00 }
    ],
    status: "active",
    lastTransaction: "-"
  },
  {
    id: "2",
    entityId: "UNIT-002",
    name: "محفظة جوالي - 774424555",
    type: "wallet",
    accountType: "wallet",
    accountNumber: "774424555",
    chartAccountId: "1.3",
    allowedCurrencies: ["YER", "SAR", "USD"],
    balances: [
      { currency: "YER", balance: 0.00 },
      { currency: "SAR", balance: 0.00 },
      { currency: "USD", balance: 0.00 }
    ],
    status: "active",
    lastTransaction: "-"
  },
  {
    id: "3",
    entityId: "UNIT-002",
    name: "محفظة جوالي - 771506017",
    type: "wallet",
    accountType: "wallet",
    accountNumber: "771506017",
    chartAccountId: "1.3",
    allowedCurrencies: ["YER", "SAR", "USD"],
    balances: [
      { currency: "YER", balance: 0.00 },
      { currency: "SAR", balance: 0.00 },
      { currency: "USD", balance: 0.00 }
    ],
    status: "active",
    lastTransaction: "-"
  },
  {
    id: "4",
    entityId: "UNIT-002",
    name: "محفظة جيب",
    type: "wallet",
    accountType: "wallet",
    accountNumber: "",
    chartAccountId: "1.3",
    allowedCurrencies: ["YER", "SAR", "USD"],
    balances: [
      { currency: "YER", balance: 0.00 },
      { currency: "SAR", balance: 0.00 },
      { currency: "USD", balance: 0.00 }
    ],
    status: "active",
    lastTransaction: "-"
  },
  {
    id: "5",
    entityId: "UNIT-002",
    name: "محفظة ون كاش",
    type: "wallet",
    accountType: "wallet",
    accountNumber: "",
    chartAccountId: "1.3",
    allowedCurrencies: ["YER", "SAR", "USD"],
    balances: [
      { currency: "YER", balance: 0.00 },
      { currency: "SAR", balance: 0.00 },
      { currency: "USD", balance: 0.00 }
    ],
    status: "active",
    lastTransaction: "-"
  },
  {
    id: "6",
    entityId: "UNIT-002",
    name: "الكريمي الحديدة - حساب جاري",
    type: "bank",
    accountType: "current",
    accountNumber: "",
    chartAccountId: "1.1",
    allowedCurrencies: ["YER", "SAR", "USD"],
    balances: [
      { currency: "YER", balance: 0.00 },
      { currency: "SAR", balance: 0.00 },
      { currency: "USD", balance: 0.00 }
    ],
    status: "active",
    lastTransaction: "-"
  },
  {
    id: "7",
    entityId: "UNIT-002",
    name: "الكريمي الحديدة - حساب توفير",
    type: "bank",
    accountType: "savings",
    accountNumber: "",
    chartAccountId: "1.1",
    allowedCurrencies: ["YER", "SAR", "USD"],
    balances: [
      { currency: "YER", balance: 0.00 },
      { currency: "SAR", balance: 0.00 },
      { currency: "USD", balance: 0.00 }
    ],
    status: "active",
    lastTransaction: "-"
  },
  {
    id: "8",
    entityId: "UNIT-002",
    name: "الكريمي صنعاء - حساب توفير",
    type: "bank",
    accountType: "savings",
    accountNumber: "",
    chartAccountId: "1.1",
    allowedCurrencies: ["YER", "SAR", "USD"],
    balances: [
      { currency: "YER", balance: 0.00 },
      { currency: "SAR", balance: 0.00 },
      { currency: "USD", balance: 0.00 }
    ],
    status: "active",
    lastTransaction: "-"
  },
  {
    id: "9",
    entityId: "UNIT-002",
    name: "الكريمي صنعاء - حساب جاري",
    type: "bank",
    accountType: "current",
    accountNumber: "",
    chartAccountId: "1.1",
    allowedCurrencies: ["YER", "SAR", "USD"],
    balances: [
      { currency: "YER", balance: 0.00 },
      { currency: "SAR", balance: 0.00 },
      { currency: "USD", balance: 0.00 }
    ],
    status: "active",
    lastTransaction: "-"
  }
];

export default function BanksWallets() {
  const { currentEntity, getThemeColor } = useEntity();
  const [banksWallets, setBanksWallets] = useState<BankWalletAccount[]>(initialBanksWallets);
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
    allowedCurrencies: ["YER", "SAR", "USD"] as string[]
  });

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

  // Get bank accounts from chart of accounts
  const allBankAccounts = initialAccountsData.filter(account => 
    account.subtype === 'bank' && 
    !account.isGroup && 
    account.entityId === currentEntity.id
  );

  // Filter available accounts (exclude already linked accounts)
  const getAvailableBankAccounts = (excludeItemId?: string) => {
    const linkedAccountIds = banksWallets
      .filter(item => item.id !== excludeItemId && item.chartAccountId) // استثناء الحساب الحالي عند التعديل
      .map(item => item.chartAccountId);
    return allBankAccounts.filter(account => !linkedAccountIds.includes(account.id));
  };

  // Filter items
  const visibleItems = banksWallets.filter(item => {
    // الشركة القابضة ليس لها حسابات
    if (currentEntity.type === 'holding') return false;
    
    // فقط عرض حسابات الوحدة الحالية
    if (item.entityId !== currentEntity.id) return false;
    const matchesSearch = item.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                         item.accountNumber.includes(searchTerm);
    const matchesTypeFilter = filterType === "all" || item.type === filterType;
    return matchesSearch && matchesTypeFilter;
  });

  const handleAddItem = () => {
    if (!newItem.name) {
      toast.error("يرجى إدخال الاسم");
      return;
    }
    if (newItem.allowedCurrencies.length === 0) {
      toast.error("يرجى اختيار عملة واحدة على الأقل");
      return;
    }

    const item: BankWalletAccount = {
      id: `${Date.now()}`,
      entityId: currentEntity.id,
      name: newItem.name,
      type: newItem.type,
      accountType: newItem.accountType,
      accountNumber: newItem.accountNumber,
      chartAccountId: newItem.chartAccountId,
      allowedCurrencies: newItem.allowedCurrencies,
      balances: newItem.allowedCurrencies.map(currency => ({
        currency,
        balance: 0.00
      })),
      status: "active",
      lastTransaction: "-"
    };

    setBanksWallets([...banksWallets, item]);
    toast.success(`تم الإضافة بنجاح (${newItem.allowedCurrencies.length} عملة)`);
    setIsNewItemOpen(false);
    setNewItem({ 
      name: "", 
      type: "bank", 
      accountType: "current", 
      accountNumber: "",
      allowedCurrencies: ["YER", "SAR", "USD"]
    });
  };

  const handleEditItem = () => {
    if (!editingItem || !editingItem.name) {
      toast.error("يرجى إدخال الاسم");
      return;
    }
    if (editingItem.allowedCurrencies.length === 0) {
      toast.error("يرجى اختيار عملة واحدة على الأقل");
      return;
    }

    // Update balances based on allowed currencies
    const updatedBalances = editingItem.allowedCurrencies.map(currency => {
      const existing = editingItem.balances.find(b => b.currency === currency);
      return existing || { currency, balance: 0.00 };
    });

    const updated = { ...editingItem, balances: updatedBalances };

    setBanksWallets(banksWallets.map(item => 
      item.id === updated.id ? updated : item
    ));
    
    toast.success("تم التحديث بنجاح");
    setIsEditItemOpen(false);
    setEditingItem(null);
  };

  const handleDeleteItem = (id: string) => {
    const item = banksWallets.find(b => b.id === id);
    if (item && item.balances.some(b => b.balance !== 0)) {
      toast.error("لا يمكن الحذف. يحتوي على رصيد. يرجى تصفير جميع الأرصدة أولاً.");
      return;
    }

    if (confirm("هل أنت متأكد من الحذف؟")) {
      setBanksWallets(banksWallets.filter(b => b.id !== id));
      toast.success("تم الحذف بنجاح");
    }
  };

  const openEditDialog = (item: BankWalletAccount) => {
    setEditingItem({ ...item });
    setIsEditItemOpen(true);
  };

  const toggleCurrency = (currency: string, isNew: boolean = false) => {
    if (isNew) {
      setNewItem(prev => {
        const currencies = prev.allowedCurrencies.includes(currency)
          ? prev.allowedCurrencies.filter(c => c !== currency)
          : [...prev.allowedCurrencies, currency];
        return { ...prev, allowedCurrencies: currencies };
      });
    } else if (editingItem) {
      setEditingItem(prev => {
        if (!prev) return null;
        const currencies = prev.allowedCurrencies.includes(currency)
          ? prev.allowedCurrencies.filter(c => c !== currency)
          : [...prev.allowedCurrencies, currency];
        return { ...prev, allowedCurrencies: currencies };
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
                    value={newItem.chartAccountId} 
                    onValueChange={(v) => setNewItem({...newItem, chartAccountId: v})}
                  >
                    <SelectTrigger className="col-span-3">
                      <SelectValue placeholder="اختر الحساب المربوط" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">لا يوجد حساب</SelectItem>
                      {getAvailableBankAccounts().map(account => (
                        <SelectItem key={account.id} value={account.id}>
                          {account.id} - {account.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid grid-cols-4 items-start gap-4">
                  <Label className="text-right mt-2">العملات المسموح بها</Label>
                  <div className="col-span-3 space-y-2">
                    <div className="flex items-center space-x-2 space-x-reverse">
                      <Checkbox 
                        id="new-yer" 
                        checked={newItem.allowedCurrencies.includes("YER")}
                        onCheckedChange={() => toggleCurrency("YER", true)}
                      />
                      <label htmlFor="new-yer" className="text-sm font-medium cursor-pointer">
                        ريال يمني (YER)
                      </label>
                    </div>
                    <div className="flex items-center space-x-2 space-x-reverse">
                      <Checkbox 
                        id="new-sar" 
                        checked={newItem.allowedCurrencies.includes("SAR")}
                        onCheckedChange={() => toggleCurrency("SAR", true)}
                      />
                      <label htmlFor="new-sar" className="text-sm font-medium cursor-pointer">
                        ريال سعودي (SAR)
                      </label>
                    </div>
                    <div className="flex items-center space-x-2 space-x-reverse">
                      <Checkbox 
                        id="new-usd" 
                        checked={newItem.allowedCurrencies.includes("USD")}
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
                          {item.allowedCurrencies.map(currency => (
                            <Badge key={currency} className={getCurrencyBadgeColor(currency)}>
                              {currency}
                            </Badge>
                          ))}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge className="bg-emerald-500/10 text-emerald-600 border-emerald-500/20">
                          نشط
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
                            <h4 className="font-semibold text-sm mb-3">الأرصدة بالعملات المختلفة:</h4>
                            <div className="grid grid-cols-3 gap-4">
                              {item.balances.map(balance => (
                                <Card key={balance.currency} className="border-0 shadow-sm">
                                  <CardContent className="pt-4">
                                    <div className="flex items-center justify-between">
                                      <div>
                                        <p className="text-xs text-muted-foreground mb-1">{balance.currency}</p>
                                        <p className="text-2xl font-bold">{balance.balance.toFixed(2)}</p>
                                      </div>
                                      <Badge className={getCurrencyBadgeColor(balance.currency)}>
                                        {balance.currency}
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
                onValueChange={(v) => setEditingItem((prev) => prev ? {...prev, chartAccountId: v} : null)}
              >
                <SelectTrigger className="col-span-3">
                  <SelectValue placeholder="اختر الحساب المربوط" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">لا يوجد حساب</SelectItem>
                  {getAvailableBankAccounts(editingItem?.id).map(account => (
                    <SelectItem key={account.id} value={account.id}>
                      {account.id} - {account.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-4 items-start gap-4">
              <Label className="text-right mt-2">العملات المسموح بها</Label>
              <div className="col-span-3 space-y-2">
                <div className="flex items-center space-x-2 space-x-reverse">
                  <Checkbox 
                    id="edit-yer" 
                    checked={editingItem?.allowedCurrencies.includes("YER")}
                    onCheckedChange={() => toggleCurrency("YER", false)}
                  />
                  <label htmlFor="edit-yer" className="text-sm font-medium cursor-pointer">
                    ريال يمني (YER)
                  </label>
                </div>
                <div className="flex items-center space-x-2 space-x-reverse">
                  <Checkbox 
                    id="edit-sar" 
                    checked={editingItem?.allowedCurrencies.includes("SAR")}
                    onCheckedChange={() => toggleCurrency("SAR", false)}
                  />
                  <label htmlFor="edit-sar" className="text-sm font-medium cursor-pointer">
                    ريال سعودي (SAR)
                  </label>
                </div>
                <div className="flex items-center space-x-2 space-x-reverse">
                  <Checkbox 
                    id="edit-usd" 
                    checked={editingItem?.allowedCurrencies.includes("USD")}
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

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
  CreditCard
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
import { useState } from "react";
import { toast } from "sonner";
import { useEntity } from "@/contexts/EntityContext";

// Helper function to create 3 currency accounts for each item
const createCurrencyAccounts = (baseId: string, entityId: string, name: string, type: string, accountType: string) => {
  const currencies = ['YER', 'SAR', 'USD'];
  return currencies.map((currency, index) => ({
    id: `${baseId}-${currency}`,
    entityId,
    name,
    type,
    accountType,
    balance: 0.00,
    currency,
    accountNumber: name.includes('جوالي') && name.includes('774424555') ? '774424555' : 
                   name.includes('جوالي') && name.includes('771506017') ? '771506017' : '',
    status: "active",
    lastTransaction: "-"
  }));
};

// Initial data for Al-Abbasi Unit - Each account has 3 currency sub-accounts
const initialBanksWallets = [
  // 1. الحوشبي للصرافة (3 عملات)
  ...createCurrencyAccounts("1", "unit-1", "الحوشبي للصرافة", "exchange", "current"),
  
  // 2. محفظة جوالي - 774424555 (3 عملات)
  ...createCurrencyAccounts("2", "unit-1", "محفظة جوالي - 774424555", "wallet", "wallet"),
  
  // 3. محفظة جوالي - 771506017 (3 عملات)
  ...createCurrencyAccounts("3", "unit-1", "محفظة جوالي - 771506017", "wallet", "wallet"),
  
  // 4. محفظة جيب (3 عملات)
  ...createCurrencyAccounts("4", "unit-1", "محفظة جيب", "wallet", "wallet"),
  
  // 5. محفظة ون كاش (3 عملات)
  ...createCurrencyAccounts("5", "unit-1", "محفظة ون كاش", "wallet", "wallet"),
  
  // 6. الكريمي الحديدة - حساب جاري (3 عملات)
  ...createCurrencyAccounts("6", "unit-1", "الكريمي الحديدة - حساب جاري", "bank", "current"),
  
  // 7. الكريمي الحديدة - حساب توفير (3 عملات)
  ...createCurrencyAccounts("7", "unit-1", "الكريمي الحديدة - حساب توفير", "bank", "savings"),
  
  // 8. الكريمي صنعاء - حساب توفير (3 عملات)
  ...createCurrencyAccounts("8", "unit-1", "الكريمي صنعاء - حساب توفير", "bank", "savings"),
  
  // 9. الكريمي صنعاء - حساب جاري (3 عملات)
  ...createCurrencyAccounts("9", "unit-1", "الكريمي صنعاء - حساب جاري", "bank", "current"),
];

export default function BanksWallets() {
  const { currentEntity, getThemeColor } = useEntity();
  const [banksWallets, setBanksWallets] = useState(initialBanksWallets);
  const [isNewItemOpen, setIsNewItemOpen] = useState(false);
  const [isEditItemOpen, setIsEditItemOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<any>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterType, setFilterType] = useState("all");
  const [filterCurrency, setFilterCurrency] = useState("all");

  const [newItem, setNewItem] = useState({
    name: "",
    type: "bank", // bank, wallet, exchange
    accountType: "current", // current, savings, wallet
    accountNumber: "",
    branchId: "",
    responsiblePerson: ""
  });

  // Filter items based on current entity
  const visibleItems = banksWallets.filter(item => {
    if (currentEntity.type === 'holding') return true;
    return item.entityId === currentEntity.id;
  }).filter(item => {
    const matchesSearch = item.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                         item.accountNumber.includes(searchTerm);
    const matchesTypeFilter = filterType === "all" || item.type === filterType;
    const matchesCurrencyFilter = filterCurrency === "all" || item.currency === filterCurrency;
    return matchesSearch && matchesTypeFilter && matchesCurrencyFilter;
  });

  const handleAddItem = () => {
    if (!newItem.name) {
      toast.error("يرجى إدخال الاسم");
      return;
    }

    // Create 3 currency accounts for the new item
    const baseId = `${Date.now()}`;
    const currencies = ['YER', 'SAR', 'USD'];
    const newItems = currencies.map(currency => ({
      id: `${baseId}-${currency}`,
      entityId: currentEntity.id,
      name: newItem.name,
      type: newItem.type,
      accountType: newItem.accountType,
      balance: 0.00,
      currency,
      accountNumber: newItem.accountNumber,
      status: "active",
      lastTransaction: "-"
    }));

    setBanksWallets([...banksWallets, ...newItems]);
    toast.success("تم الإضافة بنجاح (3 حسابات بعملات مختلفة)");
    setIsNewItemOpen(false);
    setNewItem({ 
      name: "", 
      type: "bank", 
      accountType: "current", 
      accountNumber: "",
      branchId: "",
      responsiblePerson: ""
    });
  };

  const handleEditItem = () => {
    if (!editingItem || !editingItem.name) {
      toast.error("يرجى إدخال الاسم");
      return;
    }

    setBanksWallets(banksWallets.map(item => 
      item.id === editingItem.id ? editingItem : item
    ));
    
    toast.success("تم التحديث بنجاح");
    setIsEditItemOpen(false);
    setEditingItem(null);
  };

  const handleDeleteItem = (id: string) => {
    const item = banksWallets.find(b => b.id === id);
    if (item && item.balance !== 0) {
      toast.error("لا يمكن الحذف. يحتوي على رصيد. يرجى تصفير الرصيد أولاً.");
      return;
    }

    if (confirm("هل أنت متأكد من الحذف؟")) {
      setBanksWallets(banksWallets.filter(b => b.id !== id));
      toast.success("تم الحذف بنجاح");
    }
  };

  const openEditDialog = (item: any) => {
    setEditingItem({ ...item });
    setIsEditItemOpen(true);
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
  const totalBalance = visibleItems.reduce((sum, item) => sum + item.balance, 0);
  const bankCount = visibleItems.filter(i => i.type === 'bank').length;
  const walletCount = visibleItems.filter(i => i.type === 'wallet').length;
  const exchangeCount = visibleItems.filter(i => i.type === 'exchange').length;

  // Count by currency
  const yerCount = visibleItems.filter(i => i.currency === 'YER').length;
  const sarCount = visibleItems.filter(i => i.currency === 'SAR').length;
  const usdCount = visibleItems.filter(i => i.currency === 'USD').length;

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">البنوك والمحافظ</h2>
          <p className="text-muted-foreground mt-1">
            إدارة الحسابات البنكية والمحافظ الإلكترونية لـ <span className="font-bold" style={{ color: getThemeColor() }}>{currentEntity.name}</span>
          </p>
          <p className="text-xs text-muted-foreground mt-1">
            كل حساب يحتوي على 3 حسابات فرعية بعملات مختلفة (YER, SAR, USD)
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
                  سيتم إنشاء 3 حسابات فرعية بعملات مختلفة (YER, SAR, USD) لـ: <span className="font-bold">{currentEntity.name}</span>
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
                  <Label htmlFor="accountNumber" className="text-right">رقم الحساب / المحفظة</Label>
                  <Input 
                    id="accountNumber" 
                    value={newItem.accountNumber}
                    onChange={(e) => setNewItem({...newItem, accountNumber: e.target.value})}
                    className="col-span-3" 
                    placeholder="مثال: 774424555"
                  />
                </div>
              </div>
              <DialogFooter>
                <Button onClick={handleAddItem} style={{ backgroundColor: getThemeColor() }}>
                  <Save className="w-4 h-4 ml-2" />
                  حفظ (3 حسابات)
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
            <div className="text-2xl font-bold text-purple-600">{visibleItems.length}</div>
            <p className="text-xs text-muted-foreground mt-1">حساب بجميع العملات</p>
          </CardContent>
        </Card>
      </div>

      {/* Currency Statistics */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card className="border-0 shadow-md">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">ريال يمني</p>
                <p className="text-2xl font-bold text-green-600">{yerCount}</p>
              </div>
              <Badge className="bg-green-500/10 text-green-600 border-green-500/20">YER</Badge>
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-md">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">ريال سعودي</p>
                <p className="text-2xl font-bold text-blue-600">{sarCount}</p>
              </div>
              <Badge className="bg-blue-500/10 text-blue-600 border-blue-500/20">SAR</Badge>
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-md">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">دولار أمريكي</p>
                <p className="text-2xl font-bold text-purple-600">{usdCount}</p>
              </div>
              <Badge className="bg-purple-500/10 text-purple-600 border-purple-500/20">USD</Badge>
            </div>
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
            <Select value={filterCurrency} onValueChange={setFilterCurrency}>
              <SelectTrigger className="w-[200px]">
                <CreditCard className="w-4 h-4 ml-2" />
                <SelectValue placeholder="تصفية حسب العملة" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">جميع العملات</SelectItem>
                <SelectItem value="YER">ريال يمني (YER)</SelectItem>
                <SelectItem value="SAR">ريال سعودي (SAR)</SelectItem>
                <SelectItem value="USD">دولار أمريكي (USD)</SelectItem>
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
                <TableHead className="text-right">الاسم</TableHead>
                <TableHead className="text-right">النوع</TableHead>
                <TableHead className="text-right">نوع الحساب</TableHead>
                <TableHead className="text-right">العملة</TableHead>
                <TableHead className="text-right">رقم الحساب</TableHead>
                <TableHead className="text-right">الرصيد</TableHead>
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
                  <TableRow key={item.id} className="hover:bg-muted/50">
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
                    <TableCell>
                      <Badge className={getCurrencyBadgeColor(item.currency)}>
                        {item.currency}
                      </Badge>
                    </TableCell>
                    <TableCell className="font-mono text-sm">{item.accountNumber || '-'}</TableCell>
                    <TableCell className="font-bold">{item.balance.toFixed(2)}</TableCell>
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
              تعديل بيانات الحساب أو المحفظة
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="edit-name" className="text-right">الاسم</Label>
              <Input 
                id="edit-name" 
                value={editingItem?.name || ""}
                onChange={(e) => setEditingItem((prev: any) => prev ? {...prev, name: e.target.value} : null)}
                className="col-span-3" 
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="edit-accountNumber" className="text-right">رقم الحساب</Label>
              <Input 
                id="edit-accountNumber" 
                value={editingItem?.accountNumber || ""}
                onChange={(e) => setEditingItem((prev: any) => prev ? {...prev, accountNumber: e.target.value} : null)}
                className="col-span-3" 
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="edit-currency" className="text-right">العملة</Label>
              <Select 
                value={editingItem?.currency || "YER"} 
                onValueChange={(v) => setEditingItem((prev: any) => prev ? {...prev, currency: v} : null)}
              >
                <SelectTrigger className="col-span-3">
                  <SelectValue placeholder="اختر العملة" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="YER">ريال يمني (YER)</SelectItem>
                  <SelectItem value="SAR">ريال سعودي (SAR)</SelectItem>
                  <SelectItem value="USD">دولار أمريكي (USD)</SelectItem>
                </SelectContent>
              </Select>
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

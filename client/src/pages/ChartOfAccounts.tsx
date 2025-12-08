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
  FolderTree,
  ChevronRight,
  ChevronDown,
  Folder,
  FileText,
  Save,
  Building,
  Store,
  Wallet,
  Landmark,
  Users,
  Package
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
import { useState } from "react";
import { toast } from "sonner";
import { useEntity } from "@/contexts/EntityContext";
import { useLocation } from "wouter";
import { useEffect } from "react";

// Account Subtypes
const accountSubtypes = [
  { value: "general", label: "عام", icon: FileText },
  { value: "cash", label: "صندوق / نقدية", icon: Wallet },
  { value: "bank", label: "بنك", icon: Landmark },
  { value: "receivable", label: "عميل (ذمم مدينة)", icon: Users },
  { value: "payable", label: "مورد (ذمم دائنة)", icon: Users },
  { value: "inventory", label: "مخزون", icon: Package },
  { value: "cost_of_goods", label: "تكلفة بضاعة", icon: Package },
  { value: "expense", label: "مصروف", icon: FileText },
  { value: "income", label: "إيراد", icon: FileText },
  { value: "equity", label: "حقوق ملكية", icon: FileText },
  { value: "tax", label: "ضريبة", icon: FileText },
];

// Initial Mock data for Chart of Accounts
const initialAccountsData = [
  { id: "1000", name: "الأصول", type: "asset", level: 1, balance: 450000.00, hasChildren: true, expanded: true, parentId: null, isGroup: true, subtype: "general" },
  { id: "1100", name: "الأصول المتداولة", type: "asset", level: 2, balance: 150000.00, hasChildren: true, expanded: true, parentId: "1000", isGroup: true, subtype: "general" },
  { id: "1110", name: "النقد وما في حكمه", type: "asset", level: 3, balance: 50000.00, hasChildren: true, expanded: true, parentId: "1100", isGroup: true, subtype: "general" },
  { id: "1111", name: "الصندوق الرئيسي", type: "asset", level: 4, balance: 15000.00, hasChildren: false, expanded: false, parentId: "1110", isGroup: false, subtype: "cash" },
  { id: "1112", name: "البنك الأهلي", type: "asset", level: 4, balance: 35000.00, hasChildren: false, expanded: false, parentId: "1110", isGroup: false, subtype: "bank" },
  { id: "1120", name: "العملاء", type: "asset", level: 3, balance: 45000.00, hasChildren: false, expanded: false, parentId: "1100", isGroup: true, subtype: "receivable" },
  { id: "1130", name: "المخزون", type: "asset", level: 3, balance: 55000.00, hasChildren: false, expanded: false, parentId: "1100", isGroup: true, subtype: "inventory" },
  { id: "1200", name: "الأصول الثابتة", type: "asset", level: 2, balance: 300000.00, hasChildren: true, expanded: false, parentId: "1000", isGroup: true, subtype: "general" },
  { id: "2000", name: "الخصوم", type: "liability", level: 1, balance: 120000.00, hasChildren: true, expanded: true, parentId: null, isGroup: true, subtype: "general" },
  { id: "2100", name: "الخصوم المتداولة", type: "liability", level: 2, balance: 45000.00, hasChildren: true, expanded: true, parentId: "2000", isGroup: true, subtype: "general" },
  { id: "2110", name: "الموردين", type: "liability", level: 3, balance: 25000.00, hasChildren: false, expanded: false, parentId: "2100", isGroup: true, subtype: "payable" },
  { id: "3000", name: "حقوق الملكية", type: "equity", level: 1, balance: 330000.00, hasChildren: true, expanded: false, parentId: null, isGroup: true, subtype: "equity" },
  { id: "4000", name: "الإيرادات", type: "income", level: 1, balance: 85000.00, hasChildren: true, expanded: false, parentId: null, isGroup: true, subtype: "income" },
  { id: "5000", name: "المصروفات", type: "expense", level: 1, balance: 35000.00, hasChildren: true, expanded: false, parentId: null, isGroup: true, subtype: "expense" },
];

const typeMap: Record<string, { label: string, color: string }> = {
  asset: { label: "أصول", color: "bg-blue-100 text-blue-700 border-blue-200" },
  liability: { label: "خصوم", color: "bg-rose-100 text-rose-700 border-rose-200" },
  equity: { label: "حقوق ملكية", color: "bg-purple-100 text-purple-700 border-purple-200" },
  income: { label: "إيرادات", color: "bg-emerald-100 text-emerald-700 border-emerald-200" },
  expense: { label: "مصروفات", color: "bg-amber-100 text-amber-700 border-amber-200" },
};

export default function ChartOfAccounts() {
  const { currentEntity } = useEntity();
  const [location, setLocation] = useLocation();
  const [accounts, setAccounts] = useState(initialAccountsData);
  const [isNewAccountOpen, setIsNewAccountOpen] = useState(false);

  // Handle query params for quick actions
  useEffect(() => {
    const searchParams = new URLSearchParams(window.location.search);
    if (searchParams.get('action') === 'add') {
      setIsNewAccountOpen(true);
      // Clean up URL without refreshing
      window.history.replaceState({}, '', '/coa');
    }
  }, [location]);
  const [newAccount, setNewAccount] = useState({
    name: "",
    code: "",
    type: "asset",
    parent: "none",
    isGroup: true, // Default to Group (Main)
    subtype: "general"
  });

  const toggleExpand = (id: string) => {
    setAccounts(accounts.map(acc => 
      acc.id === id ? { ...acc, expanded: !acc.expanded } : acc
    ));
  };

  const handleAddAccount = () => {
    if (!newAccount.name || !newAccount.code) {
      toast.error("يرجى تعبئة جميع الحقول المطلوبة");
      return;
    }

    const parent = accounts.find(a => a.id === newAccount.parent);
    
    // Validation: Cannot add child to a non-group account
    if (parent && !parent.isGroup) {
      toast.error("لا يمكن إضافة حساب فرعي لحساب ليس رئيسياً (مجموعة)");
      return;
    }

    const level = parent ? parent.level + 1 : 1;
    
    const newAcc = {
      id: newAccount.code,
      name: newAccount.name,
      type: newAccount.type,
      level: level,
      balance: 0,
      hasChildren: false,
      expanded: false,
      parentId: newAccount.parent === "none" ? null : newAccount.parent,
      isGroup: newAccount.isGroup,
      subtype: newAccount.subtype
    };

    // If adding to a parent, update parent to have children and be expanded
    let updatedAccounts = [...accounts];
    if (parent) {
      updatedAccounts = updatedAccounts.map(acc => 
        acc.id === parent.id ? { ...acc, hasChildren: true, expanded: true } : acc
      );
    }

    updatedAccounts.push(newAcc);
    // Sort by code to keep tree structure somewhat ordered
    updatedAccounts.sort((a, b) => a.id.localeCompare(b.id));

    setAccounts(updatedAccounts);
    setIsNewAccountOpen(false);
    setNewAccount({ 
      name: "", 
      code: "", 
      type: "asset", 
      parent: "none", 
      isGroup: true, 
      subtype: "general" 
    });
    toast.success("تم إضافة الحساب بنجاح");
  };

  const handleDeleteAccount = (id: string) => {
    const hasChildren = accounts.some(a => a.parentId === id);
    if (hasChildren) {
      toast.error("لا يمكن حذف حساب رئيسي يحتوي على حسابات فرعية");
      return;
    }
    setAccounts(accounts.filter(a => a.id !== id));
    toast.success("تم حذف الحساب بنجاح");
  };

  // Helper to check if an account should be visible based on parent expansion
  const isVisible = (account: any): boolean => {
    if (!account.parentId) return true;
    const parent = accounts.find(a => a.id === account.parentId);
    return parent ? (parent.expanded && isVisible(parent)) : true;
  };

  // Filter accounts for parent selection (only Groups can be parents)
  const groupAccounts = accounts.filter(a => a.isGroup);

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-3xl font-bold tracking-tight flex items-center gap-2">
            شجرة الحسابات
            <Badge variant="outline" className="mr-2 font-normal">
              {currentEntity.name}
            </Badge>
          </h2>
          <p className="text-muted-foreground mt-1">
            {currentEntity.type === 'holding' 
              ? "الدليل المحاسبي الموحد للشركة القابضة" 
              : "الدليل المحاسبي الخاص بالوحدة/الفرع"}
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm">
            <Download className="w-4 h-4 ml-2" />
            تصدير
          </Button>
          
          <Dialog open={isNewAccountOpen} onOpenChange={setIsNewAccountOpen}>
            <DialogTrigger asChild>
              <Button size="sm">
                <Plus className="w-4 h-4 ml-2" />
                حساب جديد
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>إضافة حساب جديد</DialogTitle>
                <DialogDescription>
                  أدخل تفاصيل الحساب الجديد لإضافته إلى الشجرة.
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-6 py-4">
                
                {/* Account Nature (Group vs Ledger) */}
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label className="text-right font-bold">نوع الحساب</Label>
                  <div className="col-span-3 flex gap-4">
                    <div 
                      className={`flex-1 p-4 border rounded-lg cursor-pointer transition-all ${newAccount.isGroup ? 'border-primary bg-primary/5 ring-1 ring-primary' : 'hover:bg-muted/50'}`}
                      onClick={() => setNewAccount({...newAccount, isGroup: true})}
                    >
                      <div className="flex items-center gap-2 mb-1">
                        <Folder className={`w-5 h-5 ${newAccount.isGroup ? 'text-primary' : 'text-muted-foreground'}`} />
                        <span className="font-bold">حساب رئيسي (مجموعة)</span>
                      </div>
                      <p className="text-xs text-muted-foreground">يستخدم للتنظيم والترتيب، ولا يمكن إجراء عمليات مالية عليه مباشرة.</p>
                    </div>
                    
                    <div 
                      className={`flex-1 p-4 border rounded-lg cursor-pointer transition-all ${!newAccount.isGroup ? 'border-primary bg-primary/5 ring-1 ring-primary' : 'hover:bg-muted/50'}`}
                      onClick={() => setNewAccount({...newAccount, isGroup: false})}
                    >
                      <div className="flex items-center gap-2 mb-1">
                        <FileText className={`w-5 h-5 ${!newAccount.isGroup ? 'text-primary' : 'text-muted-foreground'}`} />
                        <span className="font-bold">حساب فرعي (تحليلي)</span>
                      </div>
                      <p className="text-xs text-muted-foreground">الحساب الذي يتأثر بالعمليات المالية (قيود، فواتير، سندات).</p>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="name">اسم الحساب</Label>
                    <Input 
                      id="name" 
                      value={newAccount.name}
                      onChange={(e) => setNewAccount({...newAccount, name: e.target.value})}
                      placeholder="مثال: الصندوق الرئيسي"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="code">رمز الحساب</Label>
                    <Input 
                      id="code" 
                      value={newAccount.code}
                      onChange={(e) => setNewAccount({...newAccount, code: e.target.value})}
                      placeholder="مثال: 110101"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="parent">الحساب الرئيسي (الأب)</Label>
                    <Select 
                      value={newAccount.parent} 
                      onValueChange={(v) => {
                        const parent = accounts.find(a => a.id === v);
                        setNewAccount({
                          ...newAccount, 
                          parent: v,
                          type: parent ? parent.type : newAccount.type // Inherit type from parent
                        });
                      }}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="اختر الحساب الرئيسي" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="none">-- بدون (حساب جذر) --</SelectItem>
                        {groupAccounts.map(acc => (
                          <SelectItem key={acc.id} value={acc.id}>
                            {acc.id} - {acc.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="type">التصنيف الرئيسي</Label>
                    <Select 
                      value={newAccount.type} 
                      onValueChange={(v) => setNewAccount({...newAccount, type: v})}
                      disabled={newAccount.parent !== "none"} // Lock type if parent is selected
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="اختر التصنيف" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="asset">أصول</SelectItem>
                        <SelectItem value="liability">خصوم</SelectItem>
                        <SelectItem value="equity">حقوق ملكية</SelectItem>
                        <SelectItem value="income">إيرادات</SelectItem>
                        <SelectItem value="expense">مصروفات</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {/* Subtype Selection - Only for Ledger Accounts */}
                {!newAccount.isGroup && (
                  <div className="space-y-2 animate-in fade-in slide-in-from-top-2">
                    <Label htmlFor="subtype">نوع الحساب الفرعي</Label>
                    <Select 
                      value={newAccount.subtype} 
                      onValueChange={(v) => setNewAccount({...newAccount, subtype: v})}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="اختر نوع الحساب الفرعي" />
                      </SelectTrigger>
                      <SelectContent>
                        {accountSubtypes.map(st => (
                          <SelectItem key={st.value} value={st.value}>
                            <div className="flex items-center gap-2">
                              <st.icon className="w-4 h-4 text-muted-foreground" />
                              <span>{st.label}</span>
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <p className="text-[11px] text-muted-foreground">
                      يساعد تحديد النوع الدقيق في أتمتة العمليات (مثل ظهور حسابات البنوك في سندات الصرف).
                    </p>
                  </div>
                )}

              </div>
              <DialogFooter>
                <Button onClick={handleAddAccount}>
                  <Save className="w-4 h-4 ml-2" />
                  حفظ الحساب
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row gap-4 items-center justify-between bg-card p-4 rounded-lg border shadow-sm">
        <div className="relative w-full sm:w-96">
          <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input placeholder="بحث برقم الحساب أو الاسم..." className="pr-9" />
        </div>
        <div className="flex gap-2 w-full sm:w-auto">
          <Button variant="outline" size="sm" className="flex-1 sm:flex-none">
            <Filter className="w-4 h-4 ml-2" />
            تصفية
          </Button>
          <Button 
            variant="outline" 
            size="sm" 
            className="flex-1 sm:flex-none"
            onClick={() => setAccounts(accounts.map(a => ({...a, expanded: false})))}
          >
            <FolderTree className="w-4 h-4 ml-2" />
            طي الكل
          </Button>
        </div>
      </div>

      <div className="rounded-md border bg-card shadow-sm overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[400px]">اسم الحساب</TableHead>
              <TableHead>الرمز</TableHead>
              <TableHead>النوع</TableHead>
              <TableHead>التصنيف الفرعي</TableHead>
              <TableHead>الرصيد الحالي</TableHead>
              <TableHead className="text-left">إجراءات</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {accounts.filter(isVisible).map((account) => {
              const subtypeLabel = accountSubtypes.find(s => s.value === account.subtype)?.label || "عام";
              
              return (
                <TableRow key={account.id} className="group hover:bg-muted/50">
                  <TableCell>
                    <div 
                      className="flex items-center gap-2"
                      style={{ paddingRight: `${(account.level - 1) * 24}px` }}
                    >
                      {account.hasChildren ? (
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          className="h-6 w-6 p-0 hover:bg-transparent"
                          onClick={() => toggleExpand(account.id)}
                        >
                          {account.expanded ? (
                            <ChevronDown className="h-4 w-4 text-muted-foreground" />
                          ) : (
                            <ChevronRight className="h-4 w-4 text-muted-foreground rtl:rotate-180" />
                          )}
                        </Button>
                      ) : (
                        <div className="w-6" />
                      )}
                      
                      {account.isGroup ? (
                        <Folder className="h-4 w-4 text-blue-500" />
                      ) : (
                        <FileText className="h-4 w-4 text-muted-foreground" />
                      )}
                      
                      <span className={account.isGroup ? "font-bold" : ""}>
                        {account.name}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell className="font-mono text-xs text-muted-foreground">
                    {account.id}
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline" className={`${typeMap[account.type].color} ${typeMap[account.type].color.replace('text-', 'bg-').replace('700', '100')} border-0`}>
                      {typeMap[account.type].label}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {!account.isGroup && (
                      <span className="text-xs text-muted-foreground bg-muted px-2 py-1 rounded-full">
                        {subtypeLabel}
                      </span>
                    )}
                  </TableCell>
                  <TableCell>
                    <span className={account.balance < 0 ? "text-red-600" : ""}>
                      {account.balance.toLocaleString('en-US', { minimumFractionDigits: 2 })} ر.س
                    </span>
                  </TableCell>
                  <TableCell className="text-left">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuLabel>إجراءات</DropdownMenuLabel>
                        <DropdownMenuItem onClick={() => {
                          setNewAccount({
                            ...newAccount,
                            parent: account.id,
                            type: account.type,
                            isGroup: false // Default to sub-account when adding child
                          });
                          setIsNewAccountOpen(true);
                        }}>
                          <Plus className="w-4 h-4 ml-2" />
                          إضافة حساب فرعي
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem className="text-destructive" onClick={() => handleDeleteAccount(account.id)}>
                          حذف
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}

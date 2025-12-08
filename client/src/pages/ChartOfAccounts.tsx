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

// Initial Mock data for Chart of Accounts
const initialAccountsData = [
  { id: "1000", name: "الأصول", type: "asset", level: 1, balance: 450000.00, hasChildren: true, expanded: true, parentId: null },
  { id: "1100", name: "الأصول المتداولة", type: "asset", level: 2, balance: 150000.00, hasChildren: true, expanded: true, parentId: "1000" },
  { id: "1110", name: "النقد وما في حكمه", type: "asset", level: 3, balance: 50000.00, hasChildren: true, expanded: true, parentId: "1100" },
  { id: "1111", name: "الصندوق الرئيسي", type: "asset", level: 4, balance: 15000.00, hasChildren: false, expanded: false, parentId: "1110" },
  { id: "1112", name: "البنك الأهلي", type: "asset", level: 4, balance: 35000.00, hasChildren: false, expanded: false, parentId: "1110" },
  { id: "1120", name: "العملاء", type: "asset", level: 3, balance: 45000.00, hasChildren: false, expanded: false, parentId: "1100" },
  { id: "1130", name: "المخزون", type: "asset", level: 3, balance: 55000.00, hasChildren: false, expanded: false, parentId: "1100" },
  { id: "1200", name: "الأصول الثابتة", type: "asset", level: 2, balance: 300000.00, hasChildren: true, expanded: false, parentId: "1000" },
  { id: "2000", name: "الخصوم", type: "liability", level: 1, balance: 120000.00, hasChildren: true, expanded: true, parentId: null },
  { id: "2100", name: "الخصوم المتداولة", type: "liability", level: 2, balance: 45000.00, hasChildren: true, expanded: true, parentId: "2000" },
  { id: "2110", name: "الموردين", type: "liability", level: 3, balance: 25000.00, hasChildren: false, expanded: false, parentId: "2100" },
  { id: "3000", name: "حقوق الملكية", type: "equity", level: 1, balance: 330000.00, hasChildren: true, expanded: false, parentId: null },
  { id: "4000", name: "الإيرادات", type: "income", level: 1, balance: 85000.00, hasChildren: true, expanded: false, parentId: null },
  { id: "5000", name: "المصروفات", type: "expense", level: 1, balance: 35000.00, hasChildren: true, expanded: false, parentId: null },
];

const typeMap: Record<string, { label: string, color: string }> = {
  asset: { label: "أصول", color: "bg-blue-100 text-blue-700 border-blue-200" },
  liability: { label: "خصوم", color: "bg-rose-100 text-rose-700 border-rose-200" },
  equity: { label: "حقوق ملكية", color: "bg-purple-100 text-purple-700 border-purple-200" },
  income: { label: "إيرادات", color: "bg-emerald-100 text-emerald-700 border-emerald-200" },
  expense: { label: "مصروفات", color: "bg-amber-100 text-amber-700 border-amber-200" },
};

export default function ChartOfAccounts() {
  const [accounts, setAccounts] = useState(initialAccountsData);
  const [isNewAccountOpen, setIsNewAccountOpen] = useState(false);
  const [newAccount, setNewAccount] = useState({
    name: "",
    code: "",
    type: "asset",
    parent: "none"
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
    const level = parent ? parent.level + 1 : 1;
    
    const newAcc = {
      id: newAccount.code,
      name: newAccount.name,
      type: newAccount.type,
      level: level,
      balance: 0,
      hasChildren: false,
      expanded: false,
      parentId: newAccount.parent === "none" ? null : newAccount.parent
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
    setNewAccount({ name: "", code: "", type: "asset", parent: "none" });
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

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">شجرة الحسابات</h2>
          <p className="text-muted-foreground mt-1">الهيكل التنظيمي للحسابات المالية</p>
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
            <DialogContent>
              <DialogHeader>
                <DialogTitle>إضافة حساب جديد</DialogTitle>
                <DialogDescription>
                  أدخل تفاصيل الحساب الجديد لإضافته إلى الشجرة.
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="name" className="text-right">اسم الحساب</Label>
                  <Input 
                    id="name" 
                    value={newAccount.name}
                    onChange={(e) => setNewAccount({...newAccount, name: e.target.value})}
                    className="col-span-3" 
                  />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="code" className="text-right">رمز الحساب</Label>
                  <Input 
                    id="code" 
                    value={newAccount.code}
                    onChange={(e) => setNewAccount({...newAccount, code: e.target.value})}
                    className="col-span-3" 
                  />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="type" className="text-right">النوع</Label>
                  <Select 
                    value={newAccount.type} 
                    onValueChange={(v) => setNewAccount({...newAccount, type: v})}
                  >
                    <SelectTrigger className="col-span-3">
                      <SelectValue placeholder="اختر النوع" />
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
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="parent" className="text-right">الحساب الرئيسي</Label>
                  <Select 
                    value={newAccount.parent} 
                    onValueChange={(v) => setNewAccount({...newAccount, parent: v})}
                  >
                    <SelectTrigger className="col-span-3">
                      <SelectValue placeholder="اختر الحساب الرئيسي" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">-- بدون (حساب رئيسي) --</SelectItem>
                      {accounts.map(acc => (
                        <SelectItem key={acc.id} value={acc.id}>
                          {acc.id} - {acc.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
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
              <TableHead>الرصيد الحالي</TableHead>
              <TableHead className="text-left">إجراءات</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {accounts.filter(isVisible).map((account) => {
              const type = typeMap[account.type];
              
              return (
                <TableRow key={account.id} className="hover:bg-muted/50 transition-colors">
                  <TableCell>
                    <div 
                      className="flex items-center gap-2" 
                      style={{ paddingRight: `${(account.level - 1) * 24}px` }}
                    >
                      {account.hasChildren ? (
                        <button onClick={() => toggleExpand(account.id)} className="p-1 hover:bg-muted rounded">
                          {account.expanded ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
                        </button>
                      ) : (
                        <span className="w-6" />
                      )}
                      {account.hasChildren ? (
                        <Folder className="w-4 h-4 text-blue-500" />
                      ) : (
                        <FileText className="w-4 h-4 text-muted-foreground" />
                      )}
                      <span className={account.hasChildren ? "font-semibold" : ""}>{account.name}</span>
                    </div>
                  </TableCell>
                  <TableCell className="font-mono text-muted-foreground">{account.id}</TableCell>
                  <TableCell>
                    <Badge variant="outline" className={`${type.color} font-normal`}>
                      {type.label}
                    </Badge>
                  </TableCell>
                  <TableCell className="font-bold font-mono">
                    {account.balance.toLocaleString()} ر.س
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
                          setNewAccount({...newAccount, parent: account.id, type: account.type});
                          setIsNewAccountOpen(true);
                        }}>
                          إضافة حساب فرعي
                        </DropdownMenuItem>
                        <DropdownMenuItem>تعديل</DropdownMenuItem>
                        <DropdownMenuItem>كشف حساب</DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem 
                          className="text-destructive"
                          onClick={() => handleDeleteAccount(account.id)}
                        >
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

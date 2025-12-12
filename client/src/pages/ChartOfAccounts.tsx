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
  Package,
  GripVertical,
  Edit,
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
import { Checkbox } from "@/components/ui/checkbox";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { useState, useEffect } from "react";
import { toast } from "sonner";
import { useEntity } from "@/contexts/EntityContext";
import { useLocation } from "wouter";
import { accountsApi } from "@/lib/api";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { SortableRow } from "@/components/SortableRow";

// Account interface
interface Account {
  id: string;
  name: string;
  type: string;
  level: number;
  balance: number;
  hasChildren: boolean;
  expanded: boolean;
  parentId: string | null;
  isGroup: boolean;
  subtype: string;
  allowedCurrencies: string[];
  entityId?: string;
  branchId?: string;
}

// Account Subtypes
const accountSubtypes = [
  { value: "general", label: "عام" },
  { value: "cash", label: "نقدية" },
  { value: "bank", label: "بنك" },
  { value: "receivable", label: "مستحقات" },
  { value: "payable", label: "مدفوعات" },
  { value: "inventory", label: "مخزون" },
  { value: "fixed_asset", label: "أصول ثابتة" },
];

const typeMap: Record<string, { label: string, color: string }> = {
  asset: { label: "أصول", color: "bg-blue-100 text-blue-700 border-blue-200" },
  liability: { label: "خصوم", color: "bg-rose-100 text-rose-700 border-rose-200" },
  equity: { label: "حقوق ملكية", color: "bg-purple-100 text-purple-700 border-purple-200" },
  income: { label: "إيرادات", color: "bg-emerald-100 text-emerald-700 border-emerald-200" },
  expense: { label: "مصروفات", color: "bg-amber-100 text-amber-700 border-amber-200" },
};

export default function ChartOfAccounts() {
  const { currentEntity, isEntityVisible } = useEntity();
  const [location, setLocation] = useLocation();
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [loading, setLoading] = useState(true);
  const [isNewAccountOpen, setIsNewAccountOpen] = useState(false);
  const [editingAccountId, setEditingAccountId] = useState<string | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  // Load accounts from API
  useEffect(() => {
    loadAccounts();
  }, []);

  const loadAccounts = async () => {
    try {
      setLoading(true);
      const data = await accountsApi.getAll();
      setAccounts(data.map((acc: any) => ({
        ...acc,
        expanded: false,
        hasChildren: data.some((a: any) => a.parentId === acc.id)
      })));
    } catch (error) {
      console.error('Failed to load accounts:', error);
      toast.error('فشل تحميل الحسابات');
    } finally {
      setLoading(false);
    }
  };

  // Handle query params for quick actions
  useEffect(() => {
    const searchParams = new URLSearchParams(window.location.search);
    if (searchParams.get('action') === 'add') {
      setIsNewAccountOpen(true);
      window.history.replaceState({}, '', '/coa');
    }
  }, [location]);

  const [newAccount, setNewAccount] = useState({
    name: "",
    code: "",
    type: "asset",
    parent: "none",
    isGroup: true,
    subtype: "general",
    currencies: ["YER", "SAR", "USD"] as string[],
    defaultCurrency: "YER" as string,
    accountGroup: "none" as string,
    branchId: undefined as string | undefined
  });

  const toggleExpand = (id: string) => {
    setAccounts(accounts.map(acc => 
      acc.id === id ? { ...acc, expanded: !acc.expanded } : acc
    ));
  };

  const handleAddAccount = async () => {
    if (!newAccount.name || !newAccount.code) {
      toast.error("يرجى تعبئة جميع الحقول المطلوبة");
      return;
    }

    try {
      const parent = accounts.find(a => a.id === newAccount.parent);
      const level = parent ? parent.level + 1 : 1;

      const accountData = {
        id: newAccount.code,
        name: newAccount.name,
        type: newAccount.type,
        level: level,
        balance: 0,
        parentId: newAccount.parent === "none" ? null : newAccount.parent,
        isGroup: newAccount.isGroup,
        subtype: newAccount.subtype,
        allowedCurrencies: newAccount.currencies || ["YER", "SAR", "USD"],
        defaultCurrency: newAccount.defaultCurrency || 'YER',
        accountGroup: newAccount.accountGroup === 'none' ? null : newAccount.accountGroup,
        branchId: newAccount.branchId || null,
        entityId: currentEntity.type === 'unit' ? currentEntity.id : 
                  currentEntity.type === 'branch' ? currentEntity.parentId || null : null
      };

      if (editingAccountId) {
        // Update existing account
        await accountsApi.update(editingAccountId, accountData);
        toast.success("تم تحديث الحساب بنجاح");
      } else {
        // Add new account
        if (parent && !parent.isGroup) {
          toast.error("لا يمكن إضافة حساب فرعي لحساب ليس رئيسياً (مجموعة)");
          return;
        }
        await accountsApi.create(accountData);
        toast.success("تم إضافة الحساب بنجاح");
      }

      // Reload accounts
      await loadAccounts();
      
      // Reset form
      setNewAccount({
        name: "",
        code: "",
        type: "asset",
        parent: "none",
        isGroup: true,
        subtype: "general",
        currencies: ["YER", "SAR", "USD"],
        defaultCurrency: "YER",
        accountGroup: "none",
        branchId: undefined
      });
      setIsNewAccountOpen(false);
      setEditingAccountId(null);
    } catch (error: any) {
      console.error('Failed to save account:', error);
      toast.error(error.message || 'فشل حفظ الحساب');
    }
  };

  const handleDeleteAccount = async (id: string) => {
    if (!confirm("هل أنت متأكد من حذف هذا الحساب؟")) return;

    try {
      await accountsApi.delete(id);
      toast.success("تم حذف الحساب بنجاح");
      await loadAccounts();
    } catch (error: any) {
      console.error('Failed to delete account:', error);
      toast.error(error.message || 'فشل حذف الحساب');
    }
  };

  const handleEditAccount = (account: Account) => {
    setEditingAccountId(account.id);
    setNewAccount({
      name: account.name,
      code: account.id,
      type: account.type,
      parent: account.parentId || "none",
      isGroup: account.isGroup,
      subtype: account.subtype,
      currencies: account.allowedCurrencies || ["YER", "SAR", "USD"],
      defaultCurrency: (account as any).defaultCurrency || 'YER',
      accountGroup: (account as any).accountGroup || 'none',
      branchId: account.branchId
    });
    setIsNewAccountOpen(true);
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    const oldIndex = accounts.findIndex((acc) => acc.id === active.id);
    const newIndex = accounts.findIndex((acc) => acc.id === over.id);

    setAccounts(arrayMove(accounts, oldIndex, newIndex));
    toast.success("تم تحديث ترتيب الحسابات");
  };

  // Filter accounts based on current entity
  const filteredAccounts = accounts.filter(acc => {
    if (!acc.entityId) return false;
    return isEntityVisible(acc.entityId);
  });

  // Build tree structure
  const buildTree = (parentId: string | null = null, level: number = 0): Account[] => {
    return filteredAccounts
      .filter(acc => acc.parentId === parentId)
      .sort((a, b) => a.id.localeCompare(b.id))
      .flatMap(acc => {
        const children = buildTree(acc.id, level + 1);
        return acc.expanded ? [acc, ...children] : [acc];
      });
  };

  const visibleAccounts = buildTree();

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">جاري تحميل الحسابات...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-primary/10 rounded-lg">
            <FolderTree className="h-6 w-6 text-primary" />
          </div>
          <div>
            <h1 className="text-2xl font-bold">شجرة الحسابات</h1>
            <p className="text-sm text-muted-foreground">
              {currentEntity.name}
            </p>
          </div>
        </div>

        <Dialog open={isNewAccountOpen} onOpenChange={setIsNewAccountOpen}>
          <DialogTrigger asChild>
            <Button onClick={() => {
              setEditingAccountId(null);
              setNewAccount({
                name: "",
                code: "",
                type: "asset",
                parent: "none",
                isGroup: true,
                subtype: "general",
                currencies: ["YER", "SAR", "USD"],
                defaultCurrency: "YER",
                accountGroup: "none",
                branchId: undefined
              });
            }}>
              <Plus className="h-4 w-4 ml-2" />
              حساب جديد
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>{editingAccountId ? 'تعديل الحساب' : 'إضافة حساب جديد'}</DialogTitle>
            </DialogHeader>

            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>اسم الحساب</Label>
                  <Input
                    value={newAccount.name}
                    onChange={(e) => setNewAccount({ ...newAccount, name: e.target.value })}
                    placeholder="مثال: البنك الأهلي"
                  />
                </div>
                <div>
                  <Label>رمز الحساب</Label>
                  <Input
                    value={newAccount.code}
                    onChange={(e) => setNewAccount({ ...newAccount, code: e.target.value })}
                    placeholder="مثال: 1.1.1"
                    disabled={!!editingAccountId}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>نوع الحساب</Label>
                  <Select value={newAccount.type} onValueChange={(value) => setNewAccount({ ...newAccount, type: value })}>
                    <SelectTrigger>
                      <SelectValue />
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

                <div>
                  <Label>الحساب الأب</Label>
                  <Select value={newAccount.parent} onValueChange={(value) => setNewAccount({ ...newAccount, parent: value })}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">لا يوجد (حساب رئيسي)</SelectItem>
                      {filteredAccounts.filter(acc => acc.isGroup).map(acc => (
                        <SelectItem key={acc.id} value={acc.id}>{acc.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div>
                <Label>نوع الحساب الفرعي</Label>
                <Select value={newAccount.subtype} onValueChange={(value) => setNewAccount({ ...newAccount, subtype: value })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {accountSubtypes.map(st => (
                      <SelectItem key={st.value} value={st.value}>{st.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label>هل هذا حساب رئيسي (مجموعة)؟</Label>
                <RadioGroup value={newAccount.isGroup ? "group" : "account"} onValueChange={(value) => setNewAccount({ ...newAccount, isGroup: value === "group" })}>
                  <div className="flex items-center space-x-2 space-x-reverse">
                    <RadioGroupItem value="group" id="group" />
                    <Label htmlFor="group">حساب رئيسي (مجموعة)</Label>
                  </div>
                  <div className="flex items-center space-x-2 space-x-reverse">
                    <RadioGroupItem value="account" id="account" />
                    <Label htmlFor="account">حساب فرعي</Label>
                  </div>
                </RadioGroup>
              </div>

              <div>
                <Label>العملات المسموح بها</Label>
                <div className="flex gap-4 mt-2">
                  {["YER", "SAR", "USD"].map(currency => (
                    <div key={currency} className="flex items-center space-x-2 space-x-reverse">
                      <Checkbox
                        checked={newAccount.currencies.includes(currency)}
                        onCheckedChange={(checked) => {
                          if (checked) {
                            setNewAccount({ ...newAccount, currencies: [...newAccount.currencies, currency] });
                          } else {
                            setNewAccount({ ...newAccount, currencies: newAccount.currencies.filter(c => c !== currency) });
                          }
                        }}
                      />
                      <Label>{currency}</Label>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <DialogFooter>
              <Button variant="outline" onClick={() => setIsNewAccountOpen(false)}>
                إلغاء
              </Button>
              <Button onClick={handleAddAccount}>
                <Save className="h-4 w-4 ml-2" />
                {editingAccountId ? 'تحديث' : 'حفظ'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* Accounts Table */}
      <div className="border rounded-lg">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-12"></TableHead>
              <TableHead>اسم الحساب</TableHead>
              <TableHead>رمز الحساب</TableHead>
              <TableHead>النوع</TableHead>
              <TableHead>الرصيد</TableHead>
              <TableHead className="w-12"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
              <SortableContext items={visibleAccounts.map(a => a.id)} strategy={verticalListSortingStrategy}>
                {visibleAccounts.map((account) => (
                  <SortableRow key={account.id} id={account.id}>
                    <TableCell>
                      {account.hasChildren && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => toggleExpand(account.id)}
                        >
                          {account.expanded ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
                        </Button>
                      )}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2" style={{ paddingRight: `${account.level * 20}px` }}>
                        {account.isGroup ? <Folder className="h-4 w-4 text-amber-500" /> : <FileText className="h-4 w-4 text-blue-500" />}
                        <span>{account.name}</span>
                      </div>
                    </TableCell>
                    <TableCell>{account.id}</TableCell>
                    <TableCell>
                      <Badge variant="outline" className={typeMap[account.type]?.color}>
                        {typeMap[account.type]?.label}
                      </Badge>
                    </TableCell>
                    <TableCell>{account.balance.toLocaleString()} ريال</TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => handleEditAccount(account)}>
                            <Edit className="h-4 w-4 ml-2" />
                            تعديل
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleDeleteAccount(account.id)} className="text-red-600">
                            <Trash2 className="h-4 w-4 ml-2" />
                            حذف
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </SortableRow>
                ))}
              </SortableContext>
            </DndContext>
          </TableBody>
        </Table>
      </div>
    </div>
  );
}

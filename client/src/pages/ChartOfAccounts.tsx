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
import { Plus, Search, Filter, MoreHorizontal, FolderTree, ChevronRight, ChevronDown, Folder, FileText, Save, Building2, Edit, Trash2, ChevronsDownUp, ChevronsUpDown, X, TrendingUp, TrendingDown } from "lucide-react";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
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
import { Card, CardContent } from "@/components/ui/card";
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
  entityId?: string | null;
  branchId?: string;
}

import { getAccountTypes, getTypeMap, type AccountType } from "@/lib/accountTypes";
import { getAccountSubtypes } from "@/lib/accountSubtypes";

export default function ChartOfAccounts() {
  const { currentEntity, isEntityVisible: _isEntityVisible, entities } = useEntity();
  
  const [location, setLocation] = useLocation();
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [loading, setLoading] = useState(true);
  const [isNewAccountOpen, setIsNewAccountOpen] = useState(false);
  const [editingAccountId, setEditingAccountId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [typeFilter, setTypeFilter] = useState<string>("all");
  const [allExpanded, setAllExpanded] = useState(false);
  const [typeMap, setTypeMap] = useState<Record<string, { label: string, color: string }>>({});
  const [accountTypes, setAccountTypes] = useState<AccountType[]>([]);

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  // Load accounts from API when entity changes
  useEffect(() => {
    if (currentEntity) {
      loadAccounts();
    }
   
  }, [currentEntity]);

  // Load account types and update typeMap when entity changes
  useEffect(() => {
    if (!currentEntity) return;
    
    const types = getAccountTypes(currentEntity.id);
    setAccountTypes(types);
    setTypeMap(getTypeMap(currentEntity.id));
    
    // Listen for storage changes (when types are updated in AccountTypes page)
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key && e.key.startsWith('account_types_') && e.key === `account_types_${currentEntity.id}`) {
        const updatedTypes = getAccountTypes(currentEntity.id);
        setAccountTypes(updatedTypes);
        setTypeMap(getTypeMap(currentEntity.id));
      }
    };
    
    // Listen for custom event (same-tab updates)
    const handleAccountTypesUpdated = (e: Event) => {
      const customEvent = e as CustomEvent;
      if (customEvent.detail?.entityId === currentEntity.id) {
        const updatedTypes = getAccountTypes(currentEntity.id);
        setAccountTypes(updatedTypes);
        setTypeMap(getTypeMap(currentEntity.id));
      }
    };
    
    window.addEventListener('storage', handleStorageChange);
    window.addEventListener('accountTypesUpdated', handleAccountTypesUpdated);
    
    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('accountTypesUpdated', handleAccountTypesUpdated);
    };
  }, [currentEntity]);

  const loadAccounts = async () => {
    try {
      setLoading(true);
      const data = await accountsApi.getAll();
      const mappedAccounts = data.map((acc: any) => ({
        ...acc,
        expanded: false,
        hasChildren: data.some((a: any) => a.parentId === acc.id)
      }));
      setAccounts(mappedAccounts);
      console.log('Loaded accounts:', {
        total: mappedAccounts.length,
        currentEntity: currentEntity?.name,
        currentEntityType: currentEntity?.type,
        accountsForEntity: mappedAccounts.filter((acc: any) => 
          currentEntity?.type === 'holding' ? true :
          currentEntity?.type === 'unit' ? acc.entityId === currentEntity.id :
          currentEntity?.type === 'branch' ? (acc.entityId === currentEntity.id || acc.entityId === currentEntity.parentId) : false
        ).length
      });
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
    branchId: undefined as string | undefined,
    entityId: "" as string
  });

  if (!currentEntity) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-muted-foreground">الرجاء اختيار كيان أولاً</p>
      </div>
    );
  }


  const toggleExpand = (id: string) => {
    setAccounts(accounts.map(acc => 
      acc.id === id ? { ...acc, expanded: !acc.expanded } : acc
    ));
  };

  const toggleExpandAll = () => {
    const newExpanded = !allExpanded;
    setAllExpanded(newExpanded);
    setAccounts(accounts.map(acc => ({ ...acc, expanded: newExpanded })));
  };

  const clearFilters = () => {
    setSearchQuery("");
    setTypeFilter("all");
  };

  const handleAddAccount = async () => {
    // Prevent adding accounts from holding company
    if (currentEntity?.type === 'holding') {
      toast.error("لا يمكن إضافة حسابات من الشركة القابضة. يرجى الدخول إلى وحدة محددة أولاً");
      return;
    }

    if (!newAccount.name || !newAccount.code) {
      toast.error("يرجى تعبئة جميع الحقول المطلوبة");
      return;
    }

    try {
      const parent = accounts.find(a => a.id === newAccount.parent);
      const level = parent ? parent.level + 1 : 1;

      // Determine entityId - use selected entityId if editing, otherwise use current entity logic
      let entityId: string | null = null;
      if (editingAccountId && newAccount.entityId) {
        // When editing, use the selected entityId
        entityId = newAccount.entityId || null;
      } else if (currentEntity.type === 'unit') {
        entityId = currentEntity.id;
      } else if (currentEntity.type === 'branch') {
        entityId = currentEntity.parentId || currentEntity.id;
      } else if (currentEntity.type === 'holding') {
        entityId = null; // Holding company shows all accounts
      }

      const accountData = {
        id: newAccount.code,
        name: newAccount.name,
        type: newAccount.type,
        level: level,
        balance: 0,
        parentId: newAccount.parent === "none" ? null : newAccount.parent,
        isGroup: newAccount.isGroup,
        subtype: newAccount.subtype,
        currencies: newAccount.currencies || ["YER", "SAR", "USD"], // Use 'currencies' instead of 'allowedCurrencies'
        defaultCurrency: newAccount.defaultCurrency || 'YER',
        accountGroup: newAccount.accountGroup === 'none' ? null : newAccount.accountGroup,
        branchId: newAccount.branchId || null,
        entityId: entityId
      };

      console.log('Adding account with data:', {
        name: accountData.name,
        entityId: accountData.entityId,
        currentEntity: currentEntity.name,
        currentEntityType: currentEntity.type
      });

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

      // Close dialog first
      setIsNewAccountOpen(false);
      setEditingAccountId(null);
      
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
        branchId: undefined,
        entityId: ""
      });
      
      // Reload accounts after a short delay to ensure API has processed
      setTimeout(async () => {
        await loadAccounts();
      }, 500);
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
      branchId: account.branchId,
      entityId: account.entityId || ""
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

  // Filter accounts based on current entity, search, and type
  const filteredAccounts = accounts.filter(acc => {
    // For holding company, show accounts of all child units
    if (currentEntity?.type === 'holding') {
      // Get all child units of the holding company
      const childUnits = entities.filter(e => e.type === 'unit' && e.parentId === currentEntity.id);
      const childUnitIds = childUnits.map(u => u.id);
      
      // Show accounts that belong to any of the child units
      if (acc.entityId && !childUnitIds.includes(acc.entityId)) {
        return false;
      }
      // Also show accounts without entityId (global accounts) if needed
    } else {
      // For unit, show accounts with matching entityId
      if (currentEntity?.type === 'unit') {
        if (acc.entityId !== currentEntity.id) return false;
      } else if (currentEntity?.type === 'branch') {
        // For branch, show accounts of the parent unit or the branch itself
        if (acc.entityId !== currentEntity.id && acc.entityId !== currentEntity.parentId) return false;
      } else {
        // If no entity selected or unknown type, don't show any
        return false;
      }
    }
    
    // Search filter
    if (searchQuery && !acc.name.toLowerCase().includes(searchQuery.toLowerCase()) && 
        !acc.id.toLowerCase().includes(searchQuery.toLowerCase())) {
      return false;
    }
    
    // Type filter
    if (typeFilter !== "all" && acc.type !== typeFilter) {
      return false;
    }
    
    return true;
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

  // Calculate statistics
  const stats = {
    total: filteredAccounts.length,
    groups: filteredAccounts.filter(a => a.isGroup).length,
    accounts: filteredAccounts.filter(a => !a.isGroup).length,
    totalBalance: filteredAccounts.reduce((sum, acc) => sum + (acc.balance || 0), 0),
    byType: accountTypes.reduce((acc, type) => {
      acc[type.name] = filteredAccounts.filter(a => a.type === type.name).length;
      return acc;
    }, {} as Record<string, number>)
  };

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

  // الشركة القابضة ليس لها شجرة حسابات - الحسابات مرتبطة بالوحدات فقط
  if (currentEntity?.type === 'holding') {
    return (
      <div className="flex items-center justify-center min-h-[60vh] p-6">
        <Card className="w-full max-w-2xl">
          <CardContent className="p-12 text-center">
            <div className="mx-auto w-20 h-20 bg-muted rounded-full flex items-center justify-center mb-6">
              <FolderTree className="w-10 h-10 text-muted-foreground" />
            </div>
            <h2 className="text-2xl font-bold mb-4">شجرة الحسابات مرتبطة بالوحدات فقط</h2>
            <p className="text-muted-foreground mb-6 text-lg">
              الشركة القابضة هي كيان تحكم وإدارة. شجرة الحسابات مرتبطة بالوحدات التابعة فقط.
              <br />
              يمكنك إدارة الوحدات والفروع من خلال الهيكل التنظيمي.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button 
                onClick={() => setLocation('/organization')}
                size="lg"
                className="gap-2"
              >
                <Building2 className="w-5 h-5" />
                الذهاب للهيكل التنظيمي
              </Button>
              <Button 
                variant="outline"
                onClick={() => setLocation('/')}
                size="lg"
              >
                العودة للوحة المعلومات
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4">
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

          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={toggleExpandAll}
              title={allExpanded ? "طي الكل" : "فتح الكل"}
            >
              {allExpanded ? (
                <ChevronsDownUp className="h-4 w-4 ml-2" />
              ) : (
                <ChevronsUpDown className="h-4 w-4 ml-2" />
              )}
              {allExpanded ? "طي الكل" : "فتح الكل"}
            </Button>
            <Dialog open={isNewAccountOpen} onOpenChange={setIsNewAccountOpen}>
              <DialogTrigger asChild>
                <Button 
                  onClick={() => {
                    if (currentEntity?.type === 'holding') {
                      toast.error("لا يمكن إضافة حسابات من الشركة القابضة. يرجى الدخول إلى وحدة محددة أولاً");
                      return;
                    }
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
                      branchId: undefined,
                      entityId: ""
                    });
                  }}
                  disabled={(currentEntity?.type as string) === 'holding' || false}
                >
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
                      {accountTypes.map((type) => (
                        <SelectItem key={type.id} value={type.name}>
                          {type.label}
                        </SelectItem>
                      ))}
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
                      {filteredAccounts
                        .filter(acc => 
                          acc.isGroup && 
                          acc.type === newAccount.type &&
                          (!editingAccountId || acc.id !== editingAccountId) // استثناء الحساب الحالي عند التعديل
                        )
                        .map(acc => (
                          <SelectItem key={acc.id} value={acc.id}>{acc.name}</SelectItem>
                        ))}
                    </SelectContent>
                  </Select>
                </div>
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

              {!newAccount.isGroup && (
                <div>
                  <Label>نوع الحساب الفرعي</Label>
                  <Select value={newAccount.subtype} onValueChange={(value) => setNewAccount({ ...newAccount, subtype: value })}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {getAccountSubtypes(currentEntity?.id).map(st => (
                        <SelectItem key={st.value} value={st.value}>{st.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}

              {editingAccountId && (
                <div>
                  <Label>الوحدة</Label>
                  <Select 
                    value={newAccount.entityId || "none"} 
                    onValueChange={(value) => setNewAccount({ ...newAccount, entityId: value === "none" ? "" : value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="اختر الوحدة" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">لا يوجد (شركة قابضة)</SelectItem>
                      {entities.filter(e => e.type === 'unit').map(entity => (
                        <SelectItem key={entity.id} value={entity.id}>
                          {entity.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <p className="text-xs text-muted-foreground mt-1">
                    اختر الوحدة التي ينتمي إليها هذا الحساب (مثال: أعمال الحديدة)
                  </p>
                </div>
              )}

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
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3">
          <div className="bg-card border rounded-lg p-3">
            <div className="text-xs text-muted-foreground mb-1">إجمالي الحسابات</div>
            <div className="text-lg font-semibold">{stats.total}</div>
          </div>
          <div className="bg-card border rounded-lg p-3">
            <div className="text-xs text-muted-foreground mb-1">مجموعات</div>
            <div className="text-lg font-semibold text-amber-600">{stats.groups}</div>
          </div>
          <div className="bg-card border rounded-lg p-3">
            <div className="text-xs text-muted-foreground mb-1">حسابات فرعية</div>
            <div className="text-lg font-semibold text-blue-600">{stats.accounts}</div>
          </div>
          <div className="bg-card border rounded-lg p-3">
            <div className="text-xs text-muted-foreground mb-1">إجمالي الرصيد</div>
            <div className={`text-lg font-semibold ${stats.totalBalance >= 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
              {stats.totalBalance.toLocaleString()} ريال
            </div>
          </div>
          <div className="bg-card border rounded-lg p-3">
            <div className="text-xs text-muted-foreground mb-1">أصول</div>
            <div className="text-lg font-semibold text-blue-600">{stats.byType.asset || 0}</div>
          </div>
          <div className="bg-card border rounded-lg p-3">
            <div className="text-xs text-muted-foreground mb-1">خصوم</div>
            <div className="text-lg font-semibold text-rose-600">{stats.byType.liability || 0}</div>
          </div>
        </div>

        {/* Search and Filter Bar */}
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="ابحث عن حساب بالاسم أو الرمز..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pr-10"
            />
            {searchQuery && (
              <Button
                variant="ghost"
                size="sm"
                className="absolute left-2 top-1/2 transform -translate-y-1/2 h-6 w-6 p-0"
                onClick={() => setSearchQuery("")}
              >
                <X className="h-4 w-4" />
              </Button>
            )}
          </div>
          <Select value={typeFilter} onValueChange={setTypeFilter}>
            <SelectTrigger className="w-full sm:w-[180px]">
              <Filter className="h-4 w-4 ml-2" />
              <SelectValue placeholder="تصفية بالنوع" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">جميع الأنواع</SelectItem>
              {accountTypes.map((type) => (
                <SelectItem key={type.id} value={type.name}>
                  {type.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {(searchQuery || typeFilter !== "all") && (
            <Button variant="outline" onClick={clearFilters}>
              <X className="h-4 w-4 ml-2" />
              مسح التصفية
            </Button>
          )}
        </div>
      </div>

      {/* Accounts Table */}
      <div className="border rounded-lg bg-card shadow-sm">
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
                      <div className="flex items-center gap-2 group relative" style={{ paddingRight: `${account.level * 20}px` }}>
                        {account.isGroup ? (
                          <Folder className={`h-4 w-4 ${account.expanded ? 'text-amber-600' : 'text-amber-500'} transition-colors`} />
                        ) : (
                          <FileText className="h-4 w-4 text-blue-500" />
                        )}
                        <span className={`${account.isGroup ? 'font-semibold' : ''} group-hover:text-primary transition-colors`}>
                          {account.name}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <code className="text-xs bg-muted px-2 py-1 rounded font-mono">{account.id}</code>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className={`${typeMap[account.type]?.color} font-medium`}>
                        {typeMap[account.type]?.label}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        {account.balance !== 0 && (
                          account.balance > 0 ? (
                            <TrendingUp className="h-3 w-3 text-emerald-600" />
                          ) : (
                            <TrendingDown className="h-3 w-3 text-rose-600" />
                          )
                        )}
                        <span className={`font-medium ${account.balance >= 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
                          {Math.abs(account.balance).toLocaleString()} ريال
                        </span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem 
                            onClick={() => {
                              if (currentEntity?.type === 'holding') {
                                toast.error("لا يمكن تعديل الحسابات من الشركة القابضة. يرجى الدخول إلى وحدة محددة أولاً");
                                return;
                              }
                              handleEditAccount(account);
                            }}
                            disabled={currentEntity?.type === 'holding'}
                          >
                            <Edit className="h-4 w-4 ml-2" />
                            تعديل
                          </DropdownMenuItem>
                          <DropdownMenuItem 
                            onClick={() => {
                              if (currentEntity?.type === 'holding') {
                                toast.error("لا يمكن حذف الحسابات من الشركة القابضة. يرجى الدخول إلى وحدة محددة أولاً");
                                return;
                              }
                              handleDeleteAccount(account.id);
                            }}
                            disabled={(currentEntity?.type as string) === 'holding' || false}
                            className="text-red-600"
                          >
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
            {visibleAccounts.length === 0 && (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-12">
                  <div className="flex flex-col items-center gap-2 text-muted-foreground">
                    <FolderTree className="h-12 w-12 opacity-50" />
                    <p className="text-lg font-medium">لا توجد حسابات</p>
                    <p className="text-sm">
                      {searchQuery || typeFilter !== "all" 
                        ? "لا توجد نتائج للبحث المحدد" 
                        : "ابدأ بإضافة حساب جديد"}
                    </p>
                  </div>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}

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
  entityId?: string; // معرف الوحدة التي ينتمي لها الحساب
}

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

// Initial Mock data with Banks, Exchanges, and Wallets accounts
const initialAccountsData: Account[] = [
  {
    id: "1",
    name: "الأصول المتداولة",
    type: "asset",
    level: 1,
    balance: 0,
    hasChildren: true,
    expanded: true,
    parentId: null,
    isGroup: true,
    subtype: "general",
    allowedCurrencies: ["YER", "SAR", "USD"]
  },
  {
    id: "1.1",
    name: "البنوك",
    type: "asset",
    level: 2,
    balance: 0,
    hasChildren: true,
    expanded: true,
    parentId: "1",
    isGroup: true,
    subtype: "bank",
    allowedCurrencies: ["YER", "SAR", "USD"]
  },
  {
    id: "1.2",
    name: "الصرافين",
    type: "asset",
    level: 2,
    balance: 0,
    hasChildren: true,
    expanded: true,
    parentId: "1",
    isGroup: true,
    subtype: "bank",
    allowedCurrencies: ["YER", "SAR", "USD"]
  },
  {
    id: "1.3",
    name: "المحافظ",
    type: "asset",
    level: 2,
    balance: 0,
    hasChildren: true,
    expanded: true,
    parentId: "1",
    isGroup: true,
    subtype: "bank",
    allowedCurrencies: ["YER", "SAR", "USD"]
  },
  // Bank Accounts
  {
    id: "1.1.1",
    name: "الكريمي الحديدة - حساب جاري",
    type: "asset",
    level: 3,
    balance: 0,
    hasChildren: false,
    expanded: false,
    parentId: "1.1",
    isGroup: false,
    subtype: "bank",
    allowedCurrencies: ["YER", "SAR", "USD"]
  },
  {
    id: "1.1.2",
    name: "الكريمي الحديدة - حساب توفير",
    type: "asset",
    level: 3,
    balance: 0,
    hasChildren: false,
    expanded: false,
    parentId: "1.1",
    isGroup: false,
    subtype: "bank",
    allowedCurrencies: ["YER", "SAR", "USD"]
  },
  {
    id: "1.1.3",
    name: "الكريمي صنعاء - حساب جاري",
    type: "asset",
    level: 3,
    balance: 0,
    hasChildren: false,
    expanded: false,
    parentId: "1.1",
    isGroup: false,
    subtype: "bank",
    allowedCurrencies: ["YER", "SAR", "USD"]
  },
  {
    id: "1.1.4",
    name: "الكريمي صنعاء - حساب توفير",
    type: "asset",
    level: 3,
    balance: 0,
    hasChildren: false,
    expanded: false,
    parentId: "1.1",
    isGroup: false,
    subtype: "bank",
    allowedCurrencies: ["YER", "SAR", "USD"]
  },
  // Exchange Accounts
  {
    id: "1.2.1",
    name: "الحوشبي للصرافة",
    type: "asset",
    level: 3,
    balance: 0,
    hasChildren: false,
    expanded: false,
    parentId: "1.2",
    isGroup: false,
    subtype: "bank",
    allowedCurrencies: ["YER", "SAR", "USD"]
  },
  // Wallet Accounts
  {
    id: "1.3.1",
    name: "محفظة جوالي - 774424555",
    type: "asset",
    level: 3,
    balance: 0,
    hasChildren: false,
    expanded: false,
    parentId: "1.3",
    isGroup: false,
    subtype: "bank",
    allowedCurrencies: ["YER", "SAR", "USD"]
  },
  {
    id: "1.3.2",
    name: "محفظة جوالي - 771506017",
    type: "asset",
    level: 3,
    balance: 0,
    hasChildren: false,
    expanded: false,
    parentId: "1.3",
    isGroup: false,
    subtype: "bank",
    allowedCurrencies: ["YER", "SAR", "USD"]
  },
  {
    id: "1.3.3",
    name: "محفظة جيب",
    type: "asset",
    level: 3,
    balance: 0,
    hasChildren: false,
    expanded: false,
    parentId: "1.3",
    isGroup: false,
    subtype: "bank",
    allowedCurrencies: ["YER", "SAR", "USD"]
  },
  {
    id: "1.3.4",
    name: "محفظة ون كاش",
    type: "asset",
    level: 3,
    balance: 0,
    hasChildren: false,
    expanded: false,
    parentId: "1.3",
    isGroup: false,
    subtype: "bank",
    allowedCurrencies: ["YER", "SAR", "USD"]
  }
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
  const [editingAccountId, setEditingAccountId] = useState<string | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

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
    subtype: "general",
    allowedCurrencies: ["YER", "SAR", "USD"] as string[] // العملات المسموح بها
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

    // Check if we're editing an existing account
    if (editingAccountId) {
      // Update existing account
      const parent = accounts.find(a => a.id === newAccount.parent);
      const level = parent ? parent.level + 1 : 1;
      
      setAccounts(accounts.map(acc => 
        acc.id === editingAccountId ? {
          ...acc,
          id: newAccount.code,
          name: newAccount.name,
          type: newAccount.type,
          level: level,
          parentId: newAccount.parent === "none" ? null : newAccount.parent,
          isGroup: newAccount.isGroup,
          subtype: newAccount.subtype,
          allowedCurrencies: newAccount.allowedCurrencies || ["YER", "SAR", "USD"],
          entityId: currentEntity.type === 'unit' ? currentEntity.id : currentEntity.type === 'branch' ? currentEntity.parentId || undefined : undefined
        } : acc
      ));
      toast.success("تم تحديث الحساب بنجاح");
    } else {
      // Add new account
      const parent = accounts.find(a => a.id === newAccount.parent);
      
      // Validation: Cannot add child to a non-group account
      if (parent && !parent.isGroup) {
        toast.error("لا يمكن إضافة حساب فرعي لحساب ليس رئيسياً (مجموعة)");
        return;
      }

      const level = parent ? parent.level + 1 : 1;
      
      const newAcc: Account = {
        id: newAccount.code,
        name: newAccount.name,
        type: newAccount.type,
        level: level,
        balance: 0,
        hasChildren: false,
        expanded: false,
        parentId: newAccount.parent === "none" ? null : newAccount.parent,
        isGroup: newAccount.isGroup,
        subtype: newAccount.subtype,
        allowedCurrencies: newAccount.allowedCurrencies || ["YER", "SAR", "USD"],
        entityId: currentEntity.type === 'unit' ? currentEntity.id : currentEntity.type === 'branch' ? currentEntity.parentId || undefined : undefined
      };

      // If adding to a parent, update parent to have children and be expanded
      let updatedAccounts = [...accounts];
      if (parent) {
        updatedAccounts = updatedAccounts.map(acc => 
          acc.id === parent.id ? { ...acc, hasChildren: true, expanded: true } : acc
        );
      }

      updatedAccounts.push(newAcc);
      setAccounts(updatedAccounts);
      toast.success("تم إضافة الحساب بنجاح");
    }

    // Reset form
    setIsNewAccountOpen(false);
    setEditingAccountId(null);
    setNewAccount({ 
      name: "", 
      code: "", 
      type: "asset", 
      parent: "none", 
      isGroup: true, 
      subtype: "general",
      allowedCurrencies: ["YER", "SAR", "USD"]
    });
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

  const handleEditAccount = (account: any) => {
    // Set the form to edit mode with the selected account data
    setNewAccount({
      name: account.name,
      code: account.id,
      type: account.type,
      parent: account.parentId || 'none',
      isGroup: account.isGroup,
      subtype: account.subtype || '',
      allowedCurrencies: account.allowedCurrencies || ["YER", "SAR", "USD"]
    });
    setEditingAccountId(account.id);
    setIsNewAccountOpen(true);
  };

  // Helper to check if an account should be visible based on parent expansion
  const isVisible = (account: any): boolean => {
    if (!account.parentId) return true;
    const parent = accounts.find(a => a.id === account.parentId);
    return parent ? (parent.expanded && isVisible(parent)) : true;
  };

  // Filter accounts based on current entity
  const filteredAccountsByEntity = accounts.filter(account => {
    // إذا كانت الشركة القابضة، اعرض جميع الحسابات
    if (currentEntity.type === 'holding') return true;
    
    // إذا كانت وحدة، اعرض فقط حسابات هذه الوحدة
    if (currentEntity.type === 'unit') {
      return account.entityId === currentEntity.id || !account.entityId; // عرض الحسابات العامة أيضاً
    }
    
    // إذا كان فرع، اعرض حسابات الوحدة الأم
    if (currentEntity.type === 'branch' && currentEntity.parentId) {
      return account.entityId === currentEntity.parentId || !account.entityId;
    }
    
    return !account.entityId; // عرض الحسابات العامة فقط
  });

  // Filter accounts for parent selection (only Groups can be parents)
  const groupAccounts = filteredAccountsByEntity.filter(a => a.isGroup);

  // Get visible accounts for rendering
  const visibleAccounts = filteredAccountsByEntity.filter(isVisible);

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (!over || active.id === over.id) return;

    setAccounts((items) => {
      const oldIndex = items.findIndex((item) => item.id === active.id);
      const newIndex = items.findIndex((item) => item.id === over.id);
      
      if (oldIndex === -1 || newIndex === -1) return items;

      // 1. Identify the block to move (item + all its descendants)
      const activeItem = items[oldIndex];
      let blockSize = 1;
      
      // Iterate starting from the next item
      for (let i = oldIndex + 1; i < items.length; i++) {
        // If the item has a deeper level, it's a descendant (assuming strict order)
        if (items[i].level > activeItem.level) {
          blockSize++;
        } else {
          // Found a sibling or parent (level <= activeItem.level), stop
          break;
        }
      }
      
      // 2. Extract the block
      const newItems = [...items];
      const block = newItems.splice(oldIndex, blockSize);
      
      // 3. Find the new insertion index in the modified array
      // We need to find where the 'over' item ended up
      let targetIndex = newItems.findIndex(item => item.id === over.id);
      
      if (targetIndex === -1) {
        // Should not happen unless we dragged onto a descendant (which is hidden/removed)
        return items; 
      }

      // If we are dragging down (original position was above new position),
      // we generally want to insert AFTER the target item.
      // However, if the target item has children, we might want to skip them too?
      // For simplicity in this "reorder" mode, we insert immediately after/before the target row.
      // If dragging down: insert after target.
      // If dragging up: insert before target.
      
      if (oldIndex < newIndex) {
        targetIndex += 1;
      }
      
      // Insert the block at the new position
      newItems.splice(targetIndex, 0, ...block);
      
      return newItems;
    });
  };

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
          
          <Dialog open={isNewAccountOpen} onOpenChange={(open) => {
            setIsNewAccountOpen(open);
            if (!open) {
              setEditingAccountId(null);
              setNewAccount({ 
                name: "", 
                code: "", 
                type: "asset", 
                parent: "none", 
                isGroup: true, 
                subtype: "general" 
              });
            }
          }}>
            <DialogContent className="max-w-2xl flex flex-col p-0 gap-0" style={{maxHeight: '90vh'}}>
              <DialogHeader className="p-6 pb-2 border-b">
                <DialogTitle>{editingAccountId ? "تعديل الحساب" : "إضافة حساب جديد"}</DialogTitle>
                <DialogDescription>
                  {editingAccountId ? "قم بتعديل بيانات الحساب." : "أدخل تفاصيل الحساب الجديد لإضافته إلى الشجرة."}
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-6 p-6 overflow-y-auto" style={{flex: '1 1 auto', minHeight: 0}}>
                
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
                      <p className="text-xs text-muted-foreground">يستخدم لتسجيل العمليات المالية والقيود اليومية.</p>
                    </div>
                  </div>
                </div>

                {/* Subtype Selection (Only for Ledger Accounts) */}
                {!newAccount.isGroup && (
                  <div className="grid grid-cols-4 items-center gap-4 animate-in fade-in slide-in-from-top-2">
                    <Label htmlFor="subtype" className="text-right font-bold">تصنيف الحساب</Label>
                    <div className="col-span-3">
                      <Select 
                        value={newAccount.subtype} 
                        onValueChange={(value) => setNewAccount({...newAccount, subtype: value})}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="اختر تصنيف الحساب" />
                        </SelectTrigger>
                        <SelectContent>
                          {accountSubtypes.map((type) => (
                            <SelectItem key={type.value} value={type.value}>
                              <div className="flex items-center gap-2">
                                <type.icon className="w-4 h-4 text-muted-foreground" />
                                {type.label}
                              </div>
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <p className="text-xs text-muted-foreground mt-1">يساعد التصنيف في أتمتة العمليات والتقارير (مثل ربط العملاء والموردين).</p>
                    </div>
                  </div>
                )}

                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="name" className="text-right font-bold">اسم الحساب</Label>
                  <Input
                    id="name"
                    value={newAccount.name}
                    onChange={(e) => setNewAccount({...newAccount, name: e.target.value})}
                    className="col-span-3"
                    placeholder="مثال: الصندوق الرئيسي"
                  />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="code" className="text-right font-bold">رمز الحساب</Label>
                  <Input
                    id="code"
                    value={newAccount.code}
                    onChange={(e) => setNewAccount({...newAccount, code: e.target.value})}
                    className="col-span-3"
                    placeholder="مثال: 1101"
                  />
                </div>
                {/* طبيعة الحساب - يظهر فقط للحسابات الفرعية */}
                {newAccount.isGroup === false && (
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="type" className="text-right font-bold">طبيعة الحساب</Label>
                    <Select 
                      value={newAccount.type} 
                      onValueChange={(value) => setNewAccount({...newAccount, type: value})}
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
                )}
                
                {/* العملات - يظهر فقط للحسابات الفرعية */}
                {newAccount.isGroup === false && (
                  <div className="space-y-4">
                    <div className="grid grid-cols-4 items-start gap-4">
                      <Label className="text-right font-bold pt-2">العملات المدعومة</Label>
                      <div className="col-span-3 space-y-3">
                        <div className="flex items-center space-x-2 space-x-reverse">
                          <Checkbox 
                            id="currency-yer"
                            checked={newAccount.currencies.includes("YER")}
                            onCheckedChange={(checked) => {
                              if (checked) {
                                setNewAccount({...newAccount, currencies: [...newAccount.currencies, "YER"]});
                              } else {
                                setNewAccount({...newAccount, currencies: newAccount.currencies.filter(c => c !== "YER")});
                              }
                            }}
                          />
                          <label htmlFor="currency-yer" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                            ريال يمني (YER)
                          </label>
                        </div>
                        <div className="flex items-center space-x-2 space-x-reverse">
                          <Checkbox 
                            id="currency-sar"
                            checked={newAccount.currencies.includes("SAR")}
                            onCheckedChange={(checked) => {
                              if (checked) {
                                setNewAccount({...newAccount, currencies: [...newAccount.currencies, "SAR"]});
                              } else {
                                setNewAccount({...newAccount, currencies: newAccount.currencies.filter(c => c !== "SAR")});
                              }
                            }}
                          />
                          <label htmlFor="currency-sar" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                            ريال سعودي (SAR)
                          </label>
                        </div>
                        <div className="flex items-center space-x-2 space-x-reverse">
                          <Checkbox 
                            id="currency-usd"
                            checked={newAccount.currencies.includes("USD")}
                            onCheckedChange={(checked) => {
                              if (checked) {
                                setNewAccount({...newAccount, currencies: [...newAccount.currencies, "USD"]});
                              } else {
                                setNewAccount({...newAccount, currencies: newAccount.currencies.filter(c => c !== "USD")});
                              }
                            }}
                          />
                          <label htmlFor="currency-usd" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                            دولار أمريكي (USD)
                          </label>
                        </div>
                      </div>
                    </div>
                    
                    {/* العملة الافتراضية */}
                    {newAccount.currencies.length > 0 && (
                      <div className="grid grid-cols-4 items-start gap-4">
                        <Label className="text-right font-bold pt-2">العملة الافتراضية</Label>
                        <RadioGroup 
                          value={newAccount.defaultCurrency} 
                          onValueChange={(value) => setNewAccount({...newAccount, defaultCurrency: value})}
                          className="col-span-3 space-y-2"
                        >
                          {newAccount.currencies.includes("YER") && (
                            <div className="flex items-center space-x-2 space-x-reverse">
                              <RadioGroupItem value="YER" id="default-yer" />
                              <label htmlFor="default-yer" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                                ريال يمني
                              </label>
                            </div>
                          )}
                          {newAccount.currencies.includes("SAR") && (
                            <div className="flex items-center space-x-2 space-x-reverse">
                              <RadioGroupItem value="SAR" id="default-sar" />
                              <label htmlFor="default-sar" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                                ريال سعودي
                              </label>
                            </div>
                          )}
                          {newAccount.currencies.includes("USD") && (
                            <div className="flex items-center space-x-2 space-x-reverse">
                              <RadioGroupItem value="USD" id="default-usd" />
                              <label htmlFor="default-usd" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                                دولار أمريكي
                              </label>
                            </div>
                          )}
                        </RadioGroup>
                      </div>
                    )}
                  </div>
                )}

                {/* حقل مجموعة الحسابات (اختياري) - يظهر فقط للحسابات الفرعية */}
                {!newAccount.isGroup && (
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="accountGroup" className="text-right font-bold">مجموعة الحسابات (اختياري)</Label>
                    <Select 
                      value={newAccount.accountGroup} 
                      onValueChange={(value) => setNewAccount({...newAccount, accountGroup: value})}
                    >
                      <SelectTrigger className="col-span-3">
                        <SelectValue placeholder="اختر مجموعة الحسابات" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="none">بدون مجموعة</SelectItem>
                        <SelectItem value="1">أعمال الموظفين</SelectItem>
                        <SelectItem value="2">أعمال الموظفين الدهمية</SelectItem>
                        <SelectItem value="3">أعمال الموظفين الصبالية</SelectItem>
                        <SelectItem value="4">أعمال الموظفين غليل</SelectItem>
                        {/* سيتم تحميل المجموعات من API لاحقاً */}
                      </SelectContent>
                    </Select>
                  </div>
                )}
                
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="parent" className="text-right font-bold">الحساب الرئيسي</Label>
                  <Select 
                    value={newAccount.parent} 
                    onValueChange={(value) => setNewAccount({...newAccount, parent: value})}
                  >
                    <SelectTrigger className="col-span-3">
                      <SelectValue placeholder="اختر الحساب الرئيسي" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">بدون (حساب رئيسي)</SelectItem>
                      {groupAccounts.map((acc) => (
                        <SelectItem key={acc.id} value={acc.id}>
                          {acc.id} - {acc.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <DialogFooter className="p-6 border-t bg-background flex gap-2 justify-end" style={{flexShrink: 0}}>
                <Button variant="outline" onClick={() => setIsNewAccountOpen(false)}>إلغاء</Button>
                <Button onClick={handleAddAccount} className="bg-blue-600 hover:bg-blue-700 text-white">{editingAccountId ? "تحديث الحساب" : "حفظ الحساب"}</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>

          <Button 
            onClick={() => setIsNewAccountOpen(true)} 
            className="bg-emerald-600 hover:bg-emerald-700 text-white gap-2"
          >
            <Plus className="w-4 h-4" />
            إضافة حساب
          </Button>
          
          <Button variant="outline" size="icon" onClick={() => setAccounts(accounts.map(a => ({...a, expanded: false})))}>
            <FolderTree className="w-4 h-4" />
          </Button>
        </div>
      </div>

      <div className="flex gap-4 items-center bg-muted/30 p-4 rounded-lg border">
        <div className="relative flex-1">
          <Search className="absolute right-3 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input placeholder="بحث في الحسابات..." className="pr-9 bg-background" />
        </div>
        <Button variant="outline" size="icon">
          <Filter className="w-4 h-4" />
        </Button>
      </div>

      <div className="border rounded-lg overflow-hidden bg-card shadow-sm">
        <DndContext 
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragEnd={handleDragEnd}
        >
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/50 hover:bg-muted/50">
                <TableHead className="w-[40px]"></TableHead>
                <TableHead className="w-[300px] text-right">اسم الحساب</TableHead>
                <TableHead className="text-right">الرمز</TableHead>
                <TableHead className="text-right">النوع</TableHead>
                <TableHead className="text-right">التصنيف</TableHead>
                <TableHead className="text-right">الرصيد</TableHead>
                <TableHead className="w-[50px]"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              <SortableContext 
                items={visibleAccounts.map(a => a.id)}
                strategy={verticalListSortingStrategy}
              >
                {visibleAccounts.map((account) => (
                  <SortableRow key={account.id} id={account.id}>
                    <TableCell className="font-medium">
                      <div 
                        className="flex items-center gap-2"
                        style={{ paddingRight: `${(account.level - 1) * 24}px` }}
                      >
                        {account.hasChildren ? (
                          <button 
                            onClick={() => toggleExpand(account.id)}
                            className="p-1 hover:bg-muted rounded-sm transition-colors"
                          >
                            {account.expanded ? (
                              <ChevronDown className="w-4 h-4 text-muted-foreground" />
                            ) : (
                              <ChevronRight className="w-4 h-4 text-muted-foreground" />
                            )}
                          </button>
                        ) : (
                          <span className="w-6" />
                        )}
                        
                        {account.isGroup ? (
                          <Folder className={`w-4 h-4 ${account.expanded ? 'text-amber-500' : 'text-amber-400/80'}`} />
                        ) : (
                          <FileText className="w-4 h-4 text-blue-500" />
                        )}
                        
                        <span className={account.isGroup ? "font-bold text-foreground" : "text-muted-foreground"}>
                          {account.name}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <span className="font-mono text-sm bg-muted px-2 py-1 rounded">
                        {account.id}
                      </span>
                    </TableCell>
                    <TableCell>
                      <Badge 
                        variant="secondary" 
                        className={`${typeMap[account.type]?.color} border`}
                      >
                        {typeMap[account.type]?.label}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {!account.isGroup && account.subtype && (
                        <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
                          {(() => {
                            const subtype = accountSubtypes.find(s => s.value === account.subtype);
                            if (!subtype) return null;
                            const Icon = subtype.icon;
                            return (
                              <>
                                <Icon className="w-3.5 h-3.5" />
                                <span>{subtype.label}</span>
                              </>
                            );
                          })()}
                        </div>
                      )}
                    </TableCell>
                    <TableCell>
                      <span className={account.balance < 0 ? "text-red-600 font-medium" : "font-medium"}>
                        {account.balance.toLocaleString('en-US', { minimumFractionDigits: 2 })} ر.س
                      </span>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2 justify-end">
                        <Button 
                          variant="ghost" 
                          size="sm"
                          className="h-8 px-3 text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                          onClick={() => handleEditAccount(account)}
                        >
                          <Edit className="h-4 w-4 ml-1" />
                          تعديل
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="sm"
                          className="h-8 px-3 text-red-600 hover:text-red-700 hover:bg-red-50"
                          onClick={() => handleDeleteAccount(account.id)}
                        >
                          <Trash2 className="h-4 w-4 ml-1" />
                          حذف
                        </Button>
                      </div>
                    </TableCell>
                  </SortableRow>
                ))}
              </SortableContext>
            </TableBody>
          </Table>
        </DndContext>
      </div>
    </div>
  );
}

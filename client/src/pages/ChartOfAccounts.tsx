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
  GripVertical
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
    // No auto-sorting to allow manual reordering
    // updatedAccounts.sort((a, b) => a.id.localeCompare(b.id));

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

  // Get visible accounts for rendering
  const visibleAccounts = accounts.filter(isVisible);

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
          
          <Dialog open={isNewAccountOpen} onOpenChange={setIsNewAccountOpen}>
            <DialogContent className="max-w-2xl h-[90vh] md:h-auto md:max-h-[85vh] flex flex-col p-0 gap-0">
              <DialogHeader className="p-6 pb-2 border-b">
                <DialogTitle>إضافة حساب جديد</DialogTitle>
                <DialogDescription>
                  أدخل تفاصيل الحساب الجديد لإضافته إلى الشجرة.
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-6 p-6 overflow-y-auto flex-1">
                
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
              <DialogFooter className="p-6 border-t bg-background mt-auto flex gap-2 justify-end sticky bottom-0 z-50">
                <Button variant="outline" onClick={() => setIsNewAccountOpen(false)}>إلغاء</Button>
                <Button onClick={handleAddAccount}>حفظ الحساب</Button>
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
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" className="h-8 w-8 p-0">
                            <span className="sr-only">Open menu</span>
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuLabel>إجراءات</DropdownMenuLabel>
                          <DropdownMenuItem onClick={() => navigator.clipboard.writeText(account.id)}>
                            نسخ الرمز
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem>تعديل</DropdownMenuItem>
                          <DropdownMenuItem 
                            className="text-red-600 focus:text-red-600"
                            onClick={() => handleDeleteAccount(account.id)}
                          >
                            حذف
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
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

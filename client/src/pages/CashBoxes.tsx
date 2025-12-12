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
import { useState } from "react";
import { toast } from "sonner";
import { useEntity } from "@/contexts/EntityContext";
import { initialAccountsData } from "./ChartOfAccounts";

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
  const [cashBoxes, setCashBoxes] = useState(initialCashBoxes);
  const [isNewBoxOpen, setIsNewBoxOpen] = useState(false);
  const [isEditBoxOpen, setIsEditBoxOpen] = useState(false);
  const [editingBox, setEditingBox] = useState<any>(null);

  const [newBox, setNewBox] = useState({
    name: "",
    currency: "SAR",
    type: "cash_box", // cash_box or petty_cash
    accountId: "", // حساب من الدليل
    branchId: "", // الفرع المربوط
    responsiblePerson: "" // مسؤول الصندوق
  });

  // Get cash accounts from chart of accounts
  const cashAccounts = initialAccountsData.filter(account => 
    account.subtype === 'cash' && 
    !account.isGroup && 
    account.entityId === currentEntity.id
  );

  // Filter cash boxes based on current entity
  // In a real app, this would be a backend query. Here we filter by an 'entityId' property we'll add.
  const visibleCashBoxes = cashBoxes.filter(box => {
    // الشركة القابضة ليس لها صناديق
    if (currentEntity.type === 'holding') return false;
    
    // فقط عرض صناديق الوحدة الحالية
    if (box.entityId !== currentEntity.id) return false;
    
    return true;
  });

  const handleAddBox = () => {
    if (!newBox.name) {
      toast.error("يرجى إدخال اسم الصندوق");
      return;
    }

    const newId = `111${cashBoxes.length + 1}`; // Simple ID generation
    const box = {
      id: newId,
      entityId: currentEntity.id, // Associate with current entity
      name: newBox.name,
      balance: 0.00,
      currency: newBox.currency,
      type: newBox.type,
      accountId: newBox.accountId,
      branchId: newBox.branchId,
      responsiblePerson: newBox.responsiblePerson,
      status: "active",
      lastTransaction: "-"
    };

    setCashBoxes([...cashBoxes, box]);
    toast.success("تم إضافة الصندوق بنجاح");
    setIsNewBoxOpen(false);
    setNewBox({ name: "", currency: "SAR", type: "cash_box", accountId: "", branchId: "", responsiblePerson: "" });
  };

  const handleEditBox = () => {
    if (!editingBox || !editingBox.name) {
      toast.error("يرجى إدخال اسم الصندوق");
      return;
    }

    setCashBoxes(cashBoxes.map(box => 
      box.id === editingBox.id ? editingBox : box
    ));
    
    toast.success("تم تحديث بيانات الصندوق بنجاح");
    setIsEditBoxOpen(false);
    setEditingBox(null);
  };

  const handleDeleteBox = (id: string) => {
    const box = cashBoxes.find(b => b.id === id);
    if (box && box.balance !== 0) {
      toast.error("لا يمكن حذف صندوق يحتوي على رصيد. يرجى تصفير الرصيد أولاً.");
      return;
    }

    if (confirm("هل أنت متأكد من حذف هذا الصندوق؟")) {
      setCashBoxes(cashBoxes.filter(b => b.id !== id));
      toast.success("تم حذف الصندوق بنجاح");
    }
  };

  const openEditDialog = (box: any) => {
    setEditingBox({ ...box });
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
                  <Label htmlFor="currency" className="text-right">العملة</Label>
                  <Select 
                    value={newBox.currency} 
                    onValueChange={(v) => setNewBox({...newBox, currency: v})}
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
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="accountId" className="text-right">حساب من الدليل</Label>
                  <Select 
                    value={newBox.accountId} 
                    onValueChange={(v) => setNewBox({...newBox, accountId: v})}
                  >
                    <SelectTrigger className="col-span-3">
                      <SelectValue placeholder="اختر الحساب المربوط" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">لا يوجد حساب</SelectItem>
                      {cashAccounts.map(account => (
                        <SelectItem key={account.id} value={account.id}>
                          {account.id} - {account.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
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
                  <Label htmlFor="edit-currency" className="text-right">العملة</Label>
                  <Select 
                    value={editingBox?.currency || "SAR"} 
                    onValueChange={(v) => setEditingBox((prev: any) => prev ? {...prev, currency: v} : null)}
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
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="edit-accountId" className="text-right">حساب من الدليل</Label>
                  <Select 
                    value={editingBox?.accountId || "none"} 
                    onValueChange={(v) => setEditingBox((prev: any) => prev ? {...prev, accountId: v} : null)}
                  >
                    <SelectTrigger className="col-span-3">
                      <SelectValue placeholder="اختر الحساب المربوط" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">لا يوجد حساب</SelectItem>
                      {cashAccounts.map(account => (
                        <SelectItem key={account.id} value={account.id}>
                          {account.id} - {account.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
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
              <TableHead>الرصيد الحالي</TableHead>
              <TableHead>آخر حركة</TableHead>
              <TableHead>الحالة</TableHead>
              <TableHead className="text-left">إجراءات</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {visibleCashBoxes.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                  لا توجد صناديق مسجلة لـ {currentEntity.name}. قم بإضافة صندوق جديد.
                </TableCell>
              </TableRow>
            ) : (
              visibleCashBoxes.map((box) => (
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
                    <span className="font-bold text-emerald-600">
                      {box.balance.toLocaleString()} {box.currency}
                    </span>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <History className="w-3 h-3" />
                      {box.lastTransaction}
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
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}

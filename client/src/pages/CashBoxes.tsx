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

// Initial clean data
const initialCashBoxes: any[] = [];
const recentTransactions: any[] = [];

export default function CashBoxes() {
  const [cashBoxes, setCashBoxes] = useState(initialCashBoxes);
  const [isNewBoxOpen, setIsNewBoxOpen] = useState(false);
  const [isEditBoxOpen, setIsEditBoxOpen] = useState(false);
  const [editingBox, setEditingBox] = useState<any>(null);

  const [newBox, setNewBox] = useState({
    name: "",
    currency: "SAR",
    type: "cash_box" // cash_box or petty_cash
  });

  const handleAddBox = () => {
    if (!newBox.name) {
      toast.error("يرجى إدخال اسم الصندوق");
      return;
    }

    const newId = `111${cashBoxes.length + 1}`; // Simple ID generation
    const box = {
      id: newId,
      name: newBox.name,
      balance: 0.00,
      currency: newBox.currency,
      status: "active",
      lastTransaction: "-"
    };

    setCashBoxes([...cashBoxes, box]);
    toast.success("تم إضافة الصندوق بنجاح");
    setIsNewBoxOpen(false);
    setNewBox({ name: "", currency: "SAR", type: "cash_box" });
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
          <p className="text-muted-foreground mt-1">إدارة الصناديق النقدية والعهد ومتابعة أرصدتها</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm">
            <Download className="w-4 h-4 ml-2" />
            تصدير
          </Button>
          
          <Dialog open={isNewBoxOpen} onOpenChange={setIsNewBoxOpen}>
            <DialogTrigger asChild>
              <Button size="sm">
                <Plus className="w-4 h-4 ml-2" />
                صندوق جديد
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>إضافة صندوق / عهدة جديدة</DialogTitle>
                <DialogDescription>
                  أدخل بيانات الصندوق الجديد أو العهدة لإضافتها للنظام.
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
                      <SelectItem value="SAR">ريال سعودي (SAR)</SelectItem>
                      <SelectItem value="USD">دولار أمريكي (USD)</SelectItem>
                      <SelectItem value="EUR">يورو (EUR)</SelectItem>
                    </SelectContent>
                  </Select>
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
                      <SelectItem value="SAR">ريال سعودي (SAR)</SelectItem>
                      <SelectItem value="USD">دولار أمريكي (USD)</SelectItem>
                      <SelectItem value="EUR">يورو (EUR)</SelectItem>
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

      <div className="grid gap-8 md:grid-cols-3">
        <div className="md:col-span-2 space-y-4">
          <h3 className="text-lg font-semibold flex items-center gap-2">
            <Wallet className="w-5 h-5 text-primary" />
            قائمة الصناديق
          </h3>
          <div className="rounded-md border bg-card shadow-sm overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>اسم الصندوق</TableHead>
                  <TableHead>الرصيد الحالي</TableHead>
                  <TableHead>آخر حركة</TableHead>
                  <TableHead>الحالة</TableHead>
                  <TableHead className="text-left">إجراءات</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {cashBoxes.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                      لا توجد صناديق مضافة. قم بإضافة صندوق جديد للبدء.
                    </TableCell>
                  </TableRow>
                ) : (
                  cashBoxes.map((box) => (
                    <TableRow key={box.id} className="hover:bg-muted/50 transition-colors">
                      <TableCell>
                        <div className="font-medium">{box.name}</div>
                        <div className="text-xs text-muted-foreground">#{box.id}</div>
                      </TableCell>
                      <TableCell>
                        <span className="font-bold text-emerald-600">
                          {box.balance.toLocaleString()} {box.currency}
                        </span>
                      </TableCell>
                      <TableCell className="text-muted-foreground text-sm">
                        {box.lastTransaction}
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className="bg-emerald-50 text-emerald-700 border-emerald-200">
                          نشط
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
                            <DropdownMenuItem>سند قبض</DropdownMenuItem>
                            <DropdownMenuItem>سند صرف</DropdownMenuItem>
                            <DropdownMenuItem>تحويل أموال</DropdownMenuItem>
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

        <div className="space-y-4">
          <h3 className="text-lg font-semibold flex items-center gap-2">
            <History className="w-5 h-5 text-primary" />
            آخر الحركات
          </h3>
          <div className="space-y-3">
            {recentTransactions.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground bg-card rounded-lg border border-dashed">
                لا توجد حركات حديثة
              </div>
            ) : (
              recentTransactions.map((trx) => (
                <div key={trx.id} className="bg-card p-3 rounded-lg border shadow-sm flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center ${trx.type === 'in' ? 'bg-emerald-100 text-emerald-600' : 'bg-rose-100 text-rose-600'}`}>
                      {trx.type === 'in' ? <ArrowDownLeft className="w-4 h-4" /> : <ArrowUpRight className="w-4 h-4" />}
                    </div>
                    <div>
                      <p className="text-sm font-medium">{trx.description}</p>
                      <p className="text-xs text-muted-foreground">{trx.box} • {trx.date}</p>
                    </div>
                  </div>
                  <span className={`text-sm font-bold ${trx.type === 'in' ? 'text-emerald-600' : 'text-rose-600'}`}>
                    {trx.type === 'in' ? '+' : '-'}{trx.amount.toLocaleString()}
                  </span>
                </div>
              ))
            )}
            {recentTransactions.length > 0 && (
              <Button variant="ghost" className="w-full text-muted-foreground text-sm">
                عرض كل الحركات
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

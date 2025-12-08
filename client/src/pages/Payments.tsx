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
  ArrowUpRight,
  ArrowDownRight,
  CreditCard,
  Wallet,
  Banknote,
  Calendar as CalendarIcon
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

// Mock data for Cash Boxes - should be fetched from API/Context in real app
const cashBoxes: any[] = [];

// Initial clean data
const initialPayments: any[] = [];

const methodMap: Record<string, { label: string, icon: any }> = {
  bank_transfer: { label: "تحويل بنكي", icon: CreditCard },
  check: { label: "شيك", icon: Banknote },
  cash: { label: "نقدي", icon: Wallet },
  credit_card: { label: "بطاقة ائتمان", icon: CreditCard },
};

export default function Payments() {
  const [payments, setPayments] = useState(initialPayments);
  const [isReceiveOpen, setIsReceiveOpen] = useState(false);
  const [isPayOpen, setIsPayOpen] = useState(false);

  // Form states
  const [formData, setFormData] = useState({
    box: "",
    party: "",
    amount: "",
    date: new Date().toISOString().split('T')[0],
    method: "cash",
    reference: ""
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSelectChange = (name: string, value: string) => {
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (type: 'in' | 'out') => {
    if (!formData.box || !formData.party || !formData.amount) {
      toast.error("الرجاء تعبئة الحقول المطلوبة (الصندوق، الطرف، المبلغ)");
      return;
    }

    const boxName = cashBoxes.find(b => b.id === formData.box)?.name || formData.box;

    const newPayment = {
      id: `PAY-00${payments.length + 1}`,
      party: formData.party,
      type: type,
      amount: parseFloat(formData.amount),
      date: formData.date,
      method: formData.method,
      reference: formData.reference || "-",
      box: boxName
    };

    setPayments([newPayment, ...payments]);
    toast.success(type === 'in' ? "تم إنشاء سند القبض بنجاح" : "تم إنشاء سند الصرف بنجاح");
    
    // Reset form and close dialog
    setFormData({
      box: "",
      party: "",
      amount: "",
      date: new Date().toISOString().split('T')[0],
      method: "cash",
      reference: ""
    });
    
    if (type === 'in') setIsReceiveOpen(false);
    else setIsPayOpen(false);
  };

  // Calculate totals
  const totalIn = payments.filter(p => p.type === 'in').reduce((sum, p) => sum + p.amount, 0);
  const totalOut = payments.filter(p => p.type === 'out').reduce((sum, p) => sum + p.amount, 0);
  const netFlow = totalIn - totalOut;

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">المدفوعات</h2>
          <p className="text-muted-foreground mt-1">سجل المقبوضات والمدفوعات</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm">
            <Download className="w-4 h-4 ml-2" />
            تصدير
          </Button>
          
          {/* Receive Payment Dialog */}
          <Dialog open={isReceiveOpen} onOpenChange={setIsReceiveOpen}>
            <DialogTrigger asChild>
              <Button size="sm" className="bg-emerald-600 hover:bg-emerald-700">
                <Plus className="w-4 h-4 ml-2" />
                سند قبض جديد
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
              <DialogHeader>
                <DialogTitle>إنشاء سند قبض جديد</DialogTitle>
                <DialogDescription>
                  أدخل تفاصيل المبلغ المستلم. يجب تحديد الصندوق أولاً.
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="box" className="text-right font-bold">الصندوق/الحساب</Label>
                  <Select onValueChange={(v) => handleSelectChange("box", v)} value={formData.box}>
                    <SelectTrigger className="col-span-3 border-emerald-200 bg-emerald-50">
                      <SelectValue placeholder="اختر الصندوق أو البنك" />
                    </SelectTrigger>
                    <SelectContent>
                      {cashBoxes.length === 0 ? (
                        <SelectItem value="none" disabled>لا توجد صناديق متاحة</SelectItem>
                      ) : (
                        cashBoxes.map(box => (
                          <SelectItem key={box.id} value={box.id}>{box.name}</SelectItem>
                        ))
                      )}
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="party" className="text-right">مستلم من</Label>
                  <Input id="party" name="party" value={formData.party} onChange={handleInputChange} className="col-span-3" placeholder="اسم العميل / الشركة" />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="amount" className="text-right">المبلغ</Label>
                  <Input id="amount" name="amount" type="number" value={formData.amount} onChange={handleInputChange} className="col-span-3" placeholder="0.00" />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="date" className="text-right">التاريخ</Label>
                  <Input id="date" name="date" type="date" value={formData.date} onChange={handleInputChange} className="col-span-3" />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="method" className="text-right">طريقة الدفع</Label>
                  <Select onValueChange={(v) => handleSelectChange("method", v)} defaultValue={formData.method}>
                    <SelectTrigger className="col-span-3">
                      <SelectValue placeholder="اختر طريقة الدفع" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="cash">نقدي</SelectItem>
                      <SelectItem value="bank_transfer">تحويل بنكي</SelectItem>
                      <SelectItem value="check">شيك</SelectItem>
                      <SelectItem value="credit_card">بطاقة ائتمان</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="reference" className="text-right">المرجع</Label>
                  <Input id="reference" name="reference" value={formData.reference} onChange={handleInputChange} className="col-span-3" placeholder="رقم الشيك / التحويل" />
                </div>
              </div>
              <DialogFooter>
                <Button type="submit" className="bg-emerald-600 hover:bg-emerald-700" onClick={() => handleSubmit('in')}>حفظ سند القبض</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>

          {/* Pay Payment Dialog */}
          <Dialog open={isPayOpen} onOpenChange={setIsPayOpen}>
            <DialogTrigger asChild>
              <Button size="sm" variant="destructive">
                <Plus className="w-4 h-4 ml-2" />
                سند صرف جديد
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
              <DialogHeader>
                <DialogTitle>إنشاء سند صرف جديد</DialogTitle>
                <DialogDescription>
                  أدخل تفاصيل المبلغ المدفوع. يجب تحديد الصندوق أولاً.
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="box-out" className="text-right font-bold">الصندوق/الحساب</Label>
                  <Select onValueChange={(v) => handleSelectChange("box", v)} value={formData.box}>
                    <SelectTrigger className="col-span-3 border-rose-200 bg-rose-50">
                      <SelectValue placeholder="اختر الصندوق أو البنك" />
                    </SelectTrigger>
                    <SelectContent>
                      {cashBoxes.length === 0 ? (
                        <SelectItem value="none" disabled>لا توجد صناديق متاحة</SelectItem>
                      ) : (
                        cashBoxes.map(box => (
                          <SelectItem key={box.id} value={box.id}>{box.name}</SelectItem>
                        ))
                      )}
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="party-out" className="text-right">مدفوع لـ</Label>
                  <Input id="party-out" name="party" value={formData.party} onChange={handleInputChange} className="col-span-3" placeholder="اسم المورد / المستفيد" />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="amount-out" className="text-right">المبلغ</Label>
                  <Input id="amount-out" name="amount" type="number" value={formData.amount} onChange={handleInputChange} className="col-span-3" placeholder="0.00" />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="date-out" className="text-right">التاريخ</Label>
                  <Input id="date-out" name="date" type="date" value={formData.date} onChange={handleInputChange} className="col-span-3" />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="method-out" className="text-right">طريقة الدفع</Label>
                  <Select onValueChange={(v) => handleSelectChange("method", v)} defaultValue={formData.method}>
                    <SelectTrigger className="col-span-3">
                      <SelectValue placeholder="اختر طريقة الدفع" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="cash">نقدي</SelectItem>
                      <SelectItem value="bank_transfer">تحويل بنكي</SelectItem>
                      <SelectItem value="check">شيك</SelectItem>
                      <SelectItem value="credit_card">بطاقة ائتمان</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="reference-out" className="text-right">المرجع</Label>
                  <Input id="reference-out" name="reference" value={formData.reference} onChange={handleInputChange} className="col-span-3" placeholder="رقم الشيك / التحويل" />
                </div>
              </div>
              <DialogFooter>
                <Button type="submit" variant="destructive" onClick={() => handleSubmit('out')}>حفظ سند الصرف</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">إجمالي المقبوضات (هذا الشهر)</CardTitle>
            <ArrowUpRight className="h-4 w-4 text-emerald-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-emerald-600">{totalIn.toLocaleString()} ر.س</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">إجمالي المدفوعات (هذا الشهر)</CardTitle>
            <ArrowDownRight className="h-4 w-4 text-rose-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-rose-600">{totalOut.toLocaleString()} ر.س</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">صافي التدفق النقدي</CardTitle>
            <Wallet className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${netFlow >= 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
              {netFlow.toLocaleString()} ر.س
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="flex flex-col sm:flex-row gap-4 items-center justify-between bg-card p-4 rounded-lg border shadow-sm">
        <div className="relative w-full sm:w-96">
          <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input placeholder="بحث برقم السند أو الاسم..." className="pr-9" />
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
              <TableHead>رقم السند</TableHead>
              <TableHead>الطرف</TableHead>
              <TableHead>الصندوق/الحساب</TableHead>
              <TableHead>التاريخ</TableHead>
              <TableHead>طريقة الدفع</TableHead>
              <TableHead>المبلغ</TableHead>
              <TableHead className="text-left">إجراءات</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {payments.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                  لا توجد سندات مسجلة. قم بإنشاء سند قبض أو صرف جديد.
                </TableCell>
              </TableRow>
            ) : (
              payments.map((payment) => {
                const MethodIcon = methodMap[payment.method]?.icon || Wallet;
                return (
                  <TableRow key={payment.id} className="hover:bg-muted/50 transition-colors">
                    <TableCell className="font-medium">{payment.id}</TableCell>
                    <TableCell>{payment.party}</TableCell>
                    <TableCell>
                      <Badge variant="outline" className="font-normal">
                        {payment.box || "الصندوق الرئيسي"}
                      </Badge>
                    </TableCell>
                    <TableCell>{payment.date}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <MethodIcon className="w-4 h-4 text-muted-foreground" />
                        <span>{methodMap[payment.method]?.label || payment.method}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <span className={`font-bold ${payment.type === 'in' ? 'text-emerald-600' : 'text-rose-600'}`}>
                        {payment.type === 'in' ? '+' : '-'}{payment.amount.toLocaleString()} ر.س
                      </span>
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
                          <DropdownMenuItem>عرض التفاصيل</DropdownMenuItem>
                          <DropdownMenuItem>طباعة السند</DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem className="text-destructive">إلغاء السند</DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}

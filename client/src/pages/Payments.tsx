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

// Initial data
const initialPayments = [
  { id: "PAY-001", party: "شركة التقنية الحديثة", type: "in", amount: 1200.00, date: "2025-01-18", method: "bank_transfer", reference: "REF-123456" },
  { id: "PAY-002", party: "شركة التوريدات العالمية", type: "out", amount: 5000.00, date: "2025-01-17", method: "check", reference: "CHK-987" },
  { id: "PAY-003", party: "سوبر ماركت السلام", type: "in", amount: 850.00, date: "2025-01-16", method: "cash", reference: "-" },
  { id: "PAY-004", party: "فاتورة كهرباء", type: "out", amount: 450.00, date: "2025-01-15", method: "bank_transfer", reference: "BILL-JAN" },
  { id: "PAY-005", party: "مكتبة المعرفة", type: "in", amount: 450.00, date: "2025-01-14", method: "credit_card", reference: "TXN-778899" },
];

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

  const handleSelectChange = (value: string) => {
    setFormData(prev => ({ ...prev, method: value }));
  };

  const handleSubmit = (type: 'in' | 'out') => {
    if (!formData.party || !formData.amount) {
      toast.error("الرجاء تعبئة الحقول المطلوبة");
      return;
    }

    const newPayment = {
      id: `PAY-00${payments.length + 1}`,
      party: formData.party,
      type: type,
      amount: parseFloat(formData.amount),
      date: formData.date,
      method: formData.method,
      reference: formData.reference || "-"
    };

    setPayments([newPayment, ...payments]);
    toast.success(type === 'in' ? "تم إنشاء سند القبض بنجاح" : "تم إنشاء سند الصرف بنجاح");
    
    // Reset form and close dialog
    setFormData({
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
                  أدخل تفاصيل المبلغ المستلم من العميل أو الطرف الآخر.
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
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
                  <Select onValueChange={handleSelectChange} defaultValue={formData.method}>
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
                  أدخل تفاصيل المبلغ المدفوع للمورد أو المصروفات.
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
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
                  <Select onValueChange={handleSelectChange} defaultValue={formData.method}>
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
            <Wallet className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${netFlow >= 0 ? 'text-primary' : 'text-rose-600'}`}>
              {netFlow.toLocaleString()} ر.س
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="flex flex-col sm:flex-row gap-4 items-center justify-between bg-card p-4 rounded-lg border shadow-sm">
        <div className="relative w-full sm:w-96">
          <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input placeholder="بحث برقم العملية أو الطرف..." className="pr-9" />
        </div>
        <div className="flex gap-2 w-full sm:w-auto">
          <Button variant="outline" size="sm" className="flex-1 sm:flex-none">
            <Filter className="w-4 h-4 ml-2" />
            تصفية
          </Button>
          <select className="h-9 rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50">
            <option>جميع السندات</option>
            <option>سندات قبض</option>
            <option>سندات صرف</option>
          </select>
        </div>
      </div>

      <div className="rounded-md border bg-card shadow-sm overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[120px]">رقم العملية</TableHead>
              <TableHead>الطرف</TableHead>
              <TableHead>التاريخ</TableHead>
              <TableHead>طريقة الدفع</TableHead>
              <TableHead>المرجع</TableHead>
              <TableHead>المبلغ</TableHead>
              <TableHead className="text-left">إجراءات</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {payments.map((payment) => {
              const method = methodMap[payment.method];
              const MethodIcon = method.icon;
              
              return (
                <TableRow key={payment.id} className="hover:bg-muted/50 transition-colors">
                  <TableCell className="font-medium">{payment.id}</TableCell>
                  <TableCell>{payment.party}</TableCell>
                  <TableCell>{payment.date}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <MethodIcon className="w-4 h-4 text-muted-foreground" />
                      <span>{method.label}</span>
                    </div>
                  </TableCell>
                  <TableCell className="text-muted-foreground text-sm">{payment.reference}</TableCell>
                  <TableCell>
                    <span className={`font-bold flex items-center gap-1 ${payment.type === 'in' ? 'text-emerald-600' : 'text-rose-600'}`}>
                      {payment.type === 'in' ? '+' : '-'} {payment.amount.toLocaleString()} ر.س
                    </span>
                    <span className="text-xs text-muted-foreground block mt-1">
                      {payment.type === 'in' ? 'سند قبض' : 'سند صرف'}
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
                        <DropdownMenuItem>طباعة الإيصال</DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem className="text-destructive">إلغاء العملية</DropdownMenuItem>
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

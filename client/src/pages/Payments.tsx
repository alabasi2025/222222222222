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
  AlertCircle,
  AlertTriangle
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
import { Alert, AlertDescription } from "@/components/ui/alert";

// Mock data - should be fetched from API/Context in real app
const cashBoxes = [
  { id: "1", name: "صندوق الرئيسي", type: "cash" },
  { id: "2", name: "صندوق الفرع", type: "cash" }
];

const banks = [
  { id: "3", name: "الكريمي الحديدة - حساب جاري", type: "bank" },
  { id: "4", name: "الكريمي الحديدة - حساب توفير", type: "bank" },
  { id: "5", name: "الكريمي صنعاء - حساب جاري", type: "bank" },
  { id: "6", name: "الكريمي صنعاء - حساب توفير", type: "bank" }
];

const exchanges = [
  { id: "7", name: "الحوشبي للصرافة", type: "exchange" }
];

const wallets = [
  { id: "8", name: "محفظة جوالي - 774424555", type: "wallet" },
  { id: "9", name: "محفظة جوالي - 771506017", type: "wallet" },
  { id: "10", name: "محفظة جيب", type: "wallet" },
  { id: "11", name: "محفظة ون كاش", type: "wallet" }
];

const initialPayments: any[] = [];

const methodMap: Record<string, { label: string, icon: any }> = {
  cash: { label: "نقدي", icon: Wallet },
  bank: { label: "بنكي", icon: CreditCard },
  wallet: { label: "محفظة", icon: Wallet },
  exchange: { label: "صراف", icon: Banknote },
};

// Currency rates data
const currencies = [
  { code: "YER", name: "ريال يمني", currentRate: 1, maxRate: 1, minRate: 1 },
  { code: "SAR", name: "ريال سعودي", currentRate: 140, maxRate: 145, minRate: 135 },
  { code: "USD", name: "دولار أمريكي", currentRate: 535, maxRate: 540, minRate: 530 }
];

export default function Payments() {
  const [payments, setPayments] = useState(initialPayments);
  const [isReceiveOpen, setIsReceiveOpen] = useState(false);
  const [isPayOpen, setIsPayOpen] = useState(false);

  // Form states
  const [formData, setFormData] = useState({
    method: "cash",
    account: "",
    party: "",
    amount: "",
    date: new Date().toISOString().split('T')[0],
    currency: "YER",
    exchangeRate: "1",
    reference: ""
  });

  const [rateError, setRateError] = useState("");
  const [rateWarning, setRateWarning] = useState("");

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    
    if (name === "exchangeRate") {
      validateExchangeRate(value, formData.currency);
    }
  };

  const handleSelectChange = (name: string, value: string) => {
    setFormData(prev => ({ ...prev, [name]: value }));
    
    // Reset account when method changes
    if (name === "method") {
      setFormData(prev => ({ ...prev, account: "" }));
    }
    
    // Auto-update exchange rate when currency changes
    if (name === "currency") {
      const currency = currencies.find(c => c.code === value);
      if (currency) {
        setFormData(prev => ({ ...prev, exchangeRate: currency.currentRate.toString() }));
        validateExchangeRate(currency.currentRate.toString(), value);
      }
    }
  };

  const validateExchangeRate = (rate: string, currencyCode: string) => {
    const rateNum = parseFloat(rate);
    const currency = currencies.find(c => c.code === currencyCode);
    
    if (!currency) return;
    
    setRateError("");
    setRateWarning("");
    
    if (rateNum > currency.maxRate) {
      setRateError(`سعر الصرف أعلى من الحد الأقصى المسموح (${currency.maxRate})`);
    } else if (rateNum < currency.minRate) {
      setRateError(`سعر الصرف أقل من الحد الأدنى المسموح (${currency.minRate})`);
    } else if (rateNum >= currency.maxRate - 2 || rateNum <= currency.minRate + 2) {
      setRateWarning(`تنبيه: سعر الصرف قريب من الحدود (المسموح: ${currency.minRate} - ${currency.maxRate})`);
    }
  };

  const getAccountsByMethod = (method: string) => {
    switch (method) {
      case "cash":
        return cashBoxes;
      case "bank":
        return banks;
      case "exchange":
        return exchanges;
      case "wallet":
        return wallets;
      default:
        return [];
    }
  };

  const handleSubmit = (type: 'in' | 'out') => {
    if (!formData.account || !formData.party || !formData.amount) {
      toast.error("الرجاء تعبئة جميع الحقول المطلوبة");
      return;
    }

    // Validate exchange rate
    if (rateError) {
      toast.error("لا يمكن حفظ السند: " + rateError);
      return;
    }

    const allAccounts = [...cashBoxes, ...banks, ...exchanges, ...wallets];
    const accountName = allAccounts.find(a => a.id === formData.account)?.name || formData.account;

    const newPayment = {
      id: `PAY-${payments.length + 1}`,
      type,
      party: formData.party,
      account: accountName,
      date: formData.date,
      method: formData.method,
      currency: formData.currency,
      exchangeRate: parseFloat(formData.exchangeRate),
      amount: parseFloat(formData.amount),
      reference: formData.reference
    };

    setPayments([newPayment, ...payments]);
    toast.success(type === 'in' ? "تم إنشاء سند القبض بنجاح" : "تم إنشاء سند الصرف بنجاح");
    
    // Reset form
    setFormData({
      method: "cash",
      account: "",
      party: "",
      amount: "",
      date: new Date().toISOString().split('T')[0],
      currency: "YER",
      exchangeRate: "1",
      reference: ""
    });
    setRateError("");
    setRateWarning("");
    
    if (type === 'in') {
      setIsReceiveOpen(false);
    } else {
      setIsPayOpen(false);
    }
  };

  const totalIn = payments.filter(p => p.type === 'in').reduce((sum, p) => sum + (p.amount * p.exchangeRate), 0);
  const totalOut = payments.filter(p => p.type === 'out').reduce((sum, p) => sum + (p.amount * p.exchangeRate), 0);
  const netFlow = totalIn - totalOut;

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">المدفوعات</h1>
          <p className="text-muted-foreground">سجل المقبوضات والمدفوعات</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm">
            <Download className="ml-2 h-4 w-4" />
            تصدير
          </Button>
          <Dialog open={isReceiveOpen} onOpenChange={setIsReceiveOpen}>
            <DialogTrigger asChild>
              <Button size="sm" className="bg-emerald-600 hover:bg-emerald-700">
                <Plus className="ml-2 h-4 w-4" />
                سند قبض جديد
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>إنشاء سند قبض جديد</DialogTitle>
                <DialogDescription>
                  أدخل تفاصيل المبلغ المستلم
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="method-in" className="text-right">نوع العملية</Label>
                  <Select onValueChange={(v) => handleSelectChange("method", v)} defaultValue={formData.method}>
                    <SelectTrigger className="col-span-3">
                      <SelectValue placeholder="اختر نوع العملية" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="cash">نقدي</SelectItem>
                      <SelectItem value="bank">بنكي</SelectItem>
                      <SelectItem value="wallet">محفظة</SelectItem>
                      <SelectItem value="exchange">صراف</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="account-in" className="text-right">
                    {formData.method === "cash" && "الصندوق"}
                    {formData.method === "bank" && "البنك"}
                    {formData.method === "wallet" && "المحفظة"}
                    {formData.method === "exchange" && "الصراف"}
                  </Label>
                  <Select onValueChange={(v) => handleSelectChange("account", v)} value={formData.account}>
                    <SelectTrigger className="col-span-3">
                      <SelectValue placeholder="اختر الحساب" />
                    </SelectTrigger>
                    <SelectContent>
                      {getAccountsByMethod(formData.method).map(account => (
                        <SelectItem key={account.id} value={account.id}>{account.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="party-in" className="text-right">مستلم من</Label>
                  <Input id="party-in" name="party" value={formData.party} onChange={handleInputChange} className="col-span-3" placeholder="اسم العميل / الشركة" />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="currency-in" className="text-right">العملة</Label>
                  <Select onValueChange={(v) => handleSelectChange("currency", v)} value={formData.currency}>
                    <SelectTrigger className="col-span-3">
                      <SelectValue placeholder="اختر العملة" />
                    </SelectTrigger>
                    <SelectContent>
                      {currencies.map(curr => (
                        <SelectItem key={curr.code} value={curr.code}>{curr.name} ({curr.code})</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                {formData.currency !== "YER" && (
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="exchangeRate-in" className="text-right">سعر الصرف</Label>
                    <div className="col-span-3 space-y-2">
                      <Input 
                        id="exchangeRate-in" 
                        name="exchangeRate" 
                        type="number" 
                        step="0.01"
                        value={formData.exchangeRate} 
                        onChange={handleInputChange} 
                        placeholder="سعر الصرف مقابل الريال اليمني" 
                      />
                      {rateError && (
                        <Alert variant="destructive">
                          <AlertCircle className="h-4 w-4" />
                          <AlertDescription>{rateError}</AlertDescription>
                        </Alert>
                      )}
                      {rateWarning && !rateError && (
                        <Alert className="border-yellow-500 text-yellow-700">
                          <AlertTriangle className="h-4 w-4" />
                          <AlertDescription>{rateWarning}</AlertDescription>
                        </Alert>
                      )}
                    </div>
                  </div>
                )}
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="amount-in" className="text-right">المبلغ</Label>
                  <Input id="amount-in" name="amount" type="number" value={formData.amount} onChange={handleInputChange} className="col-span-3" placeholder="0.00" />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="date-in" className="text-right">التاريخ</Label>
                  <Input id="date-in" name="date" type="date" value={formData.date} onChange={handleInputChange} className="col-span-3" />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="reference-in" className="text-right">المرجع</Label>
                  <Input id="reference-in" name="reference" value={formData.reference} onChange={handleInputChange} className="col-span-3" placeholder="رقم الشيك / التحويل" />
                </div>
              </div>
              <DialogFooter>
                <Button onClick={() => handleSubmit('in')} className="bg-emerald-600 hover:bg-emerald-700">حفظ سند القبض</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
          <Dialog open={isPayOpen} onOpenChange={setIsPayOpen}>
            <DialogTrigger asChild>
              <Button size="sm" variant="destructive">
                <Plus className="ml-2 h-4 w-4" />
                سند صرف جديد
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>إنشاء سند صرف جديد</DialogTitle>
                <DialogDescription>
                  أدخل تفاصيل المبلغ المدفوع
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="method-out" className="text-right">نوع العملية</Label>
                  <Select onValueChange={(v) => handleSelectChange("method", v)} defaultValue={formData.method}>
                    <SelectTrigger className="col-span-3">
                      <SelectValue placeholder="اختر نوع العملية" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="cash">نقدي</SelectItem>
                      <SelectItem value="bank">بنكي</SelectItem>
                      <SelectItem value="wallet">محفظة</SelectItem>
                      <SelectItem value="exchange">صراف</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="account-out" className="text-right">
                    {formData.method === "cash" && "الصندوق"}
                    {formData.method === "bank" && "البنك"}
                    {formData.method === "wallet" && "المحفظة"}
                    {formData.method === "exchange" && "الصراف"}
                  </Label>
                  <Select onValueChange={(v) => handleSelectChange("account", v)} value={formData.account}>
                    <SelectTrigger className="col-span-3">
                      <SelectValue placeholder="اختر الحساب" />
                    </SelectTrigger>
                    <SelectContent>
                      {getAccountsByMethod(formData.method).map(account => (
                        <SelectItem key={account.id} value={account.id}>{account.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="party-out" className="text-right">مدفوع إلى</Label>
                  <Input id="party-out" name="party" value={formData.party} onChange={handleInputChange} className="col-span-3" placeholder="اسم المورد / الشركة" />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="currency-out" className="text-right">العملة</Label>
                  <Select onValueChange={(v) => handleSelectChange("currency", v)} value={formData.currency}>
                    <SelectTrigger className="col-span-3">
                      <SelectValue placeholder="اختر العملة" />
                    </SelectTrigger>
                    <SelectContent>
                      {currencies.map(curr => (
                        <SelectItem key={curr.code} value={curr.code}>{curr.name} ({curr.code})</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                {formData.currency !== "YER" && (
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="exchangeRate-out" className="text-right">سعر الصرف</Label>
                    <div className="col-span-3 space-y-2">
                      <Input 
                        id="exchangeRate-out" 
                        name="exchangeRate" 
                        type="number" 
                        step="0.01"
                        value={formData.exchangeRate} 
                        onChange={handleInputChange} 
                        placeholder="سعر الصرف مقابل الريال اليمني" 
                      />
                      {rateError && (
                        <Alert variant="destructive">
                          <AlertCircle className="h-4 w-4" />
                          <AlertDescription>{rateError}</AlertDescription>
                        </Alert>
                      )}
                      {rateWarning && !rateError && (
                        <Alert className="border-yellow-500 text-yellow-700">
                          <AlertTriangle className="h-4 w-4" />
                          <AlertDescription>{rateWarning}</AlertDescription>
                        </Alert>
                      )}
                    </div>
                  </div>
                )}
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="amount-out" className="text-right">المبلغ</Label>
                  <Input id="amount-out" name="amount" type="number" value={formData.amount} onChange={handleInputChange} className="col-span-3" placeholder="0.00" />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="date-out" className="text-right">التاريخ</Label>
                  <Input id="date-out" name="date" type="date" value={formData.date} onChange={handleInputChange} className="col-span-3" />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="reference-out" className="text-right">المرجع</Label>
                  <Input id="reference-out" name="reference" value={formData.reference} onChange={handleInputChange} className="col-span-3" placeholder="رقم الشيك / التحويل" />
                </div>
              </div>
              <DialogFooter>
                <Button onClick={() => handleSubmit('out')} variant="destructive">حفظ سند الصرف</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">إجمالي المقبوضات (هذا الشهر)</CardTitle>
            <ArrowUpRight className="h-4 w-4 text-emerald-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-emerald-600">{totalIn.toFixed(2)} ر.ي</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">إجمالي المدفوعات (هذا الشهر)</CardTitle>
            <ArrowDownRight className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{totalOut.toFixed(2)} ر.ي</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">صافي التدفق النقدي</CardTitle>
            <Wallet className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${netFlow >= 0 ? 'text-emerald-600' : 'text-red-600'}`}>
              {netFlow.toFixed(2)} ر.ي
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Search and Filter */}
      <div className="flex gap-2">
        <div className="relative flex-1">
          <Search className="absolute right-3 top-3 h-4 w-4 text-muted-foreground" />
          <Input placeholder="بحث برقم السند أو الاسم..." className="pr-9" />
        </div>
        <Button variant="outline">
          <Filter className="ml-2 h-4 w-4" />
          تصفية
        </Button>
      </div>

      {/* Table */}
      <Card>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="text-right">رقم السند</TableHead>
              <TableHead className="text-right">الطرف</TableHead>
              <TableHead className="text-right">الصندوق/الحساب</TableHead>
              <TableHead className="text-right">التاريخ</TableHead>
              <TableHead className="text-right">طريقة الدفع</TableHead>
              <TableHead className="text-right">العملة</TableHead>
              <TableHead className="text-right">سعر الصرف</TableHead>
              <TableHead className="text-right">المبلغ</TableHead>
              <TableHead className="text-right">إجراءات</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {payments.length === 0 ? (
              <TableRow>
                <TableCell colSpan={9} className="text-center text-muted-foreground py-8">
                  لا توجد سندات مسجلة. قم بإنشاء سند قبض أو صرف جديد.
                </TableCell>
              </TableRow>
            ) : (
              payments.map((payment) => (
                <TableRow key={payment.id}>
                  <TableCell className="font-medium">{payment.id}</TableCell>
                  <TableCell>{payment.party}</TableCell>
                  <TableCell>{payment.account}</TableCell>
                  <TableCell>{payment.date}</TableCell>
                  <TableCell>
                    <Badge variant="outline">{methodMap[payment.method]?.label}</Badge>
                  </TableCell>
                  <TableCell>{payment.currency}</TableCell>
                  <TableCell>{payment.exchangeRate.toFixed(2)}</TableCell>
                  <TableCell className={payment.type === 'in' ? 'text-emerald-600 font-bold' : 'text-red-600 font-bold'}>
                    {payment.type === 'in' ? '+' : '-'}{payment.amount.toFixed(2)} {payment.currency}
                  </TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="h-8 w-8 p-0">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuLabel>إجراءات</DropdownMenuLabel>
                        <DropdownMenuItem>عرض التفاصيل</DropdownMenuItem>
                        <DropdownMenuItem>طباعة</DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem className="text-destructive">حذف</DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </Card>
    </div>
  );
}

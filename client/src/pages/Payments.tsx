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
  AlertTriangle,
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
import { useState, useEffect } from "react";
import { toast } from "sonner";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useEntity } from "@/contexts/EntityContext";
import { cashBoxesApi, banksWalletsApi, accountsApi, paymentsApi } from "@/lib/api";
import { getAccountTypes } from "@/lib/accountTypes";
import { getAccountSubtypes } from "@/lib/accountSubtypes";
import { Textarea } from "@/components/ui/textarea";
import { OnyxStyleTable } from "@/components/OnyxStyleTable";

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
  const { currentEntity } = useEntity();
  const [payments, setPayments] = useState(initialPayments);
  const [isReceiveOpen, setIsReceiveOpen] = useState(false);
  const [isPayOpen, setIsPayOpen] = useState(false);
  
  // Load accounts from API
  const [cashBoxes, setCashBoxes] = useState<any[]>([]);
  const [banksWallets, setBanksWallets] = useState<any[]>([]);
  const [chartAccounts, setChartAccounts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Form states for payment voucher (سند صرف)
  const [paymentFormData, setPaymentFormData] = useState({
    paymentType: "cash", // نوع الدفع: cash, cheque, transfer
    cashBox: "", // الصندوق (للنقد)
    bankWallet: "", // البنك/المحفظة (للشيك/التحويل)
    date: new Date().toISOString().split('T')[0], // التاريخ
    currency: "YER", // العملة
    exchangeRate: "1", // سعر الصرف
    reference: "", // المرجع
    chequeNumber: "", // رقم الشيك (للشيكات)
    transferReference: "" // مرجع التحويل (للتحويلات)
  });

  // Operations/Items for payment voucher (العمليات داخل السند)
  const [paymentOperations, setPaymentOperations] = useState<Array<{
    id: string;
    accountType: string;
    accountSubtype: string;
    chartAccount: string;
    analyticalAccount: string;
    amount: string;
    description: string;
  }>>([]);

  // Current operation being added/edited
  const [currentOperation, setCurrentOperation] = useState({
    accountType: "",
    accountSubtype: "",
    chartAccount: "",
    analyticalAccount: "",
    amount: "",
    description: ""
  });

  const [editingOperationId, setEditingOperationId] = useState<string | null>(null);

  // Form states for receive voucher (سند قبض)
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

  // Load data from API
  useEffect(() => {
    loadAccounts();
    loadPayments();
  }, [currentEntity.id]);

  const loadAccounts = async () => {
    try {
      setLoading(true);
      const [boxesData, walletsData, accountsData] = await Promise.all([
        cashBoxesApi.getAll(),
        banksWalletsApi.getAll(),
        accountsApi.getAll()
      ]);
      
      // Filter by current entity and normalize
      const filteredBoxes = boxesData.filter((box: any) => 
        box.entityId === currentEntity.id && box.isActive !== false
      );
      
      const filteredWallets = walletsData.filter((wallet: any) => 
        wallet.entityId === currentEntity.id && wallet.isActive !== false
      );
      
      // Filter chart accounts by entity
      const filteredAccounts = accountsData.filter((account: any) => {
        if (currentEntity.type === 'holding') {
          return !account.entityId; // Global accounts only
        }
        return account.entityId === currentEntity.id;
      });
      
      setCashBoxes(filteredBoxes);
      setBanksWallets(filteredWallets);
      setChartAccounts(filteredAccounts);
    } catch (error) {
      console.error('Failed to load accounts:', error);
      toast.error('فشل تحميل الحسابات');
    } finally {
      setLoading(false);
    }
  };

  const loadPayments = async () => {
    try {
      const paymentsData = await paymentsApi.getByEntity(currentEntity.id);
      
      // Transform API data to frontend format
      const transformedPayments = paymentsData.map((voucher: any) => ({
        id: voucher.id,
        type: voucher.type,
        party: voucher.operations?.[0]?.description || '-',
        account: voucher.cashBox?.name || '-',
        cashBox: voucher.cashBox?.name || '-',
        cashBoxId: voucher.cashBoxId,
        date: new Date(voucher.date).toISOString().split('T')[0],
        method: 'cash',
        currency: voucher.currency,
        exchangeRate: parseFloat(voucher.exchangeRate || '1'),
        amount: parseFloat(voucher.totalAmount),
        totalAmount: parseFloat(voucher.totalAmount),
        operations: voucher.operations || [],
        reference: voucher.reference,
      }));
      
      setPayments(transformedPayments);
    } catch (error) {
      console.error('Failed to load payments:', error);
      // Don't show error toast for initial load - might be empty
    }
  };

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

  // Handle payment form changes
  const handlePaymentFormChange = (name: string, value: string) => {
    setPaymentFormData(prev => {
      const updated = { ...prev, [name]: value };
      
      // Auto-update exchange rate when currency changes
      if (name === "currency") {
        const currency = currencies.find(c => c.code === value);
        if (currency) {
          updated.exchangeRate = currency.currentRate.toString();
          validateExchangeRate(currency.currentRate.toString(), value);
        } else {
          updated.exchangeRate = "1";
          setRateError("");
          setRateWarning("");
        }
      }
      
      // Validate exchange rate when it changes
      if (name === "exchangeRate") {
        validateExchangeRate(value, updated.currency);
      }
      
      return updated;
    });
  };

  // Get filtered chart accounts by type and subtype (for current operation)
  const getChartAccountsByTypeAndSubtype = (accountType?: string, accountSubtype?: string) => {
    const type = accountType || currentOperation.accountType;
    const subtype = accountSubtype || currentOperation.accountSubtype;
    if (!type || !subtype) return [];
    return chartAccounts.filter(acc => {
      // Check entity visibility
      if (currentEntity.type === 'holding') {
        // For holding company, show only global accounts
        return acc.type === type &&
               acc.subtype === subtype &&
               !acc.isGroup &&
               !acc.entityId;
      } else {
        // For units/branches, show accounts for current entity
        return acc.type === type &&
               acc.subtype === subtype &&
               !acc.isGroup &&
               acc.entityId === currentEntity.id;
      }
    });
  };

  // Get analytical accounts (child accounts) for selected chart account (for current operation)
  const getAnalyticalAccounts = (chartAccountId?: string) => {
    const accountId = chartAccountId || currentOperation.chartAccount;
    if (!accountId) return [];
    const selectedAccount = chartAccounts.find(acc => acc.id === accountId);
    if (!selectedAccount) return [];
    
    // Get child accounts (accounts with this account as parent)
    return chartAccounts.filter(acc => {
      if (acc.parentId !== accountId || acc.isGroup) return false;
      
      // Check entity visibility
      if (currentEntity.type === 'holding') {
        return !acc.entityId; // Global accounts only
      } else {
        return acc.entityId === currentEntity.id; // Entity-specific accounts
      }
    });
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
        // Return cash boxes (active ones)
        return cashBoxes.map(box => ({
          id: box.id,
          name: box.name,
          type: "cash"
        }));
      case "bank":
        // Return banks from banksWallets where type === 'bank'
        return banksWallets
          .filter(item => item.type === 'bank')
          .map(item => ({
            id: item.id,
            name: item.name,
            type: "bank"
          }));
      case "exchange":
        // Return exchanges from banksWallets where type === 'exchange'
        return banksWallets
          .filter(item => item.type === 'exchange')
          .map(item => ({
            id: item.id,
            name: item.name,
            type: "exchange"
          }));
      case "wallet":
        // Return wallets from banksWallets where type === 'wallet'
        return banksWallets
          .filter(item => item.type === 'wallet')
          .map(item => ({
            id: item.id,
            name: item.name,
            type: "wallet"
          }));
      default:
        return [];
    }
  };

  const handleSubmit = async (type: 'in' | 'out') => {
    if (!formData.account || !formData.party || !formData.amount) {
      toast.error("الرجاء تعبئة جميع الحقول المطلوبة");
      return;
    }

    // Validate exchange rate
    if (rateError) {
      toast.error("لا يمكن حفظ السند: " + rateError);
      return;
    }

    try {
      // Get account details
      const allAccounts = [
        ...getAccountsByMethod("cash"),
        ...getAccountsByMethod("bank"),
        ...getAccountsByMethod("exchange"),
        ...getAccountsByMethod("wallet")
      ];
      const selectedAccount = allAccounts.find(a => a.id === formData.account);
      
      if (!selectedAccount) {
        toast.error("الرجاء اختيار حساب صحيح");
        return;
      }

      // Get the chart account ID from cash box/bank/wallet
      let chartAccountId: string | null = null;
      
      if (formData.method === 'cash') {
        // For cash boxes, get accountId from cash box
        const cashBox = cashBoxes.find(box => box.id === formData.account);
        chartAccountId = cashBox?.accountId || null;
        if (!chartAccountId) {
          toast.error("الصندوق المحدد غير مربوط بحساب في دليل الحسابات");
          return;
        }
      } else {
        // For banks/wallets/exchange, get chartAccountId from banksWallets
        const bankWallet = banksWallets.find(item => item.id === formData.account);
        chartAccountId = bankWallet?.chartAccountId || null;
        if (!chartAccountId) {
          toast.error("الحساب المحدد غير مربوط بحساب في دليل الحسابات");
          return;
        }
      }

      // Get account details from chart of accounts
      const chartAccount = chartAccounts.find(acc => acc.id === chartAccountId);
      if (!chartAccount) {
        toast.error("حساب غير موجود في دليل الحسابات");
        return;
      }

      // For receipt voucher (in), we need to create a simple operation
      // Use the account type/subtype from the chart account
      const operationsData = [{
        accountType: chartAccount.type, // Use account type from chart account
        accountSubtype: chartAccount.subtype || 'general',
        chartAccountId: chartAccountId,
        analyticalAccountId: null,
        amount: parseFloat(formData.amount).toString(),
        description: formData.party
      }];

      // Determine cashBoxId based on method
      let cashBoxId: string | null = null;
      if (formData.method === 'cash') {
        cashBoxId = formData.account; // For cash, account ID is cash box ID
      }

      // Create voucher via API
      const voucherData = {
        entityId: currentEntity.id,
        type: type,
        cashBoxId: cashBoxId,
        date: formData.date,
        currency: formData.currency,
        exchangeRate: formData.exchangeRate || "1",
        totalAmount: parseFloat(formData.amount).toString(),
        reference: formData.reference || null,
        operations: operationsData,
        createdBy: 'admin', // TODO: Get from auth context
      };

      const createdVoucher = await paymentsApi.create(voucherData);

      // Transform API response to frontend format
      const newPayment = {
        id: createdVoucher.id,
        type: createdVoucher.type,
        party: createdVoucher.operations?.[0]?.description || formData.party,
        account: selectedAccount.name,
        cashBox: createdVoucher.cashBox?.name || selectedAccount.name,
        cashBoxId: createdVoucher.cashBoxId,
        date: new Date(createdVoucher.date).toISOString().split('T')[0],
        method: formData.method,
        currency: createdVoucher.currency,
        exchangeRate: parseFloat(createdVoucher.exchangeRate || '1'),
        amount: parseFloat(createdVoucher.totalAmount),
        totalAmount: parseFloat(createdVoucher.totalAmount),
        operations: createdVoucher.operations || [],
        reference: createdVoucher.reference,
      };

      setPayments([newPayment, ...payments]);
      toast.success(type === 'in' ? "تم إنشاء سند القبض بنجاح" : "تم إنشاء سند الصرف بنجاح");
      
      // Reload cash boxes to get updated balance
      loadAccounts();
      loadPayments();
      
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
    } catch (error: any) {
      console.error('Failed to create payment voucher:', error);
      toast.error(error.message || 'فشل إنشاء السند');
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
                      {loading ? (
                        <SelectItem value="loading" disabled>جاري التحميل...</SelectItem>
                      ) : getAccountsByMethod(formData.method).length === 0 ? (
                        <SelectItem value="no-accounts" disabled>
                          لا توجد {formData.method === "cash" ? "صناديق" : formData.method === "bank" ? "بنوك" : formData.method === "wallet" ? "محافظ" : "صرافات"} متاحة
                        </SelectItem>
                      ) : (
                        getAccountsByMethod(formData.method).map(account => (
                          <SelectItem key={account.id} value={account.id}>{account.name}</SelectItem>
                        ))
                      )}
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
            <DialogContent className="!max-w-[95vw] sm:!max-w-7xl max-h-[95vh] overflow-y-auto w-full">
              <DialogHeader className="border-b pb-4">
                <DialogTitle className="text-2xl font-bold">إنشاء سند صرف جديد</DialogTitle>
                <DialogDescription className="text-base mt-2">
                  أدخل تفاصيل المبلغ المدفوع والعمليات المرتبطة بالسند
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                {/* Header Information - Onyx Pro Style (Compact) */}
                <div className="grid grid-cols-12 gap-3 p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg border-2 border-blue-300 shadow-md">
                  {/* 0. نوع الدفع - NEW */}
                  <div className="col-span-3">
                    <Label htmlFor="paymentType-out" className="text-sm font-bold mb-2 block text-gray-700">نوع الدفع *</Label>
                    <Select 
                      onValueChange={(v) => {
                        handlePaymentFormChange("paymentType", v);
                        // Reset account fields when payment type changes
                        handlePaymentFormChange("cashBox", "");
                        handlePaymentFormChange("bankWallet", "");
                      }} 
                      value={paymentFormData.paymentType}
                    >
                      <SelectTrigger className="h-11 text-base">
                        <SelectValue placeholder="اختر نوع الدفع" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="cash">
                          <div className="flex items-center gap-2">
                            <Wallet className="h-4 w-4" />
                            نقدًا (Cash)
                          </div>
                        </SelectItem>
                        <SelectItem value="cheque">
                          <div className="flex items-center gap-2">
                            <CreditCard className="h-4 w-4" />
                            شيك (Cheque)
                          </div>
                        </SelectItem>
                        <SelectItem value="transfer">
                          <div className="flex items-center gap-2">
                            <Banknote className="h-4 w-4" />
                            تحويل بنكي (Bank Transfer)
                          </div>
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {/* 1. الصندوق / البنك - CONDITIONAL */}
                  <div className="col-span-3">
                    <Label htmlFor="account-out" className="text-sm font-bold mb-2 block text-gray-700">
                      {paymentFormData.paymentType === "cash" && "الصندوق *"}
                      {paymentFormData.paymentType === "cheque" && "البنك *"}
                      {paymentFormData.paymentType === "transfer" && "البنك/المحفظة *"}
                    </Label>
                    {paymentFormData.paymentType === "cash" ? (
                      <Select 
                        onValueChange={(v) => handlePaymentFormChange("cashBox", v)} 
                        value={paymentFormData.cashBox}
                      >
                        <SelectTrigger className="h-11 text-base">
                          <SelectValue placeholder="اختر الصندوق" />
                        </SelectTrigger>
                        <SelectContent>
                          {loading ? (
                            <SelectItem value="loading" disabled>جاري التحميل...</SelectItem>
                          ) : cashBoxes.length === 0 ? (
                            <SelectItem value="no-boxes" disabled>لا توجد صناديق متاحة</SelectItem>
                          ) : (
                            cashBoxes.map(box => (
                              <SelectItem key={box.id} value={box.id}>
                                {box.name} {box.currencies && box.currencies.length > 0 && (
                                  <span className="text-xs text-muted-foreground"> ({box.currencies.join(", ")})</span>
                                )}
                              </SelectItem>
                            ))
                          )}
                        </SelectContent>
                      </Select>
                    ) : (
                      <Select 
                        onValueChange={(v) => handlePaymentFormChange("bankWallet", v)} 
                        value={paymentFormData.bankWallet}
                      >
                        <SelectTrigger className="h-11 text-base">
                          <SelectValue placeholder={
                            paymentFormData.paymentType === "cheque" ? "اختر البنك" : "اختر البنك/المحفظة"
                          } />
                        </SelectTrigger>
                        <SelectContent>
                          {loading ? (
                            <SelectItem value="loading" disabled>جاري التحميل...</SelectItem>
                          ) : banksWallets.length === 0 ? (
                            <SelectItem value="no-banks" disabled>لا توجد بنوك/محافظ متاحة</SelectItem>
                          ) : (
                            banksWallets
                              .filter(bw => 
                                paymentFormData.paymentType === "cheque" ? bw.type === "bank" : true
                              )
                              .map(bw => (
                                <SelectItem key={bw.id} value={bw.id}>
                                  {bw.name} ({bw.type === "bank" ? "بنك" : bw.type === "wallet" ? "محفظة" : "صراف"})
                                </SelectItem>
                              ))
                          )}
                        </SelectContent>
                      </Select>
                    )}
                  </div>

                  {/* 2. التاريخ */}
                  <div className="col-span-3">
                    <Label htmlFor="date-out" className="text-sm font-bold mb-2 block text-gray-700">التاريخ *</Label>
                    <Input 
                      id="date-out" 
                      name="date" 
                      type="date" 
                      value={paymentFormData.date} 
                      onChange={(e) => handlePaymentFormChange("date", e.target.value)} 
                      className="h-11 text-base" 
                    />
                  </div>

                  {/* 3. العملة */}
                  <div className="col-span-3">
                    <Label htmlFor="currency-out" className="text-sm font-bold mb-2 block text-gray-700">العملة *</Label>
                    <Select 
                      onValueChange={(v) => handlePaymentFormChange("currency", v)} 
                      value={paymentFormData.currency}
                    >
                      <SelectTrigger className="h-11 text-base">
                        <SelectValue placeholder="اختر العملة" />
                      </SelectTrigger>
                      <SelectContent>
                        {currencies.map(curr => (
                          <SelectItem key={curr.code} value={curr.code}>{curr.name} ({curr.code})</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {/* سعر الصرف (إذا كانت العملة ليست YER) */}
                {paymentFormData.currency && paymentFormData.currency !== "YER" && (
                  <div className="grid grid-cols-6 gap-6 p-5 bg-gray-50 rounded-lg border border-gray-200 shadow-sm">
                    <div className="col-span-6">
                      <Label htmlFor="exchangeRate-out" className="text-sm font-bold mb-2 block text-gray-700">سعر الصرف</Label>
                      <div className="space-y-2">
                        <Input 
                          id="exchangeRate-out" 
                          name="exchangeRate" 
                          type="number" 
                          step="0.01"
                          value={paymentFormData.exchangeRate || "1"} 
                          onChange={(e) => handlePaymentFormChange("exchangeRate", e.target.value)} 
                          placeholder="سعر الصرف مقابل الريال اليمني"
                          className="h-11 text-base"
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
                  </div>
                )}

                {/* حقول إضافية للشيك والتحويل - NEW */}
                {(paymentFormData.paymentType === "cheque" || paymentFormData.paymentType === "transfer") && (
                  <div className="grid grid-cols-6 gap-6 p-5 bg-blue-50 rounded-lg border border-blue-200 shadow-sm">
                    {paymentFormData.paymentType === "cheque" && (
                      <div className="col-span-3">
                        <Label htmlFor="chequeNumber-out" className="text-sm font-bold mb-2 block text-gray-700">رقم الشيك *</Label>
                        <Input 
                          id="chequeNumber-out" 
                          name="chequeNumber" 
                          type="text"
                          value={paymentFormData.chequeNumber} 
                          onChange={(e) => handlePaymentFormChange("chequeNumber", e.target.value)} 
                          placeholder="أدخل رقم الشيك"
                          className="h-11 text-base"
                        />
                      </div>
                    )}
                    {paymentFormData.paymentType === "transfer" && (
                      <div className="col-span-3">
                        <Label htmlFor="transferReference-out" className="text-sm font-bold mb-2 block text-gray-700">مرجع التحويل *</Label>
                        <Input 
                          id="transferReference-out" 
                          name="transferReference" 
                          type="text"
                          value={paymentFormData.transferReference} 
                          onChange={(e) => handlePaymentFormChange("transferReference", e.target.value)} 
                          placeholder="رقم التحويل أو المرجع"
                          className="h-11 text-base"
                        />
                      </div>
                    )}
                    <div className="col-span-3">
                      <Label htmlFor="reference-out" className="text-sm font-bold mb-2 block text-gray-700">ملاحظات إضافية</Label>
                      <Input 
                        id="reference-out" 
                        name="reference" 
                        type="text"
                        value={paymentFormData.reference} 
                        onChange={(e) => handlePaymentFormChange("reference", e.target.value)} 
                        placeholder="ملاحظات أو مرجع إضافي"
                        className="h-11 text-base"
                      />
                    </div>
                  </div>
                )}

                {/* 4. جدول العمليات - Onyx Pro Style (BIG TABLE) */}
                <div className="border-t-2 pt-6 mt-6">
                  <div className="space-y-4">
                    <div className="flex items-center justify-between border-b-2 pb-3">
                      <Label className="text-xl font-bold">عمليات السند</Label>
                      <span className="text-base font-semibold text-muted-foreground bg-muted px-3 py-1 rounded">
                        {paymentOperations.length} عملية
                      </span>
                    </div>

                    {/* Onyx Pro Big Table Component */}
                    <OnyxStyleTable
                      operations={paymentOperations}
                      onOperationsChange={setPaymentOperations}
                      accountTypes={getAccountTypes(currentEntity.id)}
                      accountSubtypes={getAccountSubtypes(currentEntity.id)}
                      chartAccounts={chartAccounts}
                      currency={paymentFormData.currency}
                      getAccountSubtypes={getAccountSubtypes}
                      currentEntityId={currentEntity.id}
                    />

                    {/* Old Form - Hidden for now */}
                    {false && (
                    <Card id="operation-form" className="p-6 bg-amber-50/50 border-2 border-dashed border-amber-300 shadow-sm rounded-lg">
                      <div className="space-y-4">
                        {/* Form Header */}
                        <div className="flex items-center gap-3 mb-4 pb-3 border-b-2 border-amber-400">
                          <Plus className="w-5 h-5 text-amber-600" />
                          <Label className="font-bold text-lg text-gray-800">
                            {editingOperationId ? "تعديل العملية" : "إضافة عملية جديدة"}
                          </Label>
                        </div>

                        {/* Single Row: All Fields Horizontal - Excel Style */}
                        <div className="grid grid-cols-7 gap-3 items-end">
                          {/* Account Type */}
                          <div className="col-span-1">
                            <Label className="text-xs mb-1.5 block font-medium">نوع الحساب *</Label>
                            <Select 
                              onValueChange={(v) => {
                                setCurrentOperation(prev => ({
                                  ...prev,
                                  accountType: v,
                                  accountSubtype: "",
                                  chartAccount: "",
                                  analyticalAccount: ""
                                }));
                              }}
                              value={currentOperation.accountType}
                            >
                              <SelectTrigger className="h-10 text-sm">
                                <SelectValue placeholder="النوع" />
                              </SelectTrigger>
                              <SelectContent>
                                {getAccountTypes(currentEntity.id).map(type => (
                                  <SelectItem key={type.id} value={type.id}>
                                    {type.label}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>

                          {/* Account Subtype */}
                          {currentOperation.accountType && (
                            <div className="col-span-1">
                              <Label className="text-xs mb-1.5 block font-medium">النوع الفرعي *</Label>
                              <Select 
                                onValueChange={(v) => {
                                  setCurrentOperation(prev => ({
                                    ...prev,
                                    accountSubtype: v,
                                    chartAccount: "",
                                    analyticalAccount: ""
                                  }));
                                }}
                                value={currentOperation.accountSubtype}
                              >
                                <SelectTrigger className="h-10 text-sm">
                                  <SelectValue placeholder="الفرعي" />
                                </SelectTrigger>
                                <SelectContent>
                                  {getAccountSubtypes(currentEntity.id).map(subtype => (
                                    <SelectItem key={subtype.id} value={subtype.value}>
                                      {subtype.label}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                            </div>
                          )}

                          {/* Chart Account */}
                          {currentOperation.accountType && currentOperation.accountSubtype && (
                            <div className="col-span-1">
                              <Label className="text-xs mb-1.5 block font-medium">الحساب *</Label>
                              <Select 
                                onValueChange={(v) => {
                                  setCurrentOperation(prev => ({
                                    ...prev,
                                    chartAccount: v,
                                    analyticalAccount: ""
                                  }));
                                }}
                                value={currentOperation.chartAccount}
                              >
                                <SelectTrigger className="h-10 text-sm">
                                  <SelectValue placeholder="الحساب" />
                                </SelectTrigger>
                                <SelectContent>
                                  {chartAccounts.filter(acc => 
                                    acc.type === currentOperation.accountType &&
                                    acc.subtype === currentOperation.accountSubtype &&
                                    !acc.isGroup &&
                                    (currentEntity.type === 'holding' ? !acc.entityId : acc.entityId === currentEntity.id)
                                  ).length === 0 ? (
                                    <SelectItem value="no-accounts" disabled>لا توجد حسابات</SelectItem>
                                  ) : (
                                    chartAccounts.filter(acc => 
                                      acc.type === currentOperation.accountType &&
                                      acc.subtype === currentOperation.accountSubtype &&
                                      !acc.isGroup &&
                                      (currentEntity.type === 'holding' ? !acc.entityId : acc.entityId === currentEntity.id)
                                    ).map(account => (
                                      <SelectItem key={account.id} value={account.id}>
                                        {account.id} - {account.name}
                                      </SelectItem>
                                    ))
                                  )}
                                </SelectContent>
                              </Select>
                            </div>
                          )}

                          {/* Analytical Account */}
                          {currentOperation.chartAccount && (
                            <div className="col-span-1">
                              <Label className="text-xs mb-1.5 block font-medium">التحليلي</Label>
                              <Select 
                                onValueChange={(v) => {
                                  setCurrentOperation(prev => ({
                                    ...prev,
                                    analyticalAccount: v === "none" ? "" : v
                                  }));
                                }}
                                value={currentOperation.analyticalAccount || "none"}
                              >
                                <SelectTrigger className="h-10 text-sm">
                                  <SelectValue placeholder="اختياري" />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="none">لا يوجد</SelectItem>
                                  {chartAccounts.filter(acc => 
                                    acc.parentId === currentOperation.chartAccount &&
                                    !acc.isGroup &&
                                    (currentEntity.type === 'holding' ? !acc.entityId : acc.entityId === currentEntity.id)
                                  ).map(account => (
                                    <SelectItem key={account.id} value={account.id}>
                                      {account.id} - {account.name}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                            </div>
                          )}

                          {/* Amount */}
                          <div className="col-span-1">
                            <Label className="text-xs mb-1.5 block font-medium">المبلغ *</Label>
                            <Input 
                              type="number" 
                              step="0.01"
                              value={currentOperation.amount} 
                              onChange={(e) => setCurrentOperation(prev => ({ ...prev, amount: e.target.value }))} 
                              className="h-10 text-sm font-semibold" 
                              placeholder="0.00"
                              onKeyDown={(e) => {
                                if (e.key === 'Enter' && currentOperation.amount) {
                                  const descInput = document.getElementById('operation-description') as HTMLInputElement;
                                  descInput?.focus();
                                }
                              }}
                            />
                          </div>

                          {/* Description */}
                          <div className="col-span-2">
                            <Label className="text-xs mb-1.5 block font-medium">البيان *</Label>
                            <Input 
                              id="operation-description"
                              value={currentOperation.description} 
                              onChange={(e) => setCurrentOperation(prev => ({ ...prev, description: e.target.value }))} 
                              className="h-10 text-sm" 
                              placeholder="وصف العملية"
                              onKeyDown={(e) => {
                                if (e.key === 'Enter' && currentOperation.description && 
                                    currentOperation.accountType && currentOperation.accountSubtype && 
                                    currentOperation.chartAccount && currentOperation.amount) {
                                  // Trigger add button click
                                  const addButton = document.getElementById('add-operation-btn') as HTMLButtonElement;
                                  addButton?.click();
                                }
                              }}
                            />
                          </div>

                          {/* Add/Update Button */}
                          <div className="col-span-1">
                            <Label className="text-xs mb-1.5 block font-medium opacity-0">إضافة</Label>
                            <Button
                              id="add-operation-btn"
                              type="button"
                              size="sm"
                              className="w-full h-10 text-sm font-semibold"
                                onClick={() => {
                                if (!currentOperation.accountType || !currentOperation.accountSubtype || 
                                    !currentOperation.chartAccount || !currentOperation.amount || !currentOperation.description) {
                                  toast.error("الرجاء تعبئة جميع الحقول المطلوبة");
                                  return;
                                }

                                if (editingOperationId) {
                                  setPaymentOperations(prev => prev.map(op => 
                                    op.id === editingOperationId ? { ...currentOperation, id: editingOperationId } : op
                                  ));
                                  toast.success("تم تحديث العملية");
                                } else {
                                  setPaymentOperations(prev => [...prev, {
                                    ...currentOperation,
                                    id: `OP-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
                                  }]);
                                  toast.success("تم إضافة العملية");
                                  // Scroll to show the newly added operation
                                  setTimeout(() => {
                                    document.getElementById('operations-list')?.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
                                  }, 100);
                                }

                                setCurrentOperation({
                                  accountType: "",
                                  accountSubtype: "",
                                  chartAccount: "",
                                  analyticalAccount: "",
                                  amount: "",
                                  description: ""
                                });
                                setEditingOperationId(null);
                              }}
                            >
                              {editingOperationId ? "تحديث" : "إضافة"}
                            </Button>
                          </div>
                        </div>

                        {/* Cancel edit button */}
                        {editingOperationId && (
                          <div className="flex justify-end pt-3 border-t-2 border-amber-200">
                            <Button
                              type="button"
                              variant="outline"
                              size="lg"
                              className="text-base border-gray-300 hover:bg-gray-50"
                              onClick={() => {
                                setCurrentOperation({
                                  accountType: "",
                                  accountSubtype: "",
                                  chartAccount: "",
                                  analyticalAccount: "",
                                  amount: "",
                                  description: ""
                                });
                                setEditingOperationId(null);
                              }}
                            >
                              إلغاء التعديل
                            </Button>
                          </div>
                        )}
                      </div>
                    </Card>

                    {/* Operations List - Onyx Pro Big Table */}
                    {paymentOperations.length > 0 && (
                      <div id="operations-list" className="space-y-3">
                        <div className="border-2 border-gray-400 overflow-hidden bg-white shadow-lg rounded-lg">
                          <Table>
                            <TableHeader>
                              <TableRow className="bg-gradient-to-r from-yellow-100 to-yellow-50 hover:from-yellow-100 hover:to-yellow-50 border-b-2 border-gray-400">
                                <TableHead className="text-right text-base font-bold py-4 px-4 border-r-2 border-gray-400">نوع الحساب</TableHead>
                                <TableHead className="text-right text-base font-bold py-4 px-4 border-r-2 border-gray-400">النوع الفرعي</TableHead>
                                <TableHead className="text-right text-base font-bold py-4 px-4 border-r-2 border-gray-400">الحساب</TableHead>
                                <TableHead className="text-right text-base font-bold py-4 px-4 border-r-2 border-gray-400">الحساب التحليلي</TableHead>
                                <TableHead className="text-right text-base font-bold py-4 px-4 border-r-2 border-gray-400">المبلغ</TableHead>
                                <TableHead className="text-right text-base font-bold py-4 px-4 border-r-2 border-gray-400">البيان</TableHead>
                                <TableHead className="text-right text-base font-bold py-4 px-4">إجراءات</TableHead>
                              </TableRow>
                            </TableHeader>
                            <TableBody>
                              {paymentOperations.map((operation, index) => {
                                const accountType = getAccountTypes(currentEntity.id).find(t => t.id === operation.accountType);
                                const accountSubtype = getAccountSubtypes(currentEntity.id).find(s => s.value === operation.accountSubtype);
                                const chartAccount = chartAccounts.find(acc => acc.id === operation.chartAccount);
                                const analyticalAccount = operation.analyticalAccount 
                                  ? chartAccounts.find(acc => acc.id === operation.analyticalAccount)
                                  : null;

                                return (
                                  <TableRow 
                                    key={operation.id} 
                                    className="hover:bg-yellow-50 border-b border-gray-300 bg-white group"
                                  >
                                    <TableCell className="text-base py-4 px-4 border-r-2 border-gray-300 font-medium">
                                      {accountType?.label || operation.accountType}
                                    </TableCell>
                                    <TableCell className="text-base py-4 px-4 border-r-2 border-gray-300 text-gray-700">
                                      {accountSubtype?.label || operation.accountSubtype}
                                    </TableCell>
                                    <TableCell className="text-base py-4 px-4 border-r-2 border-gray-300">
                                      {chartAccount ? `${chartAccount.id} - ${chartAccount.name}` : operation.chartAccount}
                                    </TableCell>
                                    <TableCell className="text-base py-4 px-4 border-r-2 border-gray-300 text-gray-600">
                                      {analyticalAccount ? `${analyticalAccount.id} - ${analyticalAccount.name}` : "-"}
                                    </TableCell>
                                    <TableCell className="text-base py-4 px-4 border-r-2 border-gray-300 font-bold text-right text-green-700">
                                      {parseFloat(operation.amount || "0").toLocaleString()} {paymentFormData.currency}
                                    </TableCell>
                                    <TableCell className="text-base py-4 px-4 border-r-2 border-gray-300">
                                      <span className="truncate block max-w-full">{operation.description}</span>
                                    </TableCell>
                                    <TableCell className="py-2.5 px-4">
                                      <div className="flex gap-1 justify-end opacity-0 group-hover:opacity-100 transition-opacity">
                                        <Button
                                          size="sm"
                                          variant="ghost"
                                          className="h-7 w-7 p-0 hover:bg-gray-200"
                                          onClick={() => {
                                            setCurrentOperation(operation);
                                            setEditingOperationId(operation.id);
                                            setTimeout(() => {
                                              document.getElementById('operation-form')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
                                            }, 100);
                                          }}
                                        >
                                          <Pencil className="w-3.5 h-3.5" />
                                        </Button>
                                        <Button
                                          size="sm"
                                          variant="ghost"
                                          className="h-7 w-7 p-0 text-red-600 hover:bg-red-50 hover:text-red-700"
                                          onClick={() => {
                                            setPaymentOperations(prev => prev.filter(op => op.id !== operation.id));
                                            toast.success("تم حذف العملية");
                                          }}
                                        >
                                          <Trash2 className="w-3.5 h-3.5" />
                                        </Button>
                                      </div>
                                    </TableCell>
                                  </TableRow>
                                );
                              })}
                            </TableBody>
                          </Table>
                        </div>

                        {/* Total Summary - Onyx Pro Style */}
                        <div className="flex justify-between items-center p-5 bg-gradient-to-r from-blue-600 to-blue-700 border-2 border-blue-800 shadow-xl">
                          <span className="text-xl font-bold text-white">المبلغ الإجمالي:</span>
                          <span className="text-3xl font-bold text-yellow-300">
                            {paymentOperations.reduce((sum, op) => sum + parseFloat(op.amount || "0"), 0).toLocaleString()} {paymentFormData.currency}
                          </span>
                        </div>
                      </div>
                    )}
                  </div>
                </div>


              </div>
              <DialogFooter>
                <Button 
                  onClick={async () => {
                    // Validate required fields based on payment type
                    if (paymentFormData.paymentType === "cash" && !paymentFormData.cashBox) {
                      toast.error("الرجاء اختيار الصندوق");
                      return;
                    }
                    if ((paymentFormData.paymentType === "cheque" || paymentFormData.paymentType === "transfer") && !paymentFormData.bankWallet) {
                      toast.error("الرجاء اختيار البنك أو المحفظة");
                      return;
                    }
                    if (paymentFormData.paymentType === "cheque" && !paymentFormData.chequeNumber) {
                      toast.error("الرجاء إدخال رقم الشيك");
                      return;
                    }
                    if (paymentFormData.paymentType === "transfer" && !paymentFormData.transferReference) {
                      toast.error("الرجاء إدخال مرجع التحويل");
                      return;
                    }
                    if (!paymentFormData.date || !paymentFormData.currency) {
                      toast.error("الرجاء تعبئة التاريخ والعملة");
                      return;
                    }
                    
                    // Validate that at least one operation exists
                    if (paymentOperations.length === 0) {
                      toast.error("الرجاء إضافة عملية واحدة على الأقل");
                      return;
                    }
                    
                    // Validate exchange rate if currency is not YER
                    if (paymentFormData.currency !== "YER" && rateError) {
                      toast.error("لا يمكن حفظ السند: " + rateError);
                      return;
                    }

                    // Create payment voucher with all operations
                    const selectedCashBox = cashBoxes.find(box => box.id === paymentFormData.cashBox);
                    const totalAmount = paymentOperations.reduce((sum, op) => sum + parseFloat(op.amount || "0"), 0);

                    try {
                      // Prepare operations data for API
                      const operationsData = paymentOperations.map(op => ({
                        accountType: op.accountType,
                        accountSubtype: op.accountSubtype,
                        chartAccountId: op.chartAccount,
                        analyticalAccountId: op.analyticalAccount || null,
                        amount: parseFloat(op.amount || "0").toString(),
                        description: op.description
                      }));

                      // Create voucher via API
                      const voucherData = {
                        entityId: currentEntity.id,
                        type: 'out',
                        paymentType: paymentFormData.paymentType,
                        cashBoxId: paymentFormData.paymentType === "cash" ? paymentFormData.cashBox : null,
                        bankWalletId: (paymentFormData.paymentType === "cheque" || paymentFormData.paymentType === "transfer") ? paymentFormData.bankWallet : null,
                        date: paymentFormData.date,
                        currency: paymentFormData.currency,
                        exchangeRate: paymentFormData.exchangeRate || "1",
                        totalAmount: totalAmount.toString(),
                        reference: paymentFormData.reference || null,
                        chequeNumber: paymentFormData.paymentType === "cheque" ? paymentFormData.chequeNumber : null,
                        transferReference: paymentFormData.paymentType === "transfer" ? paymentFormData.transferReference : null,
                        operations: operationsData,
                        createdBy: 'admin', // TODO: Get from auth context
                      };

                      const createdVoucher = await paymentsApi.create(voucherData);

                      // Transform API response to frontend format
                      const newPayment = {
                        id: createdVoucher.id,
                        type: createdVoucher.type,
                        party: createdVoucher.operations?.[0]?.description || '-',
                        account: createdVoucher.cashBox?.name || '-',
                        cashBox: createdVoucher.cashBox?.name || '-',
                        cashBoxId: createdVoucher.cashBoxId,
                        date: new Date(createdVoucher.date).toISOString().split('T')[0],
                        method: 'cash',
                        currency: createdVoucher.currency,
                        exchangeRate: parseFloat(createdVoucher.exchangeRate || '1'),
                        amount: parseFloat(createdVoucher.totalAmount),
                        totalAmount: parseFloat(createdVoucher.totalAmount),
                        operations: createdVoucher.operations || [],
                        reference: createdVoucher.reference,
                      };

                      setPayments([newPayment, ...payments]);
                      toast.success(`تم إنشاء سند الصرف بنجاح (${paymentOperations.length} عملية)`);
                      
                      // Reload cash boxes to get updated balance
                      loadAccounts();
                      
                      // Reset form
                      setPaymentFormData({
                        cashBox: "",
                        date: new Date().toISOString().split('T')[0],
                        currency: "YER",
                        exchangeRate: "1",
                        reference: ""
                      });
                      setPaymentOperations([]);
                      setCurrentOperation({
                        accountType: "",
                        accountSubtype: "",
                        chartAccount: "",
                        analyticalAccount: "",
                        amount: "",
                        description: ""
                      });
                      setEditingOperationId(null);
                      setRateError("");
                      setRateWarning("");
                      setIsPayOpen(false);
                    } catch (error: any) {
                      console.error('Failed to create payment voucher:', error);
                      toast.error(error.message || 'فشل إنشاء سند الصرف');
                    }
                  }} 
                  variant="destructive"
                  disabled={paymentOperations.length === 0}
                >
                  حفظ سند الصرف ({paymentOperations.length} عملية)
                </Button>
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

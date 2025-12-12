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
  DollarSign,
  TrendingUp,
  TrendingDown,
  Edit,
  Trash2
} from "lucide-react";
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
import { useState } from "react";
import { toast } from "sonner";

interface Currency {
  id: string;
  code: string;
  name: string;
  symbol: string;
  isBase: boolean;
  currentRate: number;
  maxRate: number;
  minRate: number;
}

const initialCurrencies: Currency[] = [
  {
    id: "1",
    code: "YER",
    name: "ريال يمني",
    symbol: "ر.ي",
    isBase: true,
    currentRate: 1,
    maxRate: 1,
    minRate: 1
  },
  {
    id: "2",
    code: "SAR",
    name: "ريال سعودي",
    symbol: "ر.س",
    isBase: false,
    currentRate: 140,
    maxRate: 145,
    minRate: 135
  },
  {
    id: "3",
    code: "USD",
    name: "دولار أمريكي",
    symbol: "$",
    isBase: false,
    currentRate: 535,
    maxRate: 540,
    minRate: 530
  }
];

export default function Currencies() {
  const [currencies, setCurrencies] = useState<Currency[]>(initialCurrencies);
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [editingCurrency, setEditingCurrency] = useState<Currency | null>(null);
  const [searchTerm, setSearchTerm] = useState("");

  const [formData, setFormData] = useState({
    code: "",
    name: "",
    symbol: "",
    currentRate: "",
    maxRate: "",
    minRate: ""
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleAdd = () => {
    if (!formData.code || !formData.name || !formData.symbol || !formData.currentRate) {
      toast.error("الرجاء تعبئة جميع الحقول المطلوبة");
      return;
    }

    const newCurrency: Currency = {
      id: `${currencies.length + 1}`,
      code: formData.code.toUpperCase(),
      name: formData.name,
      symbol: formData.symbol,
      isBase: false,
      currentRate: parseFloat(formData.currentRate),
      maxRate: parseFloat(formData.maxRate),
      minRate: parseFloat(formData.minRate)
    };

    setCurrencies([...currencies, newCurrency]);
    toast.success("تم إضافة العملة بنجاح");
    setIsAddOpen(false);
    setFormData({
      code: "",
      name: "",
      symbol: "",
      currentRate: "",
      maxRate: "",
      minRate: ""
    });
  };

  const handleEdit = (currency: Currency) => {
    if (currency.isBase) {
      toast.error("لا يمكن تعديل العملة الأساسية");
      return;
    }
    setEditingCurrency(currency);
    setFormData({
      code: currency.code,
      name: currency.name,
      symbol: currency.symbol,
      currentRate: currency.currentRate.toString(),
      maxRate: currency.maxRate.toString(),
      minRate: currency.minRate.toString()
    });
    setIsEditOpen(true);
  };

  const handleUpdate = () => {
    if (!editingCurrency) return;

    const updatedCurrencies = currencies.map(c => 
      c.id === editingCurrency.id 
        ? {
            ...c,
            code: formData.code.toUpperCase(),
            name: formData.name,
            symbol: formData.symbol,
            currentRate: parseFloat(formData.currentRate),
            maxRate: parseFloat(formData.maxRate),
            minRate: parseFloat(formData.minRate)
          }
        : c
    );

    setCurrencies(updatedCurrencies);
    toast.success("تم تحديث العملة بنجاح");
    setIsEditOpen(false);
    setEditingCurrency(null);
    setFormData({
      code: "",
      name: "",
      symbol: "",
      currentRate: "",
      maxRate: "",
      minRate: ""
    });
  };

  const handleDelete = (id: string) => {
    const currency = currencies.find(c => c.id === id);
    if (currency?.isBase) {
      toast.error("لا يمكن حذف العملة الأساسية");
      return;
    }
    setCurrencies(currencies.filter(c => c.id !== id));
    toast.success("تم حذف العملة بنجاح");
  };

  const filteredCurrencies = currencies.filter(c =>
    c.name.includes(searchTerm) || c.code.includes(searchTerm.toUpperCase())
  );

  const baseCurrency = currencies.find(c => c.isBase);

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">إدارة العملات</h1>
          <p className="text-muted-foreground">إدارة العملات وأسعار الصرف</p>
        </div>
        <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
          <DialogTrigger asChild>
            <Button size="sm">
              <Plus className="ml-2 h-4 w-4" />
              إضافة عملة جديدة
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>إضافة عملة جديدة</DialogTitle>
              <DialogDescription>
                أدخل تفاصيل العملة الجديدة وأسعار الصرف
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="code" className="text-right">رمز العملة</Label>
                <Input id="code" name="code" value={formData.code} onChange={handleInputChange} className="col-span-3" placeholder="مثال: USD" />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="name" className="text-right">اسم العملة</Label>
                <Input id="name" name="name" value={formData.name} onChange={handleInputChange} className="col-span-3" placeholder="مثال: دولار أمريكي" />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="symbol" className="text-right">رمز العملة</Label>
                <Input id="symbol" name="symbol" value={formData.symbol} onChange={handleInputChange} className="col-span-3" placeholder="مثال: $" />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="currentRate" className="text-right">سعر الصرف الحالي</Label>
                <Input id="currentRate" name="currentRate" type="number" value={formData.currentRate} onChange={handleInputChange} className="col-span-3" placeholder="مقابل الريال اليمني" />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="maxRate" className="text-right">أعلى سعر مسموح</Label>
                <Input id="maxRate" name="maxRate" type="number" value={formData.maxRate} onChange={handleInputChange} className="col-span-3" placeholder="الحد الأقصى" />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="minRate" className="text-right">أدنى سعر مسموح</Label>
                <Input id="minRate" name="minRate" type="number" value={formData.minRate} onChange={handleInputChange} className="col-span-3" placeholder="الحد الأدنى" />
              </div>
            </div>
            <DialogFooter>
              <Button onClick={handleAdd}>حفظ العملة</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">إجمالي العملات</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{currencies.length}</div>
            <p className="text-xs text-muted-foreground">عملة مسجلة في النظام</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">العملة الأساسية</CardTitle>
            <TrendingUp className="h-4 w-4 text-emerald-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{baseCurrency?.code}</div>
            <p className="text-xs text-muted-foreground">{baseCurrency?.name}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">العملات الأجنبية</CardTitle>
            <TrendingDown className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{currencies.filter(c => !c.isBase).length}</div>
            <p className="text-xs text-muted-foreground">عملة أجنبية</p>
          </CardContent>
        </Card>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute right-3 top-3 h-4 w-4 text-muted-foreground" />
        <Input 
          placeholder="بحث بالاسم أو الرمز..." 
          className="pr-9"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      {/* Table */}
      <Card>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="text-right">رمز العملة</TableHead>
              <TableHead className="text-right">اسم العملة</TableHead>
              <TableHead className="text-right">الرمز</TableHead>
              <TableHead className="text-right">نوع العملة</TableHead>
              <TableHead className="text-right">سعر الصرف الحالي</TableHead>
              <TableHead className="text-right">أعلى سعر</TableHead>
              <TableHead className="text-right">أدنى سعر</TableHead>
              <TableHead className="text-right">إجراءات</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredCurrencies.length === 0 ? (
              <TableRow>
                <TableCell colSpan={8} className="text-center text-muted-foreground py-8">
                  لا توجد عملات مسجلة. قم بإضافة عملة جديدة.
                </TableCell>
              </TableRow>
            ) : (
              filteredCurrencies.map((currency) => (
                <TableRow key={currency.id}>
                  <TableCell className="font-medium">{currency.code}</TableCell>
                  <TableCell>{currency.name}</TableCell>
                  <TableCell>{currency.symbol}</TableCell>
                  <TableCell>
                    {currency.isBase ? (
                      <Badge variant="default" className="bg-emerald-600">عملة أساسية</Badge>
                    ) : (
                      <Badge variant="secondary">عملة أجنبية</Badge>
                    )}
                  </TableCell>
                  <TableCell className="font-bold">
                    {currency.currentRate.toFixed(2)} {baseCurrency?.symbol}
                  </TableCell>
                  <TableCell className="text-red-600">
                    {currency.maxRate.toFixed(2)} {baseCurrency?.symbol}
                  </TableCell>
                  <TableCell className="text-green-600">
                    {currency.minRate.toFixed(2)} {baseCurrency?.symbol}
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-2">
                      <Button 
                        size="sm" 
                        variant="ghost"
                        onClick={() => handleEdit(currency)}
                        disabled={currency.isBase}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button 
                        size="sm" 
                        variant="ghost"
                        onClick={() => handleDelete(currency.id)}
                        disabled={currency.isBase}
                      >
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </Card>

      {/* Edit Dialog */}
      <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>تعديل العملة</DialogTitle>
            <DialogDescription>
              تحديث تفاصيل العملة وأسعار الصرف
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="edit-code" className="text-right">رمز العملة</Label>
              <Input id="edit-code" name="code" value={formData.code} onChange={handleInputChange} className="col-span-3" />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="edit-name" className="text-right">اسم العملة</Label>
              <Input id="edit-name" name="name" value={formData.name} onChange={handleInputChange} className="col-span-3" />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="edit-symbol" className="text-right">رمز العملة</Label>
              <Input id="edit-symbol" name="symbol" value={formData.symbol} onChange={handleInputChange} className="col-span-3" />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="edit-currentRate" className="text-right">سعر الصرف الحالي</Label>
              <Input id="edit-currentRate" name="currentRate" type="number" value={formData.currentRate} onChange={handleInputChange} className="col-span-3" />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="edit-maxRate" className="text-right">أعلى سعر مسموح</Label>
              <Input id="edit-maxRate" name="maxRate" type="number" value={formData.maxRate} onChange={handleInputChange} className="col-span-3" />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="edit-minRate" className="text-right">أدنى سعر مسموح</Label>
              <Input id="edit-minRate" name="minRate" type="number" value={formData.minRate} onChange={handleInputChange} className="col-span-3" />
            </div>
          </div>
          <DialogFooter>
            <Button onClick={handleUpdate}>حفظ التغييرات</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

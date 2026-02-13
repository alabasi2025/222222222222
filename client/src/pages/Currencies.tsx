import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Plus,
  Search,
  DollarSign,
  TrendingUp,
  TrendingDown,
  Edit,
  Trash2,
  Loader2,
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
import { useState, useEffect, useCallback } from "react";
import { toast } from "sonner";
import { useEntity } from "@/contexts/EntityContext";
import { currenciesApi } from "@/lib/api";

interface Currency {
  id: string;
  code: string;
  name: string;
  symbol: string;
  isBase: boolean;
  exchangeRate: string;
  maxRate: string | null;
  minRate: string | null;
  entityId: string;
}

export default function Currencies() {
  const { currentEntity, getThemeColor } = useEntity();
  const [currencies, setCurrencies] = useState<Currency[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [editingCurrency, setEditingCurrency] = useState<Currency | null>(null);
  const [searchTerm, setSearchTerm] = useState("");

  const [formData, setFormData] = useState({
    code: "",
    name: "",
    symbol: "",
    exchangeRate: "",
    maxRate: "",
    minRate: "",
  });

  const loadData = useCallback(async () => {
    if (!currentEntity) return;
    setIsLoading(true);
    try {
      const response = await currenciesApi.getAll({
        entityId: currentEntity.id,
      });
      const data = Array.isArray(response)
        ? response
        : (response as any)?.data || [];
      setCurrencies(data);
    } catch {
      setCurrencies([]);
    } finally {
      setIsLoading(false);
    }
  }, [currentEntity]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  if (!currentEntity) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-muted-foreground">الرجاء اختيار كيان أولاً</p>
      </div>
    );
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleAdd = async () => {
    if (
      !formData.code ||
      !formData.name ||
      !formData.symbol ||
      !formData.exchangeRate
    ) {
      toast.error("الرجاء تعبئة جميع الحقول المطلوبة");
      return;
    }
    setIsSaving(true);
    try {
      await currenciesApi.create({
        entityId: currentEntity.id,
        code: formData.code.toUpperCase(),
        name: formData.name,
        symbol: formData.symbol,
        isBase: false,
        exchangeRate: formData.exchangeRate,
        maxRate: formData.maxRate || null,
        minRate: formData.minRate || null,
      });
      toast.success("تم إضافة العملة بنجاح");
      setIsAddOpen(false);
      setFormData({
        code: "",
        name: "",
        symbol: "",
        exchangeRate: "",
        maxRate: "",
        minRate: "",
      });
      loadData();
    } catch {
      toast.error("فشل إضافة العملة");
    } finally {
      setIsSaving(false);
    }
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
      exchangeRate: currency.exchangeRate?.toString() || "",
      maxRate: currency.maxRate?.toString() || "",
      minRate: currency.minRate?.toString() || "",
    });
    setIsEditOpen(true);
  };

  const handleUpdate = async () => {
    if (!editingCurrency) return;
    setIsSaving(true);
    try {
      await currenciesApi.update(editingCurrency.id, {
        code: formData.code.toUpperCase(),
        name: formData.name,
        symbol: formData.symbol,
        exchangeRate: formData.exchangeRate,
        maxRate: formData.maxRate || null,
        minRate: formData.minRate || null,
      });
      toast.success("تم تحديث العملة بنجاح");
      setIsEditOpen(false);
      setEditingCurrency(null);
      setFormData({
        code: "",
        name: "",
        symbol: "",
        exchangeRate: "",
        maxRate: "",
        minRate: "",
      });
      loadData();
    } catch {
      toast.error("فشل تحديث العملة");
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    const currency = currencies.find(c => c.id === id);
    if (currency?.isBase) {
      toast.error("لا يمكن حذف العملة الأساسية");
      return;
    }
    if (!confirm("هل أنت متأكد من حذف هذه العملة؟")) return;
    try {
      await currenciesApi.delete(id);
      toast.success("تم حذف العملة بنجاح");
      loadData();
    } catch {
      toast.error("فشل حذف العملة");
    }
  };

  const filteredCurrencies = currencies.filter(
    c =>
      c.name?.includes(searchTerm) || c.code?.includes(searchTerm.toUpperCase())
  );

  const baseCurrency = currencies.find(c => c.isBase);

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">إدارة العملات</h1>
          <p className="text-muted-foreground">
            إدارة العملات وأسعار الصرف لـ{" "}
            <span className="font-bold" style={{ color: getThemeColor() }}>
              {currentEntity.name}
            </span>
          </p>
        </div>
        <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
          <DialogTrigger asChild>
            <Button size="sm" style={{ backgroundColor: getThemeColor() }}>
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
                <Label htmlFor="code" className="text-right">
                  رمز العملة *
                </Label>
                <Input
                  id="code"
                  name="code"
                  value={formData.code}
                  onChange={handleInputChange}
                  className="col-span-3"
                  placeholder="مثال: USD"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="name" className="text-right">
                  اسم العملة *
                </Label>
                <Input
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  className="col-span-3"
                  placeholder="مثال: دولار أمريكي"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="symbol" className="text-right">
                  رمز العملة *
                </Label>
                <Input
                  id="symbol"
                  name="symbol"
                  value={formData.symbol}
                  onChange={handleInputChange}
                  className="col-span-3"
                  placeholder="مثال: $"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="exchangeRate" className="text-right">
                  سعر الصرف *
                </Label>
                <Input
                  id="exchangeRate"
                  name="exchangeRate"
                  type="number"
                  value={formData.exchangeRate}
                  onChange={handleInputChange}
                  className="col-span-3"
                  placeholder="مقابل العملة الأساسية"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="maxRate" className="text-right">
                  أعلى سعر
                </Label>
                <Input
                  id="maxRate"
                  name="maxRate"
                  type="number"
                  value={formData.maxRate}
                  onChange={handleInputChange}
                  className="col-span-3"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="minRate" className="text-right">
                  أدنى سعر
                </Label>
                <Input
                  id="minRate"
                  name="minRate"
                  type="number"
                  value={formData.minRate}
                  onChange={handleInputChange}
                  className="col-span-3"
                />
              </div>
            </div>
            <DialogFooter>
              <Button
                onClick={handleAdd}
                disabled={isSaving}
                style={{ backgroundColor: getThemeColor() }}
              >
                {isSaving ? (
                  <Loader2 className="w-4 h-4 ml-2 animate-spin" />
                ) : null}
                حفظ العملة
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              إجمالي العملات
            </CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{currencies.length}</div>
            <p className="text-xs text-muted-foreground">
              عملة مسجلة في النظام
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              العملة الأساسية
            </CardTitle>
            <TrendingUp className="h-4 w-4 text-emerald-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {baseCurrency?.code || "---"}
            </div>
            <p className="text-xs text-muted-foreground">
              {baseCurrency?.name || "لم يتم تحديد عملة أساسية"}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              العملات الأجنبية
            </CardTitle>
            <TrendingDown className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {currencies.filter(c => !c.isBase).length}
            </div>
            <p className="text-xs text-muted-foreground">عملة أجنبية</p>
          </CardContent>
        </Card>
      </div>

      <div className="relative">
        <Search className="absolute right-3 top-3 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="بحث بالاسم أو الرمز..."
          className="pr-9"
          value={searchTerm}
          onChange={e => setSearchTerm(e.target.value)}
        />
      </div>

      <Card>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="text-right">رمز العملة</TableHead>
              <TableHead className="text-right">اسم العملة</TableHead>
              <TableHead className="text-right">الرمز</TableHead>
              <TableHead className="text-right">نوع العملة</TableHead>
              <TableHead className="text-right">سعر الصرف</TableHead>
              <TableHead className="text-right">أعلى سعر</TableHead>
              <TableHead className="text-right">أدنى سعر</TableHead>
              <TableHead className="text-right">إجراءات</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={8} className="text-center py-8">
                  <Loader2 className="w-6 h-6 animate-spin mx-auto text-muted-foreground" />
                </TableCell>
              </TableRow>
            ) : filteredCurrencies.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={8}
                  className="text-center text-muted-foreground py-8"
                >
                  لا توجد عملات مسجلة. قم بإضافة عملة جديدة.
                </TableCell>
              </TableRow>
            ) : (
              filteredCurrencies.map(currency => (
                <TableRow key={currency.id}>
                  <TableCell className="font-medium">{currency.code}</TableCell>
                  <TableCell>{currency.name}</TableCell>
                  <TableCell>{currency.symbol}</TableCell>
                  <TableCell>
                    {currency.isBase ? (
                      <Badge variant="default" className="bg-emerald-600">
                        عملة أساسية
                      </Badge>
                    ) : (
                      <Badge variant="secondary">عملة أجنبية</Badge>
                    )}
                  </TableCell>
                  <TableCell className="font-bold">
                    {Number(currency.exchangeRate || 0).toFixed(2)}{" "}
                    {baseCurrency?.symbol || ""}
                  </TableCell>
                  <TableCell className="text-red-600">
                    {currency.maxRate
                      ? Number(currency.maxRate).toFixed(2)
                      : "-"}{" "}
                    {currency.maxRate ? baseCurrency?.symbol : ""}
                  </TableCell>
                  <TableCell className="text-green-600">
                    {currency.minRate
                      ? Number(currency.minRate).toFixed(2)
                      : "-"}{" "}
                    {currency.minRate ? baseCurrency?.symbol : ""}
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
              <Label className="text-right">رمز العملة</Label>
              <Input
                name="code"
                value={formData.code}
                onChange={handleInputChange}
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label className="text-right">اسم العملة</Label>
              <Input
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label className="text-right">رمز العملة</Label>
              <Input
                name="symbol"
                value={formData.symbol}
                onChange={handleInputChange}
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label className="text-right">سعر الصرف</Label>
              <Input
                name="exchangeRate"
                type="number"
                value={formData.exchangeRate}
                onChange={handleInputChange}
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label className="text-right">أعلى سعر</Label>
              <Input
                name="maxRate"
                type="number"
                value={formData.maxRate}
                onChange={handleInputChange}
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label className="text-right">أدنى سعر</Label>
              <Input
                name="minRate"
                type="number"
                value={formData.minRate}
                onChange={handleInputChange}
                className="col-span-3"
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              onClick={handleUpdate}
              disabled={isSaving}
              style={{ backgroundColor: getThemeColor() }}
            >
              {isSaving ? (
                <Loader2 className="w-4 h-4 ml-2 animate-spin" />
              ) : null}
              حفظ التغييرات
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

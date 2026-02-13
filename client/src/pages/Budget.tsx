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
  Download,
  MoreHorizontal,
  Coins,
  Calendar,
  TrendingUp,
  TrendingDown,
  Save,
  Pencil,
  Trash2,
  FileText,
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
import { Card, CardContent } from "@/components/ui/card";
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
import { useState, useEffect, useCallback } from "react";
import { toast } from "sonner";
import { useEntity } from "@/contexts/EntityContext";
import { accountsApi, budgetsApi } from "@/lib/api";

interface BudgetItem {
  id: string;
  accountId: string;
  accountName: string;
  accountCode: string;
  period: string; // "2024-Q1", "2024-Q2", etc.
  budgetedAmount: number;
  actualAmount: number;
  variance: number;
  variancePercent: number;
  status: "on_track" | "over_budget" | "under_budget";
}

const statusMap: Record<string, { label: string; color: string }> = {
  on_track: {
    label: "في المسار",
    color: "bg-emerald-100 text-emerald-700 border-emerald-200",
  },
  over_budget: {
    label: "تجاوز الميزانية",
    color: "bg-rose-100 text-rose-700 border-rose-200",
  },
  under_budget: {
    label: "أقل من الميزانية",
    color: "bg-amber-100 text-amber-700 border-amber-200",
  },
};

export default function Budget() {
  const { currentEntity, getThemeColor } = useEntity();

  const [budgets, setBudgets] = useState<BudgetItem[]>([]);
  const [accounts, setAccounts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isNewBudgetOpen, setIsNewBudgetOpen] = useState(false);
  const [isEditBudgetOpen, setIsEditBudgetOpen] = useState(false);
  const [editingBudget, setEditingBudget] = useState<BudgetItem | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterPeriod, setFilterPeriod] = useState("all");
  const [filterAccount, setFilterAccount] = useState("all");

  const [newBudget, setNewBudget] = useState({
    accountId: "",
    period: "",
    budgetedAmount: 0,
  });

  const loadData = useCallback(async () => {
    if (!currentEntity) return;
    try {
      setLoading(true);
      const [accountsData, budgetsData] = await Promise.all([
        accountsApi.getByEntity(currentEntity.id).catch(() => []),
        budgetsApi.getAll({ entityId: currentEntity.id }).catch(() => []),
      ]);
      setAccounts(accountsData.filter((acc: any) => !acc.isGroup));
      const budgetsList = Array.isArray(budgetsData)
        ? budgetsData
        : (budgetsData as any)?.data || [];
      const enrichedBudgets = budgetsList.map((budget: any) => {
        const account = accountsData.find(
          (acc: any) => acc.id === budget.accountId
        );
        return {
          ...budget,
          accountName: account?.name || "غير معروف",
          accountCode: account?.id || "",
          budgetedAmount: Number(budget.budgetedAmount || 0),
          actualAmount: Number(budget.actualAmount || 0),
          variance: Number(budget.variance || 0),
          variancePercent: Number(budget.variancePercent || 0),
        };
      });
      setBudgets(enrichedBudgets);
    } catch (error) {
      console.error("Failed to load data:", error);
      toast.error("فشل تحميل البيانات");
    } finally {
      setLoading(false);
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

  const getCurrentYear = () => new Date().getFullYear();
  const _getCurrentQuarter = () => Math.floor((new Date().getMonth() + 3) / 3);

  const generatePeriods = () => {
    const periods: string[] = [];
    const currentYear = getCurrentYear();
    for (let year = currentYear - 1; year <= currentYear + 1; year++) {
      for (let quarter = 1; quarter <= 4; quarter++) {
        periods.push(`${year}-Q${quarter}`);
      }
    }
    return periods;
  };

  const calculateVariance = (budgeted: number, actual: number) => {
    const variance = actual - budgeted;
    const variancePercent = budgeted !== 0 ? (variance / budgeted) * 100 : 0;
    let status: "on_track" | "over_budget" | "under_budget" = "on_track";

    if (variancePercent > 10) {
      status = "over_budget";
    } else if (variancePercent < -10) {
      status = "under_budget";
    }

    return { variance, variancePercent, status };
  };

  const handleAddBudget = async () => {
    if (
      !newBudget.accountId ||
      !newBudget.period ||
      newBudget.budgetedAmount <= 0
    ) {
      toast.error("يرجى تعبئة جميع الحقول المطلوبة");
      return;
    }

    const account = accounts.find(acc => acc.id === newBudget.accountId);
    if (!account) {
      toast.error("الحساب غير موجود");
      return;
    }

    try {
      await budgetsApi.create({
        entityId: currentEntity.id,
        accountId: newBudget.accountId,
        period: newBudget.period,
        budgetedAmount: String(newBudget.budgetedAmount),
        actualAmount: "0",
        variance: String(-newBudget.budgetedAmount),
        variancePercent: "-100",
        status: "under_budget",
      });
      toast.success("تم إضافة الميزانية بنجاح");
      loadData();
    } catch {
      toast.error("فشل إضافة الميزانية");
    }

    setIsNewBudgetOpen(false);
    setNewBudget({
      accountId: "",
      period: "",
      budgetedAmount: 0,
    });
  };

  const handleEditBudget = async () => {
    if (
      !editingBudget ||
      !editingBudget.accountId ||
      !editingBudget.period ||
      editingBudget.budgetedAmount <= 0
    ) {
      toast.error("يرجى تعبئة جميع الحقول المطلوبة");
      return;
    }

    const account = accounts.find(acc => acc.id === editingBudget.accountId);
    if (!account) {
      toast.error("الحساب غير موجود");
      return;
    }

    const { variance, variancePercent, status } = calculateVariance(
      editingBudget.budgetedAmount,
      editingBudget.actualAmount
    );

    const updatedBudget: BudgetItem = {
      ...editingBudget,
      accountName: account.name,
      accountCode: account.id,
      variance,
      variancePercent,
      status,
    };

    try {
      await budgetsApi.update(updatedBudget.id, {
        accountId: updatedBudget.accountId,
        period: updatedBudget.period,
        budgetedAmount: String(updatedBudget.budgetedAmount),
        actualAmount: String(updatedBudget.actualAmount),
        variance: String(variance),
        variancePercent: String(variancePercent),
        status,
      });
      toast.success("تم تحديث الميزانية بنجاح");
      loadData();
    } catch {
      toast.error("فشل تحديث الميزانية");
    }

    setIsEditBudgetOpen(false);
    setEditingBudget(null);
  };

  const handleDeleteBudget = async (id: string) => {
    if (confirm("هل أنت متأكد من حذف هذه الميزانية؟")) {
      try {
        await budgetsApi.delete(id);
        toast.success("تم حذف الميزانية بنجاح");
        loadData();
      } catch {
        toast.error("فشل حذف الميزانية");
      }
    }
  };

  const openEditDialog = (budget: BudgetItem) => {
    setEditingBudget({ ...budget });
    setIsEditBudgetOpen(true);
  };

  const filteredBudgets = budgets.filter(budget => {
    const matchesSearch =
      budget.accountName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      budget.accountCode.toLowerCase().includes(searchTerm.toLowerCase()) ||
      budget.period.includes(searchTerm);
    const matchesPeriod =
      filterPeriod === "all" || budget.period === filterPeriod;
    const matchesAccount =
      filterAccount === "all" || budget.accountId === filterAccount;
    return matchesSearch && matchesPeriod && matchesAccount;
  });

  const periods = generatePeriods();
  const totalBudgeted = filteredBudgets.reduce(
    (sum, b) => sum + b.budgetedAmount,
    0
  );
  const totalActual = filteredBudgets.reduce(
    (sum, b) => sum + b.actualAmount,
    0
  );
  const totalVariance = totalActual - totalBudgeted;
  const totalVariancePercent =
    totalBudgeted !== 0 ? (totalVariance / totalBudgeted) * 100 : 0;

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">
            الموازنة التقديرية
          </h2>
          <p className="text-muted-foreground mt-1">
            إدارة الميزانيات التقديرية لـ{" "}
            <span className="font-bold" style={{ color: getThemeColor() }}>
              {currentEntity.name}
            </span>
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm">
            <Download className="w-4 h-4 ml-2" />
            تصدير
          </Button>

          <Dialog open={isNewBudgetOpen} onOpenChange={setIsNewBudgetOpen}>
            <DialogTrigger asChild>
              <Button size="sm" style={{ backgroundColor: getThemeColor() }}>
                <Plus className="w-4 h-4 ml-2" />
                ميزانية جديدة
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>إضافة ميزانية جديدة</DialogTitle>
                <DialogDescription>
                  إضافة ميزانية تقديرية لحساب محدد لفترة زمنية
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="space-y-2">
                  <Label>الحساب *</Label>
                  <Select
                    value={newBudget.accountId}
                    onValueChange={value =>
                      setNewBudget({ ...newBudget, accountId: value })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="اختر الحساب" />
                    </SelectTrigger>
                    <SelectContent>
                      {accounts.map(account => (
                        <SelectItem key={account.id} value={account.id}>
                          {account.id} - {account.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>الفترة الزمنية *</Label>
                  <Select
                    value={newBudget.period}
                    onValueChange={value =>
                      setNewBudget({ ...newBudget, period: value })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="اختر الفترة" />
                    </SelectTrigger>
                    <SelectContent>
                      {periods.map(period => (
                        <SelectItem key={period} value={period}>
                          {period}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>المبلغ الميزاني *</Label>
                  <Input
                    type="number"
                    value={newBudget.budgetedAmount}
                    onChange={e =>
                      setNewBudget({
                        ...newBudget,
                        budgetedAmount: parseFloat(e.target.value) || 0,
                      })
                    }
                    min="0"
                    placeholder="0.00"
                  />
                </div>
              </div>
              <DialogFooter>
                <Button
                  onClick={handleAddBudget}
                  style={{ backgroundColor: getThemeColor() }}
                >
                  <Save className="w-4 h-4 ml-2" />
                  حفظ
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>

          <Dialog open={isEditBudgetOpen} onOpenChange={setIsEditBudgetOpen}>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>تعديل الميزانية</DialogTitle>
                <DialogDescription>تعديل الميزانية التقديرية</DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="space-y-2">
                  <Label>الحساب *</Label>
                  <Select
                    value={editingBudget?.accountId || ""}
                    onValueChange={value =>
                      setEditingBudget(prev =>
                        prev ? { ...prev, accountId: value } : null
                      )
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="اختر الحساب" />
                    </SelectTrigger>
                    <SelectContent>
                      {accounts.map(account => (
                        <SelectItem key={account.id} value={account.id}>
                          {account.id} - {account.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>الفترة الزمنية *</Label>
                  <Select
                    value={editingBudget?.period || ""}
                    onValueChange={value =>
                      setEditingBudget(prev =>
                        prev ? { ...prev, period: value } : null
                      )
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="اختر الفترة" />
                    </SelectTrigger>
                    <SelectContent>
                      {periods.map(period => (
                        <SelectItem key={period} value={period}>
                          {period}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>المبلغ الميزاني *</Label>
                  <Input
                    type="number"
                    value={editingBudget?.budgetedAmount || 0}
                    onChange={e =>
                      setEditingBudget(prev =>
                        prev
                          ? {
                              ...prev,
                              budgetedAmount: parseFloat(e.target.value) || 0,
                            }
                          : null
                      )
                    }
                    min="0"
                  />
                </div>
                <div className="space-y-2">
                  <Label>المبلغ الفعلي</Label>
                  <Input
                    type="number"
                    value={editingBudget?.actualAmount || 0}
                    onChange={e =>
                      setEditingBudget(prev =>
                        prev
                          ? {
                              ...prev,
                              actualAmount: parseFloat(e.target.value) || 0,
                            }
                          : null
                      )
                    }
                    min="0"
                  />
                </div>
              </div>
              <DialogFooter>
                <Button
                  onClick={handleEditBudget}
                  style={{ backgroundColor: getThemeColor() }}
                >
                  <Save className="w-4 h-4 ml-2" />
                  حفظ التعديلات
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Statistics */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">
                إجمالي الميزانية
              </p>
              <h3 className="text-2xl font-bold mt-1">
                {totalBudgeted.toLocaleString()} ر.س
              </h3>
            </div>
            <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center text-blue-600">
              <Coins className="w-6 h-6" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">
                الإجمالي الفعلي
              </p>
              <h3 className="text-2xl font-bold mt-1">
                {totalActual.toLocaleString()} ر.س
              </h3>
            </div>
            <div className="w-12 h-12 bg-emerald-100 rounded-full flex items-center justify-center text-emerald-600">
              <FileText className="w-6 h-6" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">
                الانحراف
              </p>
              <h3
                className={`text-2xl font-bold mt-1 ${totalVariance >= 0 ? "text-rose-600" : "text-emerald-600"}`}
              >
                {totalVariance.toLocaleString()} ر.س
              </h3>
            </div>
            <div
              className={`w-12 h-12 rounded-full flex items-center justify-center ${totalVariance >= 0 ? "bg-rose-100 text-rose-600" : "bg-emerald-100 text-emerald-600"}`}
            >
              {totalVariance >= 0 ? (
                <TrendingUp className="w-6 h-6" />
              ) : (
                <TrendingDown className="w-6 h-6" />
              )}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">
                نسبة الانحراف
              </p>
              <h3
                className={`text-2xl font-bold mt-1 ${Math.abs(totalVariancePercent) > 10 ? "text-rose-600" : "text-emerald-600"}`}
              >
                {totalVariancePercent.toFixed(1)}%
              </h3>
            </div>
            <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center text-purple-600">
              <Calendar className="w-6 h-6" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
            <div className="relative w-full sm:w-96">
              <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="بحث بالحساب أو الفترة..."
                className="pr-9"
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
              />
            </div>
            <div className="flex gap-2 w-full sm:w-auto">
              <Select value={filterPeriod} onValueChange={setFilterPeriod}>
                <SelectTrigger className="w-[150px]">
                  <SelectValue placeholder="الفترة" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">جميع الفترات</SelectItem>
                  {periods.map(period => (
                    <SelectItem key={period} value={period}>
                      {period}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select value={filterAccount} onValueChange={setFilterAccount}>
                <SelectTrigger className="w-[200px]">
                  <SelectValue placeholder="الحساب" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">جميع الحسابات</SelectItem>
                  {accounts.map(account => (
                    <SelectItem key={account.id} value={account.id}>
                      {account.id} - {account.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Table */}
      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>الحساب</TableHead>
                <TableHead>الفترة</TableHead>
                <TableHead>الميزانية</TableHead>
                <TableHead>الفعلي</TableHead>
                <TableHead>الانحراف</TableHead>
                <TableHead>نسبة الانحراف</TableHead>
                <TableHead>الحالة</TableHead>
                <TableHead className="text-left">إجراءات</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={8} className="text-center py-8">
                    <div className="flex items-center justify-center">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                    </div>
                  </TableCell>
                </TableRow>
              ) : filteredBudgets.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={8}
                    className="text-center py-8 text-muted-foreground"
                  >
                    لا توجد ميزانيات مسجلة. قم بإضافة ميزانية جديدة للبدء.
                  </TableCell>
                </TableRow>
              ) : (
                filteredBudgets.map(budget => {
                  const status = statusMap[budget.status];
                  return (
                    <TableRow
                      key={budget.id}
                      className="hover:bg-muted/50 transition-colors"
                    >
                      <TableCell>
                        <div>
                          <p className="font-semibold">{budget.accountName}</p>
                          <p className="text-xs text-muted-foreground">
                            {budget.accountCode}
                          </p>
                        </div>
                      </TableCell>
                      <TableCell>{budget.period}</TableCell>
                      <TableCell className="font-medium">
                        {budget.budgetedAmount.toLocaleString()} ر.س
                      </TableCell>
                      <TableCell className="font-medium">
                        {budget.actualAmount.toLocaleString()} ر.س
                      </TableCell>
                      <TableCell
                        className={`font-medium ${budget.variance >= 0 ? "text-rose-600" : "text-emerald-600"}`}
                      >
                        {budget.variance >= 0 ? "+" : ""}
                        {budget.variance.toLocaleString()} ر.س
                      </TableCell>
                      <TableCell
                        className={`font-medium ${Math.abs(budget.variancePercent) > 10 ? "text-rose-600" : "text-emerald-600"}`}
                      >
                        {budget.variancePercent >= 0 ? "+" : ""}
                        {budget.variancePercent.toFixed(1)}%
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant="outline"
                          className={`${status.color} font-normal`}
                        >
                          {status.label}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-left">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" className="h-8 w-8 p-0">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuLabel>الإجراءات</DropdownMenuLabel>
                            <DropdownMenuItem
                              onClick={() => openEditDialog(budget)}
                            >
                              <Pencil className="w-4 h-4 ml-2" />
                              تعديل
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                              className="text-destructive"
                              onClick={() => handleDeleteBudget(budget.id)}
                            >
                              <Trash2 className="w-4 h-4 ml-2" />
                              حذف
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}

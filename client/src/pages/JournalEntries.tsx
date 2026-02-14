import { useEffect, useState } from "react";
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
  FileText,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Eye,
  Trash2,
  Save,
  X,
  BookOpen,
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
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { journalEntriesApi, accountsApi } from "../lib/api";
import { useEntity } from "@/contexts/EntityContext";
import { toast } from "sonner";

const statusMap: Record<string, { label: string; color: string; icon: any }> = {
  posted: {
    label: "مرحل",
    color: "bg-emerald-100 text-emerald-700 border-emerald-200",
    icon: CheckCircle2,
  },
  draft: {
    label: "مسودة",
    color: "bg-slate-100 text-slate-700 border-slate-200",
    icon: FileText,
  },
  cancelled: {
    label: "ملغى",
    color: "bg-rose-100 text-rose-700 border-rose-200",
    icon: AlertCircle,
  },
};

const typeMap: Record<string, string> = {
  opening: "قيد افتتاحي",
  depreciation: "إهلاك",
  adjustment: "تسوية",
  salary: "رواتب",
  expense: "مصروفات",
  manual: "قيد يدوي",
  auto: "آلي",
  general: "عام",
};

interface JournalLine {
  accountId: string;
  debit: string;
  credit: string;
  description: string;
  currency: string;
}

interface Account {
  id: string;
  code: string;
  name: string;
  type: string;
}

export default function JournalEntries() {
  const { currentEntity, getThemeColor } = useEntity();
  const [journals, setJournals] = useState<any[]>([]);
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [filterType, setFilterType] = useState("all");

  // New journal dialog
  const [isNewOpen, setIsNewOpen] = useState(false);
  const [newEntry, setNewEntry] = useState({
    date: new Date().toISOString().split("T")[0],
    description: "",
    reference: "",
    type: "manual",
    status: "draft",
  });
  const [newLines, setNewLines] = useState<JournalLine[]>([
    {
      accountId: "",
      debit: "0",
      credit: "0",
      description: "",
      currency: "YER",
    },
    {
      accountId: "",
      debit: "0",
      credit: "0",
      description: "",
      currency: "YER",
    },
  ]);

  // Detail dialog
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [detailEntry, setDetailEntry] = useState<any>(null);
  const [detailLines, setDetailLines] = useState<any[]>([]);
  const [loadingDetail, setLoadingDetail] = useState(false);

  useEffect(() => {
    loadJournals();
    loadAccounts();
  }, [currentEntity]);

  const loadJournals = async () => {
    try {
      setLoading(true);
      const response = currentEntity?.id
        ? await journalEntriesApi.getByEntity(currentEntity.id)
        : await journalEntriesApi.getAll();
      const data = Array.isArray(response) ? response : response?.data || [];
      setJournals(data);
    } catch (error) {
      console.error("Failed to load journal entries:", error);
      setJournals([]);
    } finally {
      setLoading(false);
    }
  };

  const loadAccounts = async () => {
    try {
      const data = currentEntity?.id
        ? await accountsApi.getByEntity(currentEntity.id)
        : await accountsApi.getAll();
      setAccounts(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("Failed to load accounts:", error);
    }
  };

  const handleViewDetail = async (journal: any) => {
    setDetailEntry(journal);
    setIsDetailOpen(true);
    setLoadingDetail(true);
    try {
      const detail = await journalEntriesApi.getById(journal.id);
      setDetailLines(detail?.lines || []);
    } catch (error) {
      console.error("Failed to load journal detail:", error);
      setDetailLines([]);
    } finally {
      setLoadingDetail(false);
    }
  };

  const addLine = () => {
    setNewLines([
      ...newLines,
      {
        accountId: "",
        debit: "0",
        credit: "0",
        description: "",
        currency: "YER",
      },
    ]);
  };

  const removeLine = (index: number) => {
    if (newLines.length <= 2) {
      toast.error("يجب أن يحتوي القيد على سطرين على الأقل");
      return;
    }
    setNewLines(newLines.filter((_, i) => i !== index));
  };

  const updateLine = (
    index: number,
    field: keyof JournalLine,
    value: string
  ) => {
    const updated = [...newLines];
    updated[index] = { ...updated[index], [field]: value };
    // Auto-clear opposite side
    if (field === "debit" && parseFloat(value) > 0) {
      updated[index].credit = "0";
    } else if (field === "credit" && parseFloat(value) > 0) {
      updated[index].debit = "0";
    }
    setNewLines(updated);
  };

  const totalDebit = newLines.reduce(
    (sum, l) => sum + parseFloat(l.debit || "0"),
    0
  );
  const totalCredit = newLines.reduce(
    (sum, l) => sum + parseFloat(l.credit || "0"),
    0
  );
  const isBalanced = Math.abs(totalDebit - totalCredit) < 0.01;

  const handleCreateEntry = async () => {
    if (!newEntry.description) {
      toast.error("يرجى إدخال وصف القيد");
      return;
    }
    if (!isBalanced) {
      toast.error(
        "القيد غير متوازن! يجب أن يتساوى إجمالي المدين مع إجمالي الدائن"
      );
      return;
    }
    if (totalDebit === 0) {
      toast.error("يجب أن يكون إجمالي القيد أكبر من صفر");
      return;
    }
    const invalidLines = newLines.filter(l => !l.accountId);
    if (invalidLines.length > 0) {
      toast.error("يرجى اختيار حساب لكل سطر");
      return;
    }

    try {
      await journalEntriesApi.create({
        entityId: currentEntity?.id,
        date: newEntry.date,
        description: newEntry.description,
        reference: newEntry.reference || undefined,
        type: newEntry.type,
        status: newEntry.status,
        lines: newLines.map(l => ({
          accountId: l.accountId,
          debit: l.debit,
          credit: l.credit,
          description: l.description,
          currency: l.currency,
        })),
      });
      toast.success("تم إنشاء القيد بنجاح");
      setIsNewOpen(false);
      setNewEntry({
        date: new Date().toISOString().split("T")[0],
        description: "",
        reference: "",
        type: "manual",
        status: "draft",
      });
      setNewLines([
        {
          accountId: "",
          debit: "0",
          credit: "0",
          description: "",
          currency: "YER",
        },
        {
          accountId: "",
          debit: "0",
          credit: "0",
          description: "",
          currency: "YER",
        },
      ]);
      loadJournals();
    } catch (error: any) {
      toast.error(error?.message || "فشل في إنشاء القيد");
    }
  };

  const handleDeleteEntry = async (id: string) => {
    if (!confirm("هل أنت متأكد من حذف هذا القيد؟ سيتم عكس تأثيره على الأرصدة."))
      return;
    try {
      await journalEntriesApi.delete(id);
      toast.success("تم حذف القيد بنجاح");
      loadJournals();
    } catch (error: any) {
      toast.error(error?.message || "فشل في حذف القيد");
    }
  };

  // Filter journals
  const filteredJournals = journals.filter(j => {
    const matchesSearch =
      !searchTerm ||
      j.description?.includes(searchTerm) ||
      j.reference?.includes(searchTerm) ||
      j.id?.includes(searchTerm);
    const matchesStatus = filterStatus === "all" || j.status === filterStatus;
    const matchesType = filterType === "all" || j.type === filterType;
    return matchesSearch && matchesStatus && matchesType;
  });

  // Statistics
  const totalEntries = journals.length;
  const postedEntries = journals.filter(j => j.status === "posted").length;
  const draftEntries = journals.filter(j => j.status === "draft").length;
  const autoEntries = journals.filter(j => j.type === "auto").length;

  const getAccountName = (accountId: string) => {
    const account = accounts.find(a => a.id === accountId);
    return account ? `${account.code} - ${account.name}` : accountId;
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">قيود اليومية</h2>
          <p className="text-muted-foreground mt-1">
            إدارة القيود المحاسبية والعمليات اليدوية
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm">
            <Download className="w-4 h-4 ml-2" />
            تصدير
          </Button>
          <Button
            size="sm"
            onClick={() => setIsNewOpen(true)}
            style={{ backgroundColor: getThemeColor?.() }}
          >
            <Plus className="w-4 h-4 ml-2" />
            قيد جديد
          </Button>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">
                إجمالي القيود
              </p>
              <h3 className="text-2xl font-bold mt-1">{totalEntries}</h3>
            </div>
            <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center text-blue-600">
              <BookOpen className="w-5 h-5" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">مرحلة</p>
              <h3 className="text-2xl font-bold mt-1 text-emerald-600">
                {postedEntries}
              </h3>
            </div>
            <div className="w-10 h-10 bg-emerald-100 rounded-full flex items-center justify-center text-emerald-600">
              <CheckCircle2 className="w-5 h-5" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">
                مسودات
              </p>
              <h3 className="text-2xl font-bold mt-1 text-slate-600">
                {draftEntries}
              </h3>
            </div>
            <div className="w-10 h-10 bg-slate-100 rounded-full flex items-center justify-center text-slate-600">
              <FileText className="w-5 h-5" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">
                قيود آلية
              </p>
              <h3 className="text-2xl font-bold mt-1 text-purple-600">
                {autoEntries}
              </h3>
            </div>
            <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center text-purple-600">
              <AlertCircle className="w-5 h-5" />
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
                placeholder="بحث برقم القيد أو الوصف أو المرجع..."
                className="pr-9"
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
              />
            </div>
            <div className="flex gap-2 w-full sm:w-auto">
              <Select value={filterStatus} onValueChange={setFilterStatus}>
                <SelectTrigger className="w-[130px]">
                  <SelectValue placeholder="الحالة" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">جميع الحالات</SelectItem>
                  <SelectItem value="posted">مرحل</SelectItem>
                  <SelectItem value="draft">مسودة</SelectItem>
                  <SelectItem value="cancelled">ملغى</SelectItem>
                </SelectContent>
              </Select>
              <Select value={filterType} onValueChange={setFilterType}>
                <SelectTrigger className="w-[130px]">
                  <SelectValue placeholder="النوع" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">جميع الأنواع</SelectItem>
                  <SelectItem value="manual">يدوي</SelectItem>
                  <SelectItem value="auto">آلي</SelectItem>
                  <SelectItem value="opening">افتتاحي</SelectItem>
                  <SelectItem value="adjustment">تسوية</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Journals Table */}
      <div className="rounded-md border bg-card shadow-sm overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[120px]">رقم القيد</TableHead>
              <TableHead>التاريخ</TableHead>
              <TableHead>النوع</TableHead>
              <TableHead className="w-[35%]">الوصف</TableHead>
              <TableHead>المرجع</TableHead>
              <TableHead>الإجمالي</TableHead>
              <TableHead>الحالة</TableHead>
              <TableHead className="text-left">إجراءات</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={8} className="h-24 text-center">
                  <div className="flex items-center justify-center">
                    <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                  </div>
                </TableCell>
              </TableRow>
            ) : filteredJournals.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={8}
                  className="h-24 text-center text-muted-foreground"
                >
                  لا توجد قيود يومية
                </TableCell>
              </TableRow>
            ) : (
              filteredJournals.map(journal => {
                const status = statusMap[journal.status] || statusMap.draft;
                const StatusIcon = status.icon;
                const total =
                  journal.lines?.reduce(
                    (sum: number, line: any) => sum + Number(line.debit || 0),
                    0
                  ) || 0;

                return (
                  <TableRow
                    key={journal.id}
                    className="hover:bg-muted/50 transition-colors cursor-pointer"
                    onClick={() => handleViewDetail(journal)}
                  >
                    <TableCell className="font-mono text-xs">
                      {journal.id?.substring(0, 8)}...
                    </TableCell>
                    <TableCell>
                      {new Date(journal.date).toLocaleDateString("ar-SA")}
                    </TableCell>
                    <TableCell>
                      <Badge variant="secondary" className="font-normal">
                        {typeMap[journal.type] || journal.type}
                      </Badge>
                    </TableCell>
                    <TableCell>{journal.description}</TableCell>
                    <TableCell className="font-mono text-xs">
                      {journal.reference || "-"}
                    </TableCell>
                    <TableCell className="font-bold">
                      {Number(total).toLocaleString()} ر.ي
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant="outline"
                        className={`${status.color} gap-1 pl-2 pr-2 py-0.5 font-normal`}
                      >
                        <StatusIcon className="w-3 h-3" />
                        {status.label}
                      </Badge>
                    </TableCell>
                    <TableCell
                      className="text-left"
                      onClick={e => e.stopPropagation()}
                    >
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" className="h-8 w-8 p-0">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuLabel>الإجراءات</DropdownMenuLabel>
                          <DropdownMenuItem
                            onClick={() => handleViewDetail(journal)}
                          >
                            <Eye className="w-4 h-4 ml-2" />
                            عرض التفاصيل
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem
                            className="text-destructive"
                            onClick={() => handleDeleteEntry(journal.id)}
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
      </div>

      {/* New Journal Entry Dialog */}
      <Dialog open={isNewOpen} onOpenChange={setIsNewOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>إنشاء قيد يدوي جديد</DialogTitle>
            <DialogDescription>
              أدخل بيانات القيد المحاسبي. يجب أن يكون القيد متوازناً (إجمالي
              المدين = إجمالي الدائن)
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            {/* Header Fields */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>التاريخ *</Label>
                <Input
                  type="date"
                  value={newEntry.date}
                  onChange={e =>
                    setNewEntry({ ...newEntry, date: e.target.value })
                  }
                />
              </div>
              <div className="space-y-2">
                <Label>المرجع</Label>
                <Input
                  value={newEntry.reference}
                  onChange={e =>
                    setNewEntry({ ...newEntry, reference: e.target.value })
                  }
                  placeholder="رقم مرجعي (اختياري)"
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>الوصف *</Label>
                <Input
                  value={newEntry.description}
                  onChange={e =>
                    setNewEntry({ ...newEntry, description: e.target.value })
                  }
                  placeholder="وصف القيد المحاسبي"
                />
              </div>
              <div className="space-y-2">
                <Label>الحالة</Label>
                <Select
                  value={newEntry.status}
                  onValueChange={v => setNewEntry({ ...newEntry, status: v })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="draft">مسودة</SelectItem>
                    <SelectItem value="posted">مرحل</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Lines */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label className="text-base font-semibold">بنود القيد</Label>
                <Button variant="outline" size="sm" onClick={addLine}>
                  <Plus className="w-4 h-4 ml-1" />
                  إضافة سطر
                </Button>
              </div>
              <div className="border rounded-lg overflow-hidden">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-[35%]">الحساب</TableHead>
                      <TableHead>مدين</TableHead>
                      <TableHead>دائن</TableHead>
                      <TableHead>البيان</TableHead>
                      <TableHead className="w-[50px]"></TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {newLines.map((line, idx) => (
                      <TableRow key={idx}>
                        <TableCell>
                          <Select
                            value={line.accountId}
                            onValueChange={v => updateLine(idx, "accountId", v)}
                          >
                            <SelectTrigger className="w-full">
                              <SelectValue placeholder="اختر حساب" />
                            </SelectTrigger>
                            <SelectContent>
                              {accounts.map(acc => (
                                <SelectItem key={acc.id} value={acc.id}>
                                  {acc.code} - {acc.name}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </TableCell>
                        <TableCell>
                          <Input
                            type="number"
                            value={line.debit}
                            onChange={e =>
                              updateLine(idx, "debit", e.target.value)
                            }
                            className="w-28"
                            min="0"
                          />
                        </TableCell>
                        <TableCell>
                          <Input
                            type="number"
                            value={line.credit}
                            onChange={e =>
                              updateLine(idx, "credit", e.target.value)
                            }
                            className="w-28"
                            min="0"
                          />
                        </TableCell>
                        <TableCell>
                          <Input
                            value={line.description}
                            onChange={e =>
                              updateLine(idx, "description", e.target.value)
                            }
                            placeholder="بيان"
                          />
                        </TableCell>
                        <TableCell>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => removeLine(idx)}
                            className="h-8 w-8 p-0 text-destructive"
                          >
                            <X className="w-4 h-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                    {/* Totals Row */}
                    <TableRow className="bg-muted/50 font-bold">
                      <TableCell>الإجمالي</TableCell>
                      <TableCell
                        className={totalDebit > 0 ? "text-emerald-600" : ""}
                      >
                        {totalDebit.toLocaleString()} ر.ي
                      </TableCell>
                      <TableCell
                        className={totalCredit > 0 ? "text-blue-600" : ""}
                      >
                        {totalCredit.toLocaleString()} ر.ي
                      </TableCell>
                      <TableCell colSpan={2}>
                        {isBalanced ? (
                          <Badge className="bg-emerald-100 text-emerald-700">
                            <CheckCircle2 className="w-3 h-3 ml-1" />
                            متوازن
                          </Badge>
                        ) : (
                          <Badge className="bg-rose-100 text-rose-700">
                            <AlertCircle className="w-3 h-3 ml-1" />
                            غير متوازن (فرق:{" "}
                            {Math.abs(
                              totalDebit - totalCredit
                            ).toLocaleString()}{" "}
                            ر.ي)
                          </Badge>
                        )}
                      </TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsNewOpen(false)}>
              إلغاء
            </Button>
            <Button
              onClick={handleCreateEntry}
              disabled={!isBalanced || totalDebit === 0}
              style={{ backgroundColor: getThemeColor?.() }}
            >
              <Save className="w-4 h-4 ml-2" />
              حفظ القيد
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Detail Dialog */}
      <Dialog open={isDetailOpen} onOpenChange={setIsDetailOpen}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>تفاصيل القيد</DialogTitle>
            <DialogDescription>عرض بنود القيد المحاسبي</DialogDescription>
          </DialogHeader>
          {detailEntry && (
            <div className="space-y-4 py-4">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-muted-foreground">رقم القيد:</span>
                  <span className="font-mono mr-2">{detailEntry.id}</span>
                </div>
                <div>
                  <span className="text-muted-foreground">التاريخ:</span>
                  <span className="mr-2">
                    {new Date(detailEntry.date).toLocaleDateString("ar-SA")}
                  </span>
                </div>
                <div>
                  <span className="text-muted-foreground">النوع:</span>
                  <Badge variant="secondary" className="mr-2">
                    {typeMap[detailEntry.type] || detailEntry.type}
                  </Badge>
                </div>
                <div>
                  <span className="text-muted-foreground">الحالة:</span>
                  <Badge
                    variant="outline"
                    className={`${(statusMap[detailEntry.status] || statusMap.draft).color} mr-2`}
                  >
                    {(statusMap[detailEntry.status] || statusMap.draft).label}
                  </Badge>
                </div>
                <div className="col-span-2">
                  <span className="text-muted-foreground">الوصف:</span>
                  <span className="mr-2">{detailEntry.description}</span>
                </div>
                {detailEntry.reference && (
                  <div className="col-span-2">
                    <span className="text-muted-foreground">المرجع:</span>
                    <span className="font-mono mr-2">
                      {detailEntry.reference}
                    </span>
                  </div>
                )}
              </div>

              <div className="border rounded-lg overflow-hidden">
                {loadingDetail ? (
                  <div className="p-8 text-center">
                    <Loader2 className="h-6 w-6 animate-spin mx-auto text-muted-foreground" />
                  </div>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>الحساب</TableHead>
                        <TableHead>مدين</TableHead>
                        <TableHead>دائن</TableHead>
                        <TableHead>البيان</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {detailLines.length === 0 ? (
                        <TableRow>
                          <TableCell
                            colSpan={4}
                            className="text-center text-muted-foreground py-4"
                          >
                            لا توجد بنود
                          </TableCell>
                        </TableRow>
                      ) : (
                        <>
                          {detailLines.map((line: any, idx: number) => (
                            <TableRow key={idx}>
                              <TableCell>
                                {getAccountName(line.accountId)}
                              </TableCell>
                              <TableCell
                                className={
                                  Number(line.debit) > 0
                                    ? "font-bold text-emerald-600"
                                    : ""
                                }
                              >
                                {Number(line.debit).toLocaleString()} ر.ي
                              </TableCell>
                              <TableCell
                                className={
                                  Number(line.credit) > 0
                                    ? "font-bold text-blue-600"
                                    : ""
                                }
                              >
                                {Number(line.credit).toLocaleString()} ر.ي
                              </TableCell>
                              <TableCell>{line.description || "-"}</TableCell>
                            </TableRow>
                          ))}
                          <TableRow className="bg-muted/50 font-bold">
                            <TableCell>الإجمالي</TableCell>
                            <TableCell className="text-emerald-600">
                              {detailLines
                                .reduce(
                                  (s: number, l: any) =>
                                    s + Number(l.debit || 0),
                                  0
                                )
                                .toLocaleString()}{" "}
                              ر.ي
                            </TableCell>
                            <TableCell className="text-blue-600">
                              {detailLines
                                .reduce(
                                  (s: number, l: any) =>
                                    s + Number(l.credit || 0),
                                  0
                                )
                                .toLocaleString()}{" "}
                              ر.ي
                            </TableCell>
                            <TableCell></TableCell>
                          </TableRow>
                        </>
                      )}
                    </TableBody>
                  </Table>
                )}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

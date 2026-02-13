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
  Filter,
  Download,
  MoreHorizontal,
  FileText,
  CheckCircle2,
  AlertCircle,
  Loader2,
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
import { journalEntriesApi } from "../lib/api";
import { useEntity } from "@/contexts/EntityContext";

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

export default function JournalEntries() {
  const { currentEntity } = useEntity();
  const [journals, setJournals] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadJournals();
  }, [currentEntity]);

  const loadJournals = async () => {
    try {
      setLoading(true);
      // Use getByEntity if entity is selected, otherwise getAll
      const response = currentEntity?.id
        ? await journalEntriesApi.getByEntity(currentEntity.id)
        : await journalEntriesApi.getAll();
      // API returns {data: [], pagination: {}} or direct array
      const data = Array.isArray(response) ? response : response?.data || [];
      setJournals(data);
    } catch (error) {
      console.error("Failed to load journal entries:", error);
      setJournals([]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
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
          <Button size="sm">
            <Plus className="w-4 h-4 ml-2" />
            قيد جديد
          </Button>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row gap-4 items-center justify-between bg-card p-4 rounded-lg border shadow-sm">
        <div className="relative w-full sm:w-96">
          <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input placeholder="بحث برقم القيد أو الوصف..." className="pr-9" />
        </div>
        <div className="flex gap-2 w-full sm:w-auto">
          <Button variant="outline" size="sm" className="flex-1 sm:flex-none">
            <Filter className="w-4 h-4 ml-2" />
            تصفية
          </Button>
          <select className="h-9 rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50">
            <option>جميع الحالات</option>
            <option>مرحل</option>
            <option>مسودة</option>
          </select>
        </div>
      </div>

      <div className="rounded-md border bg-card shadow-sm overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[120px]">رقم القيد</TableHead>
              <TableHead>التاريخ</TableHead>
              <TableHead>النوع</TableHead>
              <TableHead className="w-[40%]">الوصف</TableHead>
              <TableHead>الإجمالي</TableHead>
              <TableHead>الحالة</TableHead>
              <TableHead className="text-left">إجراءات</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={7} className="h-24 text-center">
                  <div className="flex items-center justify-center">
                    <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                  </div>
                </TableCell>
              </TableRow>
            ) : journals.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={7}
                  className="h-24 text-center text-muted-foreground"
                >
                  لا توجد قيود يومية
                </TableCell>
              </TableRow>
            ) : (
              journals.map(journal => {
                const status = statusMap[journal.status] || statusMap.draft;
                const StatusIcon = status.icon;
                const total =
                  journal.lines?.reduce(
                    (sum: number, line: any) => sum + Number(line.debit),
                    0
                  ) || 0;

                return (
                  <TableRow
                    key={journal.id}
                    className="hover:bg-muted/50 transition-colors"
                  >
                    <TableCell className="font-medium">{journal.id}</TableCell>
                    <TableCell>
                      {new Date(journal.date).toLocaleDateString("ar-SA")}
                    </TableCell>
                    <TableCell>
                      <Badge variant="secondary" className="font-normal">
                        {typeMap[journal.type] || journal.type}
                      </Badge>
                    </TableCell>
                    <TableCell>{journal.description}</TableCell>
                    <TableCell className="font-bold">
                      {Number(total).toLocaleString()} ر.س
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
                          <DropdownMenuItem>تكرار القيد</DropdownMenuItem>
                          <DropdownMenuItem>عكس القيد</DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem className="text-destructive">
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
    </div>
  );
}

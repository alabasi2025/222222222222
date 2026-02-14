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
  Search,
  Filter,
  Download,
  Calendar,
  BookOpen,
  Loader2,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useState, useEffect } from "react";
import { journalEntriesApi } from "@/lib/api";
import { useEntity } from "@/contexts/EntityContext";
import { toast } from "sonner";

interface LedgerLine {
  id: string;
  date: string;
  entryId: string;
  account: string;
  accountId: string;
  description: string;
  debit: number;
  credit: number;
}

export default function Ledger() {
  const { currentEntity } = useEntity();
  const [ledgerLines, setLedgerLines] = useState<LedgerLine[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    loadLedgerData();
  }, [currentEntity]);

  const loadLedgerData = async () => {
    try {
      setLoading(true);
      // Get journal entries with lines for current entity
      const entries = currentEntity?.id
        ? await journalEntriesApi.getByEntity(currentEntity.id)
        : await journalEntriesApi.getAll();

      // Flatten entries to ledger lines
      const lines: LedgerLine[] = [];
      entries.forEach((entry: any) => {
        if (entry.lines && Array.isArray(entry.lines)) {
          entry.lines.forEach((line: any) => {
            lines.push({
              id: line.id,
              date: entry.date,
              entryId: entry.id,
              account: line.account?.name || "غير معروف",
              accountId: line.accountId,
              description: line.description || entry.description || "",
              debit: Number(line.debit || 0),
              credit: Number(line.credit || 0),
            });
          });
        }
      });

      // Sort by date descending
      lines.sort(
        (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
      );

      setLedgerLines(lines);
    } catch (error) {
      console.error("Failed to load ledger data:", error);
      toast.error("فشل تحميل بيانات دفتر الأستاذ");
    } finally {
      setLoading(false);
    }
  };

  // Calculate totals
  const totalDebit = ledgerLines.reduce((sum, line) => sum + line.debit, 0);
  const totalCredit = ledgerLines.reduce((sum, line) => sum + line.credit, 0);
  const entriesCount = new Set(ledgerLines.map(line => line.entryId)).size;

  // Filter lines by search term
  const filteredLines = ledgerLines.filter(
    line =>
      line.account.toLowerCase().includes(searchTerm.toLowerCase()) ||
      line.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      line.entryId.toLowerCase().includes(searchTerm.toLowerCase())
  );
  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">
            دفتر الأستاذ العام
          </h2>
          <p className="text-muted-foreground mt-1">
            سجل جميع القيود المحاسبية والحركات المالية
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm">
            <Download className="w-4 h-4 ml-2" />
            تصدير PDF
          </Button>
          <Button variant="outline" size="sm">
            <Download className="w-4 h-4 ml-2" />
            تصدير Excel
          </Button>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">إجمالي المدين</CardTitle>
            <BookOpen className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {totalDebit.toLocaleString()} ر.ي
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">إجمالي الدائن</CardTitle>
            <BookOpen className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {totalCredit.toLocaleString()} ر.ي
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">عدد القيود</CardTitle>
            <BookOpen className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{entriesCount}</div>
          </CardContent>
        </Card>
      </div>

      <div className="flex flex-col sm:flex-row gap-4 items-center justify-between bg-card p-4 rounded-lg border shadow-sm">
        <div className="relative w-full sm:w-96">
          <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="بحث في الوصف أو الحساب..."
            className="pr-9"
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="flex gap-2 w-full sm:w-auto">
          <Button variant="outline" size="sm" className="flex-1 sm:flex-none">
            <Calendar className="w-4 h-4 ml-2" />
            الفترة
          </Button>
          <Button variant="outline" size="sm" className="flex-1 sm:flex-none">
            <Filter className="w-4 h-4 ml-2" />
            تصفية الحسابات
          </Button>
        </div>
      </div>

      <div className="rounded-md border bg-card shadow-sm overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[120px]">التاريخ</TableHead>
              <TableHead className="w-[150px]">رقم القيد</TableHead>
              <TableHead>الحساب</TableHead>
              <TableHead>البيان</TableHead>
              <TableHead className="text-left">مدين</TableHead>
              <TableHead className="text-left">دائن</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={6} className="h-24 text-center">
                  <div className="flex items-center justify-center">
                    <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                  </div>
                </TableCell>
              </TableRow>
            ) : filteredLines.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={6}
                  className="h-24 text-center text-muted-foreground"
                >
                  {ledgerLines.length === 0
                    ? "لا توجد حركات في دفتر الأستاذ"
                    : "لا توجد نتائج للبحث"}
                </TableCell>
              </TableRow>
            ) : (
              filteredLines.map(line => (
                <TableRow
                  key={line.id}
                  className="hover:bg-muted/50 transition-colors"
                >
                  <TableCell>
                    {new Date(line.date).toLocaleDateString("ar-SA")}
                  </TableCell>
                  <TableCell className="font-medium text-xs text-muted-foreground">
                    {line.entryId}
                  </TableCell>
                  <TableCell className="font-medium">{line.account}</TableCell>
                  <TableCell>{line.description}</TableCell>
                  <TableCell className="text-left font-mono">
                    {line.debit > 0 ? line.debit.toLocaleString() : "-"}
                  </TableCell>
                  <TableCell className="text-left font-mono">
                    {line.credit > 0 ? line.credit.toLocaleString() : "-"}
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}

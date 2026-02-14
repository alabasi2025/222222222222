import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  FileText,
  Download,
  AlertTriangle,
  CheckCircle,
  Clock,
  ArrowUpRight,
  ArrowDownLeft,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const taxPeriods = [
  {
    id: "VAT-2024-Q4",
    period: "الربع الرابع 2024",
    startDate: "2024-10-01",
    endDate: "2024-12-31",
    salesVat: 45000.0,
    purchaseVat: 12000.0,
    netVat: 33000.0,
    status: "submitted",
    dueDate: "2025-01-31",
  },
  {
    id: "VAT-2024-Q3",
    period: "الربع الثالث 2024",
    startDate: "2024-07-01",
    endDate: "2024-09-30",
    salesVat: 38000.0,
    purchaseVat: 15000.0,
    netVat: 23000.0,
    status: "paid",
    dueDate: "2024-10-31",
  },
  {
    id: "VAT-2024-Q2",
    period: "الربع الثاني 2024",
    startDate: "2024-04-01",
    endDate: "2024-06-30",
    salesVat: 42000.0,
    purchaseVat: 18000.0,
    netVat: 24000.0,
    status: "paid",
    dueDate: "2024-07-31",
  },
];

const statusMap: Record<string, { label: string; color: string; icon: any }> = {
  draft: {
    label: "مسودة",
    color: "bg-slate-100 text-slate-700 border-slate-200",
    icon: FileText,
  },
  submitted: {
    label: "تم التقديم",
    color: "bg-blue-100 text-blue-700 border-blue-200",
    icon: Clock,
  },
  paid: {
    label: "مدفوع",
    color: "bg-emerald-100 text-emerald-700 border-emerald-200",
    icon: CheckCircle,
  },
  overdue: {
    label: "متأخر",
    color: "bg-rose-100 text-rose-700 border-rose-200",
    icon: AlertTriangle,
  },
};

export default function TaxManagement() {
  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">
            إدارة ضريبة القيمة المضافة
          </h2>
          <p className="text-muted-foreground mt-1">
            الإقرارات الضريبية والتقارير (VAT)
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm">
            <Download className="w-4 h-4 ml-2" />
            تقرير المبيعات الضريبي
          </Button>
          <Button size="sm">
            <FileText className="w-4 h-4 ml-2" />
            إقرار جديد
          </Button>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              ضريبة المبيعات (مستحقة)
            </CardTitle>
            <ArrowUpRight className="h-4 w-4 text-rose-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-rose-600">
              15,230.00 ر.ي
            </div>
            <p className="text-xs text-muted-foreground">
              للربع الحالي (غير مقدم)
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              ضريبة المشتريات (مستردة)
            </CardTitle>
            <ArrowDownLeft className="h-4 w-4 text-emerald-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-emerald-600">
              4,120.00 ر.ي
            </div>
            <p className="text-xs text-muted-foreground">
              للربع الحالي (غير مقدم)
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              صافي الضريبة المستحقة
            </CardTitle>
            <FileText className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">
              11,110.00 ر.ي
            </div>
            <p className="text-xs text-muted-foreground">
              واجبة السداد بنهاية الفترة
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="rounded-md border bg-card shadow-sm overflow-hidden">
        <div className="p-4 border-b bg-muted/30">
          <h3 className="font-semibold flex items-center gap-2">
            <HistoryIcon className="w-4 h-4" />
            سجل الإقرارات الضريبية
          </h3>
        </div>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>الفترة الضريبية</TableHead>
              <TableHead>من تاريخ</TableHead>
              <TableHead>إلى تاريخ</TableHead>
              <TableHead>ضريبة المبيعات</TableHead>
              <TableHead>ضريبة المشتريات</TableHead>
              <TableHead>صافي الضريبة</TableHead>
              <TableHead>تاريخ الاستحقاق</TableHead>
              <TableHead>الحالة</TableHead>
              <TableHead className="text-left">إجراءات</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {taxPeriods.map(period => {
              const status = statusMap[period.status];
              const StatusIcon = status.icon;

              return (
                <TableRow
                  key={period.id}
                  className="hover:bg-muted/50 transition-colors"
                >
                  <TableCell className="font-semibold">
                    {period.period}
                  </TableCell>
                  <TableCell>{period.startDate}</TableCell>
                  <TableCell>{period.endDate}</TableCell>
                  <TableCell className="text-rose-600">
                    {period.salesVat.toLocaleString()}
                  </TableCell>
                  <TableCell className="text-emerald-600">
                    {period.purchaseVat.toLocaleString()}
                  </TableCell>
                  <TableCell className="font-bold">
                    {period.netVat.toLocaleString()}
                  </TableCell>
                  <TableCell>{period.dueDate}</TableCell>
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
                    <Button variant="ghost" size="sm">
                      عرض التفاصيل
                    </Button>
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

function HistoryIcon(props: any) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" />
      <path d="M3 3v5h5" />
      <path d="M12 7v5l4 2" />
    </svg>
  );
}

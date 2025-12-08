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
  Users,
  Phone,
  Mail,
  MapPin,
  Building2
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

const customers = [
  { id: "CUS-001", name: "شركة التقنية الحديثة", type: "شركة", email: "info@tech-modern.com", phone: "0501234567", balance: 1200.00, status: "active" },
  { id: "CUS-002", name: "مؤسسة البناء", type: "مؤسسة", email: "contact@al-binaa.com", phone: "0559876543", balance: -3450.00, status: "active" },
  { id: "CUS-003", name: "سوبر ماركت السلام", type: "فرد", email: "salam@gmail.com", phone: "0541122334", balance: 0.00, status: "inactive" },
  { id: "CUS-004", name: "مطعم النخيل", type: "شركة", email: "manager@palm-rest.com", phone: "0566677788", balance: 2100.00, status: "active" },
];

const suppliers = [
  { id: "SUP-001", name: "شركة التوريدات العالمية", type: "شركة", email: "sales@global-supply.com", phone: "0112233445", balance: 15000.00, status: "active" },
  { id: "SUP-002", name: "مصنع الأثاث الحديث", type: "مصنع", email: "orders@modern-furniture.com", phone: "0123344556", balance: 8450.00, status: "active" },
  { id: "SUP-003", name: "مؤسسة التقنية", type: "مؤسسة", email: "support@tech-est.com", phone: "0134455667", balance: 0.00, status: "inactive" },
];

export default function Contacts() {
  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">العملاء والموردين</h2>
          <p className="text-muted-foreground mt-1">إدارة بيانات الاتصال والأرصدة</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm">
            <Download className="w-4 h-4 ml-2" />
            تصدير
          </Button>
          <Button size="sm">
            <Plus className="w-4 h-4 ml-2" />
            جهة اتصال جديدة
          </Button>
        </div>
      </div>

      <Tabs defaultValue="customers" className="w-full">
        <TabsList className="grid w-full max-w-md grid-cols-2 mb-8">
          <TabsTrigger value="customers">العملاء</TabsTrigger>
          <TabsTrigger value="suppliers">الموردين</TabsTrigger>
        </TabsList>

        <div className="flex flex-col sm:flex-row gap-4 items-center justify-between bg-card p-4 rounded-lg border shadow-sm mb-6">
          <div className="relative w-full sm:w-96">
            <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input placeholder="بحث بالاسم، البريد الإلكتروني أو الهاتف..." className="pr-9" />
          </div>
          <div className="flex gap-2 w-full sm:w-auto">
            <Button variant="outline" size="sm" className="flex-1 sm:flex-none">
              <Filter className="w-4 h-4 ml-2" />
              تصفية
            </Button>
          </div>
        </div>

        <TabsContent value="customers">
          <div className="rounded-md border bg-card shadow-sm overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[250px]">الاسم</TableHead>
                  <TableHead>معلومات الاتصال</TableHead>
                  <TableHead>النوع</TableHead>
                  <TableHead>الرصيد</TableHead>
                  <TableHead>الحالة</TableHead>
                  <TableHead className="text-left">إجراءات</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {customers.map((customer) => (
                  <TableRow key={customer.id} className="hover:bg-muted/50 transition-colors">
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <Avatar className="h-9 w-9">
                          <AvatarFallback className="bg-primary/10 text-primary">
                            {customer.name.substring(0, 2)}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="font-medium">{customer.name}</p>
                          <p className="text-xs text-muted-foreground">{customer.id}</p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="space-y-1">
                        <div className="flex items-center text-xs text-muted-foreground">
                          <Mail className="w-3 h-3 ml-1" />
                          {customer.email}
                        </div>
                        <div className="flex items-center text-xs text-muted-foreground">
                          <Phone className="w-3 h-3 ml-1" />
                          {customer.phone}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="secondary" className="font-normal">
                        {customer.type}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <span className={`font-bold ${customer.balance > 0 ? "text-emerald-600" : customer.balance < 0 ? "text-rose-600" : ""}`}>
                        {customer.balance.toLocaleString()} ر.س
                      </span>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className={customer.status === "active" ? "bg-emerald-50 text-emerald-700 border-emerald-200" : "bg-slate-100 text-slate-700"}>
                        {customer.status === "active" ? "نشط" : "غير نشط"}
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
                          <DropdownMenuItem>عرض الملف</DropdownMenuItem>
                          <DropdownMenuItem>كشف حساب</DropdownMenuItem>
                          <DropdownMenuItem>تعديل البيانات</DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem className="text-destructive">حذف</DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </TabsContent>

        <TabsContent value="suppliers">
          <div className="rounded-md border bg-card shadow-sm overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[250px]">الاسم</TableHead>
                  <TableHead>معلومات الاتصال</TableHead>
                  <TableHead>النوع</TableHead>
                  <TableHead>الرصيد</TableHead>
                  <TableHead>الحالة</TableHead>
                  <TableHead className="text-left">إجراءات</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {suppliers.map((supplier) => (
                  <TableRow key={supplier.id} className="hover:bg-muted/50 transition-colors">
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <Avatar className="h-9 w-9">
                          <AvatarFallback className="bg-secondary/10 text-secondary-foreground">
                            {supplier.name.substring(0, 2)}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="font-medium">{supplier.name}</p>
                          <p className="text-xs text-muted-foreground">{supplier.id}</p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="space-y-1">
                        <div className="flex items-center text-xs text-muted-foreground">
                          <Mail className="w-3 h-3 ml-1" />
                          {supplier.email}
                        </div>
                        <div className="flex items-center text-xs text-muted-foreground">
                          <Phone className="w-3 h-3 ml-1" />
                          {supplier.phone}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="secondary" className="font-normal">
                        {supplier.type}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <span className={`font-bold ${supplier.balance > 0 ? "text-rose-600" : supplier.balance < 0 ? "text-emerald-600" : ""}`}>
                        {supplier.balance.toLocaleString()} ر.س
                      </span>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className={supplier.status === "active" ? "bg-emerald-50 text-emerald-700 border-emerald-200" : "bg-slate-100 text-slate-700"}>
                        {supplier.status === "active" ? "نشط" : "غير نشط"}
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
                          <DropdownMenuItem>عرض الملف</DropdownMenuItem>
                          <DropdownMenuItem>كشف حساب</DropdownMenuItem>
                          <DropdownMenuItem>تعديل البيانات</DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem className="text-destructive">حذف</DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}

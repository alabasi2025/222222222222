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
  Building2,
  Save
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useState } from "react";
import { toast } from "sonner";

// Initial clean data
const initialCustomers: any[] = [];
const initialSuppliers: any[] = [];

export default function Contacts() {
  const [customers, setCustomers] = useState(initialCustomers);
  const [suppliers, setSuppliers] = useState(initialSuppliers);
  const [activeTab, setActiveTab] = useState("customers");
  const [isNewContactOpen, setIsNewContactOpen] = useState(false);
  const [newContact, setNewContact] = useState({
    name: "",
    type: "شركة",
    email: "",
    phone: "",
    category: "customer" // customer or supplier
  });

  const handleAddContact = () => {
    if (!newContact.name || !newContact.phone) {
      toast.error("يرجى تعبئة الاسم ورقم الهاتف");
      return;
    }

    const contact = {
      id: newContact.category === "customer" 
        ? `CUS-${String(customers.length + 1).padStart(3, '0')}`
        : `SUP-${String(suppliers.length + 1).padStart(3, '0')}`,
      name: newContact.name,
      type: newContact.type,
      email: newContact.email,
      phone: newContact.phone,
      balance: 0.00,
      status: "active"
    };

    if (newContact.category === "customer") {
      setCustomers([...customers, contact]);
      toast.success("تم إضافة العميل بنجاح");
    } else {
      setSuppliers([...suppliers, contact]);
      toast.success("تم إضافة المورد بنجاح");
    }

    setIsNewContactOpen(false);
    setNewContact({
      name: "",
      type: "شركة",
      email: "",
      phone: "",
      category: activeTab === "customers" ? "customer" : "supplier"
    });
  };

  const handleDeleteCustomer = (id: string) => {
    setCustomers(customers.filter(c => c.id !== id));
    toast.success("تم حذف العميل بنجاح");
  };

  const handleDeleteSupplier = (id: string) => {
    setSuppliers(suppliers.filter(s => s.id !== id));
    toast.success("تم حذف المورد بنجاح");
  };

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
          
          <Dialog open={isNewContactOpen} onOpenChange={setIsNewContactOpen}>
            <DialogTrigger asChild>
              <Button size="sm" onClick={() => setNewContact({...newContact, category: activeTab === "customers" ? "customer" : "supplier"})}>
                <Plus className="w-4 h-4 ml-2" />
                جهة اتصال جديدة
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>إضافة جهة اتصال جديدة</DialogTitle>
                <DialogDescription>
                  أدخل بيانات العميل أو المورد الجديد.
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="category" className="text-right">التصنيف</Label>
                  <Select 
                    value={newContact.category} 
                    onValueChange={(v) => setNewContact({...newContact, category: v})}
                  >
                    <SelectTrigger className="col-span-3">
                      <SelectValue placeholder="اختر التصنيف" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="customer">عميل</SelectItem>
                      <SelectItem value="supplier">مورد</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="name" className="text-right">الاسم</Label>
                  <Input 
                    id="name" 
                    value={newContact.name}
                    onChange={(e) => setNewContact({...newContact, name: e.target.value})}
                    className="col-span-3" 
                  />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="type" className="text-right">النوع</Label>
                  <Select 
                    value={newContact.type} 
                    onValueChange={(v) => setNewContact({...newContact, type: v})}
                  >
                    <SelectTrigger className="col-span-3">
                      <SelectValue placeholder="اختر النوع" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="شركة">شركة</SelectItem>
                      <SelectItem value="مؤسسة">مؤسسة</SelectItem>
                      <SelectItem value="فرد">فرد</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="phone" className="text-right">الهاتف</Label>
                  <Input 
                    id="phone" 
                    value={newContact.phone}
                    onChange={(e) => setNewContact({...newContact, phone: e.target.value})}
                    className="col-span-3" 
                  />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="email" className="text-right">البريد الإلكتروني</Label>
                  <Input 
                    id="email" 
                    type="email"
                    value={newContact.email}
                    onChange={(e) => setNewContact({...newContact, email: e.target.value})}
                    className="col-span-3" 
                  />
                </div>
              </div>
              <DialogFooter>
                <Button onClick={handleAddContact}>
                  <Save className="w-4 h-4 ml-2" />
                  حفظ البيانات
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
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
                {customers.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                      لا يوجد عملاء مسجلين. قم بإضافة عميل جديد.
                    </TableCell>
                  </TableRow>
                ) : (
                  customers.map((customer) => (
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
                          <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <Mail className="w-3 h-3" />
                            {customer.email}
                          </div>
                          <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <Phone className="w-3 h-3" />
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
                        <span className={`font-bold ${customer.balance > 0 ? 'text-emerald-600' : customer.balance < 0 ? 'text-rose-600' : 'text-muted-foreground'}`}>
                          {Math.abs(customer.balance).toLocaleString()} ر.س
                          {customer.balance > 0 ? ' (له)' : customer.balance < 0 ? ' (عليه)' : ''}
                        </span>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className="bg-emerald-50 text-emerald-700 border-emerald-200">
                          نشط
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
                            <DropdownMenuItem>كشف حساب</DropdownMenuItem>
                            <DropdownMenuItem>تعديل البيانات</DropdownMenuItem>
                            <DropdownMenuItem>إنشاء فاتورة</DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem className="text-destructive" onClick={() => handleDeleteCustomer(customer.id)}>
                              حذف
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))
                )}
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
                {suppliers.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                      لا يوجد موردين مسجلين. قم بإضافة مورد جديد.
                    </TableCell>
                  </TableRow>
                ) : (
                  suppliers.map((supplier) => (
                    <TableRow key={supplier.id} className="hover:bg-muted/50 transition-colors">
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <Avatar className="h-9 w-9">
                            <AvatarFallback className="bg-blue-100 text-blue-700">
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
                          <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <Mail className="w-3 h-3" />
                            {supplier.email}
                          </div>
                          <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <Phone className="w-3 h-3" />
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
                        <span className={`font-bold ${supplier.balance > 0 ? 'text-emerald-600' : supplier.balance < 0 ? 'text-rose-600' : 'text-muted-foreground'}`}>
                          {Math.abs(supplier.balance).toLocaleString()} ر.س
                          {supplier.balance > 0 ? ' (له)' : supplier.balance < 0 ? ' (عليه)' : ''}
                        </span>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className="bg-emerald-50 text-emerald-700 border-emerald-200">
                          نشط
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
                            <DropdownMenuItem>كشف حساب</DropdownMenuItem>
                            <DropdownMenuItem>تعديل البيانات</DropdownMenuItem>
                            <DropdownMenuItem>إنشاء فاتورة شراء</DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem className="text-destructive" onClick={() => handleDeleteSupplier(supplier.id)}>
                              حذف
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}

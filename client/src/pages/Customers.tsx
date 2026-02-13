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
  Download, 
  MoreHorizontal,
  Users,
  Phone,
  Mail,
  Save,
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
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useState, useEffect } from "react";
import { toast } from "sonner";
import { useEntity } from "@/contexts/EntityContext";

const initialCustomers: any[] = [];

export default function Customers() {
  const { currentEntity, getThemeColor } = useEntity();
  
  const loadFromStorage = () => {
    try {
      const savedCustomers = localStorage.getItem('customers');
      if (savedCustomers) {
        return JSON.parse(savedCustomers);
      }
      return initialCustomers;
    } catch {
      return initialCustomers;
    }
  };

  const [customers, setCustomers] = useState(loadFromStorage);
  const [isNewCustomerOpen, setIsNewCustomerOpen] = useState(false);
  const [isEditCustomerOpen, setIsEditCustomerOpen] = useState(false);
  const [editingCustomer, setEditingCustomer] = useState<any>(null);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    setCustomers(loadFromStorage());
  }, [currentEntity]);

  const [newCustomer, setNewCustomer] = useState({
    name: "",
    type: "شركة",
    email: "",
    phone: "",
  });

  if (!currentEntity) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-muted-foreground">الرجاء اختيار كيان أولاً</p>
      </div>
    );
  }


  const visibleCustomers = customers.filter((c: any) => {
    if (currentEntity.type === 'holding') return true;
    return c.entityId === currentEntity.id;
  }).filter((c: any) => 
    c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.phone.includes(searchTerm) ||
    (c.email && c.email.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const handleAddCustomer = () => {
    if (!newCustomer.name || !newCustomer.phone) {
      toast.error("يرجى تعبئة الاسم ورقم الهاتف");
      return;
    }

    const customer = {
      id: `CUS-${String(customers.length + 1).padStart(3, '0')}`,
      entityId: currentEntity.id,
      name: newCustomer.name,
      type: newCustomer.type,
      email: newCustomer.email,
      phone: newCustomer.phone,
      balance: 0.00,
      status: "active"
    };

    const updatedCustomers = [...customers, customer];
    setCustomers(updatedCustomers);
    localStorage.setItem('customers', JSON.stringify(updatedCustomers));
    toast.success("تم إضافة العميل بنجاح");

    setIsNewCustomerOpen(false);
    setNewCustomer({
      name: "",
      type: "شركة",
      email: "",
      phone: "",
    });
  };

  const handleEditCustomer = () => {
    if (!editingCustomer || !editingCustomer.name) {
      toast.error("يرجى إدخال الاسم");
      return;
    }

      const updatedCustomers = customers.map((c: any) => 
        c.id === editingCustomer.id ? editingCustomer : c
    );
    setCustomers(updatedCustomers);
    localStorage.setItem('customers', JSON.stringify(updatedCustomers));
    toast.success("تم تحديث بيانات العميل بنجاح");
    
    setIsEditCustomerOpen(false);
    setEditingCustomer(null);
  };

  const handleDeleteCustomer = (id: string) => {
    if (confirm("هل أنت متأكد من حذف هذا العميل؟")) {
      const updatedCustomers = customers.filter((c: any) => c.id !== id);
      setCustomers(updatedCustomers);
      localStorage.setItem('customers', JSON.stringify(updatedCustomers));
      toast.success("تم حذف العميل بنجاح");
    }
  };

  const openEditDialog = (customer: any) => {
    setEditingCustomer({ ...customer });
    setIsEditCustomerOpen(true);
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">العملاء</h2>
          <p className="text-muted-foreground mt-1">
            إدارة بيانات العملاء لـ <span className="font-bold" style={{ color: getThemeColor() }}>{currentEntity.name}</span>
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm">
            <Download className="w-4 h-4 ml-2" />
            تصدير
          </Button>
          
          <Dialog open={isNewCustomerOpen} onOpenChange={setIsNewCustomerOpen}>
            <DialogTrigger asChild>
              <Button size="sm" style={{ backgroundColor: getThemeColor() }}>
                <Plus className="w-4 h-4 ml-2" />
                عميل جديد
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>إضافة عميل جديد</DialogTitle>
                <DialogDescription>
                  سيتم إضافة العميل إلى: <span className="font-bold">{currentEntity.name}</span>
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="name" className="text-right">الاسم *</Label>
                  <Input 
                    id="name" 
                    value={newCustomer.name}
                    onChange={(e) => setNewCustomer({...newCustomer, name: e.target.value})}
                    className="col-span-3" 
                  />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="type" className="text-right">النوع</Label>
                  <Select 
                    value={newCustomer.type} 
                    onValueChange={(v) => setNewCustomer({...newCustomer, type: v})}
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
                  <Label htmlFor="phone" className="text-right">الهاتف *</Label>
                  <Input 
                    id="phone" 
                    value={newCustomer.phone}
                    onChange={(e) => setNewCustomer({...newCustomer, phone: e.target.value})}
                    className="col-span-3" 
                  />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="email" className="text-right">البريد الإلكتروني</Label>
                  <Input 
                    id="email" 
                    type="email"
                    value={newCustomer.email}
                    onChange={(e) => setNewCustomer({...newCustomer, email: e.target.value})}
                    className="col-span-3" 
                  />
                </div>
              </div>
              <DialogFooter>
                <Button onClick={handleAddCustomer} style={{ backgroundColor: getThemeColor() }}>
                  <Save className="w-4 h-4 ml-2" />
                  حفظ البيانات
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>

          <Dialog open={isEditCustomerOpen} onOpenChange={setIsEditCustomerOpen}>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>تعديل بيانات العميل</DialogTitle>
                <DialogDescription>
                  تعديل بيانات العميل.
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="edit-name" className="text-right">الاسم *</Label>
                  <Input 
                    id="edit-name" 
                    value={editingCustomer?.name || ""}
                    onChange={(e) => setEditingCustomer((prev: any) => prev ? {...prev, name: e.target.value} : null)}
                    className="col-span-3" 
                  />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="edit-phone" className="text-right">الهاتف *</Label>
                  <Input 
                    id="edit-phone" 
                    value={editingCustomer?.phone || ""}
                    onChange={(e) => setEditingCustomer((prev: any) => prev ? {...prev, phone: e.target.value} : null)}
                    className="col-span-3" 
                  />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="edit-email" className="text-right">البريد الإلكتروني</Label>
                  <Input 
                    id="edit-email" 
                    type="email"
                    value={editingCustomer?.email || ""}
                    onChange={(e) => setEditingCustomer((prev: any) => prev ? {...prev, email: e.target.value} : null)}
                    className="col-span-3" 
                  />
                </div>
              </div>
              <DialogFooter>
                <Button onClick={handleEditCustomer} style={{ backgroundColor: getThemeColor() }}>
                  <Save className="w-4 h-4 ml-2" />
                  حفظ التعديلات
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row gap-4 items-center justify-between bg-card p-4 rounded-lg border shadow-sm">
        <div className="relative w-full sm:w-96">
          <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input 
            placeholder="بحث بالاسم أو الهاتف أو البريد..." 
            className="pr-9"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      <div className="rounded-md border bg-card shadow-sm overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[250px]">الاسم</TableHead>
              <TableHead>النوع</TableHead>
              <TableHead>بيانات الاتصال</TableHead>
              <TableHead>الرصيد</TableHead>
              <TableHead>الحالة</TableHead>
              <TableHead className="text-left">إجراءات</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {visibleCustomers.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                  لا يوجد عملاء مسجلين لـ {currentEntity.name}. قم بإضافة عميل جديد.
                </TableCell>
              </TableRow>
            ) : (
                  visibleCustomers.map((customer: any) => (
                <TableRow key={customer.id} className="hover:bg-muted/50 transition-colors">
                  <TableCell className="font-medium">
                    <div className="flex items-center gap-3">
                      <Avatar className="h-8 w-8">
                        <AvatarImage src={`https://api.dicebear.com/7.x/initials/svg?seed=${customer.name}`} />
                        <AvatarFallback>{customer.name.substring(0, 2)}</AvatarFallback>
                      </Avatar>
                      <div className="flex flex-col">
                        <span>{customer.name}</span>
                        <span className="text-xs text-muted-foreground">{customer.id}</span>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline">{customer.type}</Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-col gap-1 text-sm">
                      <div className="flex items-center gap-2">
                        <Phone className="w-3 h-3 text-muted-foreground" />
                        {customer.phone}
                      </div>
                      {customer.email && (
                        <div className="flex items-center gap-2">
                          <Mail className="w-3 h-3 text-muted-foreground" />
                          {customer.email}
                        </div>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <span className={`font-bold ${customer.balance > 0 ? 'text-emerald-600' : customer.balance < 0 ? 'text-rose-600' : ''}`}>
                      {customer.balance.toLocaleString()} ر.ي
                    </span>
                  </TableCell>
                  <TableCell>
                    <Badge variant="secondary" className="bg-emerald-50 text-emerald-700 border-emerald-200">
                      {customer.status === 'active' ? 'نشط' : 'غير نشط'}
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
                        <DropdownMenuItem>إنشاء فاتورة</DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem onClick={() => openEditDialog(customer)}>
                          <Pencil className="w-4 h-4 ml-2" />
                          تعديل البيانات
                        </DropdownMenuItem>
                        <DropdownMenuItem 
                          className="text-destructive"
                          onClick={() => handleDeleteCustomer(customer.id)}
                        >
                          <Trash2 className="w-4 h-4 ml-2" />
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
    </div>
  );
}





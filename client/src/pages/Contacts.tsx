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
import { Plus, Download, MoreHorizontal, Phone, Mail, Save, Pencil, Trash2 } from "lucide-react";
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
import { useState, useEffect, useCallback } from "react";
import { toast } from "sonner";
import { useEntity } from "@/contexts/EntityContext";

// Initial clean data
const initialCustomers: any[] = [];
const initialSuppliers: any[] = [];

export default function Contacts() {
  const { currentEntity } = useEntity();
  
  // Load from localStorage on mount
  const loadFromStorage = () => {
    try {
      const savedCustomers = localStorage.getItem('customers');
      const _savedSuppliers = localStorage.getItem('suppliers');
      if (savedCustomers) {
        return JSON.parse(savedCustomers);
      }
      return initialCustomers;
    } catch {
      return initialCustomers;
    }
  };

  const loadSuppliersFromStorage = () => {
    try {
      const savedSuppliers = localStorage.getItem('suppliers');
      if (savedSuppliers) {
        return JSON.parse(savedSuppliers);
      }
      return initialSuppliers;
    } catch {
      return initialSuppliers;
    }
  };

  const [customers, setCustomers] = useState(loadFromStorage);
  const [suppliers, setSuppliers] = useState(loadSuppliersFromStorage);
  const [activeTab, setActiveTab] = useState("customers");
  
  const [isNewContactOpen, setIsNewContactOpen] = useState(false);
  const [isEditContactOpen, setIsEditContactOpen] = useState(false);
  const [editingContact, setEditingContact] = useState<any>(null);

  // Reload contacts when entity changes
  const reloadContacts = useCallback(() => {
    setCustomers(loadFromStorage());
    setSuppliers(loadSuppliersFromStorage());
  }, []);

  useEffect(() => {
    reloadContacts();
  }, [currentEntity, reloadContacts]);

  const [newContact, setNewContact] = useState({
    name: "",
    type: "شركة",
    email: "",
    phone: "",
    category: "customer" // customer or supplier
  });

  if (!currentEntity) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-muted-foreground">الرجاء اختيار كيان أولاً</p>
      </div>
    );
  }


  // Filter contacts based on current entity
  const visibleCustomers = customers.filter((c: any) => {
    if (currentEntity.type === 'holding') return true;
    return c.entityId === currentEntity.id;
  });

  const visibleSuppliers = suppliers.filter((s: any) => {
    if (currentEntity.type === 'holding') return true;
    return s.entityId === currentEntity.id;
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
      entityId: currentEntity.id, // Associate with current entity
      name: newContact.name,
      type: newContact.type,
      email: newContact.email,
      phone: newContact.phone,
      balance: 0.00,
      status: "active"
    };

    if (newContact.category === "customer") {
      const updatedCustomers = [...customers, contact];
      setCustomers(updatedCustomers);
      // Save to localStorage
      localStorage.setItem('customers', JSON.stringify(updatedCustomers));
      toast.success("تم إضافة العميل بنجاح");
    } else {
      const updatedSuppliers = [...suppliers, contact];
      setSuppliers(updatedSuppliers);
      // Save to localStorage
      localStorage.setItem('suppliers', JSON.stringify(updatedSuppliers));
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

  const handleEditContact = () => {
    if (!editingContact || !editingContact.name) {
      toast.error("يرجى إدخال الاسم");
      return;
    }

    if (activeTab === "customers") {
      const updatedCustomers = customers.map((c: any) => 
        c.id === editingContact.id ? editingContact : c
      );
      setCustomers(updatedCustomers);
      localStorage.setItem('customers', JSON.stringify(updatedCustomers));
      toast.success("تم تحديث بيانات العميل بنجاح");
    } else {
      const updatedSuppliers = suppliers.map((s: any) => 
        s.id === editingContact.id ? editingContact : s
      );
      setSuppliers(updatedSuppliers);
      localStorage.setItem('suppliers', JSON.stringify(updatedSuppliers));
      toast.success("تم تحديث بيانات المورد بنجاح");
    }
    
    setIsEditContactOpen(false);
    setEditingContact(null);
  };

  const handleDeleteCustomer = (id: string) => {
    if (confirm("هل أنت متأكد من حذف هذا العميل؟")) {
      const updatedCustomers = customers.filter((c: any) => c.id !== id);
      setCustomers(updatedCustomers);
      localStorage.setItem('customers', JSON.stringify(updatedCustomers));
      toast.success("تم حذف العميل بنجاح");
    }
  };

  const handleDeleteSupplier = (id: string) => {
    if (confirm("هل أنت متأكد من حذف هذا المورد؟")) {
      const updatedSuppliers = suppliers.filter((s: any) => s.id !== id);
      setSuppliers(updatedSuppliers);
      localStorage.setItem('suppliers', JSON.stringify(updatedSuppliers));
      toast.success("تم حذف المورد بنجاح");
    }
  };

  const openEditDialog = (contact: any) => {
    setEditingContact({ ...contact });
    setIsEditContactOpen(true);
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">العملاء والموردين</h2>
          <p className="text-muted-foreground mt-1">
            إدارة بيانات الاتصال والأرصدة لـ <span className="font-bold text-primary">{currentEntity.name}</span>
          </p>
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
                  سيتم إضافة جهة الاتصال إلى: <span className="font-bold">{currentEntity.name}</span>
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

          {/* Edit Dialog */}
          <Dialog open={isEditContactOpen} onOpenChange={setIsEditContactOpen}>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>تعديل بيانات جهة الاتصال</DialogTitle>
                <DialogDescription>
                  تعديل بيانات العميل أو المورد.
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="edit-name" className="text-right">الاسم</Label>
                  <Input 
                    id="edit-name" 
                    value={editingContact?.name || ""}
                    onChange={(e) => setEditingContact((prev: any) => prev ? {...prev, name: e.target.value} : null)}
                    className="col-span-3" 
                  />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="edit-phone" className="text-right">الهاتف</Label>
                  <Input 
                    id="edit-phone" 
                    value={editingContact?.phone || ""}
                    onChange={(e) => setEditingContact((prev: any) => prev ? {...prev, phone: e.target.value} : null)}
                    className="col-span-3" 
                  />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="edit-email" className="text-right">البريد الإلكتروني</Label>
                  <Input 
                    id="edit-email" 
                    type="email"
                    value={editingContact?.email || ""}
                    onChange={(e) => setEditingContact((prev: any) => prev ? {...prev, email: e.target.value} : null)}
                    className="col-span-3" 
                  />
                </div>
              </div>
              <DialogFooter>
                <Button onClick={handleEditContact}>
                  <Save className="w-4 h-4 ml-2" />
                  حفظ التعديلات
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <Tabs defaultValue="customers" value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-2 max-w-[400px]">
          <TabsTrigger value="customers">العملاء</TabsTrigger>
          <TabsTrigger value="suppliers">الموردين</TabsTrigger>
        </TabsList>
        
        <TabsContent value="customers" className="mt-6">
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
        </TabsContent>
        
        <TabsContent value="suppliers" className="mt-6">
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
                {visibleSuppliers.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                      لا يوجد موردين مسجلين لـ {currentEntity.name}. قم بإضافة مورد جديد.
                    </TableCell>
                  </TableRow>
                ) : (
                  visibleSuppliers.map((supplier: any) => (
                    <TableRow key={supplier.id} className="hover:bg-muted/50 transition-colors">
                      <TableCell className="font-medium">
                        <div className="flex items-center gap-3">
                          <Avatar className="h-8 w-8">
                            <AvatarImage src={`https://api.dicebear.com/7.x/initials/svg?seed=${supplier.name}`} />
                            <AvatarFallback>{supplier.name.substring(0, 2)}</AvatarFallback>
                          </Avatar>
                          <div className="flex flex-col">
                            <span>{supplier.name}</span>
                            <span className="text-xs text-muted-foreground">{supplier.id}</span>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">{supplier.type}</Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-col gap-1 text-sm">
                          <div className="flex items-center gap-2">
                            <Phone className="w-3 h-3 text-muted-foreground" />
                            {supplier.phone}
                          </div>
                          {supplier.email && (
                            <div className="flex items-center gap-2">
                              <Mail className="w-3 h-3 text-muted-foreground" />
                              {supplier.email}
                            </div>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <span className={`font-bold ${supplier.balance > 0 ? 'text-rose-600' : supplier.balance < 0 ? 'text-emerald-600' : ''}`}>
                          {supplier.balance.toLocaleString()} ر.ي
                        </span>
                      </TableCell>
                      <TableCell>
                        <Badge variant="secondary" className="bg-emerald-50 text-emerald-700 border-emerald-200">
                          {supplier.status === 'active' ? 'نشط' : 'غير نشط'}
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
                            <DropdownMenuItem>إنشاء أمر شراء</DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem onClick={() => openEditDialog(supplier)}>
                              <Pencil className="w-4 h-4 ml-2" />
                              تعديل البيانات
                            </DropdownMenuItem>
                            <DropdownMenuItem 
                              className="text-destructive"
                              onClick={() => handleDeleteSupplier(supplier.id)}
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
        </TabsContent>
      </Tabs>
    </div>
  );
}

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

const initialSuppliers: any[] = [];

export default function Suppliers() {
  const { currentEntity, getThemeColor } = useEntity();
  
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

  const [suppliers, setSuppliers] = useState(loadSuppliersFromStorage);
  const [isNewSupplierOpen, setIsNewSupplierOpen] = useState(false);
  const [isEditSupplierOpen, setIsEditSupplierOpen] = useState(false);
  const [editingSupplier, setEditingSupplier] = useState<any>(null);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    setSuppliers(loadSuppliersFromStorage());
  }, [currentEntity]);

  const [newSupplier, setNewSupplier] = useState({
    name: "",
    type: "شركة",
    email: "",
    phone: "",
  });

  const visibleSuppliers = suppliers.filter(s => {
    if (currentEntity.type === 'holding') return true;
    return s.entityId === currentEntity.id;
  }).filter(s => 
    s.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    s.phone.includes(searchTerm) ||
    (s.email && s.email.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const handleAddSupplier = () => {
    if (!newSupplier.name || !newSupplier.phone) {
      toast.error("يرجى تعبئة الاسم ورقم الهاتف");
      return;
    }

    const supplier = {
      id: `SUP-${String(suppliers.length + 1).padStart(3, '0')}`,
      entityId: currentEntity.id,
      name: newSupplier.name,
      type: newSupplier.type,
      email: newSupplier.email,
      phone: newSupplier.phone,
      balance: 0.00,
      status: "active"
    };

    const updatedSuppliers = [...suppliers, supplier];
    setSuppliers(updatedSuppliers);
    localStorage.setItem('suppliers', JSON.stringify(updatedSuppliers));
    toast.success("تم إضافة المورد بنجاح");

    setIsNewSupplierOpen(false);
    setNewSupplier({
      name: "",
      type: "شركة",
      email: "",
      phone: "",
    });
  };

  const handleEditSupplier = () => {
    if (!editingSupplier || !editingSupplier.name) {
      toast.error("يرجى إدخال الاسم");
      return;
    }

    const updatedSuppliers = suppliers.map(s => 
      s.id === editingSupplier.id ? editingSupplier : s
    );
    setSuppliers(updatedSuppliers);
    localStorage.setItem('suppliers', JSON.stringify(updatedSuppliers));
    toast.success("تم تحديث بيانات المورد بنجاح");
    
    setIsEditSupplierOpen(false);
    setEditingSupplier(null);
  };

  const handleDeleteSupplier = (id: string) => {
    if (confirm("هل أنت متأكد من حذف هذا المورد؟")) {
      const updatedSuppliers = suppliers.filter(s => s.id !== id);
      setSuppliers(updatedSuppliers);
      localStorage.setItem('suppliers', JSON.stringify(updatedSuppliers));
      toast.success("تم حذف المورد بنجاح");
    }
  };

  const openEditDialog = (supplier: any) => {
    setEditingSupplier({ ...supplier });
    setIsEditSupplierOpen(true);
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">الموردين</h2>
          <p className="text-muted-foreground mt-1">
            إدارة بيانات الموردين لـ <span className="font-bold" style={{ color: getThemeColor() }}>{currentEntity.name}</span>
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm">
            <Download className="w-4 h-4 ml-2" />
            تصدير
          </Button>
          
          <Dialog open={isNewSupplierOpen} onOpenChange={setIsNewSupplierOpen}>
            <DialogTrigger asChild>
              <Button size="sm" style={{ backgroundColor: getThemeColor() }}>
                <Plus className="w-4 h-4 ml-2" />
                مورد جديد
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>إضافة مورد جديد</DialogTitle>
                <DialogDescription>
                  سيتم إضافة المورد إلى: <span className="font-bold">{currentEntity.name}</span>
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="name" className="text-right">الاسم *</Label>
                  <Input 
                    id="name" 
                    value={newSupplier.name}
                    onChange={(e) => setNewSupplier({...newSupplier, name: e.target.value})}
                    className="col-span-3" 
                  />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="type" className="text-right">النوع</Label>
                  <Select 
                    value={newSupplier.type} 
                    onValueChange={(v) => setNewSupplier({...newSupplier, type: v})}
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
                    value={newSupplier.phone}
                    onChange={(e) => setNewSupplier({...newSupplier, phone: e.target.value})}
                    className="col-span-3" 
                  />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="email" className="text-right">البريد الإلكتروني</Label>
                  <Input 
                    id="email" 
                    type="email"
                    value={newSupplier.email}
                    onChange={(e) => setNewSupplier({...newSupplier, email: e.target.value})}
                    className="col-span-3" 
                  />
                </div>
              </div>
              <DialogFooter>
                <Button onClick={handleAddSupplier} style={{ backgroundColor: getThemeColor() }}>
                  <Save className="w-4 h-4 ml-2" />
                  حفظ البيانات
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>

          <Dialog open={isEditSupplierOpen} onOpenChange={setIsEditSupplierOpen}>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>تعديل بيانات المورد</DialogTitle>
                <DialogDescription>
                  تعديل بيانات المورد.
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="edit-name" className="text-right">الاسم *</Label>
                  <Input 
                    id="edit-name" 
                    value={editingSupplier?.name || ""}
                    onChange={(e) => setEditingSupplier((prev: any) => prev ? {...prev, name: e.target.value} : null)}
                    className="col-span-3" 
                  />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="edit-phone" className="text-right">الهاتف *</Label>
                  <Input 
                    id="edit-phone" 
                    value={editingSupplier?.phone || ""}
                    onChange={(e) => setEditingSupplier((prev: any) => prev ? {...prev, phone: e.target.value} : null)}
                    className="col-span-3" 
                  />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="edit-email" className="text-right">البريد الإلكتروني</Label>
                  <Input 
                    id="edit-email" 
                    type="email"
                    value={editingSupplier?.email || ""}
                    onChange={(e) => setEditingSupplier((prev: any) => prev ? {...prev, email: e.target.value} : null)}
                    className="col-span-3" 
                  />
                </div>
              </div>
              <DialogFooter>
                <Button onClick={handleEditSupplier} style={{ backgroundColor: getThemeColor() }}>
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
            {visibleSuppliers.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                  لا يوجد موردين مسجلين لـ {currentEntity.name}. قم بإضافة مورد جديد.
                </TableCell>
              </TableRow>
            ) : (
              visibleSuppliers.map((supplier) => (
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
                      {supplier.balance.toLocaleString()} ر.س
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
    </div>
  );
}





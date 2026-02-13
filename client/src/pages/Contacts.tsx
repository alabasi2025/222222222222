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
  Download,
  MoreHorizontal,
  Phone,
  Mail,
  Save,
  Pencil,
  Trash2,
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
import { customersApi, suppliersApi, contactsApi } from "@/lib/api";

export default function Contacts() {
  const { currentEntity, getThemeColor } = useEntity();
  const [customers, setCustomers] = useState<any[]>([]);
  const [suppliers, setSuppliers] = useState<any[]>([]);
  const [contacts, setContacts] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<any>(null);
  const [activeTab, setActiveTab] = useState("customers");
  const [searchTerm, setSearchTerm] = useState("");

  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    email: "",
    address: "",
    contactType: "customer",
    taxNumber: "",
    status: "active",
  });

  const loadData = useCallback(async () => {
    if (!currentEntity) return;
    setIsLoading(true);
    try {
      const [custRes, suppRes, contRes] = await Promise.all([
        customersApi.getAll({ entityId: currentEntity.id }).catch(() => []),
        suppliersApi.getAll({ entityId: currentEntity.id }).catch(() => []),
        contactsApi.getAll({ entityId: currentEntity.id }).catch(() => []),
      ]);
      setCustomers(
        Array.isArray(custRes) ? custRes : (custRes as any)?.data || []
      );
      setSuppliers(
        Array.isArray(suppRes) ? suppRes : (suppRes as any)?.data || []
      );
      setContacts(
        Array.isArray(contRes) ? contRes : (contRes as any)?.data || []
      );
    } catch {
      setCustomers([]);
      setSuppliers([]);
      setContacts([]);
    } finally {
      setIsLoading(false);
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

  const resetForm = () => {
    setFormData({
      name: "",
      phone: "",
      email: "",
      address: "",
      contactType: "customer",
      taxNumber: "",
      status: "active",
    });
  };

  const handleAdd = async () => {
    if (!formData.name) {
      toast.error("يرجى إدخال الاسم");
      return;
    }
    setIsSaving(true);
    try {
      const payload = { ...formData, entityId: currentEntity.id };
      if (formData.contactType === "customer") {
        await customersApi.create(payload);
      } else if (formData.contactType === "supplier") {
        await suppliersApi.create(payload);
      } else {
        await contactsApi.create(payload);
      }
      toast.success("تمت الإضافة بنجاح");
      setIsAddOpen(false);
      resetForm();
      loadData();
    } catch {
      toast.error("فشلت الإضافة");
    } finally {
      setIsSaving(false);
    }
  };

  const handleEdit = (item: any, type: string) => {
    setEditingItem({ ...item, contactType: type });
    setFormData({
      name: item.name || "",
      phone: item.phone || "",
      email: item.email || "",
      address: item.address || "",
      contactType: type,
      taxNumber: item.taxNumber || "",
      status: item.status || "active",
    });
    setIsEditOpen(true);
  };

  const handleUpdate = async () => {
    if (!editingItem) return;
    setIsSaving(true);
    try {
      const payload = { ...formData };
      if (editingItem.contactType === "customer") {
        await customersApi.update(editingItem.id, payload);
      } else if (editingItem.contactType === "supplier") {
        await suppliersApi.update(editingItem.id, payload);
      } else {
        await contactsApi.update(editingItem.id, payload);
      }
      toast.success("تم التحديث بنجاح");
      setIsEditOpen(false);
      setEditingItem(null);
      resetForm();
      loadData();
    } catch {
      toast.error("فشل التحديث");
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (id: string, type: string) => {
    if (!confirm("هل أنت متأكد من الحذف؟")) return;
    try {
      if (type === "customer") {
        await customersApi.delete(id);
      } else if (type === "supplier") {
        await suppliersApi.delete(id);
      } else {
        await contactsApi.delete(id);
      }
      toast.success("تم الحذف بنجاح");
      loadData();
    } catch {
      toast.error("فشل الحذف");
    }
  };

  const filterItems = (items: any[]) =>
    items.filter(
      (item: any) =>
        item.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.phone?.includes(searchTerm) ||
        item.email?.toLowerCase().includes(searchTerm.toLowerCase())
    );

  const renderTable = (items: any[], type: string) => (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>الاسم</TableHead>
          <TableHead>الهاتف</TableHead>
          <TableHead>البريد</TableHead>
          <TableHead>العنوان</TableHead>
          <TableHead>الرقم الضريبي</TableHead>
          <TableHead>الحالة</TableHead>
          <TableHead className="text-left">إجراءات</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {isLoading ? (
          <TableRow>
            <TableCell colSpan={7} className="text-center py-8">
              <Loader2 className="w-6 h-6 animate-spin mx-auto" />
            </TableCell>
          </TableRow>
        ) : filterItems(items).length === 0 ? (
          <TableRow>
            <TableCell
              colSpan={7}
              className="text-center py-8 text-muted-foreground"
            >
              لا توجد بيانات. قم بإضافة جديد.
            </TableCell>
          </TableRow>
        ) : (
          filterItems(items).map((item: any) => (
            <TableRow key={item.id} className="hover:bg-muted/50">
              <TableCell>
                <div className="flex items-center gap-3">
                  <Avatar className="h-8 w-8">
                    <AvatarImage
                      src={`https://api.dicebear.com/7.x/initials/svg?seed=${item.name}`}
                    />
                    <AvatarFallback>{item.name?.charAt(0)}</AvatarFallback>
                  </Avatar>
                  <span className="font-semibold">{item.name}</span>
                </div>
              </TableCell>
              <TableCell>
                {item.phone && (
                  <div className="flex items-center gap-1 text-sm">
                    <Phone className="w-3 h-3" />
                    {item.phone}
                  </div>
                )}
              </TableCell>
              <TableCell>
                {item.email && (
                  <div className="flex items-center gap-1 text-sm">
                    <Mail className="w-3 h-3" />
                    {item.email}
                  </div>
                )}
              </TableCell>
              <TableCell className="text-sm">{item.address || "-"}</TableCell>
              <TableCell className="text-sm">{item.taxNumber || "-"}</TableCell>
              <TableCell>
                <Badge
                  variant="outline"
                  className={
                    item.status === "active"
                      ? "bg-emerald-100 text-emerald-700"
                      : "bg-slate-100 text-slate-700"
                  }
                >
                  {item.status === "active" ? "نشط" : "غير نشط"}
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
                    <DropdownMenuItem onClick={() => handleEdit(item, type)}>
                      <Pencil className="w-4 h-4 ml-2" />
                      تعديل
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem
                      className="text-destructive"
                      onClick={() => handleDelete(item.id, type)}
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
  );

  const formFields = (
    <div className="grid gap-4 py-4">
      <div className="grid grid-cols-4 items-center gap-4">
        <Label className="text-right">الاسم *</Label>
        <Input
          value={formData.name}
          onChange={e => setFormData({ ...formData, name: e.target.value })}
          className="col-span-3"
        />
      </div>
      <div className="grid grid-cols-4 items-center gap-4">
        <Label className="text-right">الهاتف</Label>
        <Input
          value={formData.phone}
          onChange={e => setFormData({ ...formData, phone: e.target.value })}
          className="col-span-3"
        />
      </div>
      <div className="grid grid-cols-4 items-center gap-4">
        <Label className="text-right">البريد</Label>
        <Input
          type="email"
          value={formData.email}
          onChange={e => setFormData({ ...formData, email: e.target.value })}
          className="col-span-3"
        />
      </div>
      <div className="grid grid-cols-4 items-center gap-4">
        <Label className="text-right">العنوان</Label>
        <Input
          value={formData.address}
          onChange={e => setFormData({ ...formData, address: e.target.value })}
          className="col-span-3"
        />
      </div>
      <div className="grid grid-cols-4 items-center gap-4">
        <Label className="text-right">الرقم الضريبي</Label>
        <Input
          value={formData.taxNumber}
          onChange={e =>
            setFormData({ ...formData, taxNumber: e.target.value })
          }
          className="col-span-3"
        />
      </div>
      <div className="grid grid-cols-4 items-center gap-4">
        <Label className="text-right">الحالة</Label>
        <Select
          value={formData.status}
          onValueChange={v => setFormData({ ...formData, status: v })}
        >
          <SelectTrigger className="col-span-3">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="active">نشط</SelectItem>
            <SelectItem value="inactive">غير نشط</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </div>
  );

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">جهات الاتصال</h2>
          <p className="text-muted-foreground mt-1">
            إدارة العملاء والموردين لـ{" "}
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
          <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
            <DialogTrigger asChild>
              <Button size="sm" style={{ backgroundColor: getThemeColor() }}>
                <Plus className="w-4 h-4 ml-2" />
                إضافة جديد
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>إضافة جهة اتصال</DialogTitle>
                <DialogDescription>
                  إضافة عميل أو مورد أو جهة اتصال
                </DialogDescription>
              </DialogHeader>
              <div className="grid grid-cols-4 items-center gap-4 pt-4">
                <Label className="text-right">النوع</Label>
                <Select
                  value={formData.contactType}
                  onValueChange={v =>
                    setFormData({ ...formData, contactType: v })
                  }
                >
                  <SelectTrigger className="col-span-3">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="customer">عميل</SelectItem>
                    <SelectItem value="supplier">مورد</SelectItem>
                    <SelectItem value="contact">جهة اتصال</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              {formFields}
              <DialogFooter>
                <Button
                  onClick={handleAdd}
                  disabled={isSaving}
                  style={{ backgroundColor: getThemeColor() }}
                >
                  {isSaving ? (
                    <Loader2 className="w-4 h-4 ml-2 animate-spin" />
                  ) : (
                    <Save className="w-4 h-4 ml-2" />
                  )}
                  حفظ
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <div className="bg-card p-4 rounded-lg border shadow-sm">
          <div className="text-sm font-medium text-muted-foreground">
            العملاء
          </div>
          <div className="text-2xl font-bold mt-2">{customers.length}</div>
        </div>
        <div className="bg-card p-4 rounded-lg border shadow-sm">
          <div className="text-sm font-medium text-muted-foreground">
            الموردين
          </div>
          <div className="text-2xl font-bold mt-2">{suppliers.length}</div>
        </div>
        <div className="bg-card p-4 rounded-lg border shadow-sm">
          <div className="text-sm font-medium text-muted-foreground">
            جهات الاتصال
          </div>
          <div className="text-2xl font-bold mt-2">{contacts.length}</div>
        </div>
      </div>

      <Input
        placeholder="بحث بالاسم أو الهاتف أو البريد..."
        value={searchTerm}
        onChange={e => setSearchTerm(e.target.value)}
      />

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="customers">
            العملاء ({customers.length})
          </TabsTrigger>
          <TabsTrigger value="suppliers">
            الموردين ({suppliers.length})
          </TabsTrigger>
          <TabsTrigger value="contacts">
            جهات الاتصال ({contacts.length})
          </TabsTrigger>
        </TabsList>
        <TabsContent value="customers">
          <div className="rounded-md border bg-card shadow-sm overflow-hidden">
            {renderTable(customers, "customer")}
          </div>
        </TabsContent>
        <TabsContent value="suppliers">
          <div className="rounded-md border bg-card shadow-sm overflow-hidden">
            {renderTable(suppliers, "supplier")}
          </div>
        </TabsContent>
        <TabsContent value="contacts">
          <div className="rounded-md border bg-card shadow-sm overflow-hidden">
            {renderTable(contacts, "contact")}
          </div>
        </TabsContent>
      </Tabs>

      <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>تعديل</DialogTitle>
            <DialogDescription>تحديث بيانات جهة الاتصال</DialogDescription>
          </DialogHeader>
          {formFields}
          <DialogFooter>
            <Button
              onClick={handleUpdate}
              disabled={isSaving}
              style={{ backgroundColor: getThemeColor() }}
            >
              {isSaving ? (
                <Loader2 className="w-4 h-4 ml-2 animate-spin" />
              ) : (
                <Save className="w-4 h-4 ml-2" />
              )}
              حفظ التغييرات
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

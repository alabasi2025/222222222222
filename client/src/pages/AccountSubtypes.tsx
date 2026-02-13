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
  Edit, 
  Trash2, 
  Save,
  Tag,
  Search,
  FileText,
  Wallet,
  Landmark,
  Users,
  Package,
  Building2,
  CreditCard,
  User,
  Store
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { useState, useEffect } from "react";
import { toast } from "sonner";
import { useEntity } from "@/contexts/EntityContext";
import { getAccountSubtypes, saveAccountSubtypes, deleteHoldingCompanySubtypes, type AccountSubtype } from "@/lib/accountSubtypes";

const iconOptions = [
  { value: "FileText", label: "ملف", icon: FileText },
  { value: "Wallet", label: "محفظة", icon: Wallet },
  { value: "Landmark", label: "بنك", icon: Landmark },
  { value: "Users", label: "مستخدمين", icon: Users },
  { value: "Package", label: "طرد", icon: Package },
  { value: "Building2", label: "مبنى", icon: Building2 },
  { value: "CreditCard", label: "بطاقة", icon: CreditCard },
  { value: "User", label: "مستخدم", icon: User },
  { value: "Store", label: "متجر", icon: Store },
];

export default function AccountSubtypes() {
  const { currentEntity } = useEntity();
  const [subtypes, setSubtypes] = useState<AccountSubtype[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingSubtype, setEditingSubtype] = useState<AccountSubtype | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [formData, setFormData] = useState({
    value: "",
    label: "",
    icon: "FileText",
    description: ""
  });

  // Load subtypes from storage on mount and when entity changes
  useEffect(() => {
    // Delete holding company data on mount (one-time cleanup)
    deleteHoldingCompanySubtypes();
    
    if (currentEntity) {
      setSubtypes(getAccountSubtypes(currentEntity.id));
    }
  }, [currentEntity]);

  // Listen for storage changes and custom events
  useEffect(() => {
    if (!currentEntity) return;
    
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key && e.key.startsWith('account_subtypes_') && e.key === `account_subtypes_${currentEntity.id}`) {
        const updatedSubtypes = getAccountSubtypes(currentEntity.id);
        setSubtypes(updatedSubtypes);
      }
    };
    
    const handleAccountSubtypesUpdated = (e: Event) => {
      const customEvent = e as CustomEvent;
      if (customEvent.detail?.entityId === currentEntity.id) {
        const updatedSubtypes = getAccountSubtypes(currentEntity.id);
        setSubtypes(updatedSubtypes);
      }
    };
    
    window.addEventListener('storage', handleStorageChange);
    window.addEventListener('accountSubtypesUpdated', handleAccountSubtypesUpdated);
    
    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('accountSubtypesUpdated', handleAccountSubtypesUpdated);
    };
  }, [currentEntity]);

  const filteredSubtypes = subtypes.filter(subtype =>
    subtype.label.toLowerCase().includes(searchQuery.toLowerCase()) ||
    subtype.value.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (subtype.description && subtype.description.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const handleOpenDialog = (subtype?: AccountSubtype) => {
    if (subtype) {
      setEditingSubtype(subtype);
      setFormData({
        value: subtype.value,
        label: subtype.label,
        icon: subtype.icon || "FileText",
        description: subtype.description || ""
      });
    } else {
      setEditingSubtype(null);
      setFormData({
        value: "",
        label: "",
        icon: "FileText",
        description: ""
      });
    }
    setIsDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setIsDialogOpen(false);
    setEditingSubtype(null);
    setFormData({
      value: "",
      label: "",
      icon: "FileText",
      description: ""
    });
  };

  const handleSave = () => {
    // Prevent adding/editing subtypes from holding company
    if (currentEntity?.type === 'holding') {
      toast.error("لا يمكن إضافة أو تعديل أنواع الحسابات الفرعية من الشركة القابضة. يرجى الدخول إلى وحدة محددة أولاً");
      return;
    }

    if (!formData.value || !formData.label) {
      toast.error("يرجى تعبئة جميع الحقول المطلوبة");
      return;
    }

    if (!currentEntity) return;

    let updatedSubtypes: AccountSubtype[];
    
    if (editingSubtype) {
      // Update existing subtype
      updatedSubtypes = subtypes.map(s => 
        s.id === editingSubtype.id 
          ? { ...s, ...formData, id: formData.value }
          : s
      );
      setSubtypes(updatedSubtypes);
      saveAccountSubtypes(updatedSubtypes, currentEntity.id);
      toast.success("تم تحديث نوع الحساب الفرعي بنجاح");
    } else {
      // Add new subtype
      if (subtypes.some(s => s.value === formData.value)) {
        toast.error("نوع الحساب الفرعي موجود بالفعل");
        return;
      }
      updatedSubtypes = [...subtypes, {
        id: formData.value,
        ...formData
      }];
      setSubtypes(updatedSubtypes);
      saveAccountSubtypes(updatedSubtypes, currentEntity.id);
      toast.success("تم إضافة نوع الحساب الفرعي بنجاح");
    }
    
    window.dispatchEvent(new CustomEvent('accountSubtypesUpdated', { detail: { entityId: currentEntity.id } }));
    handleCloseDialog();
  };

  const handleDelete = (id: string) => {
    if (!confirm("هل أنت متأكد من حذف هذا النوع الفرعي؟")) return;
    
    if (!currentEntity) return;
    
    // Prevent deletion of default subtypes
    const defaultSubtypesList = getAccountSubtypes(null);
    if (defaultSubtypesList.some(s => s.id === id)) {
      toast.error("لا يمكن حذف الأنواع الفرعية الافتراضية");
      return;
    }
    
    const updatedSubtypes = subtypes.filter(s => s.id !== id);
    setSubtypes(updatedSubtypes);
    saveAccountSubtypes(updatedSubtypes, currentEntity.id);
    window.dispatchEvent(new CustomEvent('accountSubtypesUpdated', { detail: { entityId: currentEntity.id } }));
    toast.success("تم حذف نوع الحساب الفرعي بنجاح");
  };

  const getIconComponent = (iconName?: string) => {
    const iconOption = iconOptions.find(opt => opt.value === iconName);
    if (iconOption) {
      const Icon = iconOption.icon;
      return <Icon className="h-4 w-4" />;
    }
    return <FileText className="h-4 w-4" />;
  };

  // Don't show content if holding company is selected
  if (currentEntity?.type === 'holding') {
    return (
      <div className="p-6 space-y-6">
        <div className="flex flex-col items-center justify-center min-h-[400px] gap-4 text-center">
          <div className="p-4 bg-muted rounded-full">
            <Tag className="h-12 w-12 text-muted-foreground" />
          </div>
          <div>
            <h2 className="text-xl font-semibold mb-2">لا يمكن عرض أنواع الحسابات الفرعية من الشركة القابضة</h2>
            <p className="text-muted-foreground">
              يرجى الدخول إلى وحدة محددة (مثل: أعمال الحديدة) لإدارة أنواع الحسابات الفرعية الخاصة بها
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-primary/10 rounded-lg">
              <Tag className="h-6 w-6 text-primary" />
            </div>
            <div>
              <h1 className="text-2xl font-bold">أنواع الحسابات الفرعية</h1>
              <p className="text-sm text-muted-foreground">
                إدارة أنواع الحسابات الفرعية (نقدية، بنك، مستحقات، مخزون، إلخ)
                {currentEntity && ` - ${currentEntity.name}`}
              </p>
            </div>
          </div>

          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button onClick={() => handleOpenDialog()}>
                <Plus className="h-4 w-4 ml-2" />
                نوع فرعي جديد
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>
                  {editingSubtype ? 'تعديل نوع الحساب الفرعي' : 'إضافة نوع حساب فرعي جديد'}
                </DialogTitle>
                <DialogDescription>
                  {editingSubtype 
                    ? 'قم بتعديل بيانات نوع الحساب الفرعي' 
                    : 'أضف نوع حساب فرعي جديد للنظام'}
                </DialogDescription>
              </DialogHeader>

              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>القيمة (Value) *</Label>
                    <Input
                      value={formData.value}
                      onChange={(e) => setFormData({ ...formData, value: e.target.value.toLowerCase().replace(/\s+/g, '_') })}
                      placeholder="مثال: cash"
                      disabled={!!editingSubtype}
                    />
                    <p className="text-xs text-muted-foreground mt-1">
                      يستخدم في الكود (لا يمكن تعديله)
                    </p>
                  </div>
                  <div>
                    <Label>الاسم المعروض *</Label>
                    <Input
                      value={formData.label}
                      onChange={(e) => setFormData({ ...formData, label: e.target.value })}
                      placeholder="مثال: نقدية"
                    />
                  </div>
                </div>

                <div>
                  <Label>الوصف</Label>
                  <Input
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    placeholder="وصف مختصر لنوع الحساب الفرعي"
                  />
                </div>

                <div>
                  <Label>الأيقونة</Label>
                  <div className="grid grid-cols-3 gap-2 mt-2">
                    {iconOptions.map((icon) => {
                      const Icon = icon.icon;
                      return (
                        <button
                          key={icon.value}
                          type="button"
                          onClick={() => setFormData({ ...formData, icon: icon.value })}
                          className={`flex items-center gap-2 p-3 rounded border transition ${
                            formData.icon === icon.value 
                              ? 'border-primary ring-2 ring-primary bg-primary/5' 
                              : 'border-border hover:border-primary/50'
                          }`}
                        >
                          <Icon className="h-5 w-5" />
                          <span className="text-sm">{icon.label}</span>
                        </button>
                      );
                    })}
                  </div>
                  <div className="mt-2 flex items-center gap-2">
                    <span className="text-sm text-muted-foreground">المعاينة:</span>
                    {getIconComponent(formData.icon)}
                    <span className="text-sm">{formData.label || "اسم الحساب"}</span>
                  </div>
                </div>
              </div>

              <DialogFooter>
                <Button variant="outline" onClick={handleCloseDialog}>
                  إلغاء
                </Button>
                <Button onClick={handleSave}>
                  <Save className="h-4 w-4 ml-2" />
                  {editingSubtype ? 'تحديث' : 'حفظ'}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>

        {/* Search */}
        <div className="relative">
          <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="ابحث عن نوع حساب فرعي..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pr-10"
          />
        </div>
      </div>

      {/* Subtypes Table */}
      <div className="border rounded-lg bg-card shadow-sm">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-12"></TableHead>
              <TableHead>الاسم المعروض</TableHead>
              <TableHead>القيمة</TableHead>
              <TableHead>الوصف</TableHead>
              <TableHead className="w-24"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredSubtypes.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center py-12">
                  <div className="flex flex-col items-center gap-2 text-muted-foreground">
                    <Tag className="h-12 w-12 opacity-50" />
                    <p className="text-lg font-medium">لا توجد نتائج</p>
                  </div>
                </TableCell>
              </TableRow>
            ) : (
              filteredSubtypes.map((subtype) => (
                <TableRow key={subtype.id}>
                  <TableCell>
                    {getIconComponent(subtype.icon)}
                  </TableCell>
                  <TableCell className="font-medium">{subtype.label}</TableCell>
                  <TableCell>
                    <code className="text-xs bg-muted px-2 py-1 rounded font-mono">
                      {subtype.value}
                    </code>
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {subtype.description || "-"}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          if (currentEntity?.type === 'holding') {
                            toast.error("لا يمكن تعديل أنواع الحسابات الفرعية من الشركة القابضة. يرجى الدخول إلى وحدة محددة أولاً");
                            return;
                          }
                          handleOpenDialog(subtype);
                        }}
                        disabled={currentEntity?.type === 'holding'}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      {(() => {
                        const defaultSubtypesList = getAccountSubtypes(null);
                        return !defaultSubtypesList.some(s => s.id === subtype.id);
                      })() && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            if (currentEntity?.type === 'holding') {
                              toast.error("لا يمكن حذف أنواع الحسابات الفرعية من الشركة القابضة. يرجى الدخول إلى وحدة محددة أولاً");
                              return;
                            }
                            handleDelete(subtype.id);
                          }}
                          disabled={currentEntity?.type === 'holding'}
                          className="text-red-600 hover:text-red-700"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
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


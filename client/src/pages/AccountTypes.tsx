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
  Search
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
import { Badge } from "@/components/ui/badge";
import { useState, useEffect } from "react";
import { toast } from "sonner";
import { getAccountTypes, saveAccountTypes, deleteHoldingCompanyTypes, type AccountType } from "@/lib/accountTypes";
import { useEntity } from "@/contexts/EntityContext";

export default function AccountTypes() {
  const { currentEntity } = useEntity();
  
  if (!currentEntity) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-muted-foreground">الرجاء اختيار كيان أولاً</p>
      </div>
    );
  }
  
  const [types, setTypes] = useState<AccountType[]>([]);
  
  // Load types from storage on mount and when entity changes
  useEffect(() => {
    // Delete holding company data on mount (one-time cleanup)
    deleteHoldingCompanyTypes();
    
    if (currentEntity) {
      console.log('Loading account types for entity:', currentEntity.id, currentEntity.name);
      
      // Auto-add custom types for Hodeidah unit (UNIT-001) if not already present
      if (currentEntity.id === 'UNIT-001') {
        const currentTypes = getAccountTypes(currentEntity.id);
        console.log('Current types for UNIT-001:', currentTypes.length, currentTypes.map(t => t.label));
        
        const customTypesToAdd = [
          {
            id: "employee_operations",
            name: "employee_operations",
            label: "أعمال الموظفين",
            color: "bg-cyan-100 text-cyan-700 border-cyan-200",
            description: "حسابات أعمال الموظفين"
          },
          {
            id: "accountant_operations",
            name: "accountant_operations",
            label: "أعمال المحاسب",
            color: "bg-indigo-100 text-indigo-700 border-indigo-200",
            description: "حسابات أعمال المحاسب"
          },
          {
            id: "abbasi_operations",
            name: "abbasi_operations",
            label: "أعمال العباسي",
            color: "bg-pink-100 text-pink-700 border-pink-200",
            description: "حسابات أعمال العباسي"
          },
        ];
        
        // Check if any custom type is missing
        const missingTypes = customTypesToAdd.filter(ct => 
          !currentTypes.some(t => t.id === ct.id)
        );
        
        console.log('Missing types:', missingTypes.length, missingTypes.map(t => t.label));
        
        if (missingTypes.length > 0) {
          // Add missing types
          const updatedTypes = [...currentTypes, ...missingTypes];
          console.log('Saving updated types:', updatedTypes.length, updatedTypes.map(t => t.label));
          
          // Save first
          saveAccountTypes(updatedTypes, currentEntity.id);
          
          // Verify it was saved
          const verifyTypes = getAccountTypes(currentEntity.id);
          console.log('Verified saved types:', verifyTypes.length, verifyTypes.map(t => t.label));
          
          // Set state and notify
          setTypes(verifyTypes);
          window.dispatchEvent(new CustomEvent('accountTypesUpdated', { detail: { entityId: currentEntity.id } }));
          toast.success(`تم إضافة ${missingTypes.length} نوع حساب جديد`);
        } else {
          console.log('All custom types already exist');
          setTypes(currentTypes);
        }
      } else {
        const types = getAccountTypes(currentEntity.id);
        console.log('Types for other entity:', types.length, types.map(t => t.label));
        setTypes(types);
      }
    }
  }, [currentEntity]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingType, setEditingType] = useState<AccountType | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [formData, setFormData] = useState({
    name: "",
    label: "",
    color: "bg-blue-100 text-blue-700 border-blue-200",
    description: ""
  });

  const colorOptions = [
    { value: "bg-blue-100 text-blue-700 border-blue-200", label: "أزرق", preview: "bg-blue-500" },
    { value: "bg-rose-100 text-rose-700 border-rose-200", label: "وردي", preview: "bg-rose-500" },
    { value: "bg-purple-100 text-purple-700 border-purple-200", label: "بنفسجي", preview: "bg-purple-500" },
    { value: "bg-emerald-100 text-emerald-700 border-emerald-200", label: "أخضر", preview: "bg-emerald-500" },
    { value: "bg-amber-100 text-amber-700 border-amber-200", label: "كهرماني", preview: "bg-amber-500" },
    { value: "bg-cyan-100 text-cyan-700 border-cyan-200", label: "سماوي", preview: "bg-cyan-500" },
    { value: "bg-indigo-100 text-indigo-700 border-indigo-200", label: "نيلي", preview: "bg-indigo-500" },
    { value: "bg-pink-100 text-pink-700 border-pink-200", label: "زهري", preview: "bg-pink-500" },
  ];

  const filteredTypes = types.filter(type =>
    type.label.toLowerCase().includes(searchQuery.toLowerCase()) ||
    type.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (type.description && type.description.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const handleOpenDialog = (type?: AccountType) => {
    if (type) {
      setEditingType(type);
      setFormData({
        name: type.name,
        label: type.label,
        color: type.color,
        description: type.description || ""
      });
    } else {
      setEditingType(null);
      setFormData({
        name: "",
        label: "",
        color: "bg-blue-100 text-blue-700 border-blue-200",
        description: ""
      });
    }
    setIsDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setIsDialogOpen(false);
    setEditingType(null);
    setFormData({
      name: "",
      label: "",
      color: "bg-blue-100 text-blue-700 border-blue-200",
      description: ""
    });
  };

  const handleSave = () => {
    // Prevent adding/editing types from holding company
    if (currentEntity?.type === 'holding') {
      toast.error("لا يمكن إضافة أو تعديل أنواع الحسابات من الشركة القابضة. يرجى الدخول إلى وحدة محددة أولاً");
      return;
    }

    if (!formData.name || !formData.label) {
      toast.error("يرجى تعبئة جميع الحقول المطلوبة");
      return;
    }

    let updatedTypes: AccountType[];
    
    if (editingType) {
      // Update existing type
      updatedTypes = types.map(t => 
        t.id === editingType.id 
          ? { ...t, ...formData, id: formData.name }
          : t
      );
      toast.success("تم تحديث نوع الحساب بنجاح");
    } else {
      // Add new type
      if (types.some(t => t.name === formData.name)) {
        toast.error("نوع الحساب موجود بالفعل");
        return;
      }
      updatedTypes = [...types, {
        id: formData.name,
        ...formData
      }];
      toast.success("تم إضافة نوع الحساب بنجاح");
    }
    
    setTypes(updatedTypes);
    if (currentEntity) {
      saveAccountTypes(updatedTypes, currentEntity.id);
      // Dispatch custom event to notify other components
      window.dispatchEvent(new CustomEvent('accountTypesUpdated', { detail: { entityId: currentEntity.id } }));
    }
    handleCloseDialog();
  };

  const handleDelete = (id: string) => {
    if (!confirm("هل أنت متأكد من حذف هذا النوع؟")) return;
    
    // Prevent deletion of basic types (always available)
    if (["asset", "liability", "equity", "income", "expense"].includes(id)) {
      toast.error("لا يمكن حذف الأنواع الأساسية");
      return;
    }
    
    const updatedTypes = types.filter(t => t.id !== id);
    setTypes(updatedTypes);
    if (currentEntity) {
      saveAccountTypes(updatedTypes, currentEntity.id);
      // Dispatch custom event to notify other components
      window.dispatchEvent(new CustomEvent('accountTypesUpdated', { detail: { entityId: currentEntity.id } }));
    }
    toast.success("تم حذف نوع الحساب بنجاح");
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
            <h2 className="text-xl font-semibold mb-2">لا يمكن عرض أنواع الحسابات من الشركة القابضة</h2>
            <p className="text-muted-foreground">
              يرجى الدخول إلى وحدة محددة (مثل: أعمال الحديدة) لإدارة أنواع الحسابات الخاصة بها
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
              <h1 className="text-2xl font-bold">أنواع الحسابات</h1>
              <p className="text-sm text-muted-foreground">
                إدارة أنواع الحسابات المحاسبية (أصول، خصوم، إيرادات، مصروفات)
                {currentEntity && ` - ${currentEntity.name}`}
              </p>
            </div>
          </div>

          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button 
                onClick={() => {
                  if (currentEntity?.type === 'holding') {
                    toast.error("لا يمكن إضافة أنواع حسابات من الشركة القابضة. يرجى الدخول إلى وحدة محددة أولاً");
                    return;
                  }
                  handleOpenDialog();
                }}
                disabled={(currentEntity.type as string) === 'holding'}
              >
                <Plus className="h-4 w-4 ml-2" />
                نوع جديد
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>
                  {editingType ? 'تعديل نوع الحساب' : 'إضافة نوع حساب جديد'}
                </DialogTitle>
                <DialogDescription>
                  {editingType 
                    ? 'قم بتعديل بيانات نوع الحساب' 
                    : 'أضف نوع حساب جديد للنظام'}
                </DialogDescription>
              </DialogHeader>

              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>الاسم التقني (ID)</Label>
                    <Input
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value.toLowerCase() })}
                      placeholder="مثال: asset"
                      disabled={!!editingType}
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
                      placeholder="مثال: أصول"
                    />
                  </div>
                </div>

                <div>
                  <Label>الوصف</Label>
                  <Input
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    placeholder="وصف مختصر لنوع الحساب"
                  />
                </div>

                <div>
                  <Label>اللون</Label>
                  <div className="grid grid-cols-4 gap-2 mt-2">
                    {colorOptions.map((color) => (
                      <button
                        key={color.value}
                        type="button"
                        onClick={() => setFormData({ ...formData, color: color.value })}
                        className={`flex items-center gap-2 p-2 rounded border transition ${
                          formData.color === color.value 
                            ? 'border-primary ring-2 ring-primary' 
                            : 'border-border hover:border-primary/50'
                        }`}
                      >
                        <div className={`w-4 h-4 rounded ${color.preview}`} />
                        <span className="text-sm">{color.label}</span>
                      </button>
                    ))}
                  </div>
                  <div className="mt-2">
                    <Badge variant="outline" className={formData.color}>
                      معاينة اللون
                    </Badge>
                  </div>
                </div>
              </div>

              <DialogFooter>
                <Button variant="outline" onClick={handleCloseDialog}>
                  إلغاء
                </Button>
                <Button onClick={handleSave}>
                  <Save className="h-4 w-4 ml-2" />
                  {editingType ? 'تحديث' : 'حفظ'}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>

        {/* Search */}
        <div className="relative">
          <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="ابحث عن نوع حساب..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pr-10"
          />
        </div>
      </div>

      {/* Types Table */}
      <div className="border rounded-lg bg-card shadow-sm">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>الاسم المعروض</TableHead>
              <TableHead>الاسم التقني</TableHead>
              <TableHead>اللون</TableHead>
              <TableHead>الوصف</TableHead>
              <TableHead className="w-24"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredTypes.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center py-12">
                  <div className="flex flex-col items-center gap-2 text-muted-foreground">
                    <Tag className="h-12 w-12 opacity-50" />
                    <p className="text-lg font-medium">لا توجد نتائج</p>
                  </div>
                </TableCell>
              </TableRow>
            ) : (
              filteredTypes.map((type) => (
                <TableRow key={type.id}>
                  <TableCell className="font-medium">{type.label}</TableCell>
                  <TableCell>
                    <code className="text-xs bg-muted px-2 py-1 rounded font-mono">
                      {type.name}
                    </code>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline" className={type.color}>
                      {type.label}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {type.description || "-"}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          if (currentEntity?.type === 'holding') {
                            toast.error("لا يمكن تعديل أنواع الحسابات من الشركة القابضة. يرجى الدخول إلى وحدة محددة أولاً");
                            return;
                          }
                          handleOpenDialog(type);
                        }}
                        disabled={currentEntity?.type === 'holding'}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      {!["asset", "liability", "equity", "income", "expense"].includes(type.id) && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            if (currentEntity?.type === 'holding') {
                              toast.error("لا يمكن حذف أنواع الحسابات من الشركة القابضة. يرجى الدخول إلى وحدة محددة أولاً");
                              return;
                            }
                            handleDelete(type.id);
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


import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
  Plus, 
  Building2,
  Building,
  Store,
  Save,
  Pencil,
  Trash2,
  Upload,
  Image as ImageIcon,
  ArrowRight,
  MapPin,
  Phone,
  Mail,
  MoreHorizontal
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
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
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useState, useRef } from "react";
import { toast } from "sonner";
import { useEntity, Entity } from "@/contexts/EntityContext";

const typeMap: Record<string, { label: string, icon: any, color: string, bg: string }> = {
  holding: { label: "شركة قابضة", icon: Building2, color: "text-purple-700", bg: "bg-purple-100" },
  unit: { label: "وحدة أعمال", icon: Building, color: "text-blue-700", bg: "bg-blue-100" },
  branch: { label: "فرع", icon: Store, color: "text-emerald-700", bg: "bg-emerald-100" },
};

export default function OrganizationStructure() {
  const { 
    currentEntity, 
    setCurrentEntity, 
    entities, 
    setEntities, 
    updateEntityLogo,
    getThemeColor 
  } = useEntity();
  
  const [isNewEntityOpen, setIsNewEntityOpen] = useState(false);
  const [isEditEntityOpen, setIsEditEntityOpen] = useState(false);
  const [editingEntity, setEditingEntity] = useState<Entity | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [newEntity, setNewEntity] = useState({
    name: "",
    type: "branch",
    parent: ""
  });

  // Determine what to show based on current context
  const isHoldingView = currentEntity.type === 'holding';
  const isUnitView = currentEntity.type === 'unit';
  const isBranchView = currentEntity.type === 'branch';

  // Filter children based on current view
  const childEntities = entities.filter(e => e.parentId === currentEntity.id);

  const handleAddEntity = () => {
    if (!newEntity.name) {
      toast.error("يرجى تعبئة الاسم");
      return;
    }

    // Determine type and parent based on current context
    let type: "unit" | "branch" = "branch";
    let parentId = currentEntity.id;

    if (isHoldingView) {
      type = "unit";
    } else if (isUnitView) {
      type = "branch";
    } else {
      toast.error("لا يمكن إضافة كيانات فرعية للفرع");
      return;
    }

    const prefix = type === "unit" ? "UNIT" : "BR";
    const newId = `${prefix}-${String(entities.length + 1).padStart(3, '0')}`;

    const newEnt: Entity = {
      id: newId,
      name: newEntity.name,
      type: type,
      parentId: parentId,
      themeColor: type === 'unit' ? '#2563eb' : undefined // Default blue for units, branches inherit
    };

    setEntities([...entities, newEnt]);
    toast.success(`تم إضافة ${type === 'unit' ? 'وحدة الأعمال' : 'الفرع'} بنجاح`);
    setIsNewEntityOpen(false);
    setNewEntity({ name: "", type: "branch", parent: "" });
  };

  const handleEditEntity = () => {
    if (!editingEntity || !editingEntity.name) {
      toast.error("يرجى إدخال اسم الكيان");
      return;
    }

    const updatedEntities = entities.map(e => 
      e.id === editingEntity.id ? editingEntity : e
    );
    
    setEntities(updatedEntities);
    
    // If we edited the current entity, update it in context too
    if (currentEntity.id === editingEntity.id) {
      setCurrentEntity(editingEntity);
    }
    
    toast.success("تم تحديث البيانات بنجاح");
    setIsEditEntityOpen(false);
    setEditingEntity(null);
  };

  const handleDeleteEntity = (id: string) => {
    const hasChildren = entities.some(e => e.parentId === id);
    if (hasChildren) {
      toast.error("لا يمكن حذف كيان يحتوي على كيانات فرعية.");
      return;
    }

    if (confirm("هل أنت متأكد من الحذف؟")) {
      setEntities(entities.filter(e => e.id !== id));
      toast.success("تم الحذف بنجاح");
    }
  };

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !editingEntity) return;

    if (file.size > 2 * 1024 * 1024) {
      toast.error("حجم الصورة يجب أن لا يتجاوز 2 ميجابايت");
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      const base64String = reader.result as string;
      setEditingEntity({ ...editingEntity, logo: base64String });
      updateEntityLogo(editingEntity.id, base64String);
      toast.success("تم رفع الشعار بنجاح");
    };
    reader.readAsDataURL(file);
  };

  const openEditDialog = (entity: Entity) => {
    setEditingEntity({ ...entity });
    setIsEditEntityOpen(true);
  };

  const navigateToEntity = (entity: Entity) => {
    setCurrentEntity(entity);
  };

  const goBack = () => {
    if (currentEntity.parentId) {
      const parent = entities.find(e => e.id === currentEntity.parentId);
      if (parent) setCurrentEntity(parent);
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div className="flex items-center gap-4">
          {currentEntity.parentId && (
            <Button variant="outline" size="icon" onClick={goBack}>
              <ArrowRight className="w-4 h-4" />
            </Button>
          )}
          <div>
            <h2 className="text-3xl font-bold tracking-tight flex items-center gap-2">
              {currentEntity.name}
              <Badge variant="outline" className={`${typeMap[currentEntity.type].bg} ${typeMap[currentEntity.type].color} border-0`}>
                {typeMap[currentEntity.type].label}
              </Badge>
            </h2>
            <p className="text-muted-foreground mt-1">
              {isHoldingView ? "إدارة وحدات الأعمال التابعة للمجموعة" : 
               isUnitView ? "إدارة الفروع التابعة لوحدة الأعمال" : 
               "تفاصيل وإعدادات الفرع"}
            </p>
          </div>
        </div>

        <div className="flex gap-2">
          <Button variant="outline" onClick={() => openEditDialog(currentEntity)}>
            <Pencil className="w-4 h-4 ml-2" />
            تعديل البيانات
          </Button>
          
          {!isBranchView && (
            <Dialog open={isNewEntityOpen} onOpenChange={setIsNewEntityOpen}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="w-4 h-4 ml-2" />
                  {isHoldingView ? "إضافة وحدة أعمال" : "إضافة فرع جديد"}
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>
                    {isHoldingView ? "إضافة وحدة أعمال جديدة" : "إضافة فرع جديد"}
                  </DialogTitle>
                  <DialogDescription>
                    سيتم إضافة الكيان الجديد تحت {currentEntity.name}
                  </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="name" className="text-right">الاسم</Label>
                    <Input 
                      id="name" 
                      value={newEntity.name}
                      onChange={(e) => setNewEntity({...newEntity, name: e.target.value})}
                      className="col-span-3" 
                      placeholder={isHoldingView ? "مثال: وحدة المقاولات" : "مثال: فرع الرياض"}
                    />
                  </div>
                </div>
                <DialogFooter>
                  <Button onClick={handleAddEntity}>
                    <Save className="w-4 h-4 ml-2" />
                    حفظ
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          )}
        </div>
      </div>

      {/* Content Section */}
      {isBranchView ? (
        <Card>
          <CardHeader>
            <CardTitle>بيانات الفرع</CardTitle>
            <CardDescription>المعلومات الأساسية وإعدادات الفرع</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex items-center gap-6 p-6 border rounded-lg bg-muted/20">
              <div className="w-24 h-24 rounded-lg border bg-background flex items-center justify-center overflow-hidden">
                {currentEntity.logo ? (
                  <img src={currentEntity.logo} alt="Logo" className="w-full h-full object-cover" />
                ) : (
                  <Store className="w-10 h-10 text-muted-foreground" />
                )}
              </div>
              <div className="space-y-2">
                <h3 className="text-xl font-bold">{currentEntity.name}</h3>
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Badge variant="secondary">{currentEntity.id}</Badge>
                  <span>•</span>
                  <span>تابع لـ: {entities.find(e => e.id === currentEntity.parentId)?.name}</span>
                </div>
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label>العنوان</Label>
                <div className="flex items-center gap-2 p-3 border rounded-md text-muted-foreground">
                  <MapPin className="w-4 h-4" />
                  <span>لم يتم تحديد العنوان</span>
                </div>
              </div>
              <div className="space-y-2">
                <Label>معلومات الاتصال</Label>
                <div className="flex items-center gap-2 p-3 border rounded-md text-muted-foreground">
                  <Phone className="w-4 h-4" />
                  <span>لم يتم تحديد رقم الهاتف</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {childEntities.length === 0 ? (
            <div className="col-span-full flex flex-col items-center justify-center py-12 text-center border-2 border-dashed rounded-lg bg-muted/10">
              <div className={`p-4 rounded-full mb-4 ${isHoldingView ? 'bg-blue-100' : 'bg-emerald-100'}`}>
                {isHoldingView ? <Building className="w-8 h-8 text-blue-600" /> : <Store className="w-8 h-8 text-emerald-600" />}
              </div>
              <h3 className="text-lg font-semibold">لا يوجد {isHoldingView ? "وحدات أعمال" : "فروع"}</h3>
              <p className="text-muted-foreground mb-4">
                لم يتم إضافة أي {isHoldingView ? "وحدات أعمال" : "فروع"} تابعة لـ {currentEntity.name} بعد.
              </p>
              <Button onClick={() => setIsNewEntityOpen(true)}>
                <Plus className="w-4 h-4 ml-2" />
                {isHoldingView ? "إضافة وحدة أعمال" : "إضافة فرع"}
              </Button>
            </div>
          ) : (
            childEntities.map((entity) => {
              const TypeIcon = typeMap[entity.type].icon;
              const childCount = entities.filter(e => e.parentId === entity.id).length;
              
              return (
                <Card key={entity.id} className="group hover:shadow-md transition-all cursor-pointer border-t-4" style={{ borderTopColor: getThemeColor(entity.id) }}>
                  <CardHeader className="pb-3">
                    <div className="flex justify-between items-start">
                      <div className={`p-2 rounded-lg ${typeMap[entity.type].bg} bg-opacity-50`}>
                        {entity.logo ? (
                          <img src={entity.logo} alt="Logo" className="w-6 h-6 object-cover rounded-sm" />
                        ) : (
                          <TypeIcon className={`w-6 h-6 ${typeMap[entity.type].color}`} />
                        )}
                      </div>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity">
                            <MoreHorizontal className="w-4 h-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={(e) => { e.stopPropagation(); openEditDialog(entity); }}>
                            <Pencil className="w-4 h-4 ml-2" />
                            تعديل
                          </DropdownMenuItem>
                          <DropdownMenuItem className="text-destructive" onClick={(e) => { e.stopPropagation(); handleDeleteEntity(entity.id); }}>
                            <Trash2 className="w-4 h-4 ml-2" />
                            حذف
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                    <CardTitle className="mt-3">{entity.name}</CardTitle>
                    <CardDescription>{entity.id}</CardDescription>
                  </CardHeader>
                  <CardContent className="pb-3">
                    {entity.type === 'unit' && (
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Store className="w-4 h-4" />
                        <span>{childCount} فروع</span>
                      </div>
                    )}
                  </CardContent>
                  <CardFooter>
                    <Button className="w-full" variant="secondary" onClick={() => navigateToEntity(entity)}>
                      {entity.type === 'unit' ? 'إدارة الوحدة' : 'عرض التفاصيل'}
                      <ArrowRight className="w-4 h-4 mr-2" />
                    </Button>
                  </CardFooter>
                </Card>
              );
            })
          )}
        </div>
      )}

      {/* Edit Dialog */}
      <Dialog open={isEditEntityOpen} onOpenChange={setIsEditEntityOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>تعديل بيانات الكيان</DialogTitle>
            <DialogDescription>
              تعديل اسم وشعار الكيان المحدد.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="edit-name" className="text-right">الاسم</Label>
              <Input 
                id="edit-name" 
                value={editingEntity?.name || ""}
                onChange={(e) => setEditingEntity(prev => prev ? {...prev, name: e.target.value} : null)}
                className="col-span-3" 
              />
            </div>
            
            <div className="grid grid-cols-4 items-start gap-4">
              <Label className="text-right pt-2">الشعار</Label>
              <div className="col-span-3 flex flex-col gap-3">
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 rounded-lg border flex items-center justify-center bg-muted overflow-hidden">
                    {editingEntity?.logo ? (
                      <img src={editingEntity.logo} alt="Logo" className="w-full h-full object-cover" />
                    ) : (
                      <ImageIcon className="w-8 h-8 text-muted-foreground" />
                    )}
                  </div>
                  <div className="flex flex-col gap-2">
                    <Button 
                      type="button" 
                      variant="outline" 
                      size="sm"
                      onClick={() => fileInputRef.current?.click()}
                    >
                      <Upload className="w-3 h-3 ml-2" />
                      رفع شعار جديد
                    </Button>
                    <input 
                      type="file" 
                      ref={fileInputRef}
                      className="hidden" 
                      accept="image/*"
                      onChange={handleLogoUpload}
                    />
                    <p className="text-xs text-muted-foreground">PNG, JPG حتى 2MB</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button onClick={handleEditEntity}>
              <Save className="w-4 h-4 ml-2" />
              حفظ التعديلات
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

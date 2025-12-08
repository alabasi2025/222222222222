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
  MoreHorizontal,
  Eye
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
import { useState, useRef, useEffect } from "react";
import { toast } from "sonner";
import { useEntity, Entity } from "@/contexts/EntityContext";
import { useLocation } from "wouter";

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
  
  const [location, setLocation] = useLocation();
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

  // Handle query parameters for actions
  useEffect(() => {
    const searchParams = new URLSearchParams(window.location.search);
    const action = searchParams.get('action');
    
    if (action === 'add') {
      setIsNewEntityOpen(true);
      // Clean up URL without refreshing
      const newUrl = window.location.pathname;
      window.history.replaceState({}, '', newUrl);
    }
  }, []);

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
    } else if (isBranchView) {
      // Allow adding a sibling branch (same parent unit)
      type = "branch";
      parentId = currentEntity.parentId || "";
      if (!parentId) {
        toast.error("خطأ في تحديد الوحدة التابعة");
        return;
      }
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

  // Get parent name for display in dialog
  const getParentNameForNewEntity = () => {
    if (isBranchView && currentEntity.parentId) {
      return entities.find(e => e.id === currentEntity.parentId)?.name || currentEntity.name;
    }
    return currentEntity.name;
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-card p-6 rounded-lg border shadow-sm">
        <div className="flex items-center gap-4">
          {currentEntity.parentId && (
            <Button variant="outline" size="icon" onClick={goBack} title="عودة للمستوى السابق">
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

        <div className="flex flex-wrap gap-2">
          <Button variant="outline" onClick={() => openEditDialog(currentEntity)}>
            <Pencil className="w-4 h-4 ml-2" />
            تعديل البيانات
          </Button>
          
          <Dialog open={isNewEntityOpen} onOpenChange={setIsNewEntityOpen}>
            <DialogTrigger asChild>
              <Button className="bg-primary hover:bg-primary/90">
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
                  سيتم إضافة {isHoldingView ? "وحدة الأعمال" : "الفرع"} مباشرة تحت: <span className="font-bold text-primary">{getParentNameForNewEntity()}</span>
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
            <div className="col-span-full flex flex-col items-center justify-center py-12 text-muted-foreground border-2 border-dashed rounded-lg bg-muted/10">
              {isHoldingView ? (
                <>
                  <Building2 className="w-16 h-16 mb-4 opacity-20" />
                  <h3 className="text-lg font-medium mb-2">لا توجد وحدات أعمال</h3>
                  <p className="text-muted-foreground mb-6 text-center max-w-sm">قم بإضافة وحدات الأعمال لتقسيم نشاط الشركة وتنظيم الفروع تحتها.</p>
                  <Button onClick={() => setIsNewEntityOpen(true)}>
                    <Plus className="w-4 h-4 ml-2" />
                    إضافة وحدة جديدة
                  </Button>
                </>
              ) : (
                <>
                  <Store className="w-16 h-16 mb-4 opacity-20" />
                  <h3 className="text-lg font-medium mb-2">لا توجد فروع</h3>
                  <p className="text-muted-foreground mb-6 text-center max-w-sm">قم بإضافة الفروع التابعة لهذه الوحدة لبدء إدارة العمليات.</p>
                  <Button onClick={() => setIsNewEntityOpen(true)}>
                    <Plus className="w-4 h-4 ml-2" />
                    إضافة فرع جديد
                  </Button>
                </>
              )}
            </div>
          ) : (
            childEntities.map((entity) => (
              <Card key={entity.id} className="hover:shadow-md transition-all duration-200 cursor-pointer group relative border-muted-foreground/20">
                <div className="absolute top-3 left-3 z-10">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" className="h-8 w-8 hover:bg-muted">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={(e) => { e.stopPropagation(); navigateToEntity(entity); }}>
                        <Eye className="w-4 h-4 ml-2" />
                        عرض التفاصيل
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={(e) => { e.stopPropagation(); openEditDialog(entity); }}>
                        <Pencil className="w-4 h-4 ml-2" />
                        تعديل
                      </DropdownMenuItem>
                      <DropdownMenuItem 
                        className="text-destructive focus:text-destructive" 
                        onClick={(e) => { e.stopPropagation(); handleDeleteEntity(entity.id); }}
                      >
                        <Trash2 className="w-4 h-4 ml-2" />
                        حذف
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
                <div onClick={() => navigateToEntity(entity)}>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">
                      {entity.type === 'unit' ? 'وحدة أعمال' : 'فرع'}
                    </CardTitle>
                    {entity.type === 'unit' ? <Building className="h-4 w-4 text-muted-foreground" /> : <Store className="h-4 w-4 text-muted-foreground" />}
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center gap-4 mt-2">
                      <div 
                        className="w-12 h-12 rounded-lg flex items-center justify-center text-white font-bold text-lg shrink-0 overflow-hidden shadow-sm"
                        style={{ backgroundColor: entity.logo ? 'transparent' : getThemeColor(entity.id) }}
                      >
                        {entity.logo ? (
                          <img src={entity.logo} alt="Logo" className="w-full h-full object-cover" />
                        ) : (
                          entity.type === 'unit' ? <Building className="w-6 h-6" /> : <Store className="w-6 h-6" />
                        )}
                      </div>
                      <div className="flex-1 overflow-hidden">
                        <div className="text-2xl font-bold truncate">{entity.name}</div>
                        <p className="text-xs text-muted-foreground mt-1">
                          {entity.type === 'unit' 
                            ? `${entities.filter(e => e.parentId === entity.id).length} فروع` 
                            : 'نشط'}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                  <CardFooter className="bg-muted/30 p-3 flex justify-between items-center group-hover:bg-muted/60 transition-colors border-t">
                    <span className="text-xs text-muted-foreground font-medium">انقر للإدارة</span>
                    <ArrowRight className="w-4 h-4 text-muted-foreground group-hover:translate-x-1 transition-transform" />
                  </CardFooter>
                </div>
              </Card>
            ))
          )}
        </div>
      )}

      {/* Edit Dialog */}
      <Dialog open={isEditEntityOpen} onOpenChange={setIsEditEntityOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>تعديل البيانات</DialogTitle>
            <DialogDescription>
              تعديل بيانات {editingEntity?.name}
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="edit-name" className="text-right">الاسم</Label>
              <Input 
                id="edit-name" 
                value={editingEntity?.name || ""}
                onChange={(e) => setEditingEntity(editingEntity ? {...editingEntity, name: e.target.value} : null)}
                className="col-span-3" 
              />
            </div>
            
            <div className="grid grid-cols-4 items-center gap-4">
              <Label className="text-right">الشعار</Label>
              <div className="col-span-3 flex items-center gap-4">
                <div className="w-16 h-16 border rounded-md flex items-center justify-center overflow-hidden bg-muted/20">
                  {editingEntity?.logo ? (
                    <img src={editingEntity.logo} alt="Logo" className="w-full h-full object-cover" />
                  ) : (
                    <ImageIcon className="w-6 h-6 text-muted-foreground" />
                  )}
                </div>
                <div className="flex flex-col gap-2">
                  <Button variant="outline" size="sm" onClick={() => fileInputRef.current?.click()}>
                    <Upload className="w-3 h-3 ml-2" />
                    رفع شعار
                  </Button>
                  <input 
                    type="file" 
                    ref={fileInputRef} 
                    className="hidden" 
                    accept="image/*"
                    onChange={handleLogoUpload}
                  />
                  <span className="text-[10px] text-muted-foreground">الحد الأقصى 2 ميجابايت</span>
                </div>
              </div>
            </div>

            {editingEntity && !entities.some(e => e.parentId === editingEntity.id) && (
              <div className="border-t pt-4 mt-2">
                <Button 
                  variant="destructive" 
                  className="w-full" 
                  onClick={() => {
                    handleDeleteEntity(editingEntity.id);
                    setIsEditEntityOpen(false);
                    if (currentEntity.id === editingEntity.id) {
                      goBack();
                    }
                  }}
                >
                  <Trash2 className="w-4 h-4 ml-2" />
                  حذف الكيان نهائياً
                </Button>
              </div>
            )}
          </div>
          <DialogFooter>
            <Button onClick={handleEditEntity}>
              <Save className="w-4 h-4 ml-2" />
              حفظ التغييرات
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

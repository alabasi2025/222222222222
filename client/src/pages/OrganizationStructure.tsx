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
  Building2,
  Building,
  Store,
  Network,
  Save,
  ChevronRight,
  ChevronDown,
  Pencil,
  Trash2,
  Upload,
  Image as ImageIcon
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
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useState, useEffect, useRef } from "react";
import { toast } from "sonner";
import { useEntity, Entity } from "@/contexts/EntityContext";

const typeMap: Record<string, { label: string, icon: any, color: string }> = {
  holding: { label: "شركة قابضة", icon: Building2, color: "bg-purple-100 text-purple-700 border-purple-200" },
  unit: { label: "وحدة أعمال", icon: Building, color: "bg-blue-100 text-blue-700 border-blue-200" },
  branch: { label: "فرع", icon: Store, color: "bg-emerald-100 text-emerald-700 border-emerald-200" },
};

export default function OrganizationStructure() {
  const { entities: contextEntities, setEntities: setContextEntities, isEntityVisible, updateEntityLogo } = useEntity();
  
  // Local state for UI manipulation (expanding/collapsing)
  // We initialize with context entities but add 'expanded' property
  const [entities, setEntities] = useState<(Entity & { expanded: boolean })[]>([]);
  
  useEffect(() => {
    setEntities(contextEntities.map(e => ({ ...e, expanded: true })));
  }, [contextEntities]);

  const [isNewEntityOpen, setIsNewEntityOpen] = useState(false);
  const [isEditEntityOpen, setIsEditEntityOpen] = useState(false);
  const [editingEntity, setEditingEntity] = useState<(Entity & { expanded: boolean }) | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [newEntity, setNewEntity] = useState({
    name: "",
    type: "branch",
    parent: ""
  });

  const toggleExpand = (id: string) => {
    setEntities(entities.map(ent => 
      ent.id === id ? { ...ent, expanded: !ent.expanded } : ent
    ));
  };

  const handleAddEntity = () => {
    if (!newEntity.name || !newEntity.parent) {
      toast.error("يرجى تعبئة الاسم واختيار الكيان الرئيسي");
      return;
    }

    const parent = entities.find(e => e.id === newEntity.parent);
    
    // Validation logic
    if (newEntity.type === "holding" && entities.some(e => e.type === "holding")) {
      toast.error("لا يمكن إضافة أكثر من شركة قابضة واحدة");
      return;
    }
    if (newEntity.type === "unit" && parent?.type !== "holding") {
      toast.error("وحدة الأعمال يجب أن تتبع الشركة القابضة مباشرة");
      return;
    }
    if (newEntity.type === "branch" && parent?.type !== "unit") {
      toast.error("الفرع يجب أن يتبع وحدة أعمال");
      return;
    }

    const prefix = newEntity.type === "holding" ? "HOLD" : newEntity.type === "unit" ? "UNIT" : "BR";
    const newId = `${prefix}-${String(entities.length + 1).padStart(3, '0')}`;

    const newEnt = {
      id: newId,
      name: newEntity.name,
      type: newEntity.type as any,
      parentId: newEntity.parent === "none" ? null : newEntity.parent,
      expanded: true
    };

    // Update parent to be expanded
    const updatedEntities = entities.map(e => 
      e.id === newEntity.parent ? { ...e, expanded: true } : e
    );

    const finalEntities = [...updatedEntities, newEnt];
    setEntities(finalEntities);
    setContextEntities(finalEntities); // Sync with context
    
    toast.success("تم إضافة الكيان بنجاح");
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
    setContextEntities(updatedEntities); // Sync with context
    
    toast.success("تم تحديث بيانات الكيان بنجاح");
    setIsEditEntityOpen(false);
    setEditingEntity(null);
  };

  const handleDeleteEntity = (id: string) => {
    // Check if entity has children
    const hasChildren = entities.some(e => e.parentId === id);
    if (hasChildren) {
      toast.error("لا يمكن حذف كيان يحتوي على كيانات فرعية. يرجى حذف الفروع أولاً.");
      return;
    }

    if (confirm("هل أنت متأكد من حذف هذا الكيان؟")) {
      const filteredEntities = entities.filter(e => e.id !== id);
      setEntities(filteredEntities);
      setContextEntities(filteredEntities); // Sync with context
      toast.success("تم حذف الكيان بنجاح");
    }
  };

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !editingEntity) return;

    if (file.size > 2 * 1024 * 1024) { // 2MB limit
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

  const openEditDialog = (entity: any) => {
    setEditingEntity({ ...entity });
    setIsEditEntityOpen(true);
  };

  // Helper to check visibility for tree structure
  const isVisibleInTree = (entity: any): boolean => {
    // First check if it's allowed by current context
    if (!isEntityVisible(entity.id)) return false;

    // Then check tree expansion logic
    if (!entity.parentId) return true;
    const parent = entities.find(e => e.id === entity.parentId);
    // If parent is not visible in current context, child shouldn't be either (unless it's the root of current view)
    // But isEntityVisible handles that logic mostly.
    // Here we just care about expansion state
    return parent ? (parent.expanded && isVisibleInTree(parent)) : true;
  };

  // Filter entities for display based on context
  const visibleEntities = entities.filter(e => isEntityVisible(e.id));

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">الهيكل التنظيمي</h2>
          <p className="text-muted-foreground mt-1">إدارة هيكل الشركة القابضة والوحدات والفروع</p>
        </div>
        <div className="flex gap-2">
          <Dialog open={isNewEntityOpen} onOpenChange={setIsNewEntityOpen}>
            <DialogTrigger asChild>
              <Button size="sm">
                <Plus className="w-4 h-4 ml-2" />
                إضافة كيان جديد
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>إضافة كيان جديد للهيكل</DialogTitle>
                <DialogDescription>
                  أدخل تفاصيل الكيان الجديد (وحدة أعمال أو فرع).
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="type" className="text-right">نوع الكيان</Label>
                  <Select 
                    value={newEntity.type} 
                    onValueChange={(v) => setNewEntity({...newEntity, type: v})}
                  >
                    <SelectTrigger className="col-span-3">
                      <SelectValue placeholder="اختر النوع" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="unit">وحدة أعمال (Business Unit)</SelectItem>
                      <SelectItem value="branch">فرع (Branch)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="parent" className="text-right">التابع لـ</Label>
                  <Select 
                    value={newEntity.parent} 
                    onValueChange={(v) => setNewEntity({...newEntity, parent: v})}
                  >
                    <SelectTrigger className="col-span-3">
                      <SelectValue placeholder="اختر الكيان الرئيسي" />
                    </SelectTrigger>
                    <SelectContent>
                      {entities
                        .filter(e => newEntity.type === "unit" ? e.type === "holding" : e.type === "unit")
                        .map(e => (
                          <SelectItem key={e.id} value={e.id}>{e.name}</SelectItem>
                        ))
                      }
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="name" className="text-right">الاسم</Label>
                  <Input 
                    id="name" 
                    value={newEntity.name}
                    onChange={(e) => setNewEntity({...newEntity, name: e.target.value})}
                    className="col-span-3" 
                    placeholder="مثال: فرع الدمام"
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
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle>شجرة الهيكل التنظيمي</CardTitle>
            <CardDescription>عرض هرمي لجميع وحدات وفروع الشركة</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="rounded-md border p-4 min-h-[400px]">
              {visibleEntities.length === 0 ? (
                <div className="text-center py-10 text-muted-foreground">
                  لا توجد كيانات لعرضها في هذا السياق
                </div>
              ) : (
                <div className="space-y-2">
                  {visibleEntities.map((entity) => {
                    if (!isVisibleInTree(entity)) return null;
                    
                    // Calculate indentation level
                    let level = 0;
                    if (entity.type === 'unit') level = 1;
                    if (entity.type === 'branch') level = 2;
                    
                    const hasChildren = entities.some(e => e.parentId === entity.id);
                    const TypeIcon = typeMap[entity.type]?.icon || Store;
                    
                    return (
                      <div 
                        key={entity.id}
                        className="flex items-center gap-2 p-2 rounded-md hover:bg-muted/50 transition-colors group"
                        style={{ marginRight: `${level * 24}px` }}
                      >
                        <button 
                          onClick={() => toggleExpand(entity.id)}
                          className={`p-1 rounded-sm hover:bg-muted ${!hasChildren && 'invisible'}`}
                        >
                          {entity.expanded ? (
                            <ChevronDown className="w-4 h-4 text-muted-foreground" />
                          ) : (
                            <ChevronRight className="w-4 h-4 text-muted-foreground" />
                          )}
                        </button>
                        
                        <div className={`p-2 rounded-md ${typeMap[entity.type]?.color} bg-opacity-20`}>
                          {entity.logo ? (
                            <img src={entity.logo} alt="Logo" className="w-4 h-4 object-cover rounded-sm" />
                          ) : (
                            <TypeIcon className="w-4 h-4" />
                          )}
                        </div>
                        
                        <div className="flex-1">
                          <div className="font-medium text-sm flex items-center gap-2">
                            {entity.name}
                            <Badge variant="outline" className="text-[10px] h-5">
                              {typeMap[entity.type]?.label}
                            </Badge>
                          </div>
                          <div className="text-xs text-muted-foreground">
                            {entity.id}
                          </div>
                        </div>

                        <div className="opacity-0 group-hover:opacity-100 flex items-center gap-1 transition-opacity">
                          <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => openEditDialog(entity)}>
                            <Pencil className="w-3 h-3" />
                          </Button>
                          <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive hover:text-destructive" onClick={() => handleDeleteEntity(entity.id)}>
                            <Trash2 className="w-3 h-3" />
                          </Button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>إحصائيات سريعة</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between p-4 rounded-lg border bg-purple-50 border-purple-100">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-purple-100 rounded-full">
                  <Building2 className="w-4 h-4 text-purple-600" />
                </div>
                <span className="font-medium">الشركات القابضة</span>
              </div>
              <span className="text-xl font-bold text-purple-700">
                {entities.filter(e => e.type === 'holding').length}
              </span>
            </div>

            <div className="flex items-center justify-between p-4 rounded-lg border bg-blue-50 border-blue-100">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-100 rounded-full">
                  <Building className="w-4 h-4 text-blue-600" />
                </div>
                <span className="font-medium">وحدات الأعمال</span>
              </div>
              <span className="text-xl font-bold text-blue-700">
                {entities.filter(e => e.type === 'unit').length}
              </span>
            </div>

            <div className="flex items-center justify-between p-4 rounded-lg border bg-emerald-50 border-emerald-100">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-emerald-100 rounded-full">
                  <Store className="w-4 h-4 text-emerald-600" />
                </div>
                <span className="font-medium">الفروع</span>
              </div>
              <span className="text-xl font-bold text-emerald-700">
                {entities.filter(e => e.type === 'branch').length}
              </span>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

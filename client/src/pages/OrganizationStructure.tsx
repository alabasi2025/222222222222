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
  ChevronDown
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
import { useState } from "react";
import { toast } from "sonner";

// Initial clean data
const initialEntities = [
  { id: "HOLD-001", name: "شركة أعمال العباسي", type: "holding", parentId: null, expanded: true },
];

const typeMap: Record<string, { label: string, icon: any, color: string }> = {
  holding: { label: "شركة قابضة", icon: Building2, color: "bg-purple-100 text-purple-700 border-purple-200" },
  unit: { label: "وحدة أعمال", icon: Building, color: "bg-blue-100 text-blue-700 border-blue-200" },
  branch: { label: "فرع", icon: Store, color: "bg-emerald-100 text-emerald-700 border-emerald-200" },
};

export default function OrganizationStructure() {
  interface Entity {
  id: string;
  name: string;
  type: string;
  parentId: string | null;
  expanded: boolean;
}

const [entities, setEntities] = useState<Entity[]>(initialEntities);
  const [isNewEntityOpen, setIsNewEntityOpen] = useState(false);
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
      type: newEntity.type,
      parentId: newEntity.parent === "none" ? null : newEntity.parent,
      expanded: true
    };

    // Update parent to be expanded
    const updatedEntities = entities.map(e => 
      e.id === newEntity.parent ? { ...e, expanded: true } : e
    );

    setEntities([...updatedEntities, newEnt]);
    toast.success("تم إضافة الكيان بنجاح");
    setIsNewEntityOpen(false);
    setNewEntity({ name: "", type: "branch", parent: "" });
  };

  // Helper to check visibility
  const isVisible = (entity: any): boolean => {
    if (!entity.parentId) return true;
    const parent = entities.find(e => e.id === entity.parentId);
    return parent ? (parent.expanded && isVisible(parent)) : true;
  };

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
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Network className="w-5 h-5 text-primary" />
              شجرة الهيكل التنظيمي
            </CardTitle>
            <CardDescription>عرض هرمي للشركة القابضة والوحدات والفروع التابعة لها</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="rounded-md border shadow-sm overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[400px]">الكيان</TableHead>
                    <TableHead>النوع</TableHead>
                    <TableHead>الرمز</TableHead>
                    <TableHead className="text-left">إجراءات</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {entities.filter(isVisible).map((entity) => {
                    const TypeIcon = typeMap[entity.type].icon;
                    const hasChildren = entities.some(e => e.parentId === entity.id);
                    const indentLevel = entity.type === "holding" ? 0 : entity.type === "unit" ? 1 : 2;
                    
                    return (
                      <TableRow key={entity.id} className="hover:bg-muted/50 transition-colors">
                        <TableCell>
                          <div 
                            className="flex items-center gap-2" 
                            style={{ paddingRight: `${indentLevel * 24}px` }}
                          >
                            {hasChildren ? (
                              <Button 
                                variant="ghost" 
                                size="icon" 
                                className="h-6 w-6 p-0 hover:bg-muted"
                                onClick={() => toggleExpand(entity.id)}
                              >
                                {entity.expanded ? (
                                  <ChevronDown className="h-4 w-4 text-muted-foreground" />
                                ) : (
                                  <ChevronRight className="h-4 w-4 text-muted-foreground rtl:rotate-180" />
                                )}
                              </Button>
                            ) : (
                              <div className="w-6" />
                            )}
                            <TypeIcon className={`w-4 h-4 ${entity.type === 'holding' ? 'text-purple-600' : entity.type === 'unit' ? 'text-blue-600' : 'text-emerald-600'}`} />
                            <span className={`font-medium ${entity.type === 'holding' ? 'text-lg' : ''}`}>
                              {entity.name}
                            </span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline" className={typeMap[entity.type].color}>
                            {typeMap[entity.type].label}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-muted-foreground text-sm font-mono">
                          {entity.id}
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
                              <DropdownMenuItem>تعديل البيانات</DropdownMenuItem>
                              <DropdownMenuItem>إعدادات الكيان</DropdownMenuItem>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem className="text-destructive">حذف</DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>إحصائيات الهيكل</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between p-3 bg-purple-50 rounded-lg border border-purple-100">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-purple-100 rounded-full">
                    <Building2 className="w-4 h-4 text-purple-600" />
                  </div>
                  <span className="font-medium">الشركات القابضة</span>
                </div>
                <span className="text-xl font-bold text-purple-700">1</span>
              </div>
              <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg border border-blue-100">
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
              <div className="flex items-center justify-between p-3 bg-emerald-50 rounded-lg border border-emerald-100">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-emerald-100 rounded-full">
                    <Store className="w-4 h-4 text-emerald-600" />
                  </div>
                  <span className="font-medium">الفروع النشطة</span>
                </div>
                <span className="text-xl font-bold text-emerald-700">
                  {entities.filter(e => e.type === 'branch').length}
                </span>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-primary/5 border-primary/20">
            <CardHeader>
              <CardTitle className="text-primary">معلومات هامة</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground leading-relaxed">
                يسمح هذا الهيكل بإدارة حسابات متعددة المستويات. يتم تجميع التقارير المالية تلقائياً من الفروع إلى الوحدات، ومن الوحدات إلى الشركة القابضة.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

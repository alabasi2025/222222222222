import { useState, useEffect } from "react";
import { useEntity } from "@/contexts/EntityContext";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Building2, Wallet, Edit, RefreshCw, TrendingUp, TrendingDown, AlertTriangle, CheckCircle, ArrowLeftRight, FileText } from "lucide-react";
import { api } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";

interface Entity {
  id: string;
  name: string;
  type: string;
}

interface Account {
  id: string;
  name: string;
  type: string;
  subtype?: string;
  entityId?: string;
  balance: string;
}

interface InterUnitAccount {
  id: string;
  entityId: string;
  relatedEntityId: string;
  accountId: string;
  balance: string;
  currency: string;
}

export default function InterUnitAccounts() {
  const { currentEntity: _currentEntity, getThemeColor } = useEntity();
  const { toast } = useToast();
  const [_interUnitAccounts, setInterUnitAccounts] = useState<InterUnitAccount[]>([]);
  const [entities, setEntities] = useState<Entity[]>([]);
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [loading, setLoading] = useState(true);
  
  // حالات النوافذ
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [reconcileDialogOpen, setReconcileDialogOpen] = useState(false);
  const [selectedAccount, setSelectedAccount] = useState<Account | null>(null);
  const [editName, setEditName] = useState("");
  
  // حالة التسوية
  const [reconcileData, setReconcileData] = useState({
    fromEntityId: "",
    toEntityId: "",
    amount: "",
    description: "",
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const [entitiesRes, accountsRes, interAccountsRes] = await Promise.all([
        api.get<Entity[]>("/entities"),
        api.get<Account[]>("/accounts"),
        api.get<InterUnitAccount[]>("/inter-unit-transfers/inter-unit-accounts"),
      ]);
      setEntities(entitiesRes.filter((e: Entity) => e.type === "unit"));
      setAccounts(accountsRes);
      setInterUnitAccounts(interAccountsRes);
    } catch (error) {
      console.error("Error loading data:", error);
    } finally {
      setLoading(false);
    }
  };

  // الحصول على حسابات الجاري (من شجرة الحسابات)
  const getIntercompanyAccounts = () => {
    return accounts.filter((acc) => acc.subtype === "intercompany");
  };

  // الحصول على اسم الوحدة
  const getEntityName = (entityId: string) => {
    return entities.find((e) => e.id === entityId)?.name || entityId;
  };

  // الحصول على الوحدة المرتبطة من اسم الحساب
  const _getRelatedEntityFromAccount = (account: Account) => {
    // اسم الحساب يكون مثل "جاري وحدة العباسي خاص"
    const match = account.name.match(/جاري (.+)/);
    if (match) {
      const relatedEntity = entities.find((e) => account.name.includes(e.name));
      return relatedEntity;
    }
    return null;
  };

  // حساب الرصيد الصافي بين وحدتين
  const _getNetBalance = (entityId: string, relatedEntityId: string) => {
    const account1 = getIntercompanyAccounts().find(
      (acc) => acc.entityId === entityId && acc.name.includes(getEntityName(relatedEntityId))
    );
    const account2 = getIntercompanyAccounts().find(
      (acc) => acc.entityId === relatedEntityId && acc.name.includes(getEntityName(entityId))
    );
    
    const balance1 = parseFloat(account1?.balance || "0");
    const balance2 = parseFloat(account2?.balance || "0");
    
    return balance1 - balance2;
  };

  // فتح نافذة التعديل
  const handleEdit = (account: Account) => {
    setSelectedAccount(account);
    setEditName(account.name);
    setEditDialogOpen(true);
  };

  // حفظ التعديل
  const handleSaveEdit = async () => {
    if (!selectedAccount || !editName.trim()) return;

    try {
      await api.put(`/accounts/${selectedAccount.id}`, {
        name: editName,
      });

      toast({
        title: "تم التحديث",
        description: "تم تحديث اسم الحساب بنجاح",
      });

      setEditDialogOpen(false);
      loadData();
    } catch (error) {
      console.error("Error updating account:", error);
      toast({
        title: "خطأ",
        description: "فشل في تحديث الحساب",
        variant: "destructive",
      });
    }
  };

  // إنشاء تسوية
  const handleReconcile = async () => {
    if (!reconcileData.fromEntityId || !reconcileData.toEntityId || !reconcileData.amount) {
      toast({
        title: "خطأ",
        description: "يرجى ملء جميع الحقول المطلوبة",
        variant: "destructive",
      });
      return;
    }

    try {
      // الحصول على حسابات الجاري
      const fromAccount = getIntercompanyAccounts().find(
        (acc) => acc.entityId === reconcileData.fromEntityId && 
                 acc.name.includes(getEntityName(reconcileData.toEntityId))
      );
      const toAccount = getIntercompanyAccounts().find(
        (acc) => acc.entityId === reconcileData.toEntityId && 
                 acc.name.includes(getEntityName(reconcileData.fromEntityId))
      );

      if (!fromAccount || !toAccount) {
        toast({
          title: "خطأ",
          description: "لم يتم العثور على حسابات الجاري",
          variant: "destructive",
        });
        return;
      }

      // إنشاء قيد تسوية
      await api.post("/inter-unit-transfers", {
        fromEntityId: reconcileData.fromEntityId,
        toEntityId: reconcileData.toEntityId,
        fromAccountId: fromAccount.id,
        toAccountId: toAccount.id,
        amount: parseFloat(reconcileData.amount),
        description: reconcileData.description || "تسوية حسابات جاري",
      });

      toast({
        title: "تم بنجاح",
        description: "تم إنشاء قيد التسوية بنجاح",
      });

      setReconcileDialogOpen(false);
      setReconcileData({
        fromEntityId: "",
        toEntityId: "",
        amount: "",
        description: "",
      });
      loadData();
    } catch (error) {
      console.error("Error creating reconciliation:", error);
      toast({
        title: "خطأ",
        description: "فشل في إنشاء التسوية",
        variant: "destructive",
      });
    }
  };

  const themeColor = getThemeColor();
  const intercompanyAccounts = getIntercompanyAccounts();

  // تجميع الحسابات حسب الوحدة
  const accountsByEntity = entities.reduce((acc, entity) => {
    acc[entity.id] = intercompanyAccounts.filter((a) => a.entityId === entity.id);
    return acc;
  }, {} as Record<string, Account[]>);

  // حساب إجمالي الأرصدة
  const totalDebit = intercompanyAccounts
    .filter((a) => a.type === "asset")
    .reduce((sum, a) => sum + parseFloat(a.balance), 0);
  const totalCredit = intercompanyAccounts
    .filter((a) => a.type === "liability")
    .reduce((sum, a) => sum + parseFloat(a.balance), 0);

  return (
    <div className="p-6 space-y-6">
      {/* العنوان */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Building2 className="w-6 h-6" style={{ color: themeColor }} />
            حسابات الجاري بين الوحدات
          </h1>
          <p className="text-muted-foreground mt-1">
            إدارة ومراجعة حسابات الجاري بين وحدات الأعمال
          </p>
        </div>

        <Button 
          onClick={() => setReconcileDialogOpen(true)}
          style={{ backgroundColor: themeColor }}
        >
          <RefreshCw className="w-4 h-4 ml-2" />
          تسوية حسابات
        </Button>
      </div>

      {/* إحصائيات */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">عدد الحسابات</p>
                <p className="text-2xl font-bold">{intercompanyAccounts.length}</p>
              </div>
              <Wallet className="w-8 h-8 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">إجمالي المدين</p>
                <p className="text-2xl font-bold text-green-500">
                  {totalDebit.toLocaleString()} ر.س
                </p>
              </div>
              <TrendingUp className="w-8 h-8 text-green-500" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">إجمالي الدائن</p>
                <p className="text-2xl font-bold text-red-500">
                  {totalCredit.toLocaleString()} ر.س
                </p>
              </div>
              <TrendingDown className="w-8 h-8 text-red-500" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">الفرق</p>
                <p className={`text-2xl font-bold ${Math.abs(totalDebit - totalCredit) < 0.01 ? 'text-green-500' : 'text-yellow-500'}`}>
                  {Math.abs(totalDebit - totalCredit).toLocaleString()} ر.س
                </p>
              </div>
              {Math.abs(totalDebit - totalCredit) < 0.01 ? (
                <CheckCircle className="w-8 h-8 text-green-500" />
              ) : (
                <AlertTriangle className="w-8 h-8 text-yellow-500" />
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* حسابات كل وحدة */}
      {entities.map((entity) => {
        const entityAccounts = accountsByEntity[entity.id] || [];
        if (entityAccounts.length === 0) return null;

        return (
          <Card key={entity.id}>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Building2 className="w-5 h-5" style={{ color: themeColor }} />
                {entity.name}
              </CardTitle>
              <CardDescription>
                حسابات الجاري مع الوحدات الأخرى
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>اسم الحساب</TableHead>
                    <TableHead>النوع</TableHead>
                    <TableHead>الرصيد</TableHead>
                    <TableHead>العملة</TableHead>
                    <TableHead>الإجراءات</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {entityAccounts.map((account) => (
                    <TableRow key={account.id}>
                      <TableCell className="font-medium">
                        <div className="flex items-center gap-2">
                          <ArrowLeftRight className="w-4 h-4 text-muted-foreground" />
                          {account.name}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant={account.type === "asset" ? "default" : "secondary"}>
                          {account.type === "asset" ? "مدين (أصل)" : "دائن (التزام)"}
                        </Badge>
                      </TableCell>
                      <TableCell className={`font-semibold ${parseFloat(account.balance) > 0 ? 'text-green-600' : parseFloat(account.balance) < 0 ? 'text-red-600' : ''}`}>
                        {parseFloat(account.balance).toLocaleString()} ر.س
                      </TableCell>
                      <TableCell>YER</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleEdit(account)}
                          >
                            <Edit className="w-4 h-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        );
      })}

      {/* رسالة إذا لم توجد حسابات */}
      {intercompanyAccounts.length === 0 && !loading && (
        <Card>
          <CardContent className="py-12 text-center">
            <Building2 className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">لا توجد حسابات جاري</h3>
            <p className="text-muted-foreground mb-4">
              سيتم إنشاء حسابات الجاري تلقائياً عند إجراء أول تحويل بين الوحدات
            </p>
            <Button variant="outline" asChild>
              <a href="/inter-unit-transfers">
                <ArrowLeftRight className="w-4 h-4 ml-2" />
                إنشاء تحويل جديد
              </a>
            </Button>
          </CardContent>
        </Card>
      )}

      {/* نافذة تعديل الحساب */}
      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Edit className="w-5 h-5" style={{ color: themeColor }} />
              تعديل اسم الحساب
            </DialogTitle>
            <DialogDescription>
              قم بتعديل اسم حساب الجاري
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>اسم الحساب</Label>
              <Input
                value={editName}
                onChange={(e) => setEditName(e.target.value)}
                placeholder="أدخل اسم الحساب"
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setEditDialogOpen(false)}>
              إلغاء
            </Button>
            <Button onClick={handleSaveEdit} style={{ backgroundColor: themeColor }}>
              حفظ
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* نافذة التسوية */}
      <Dialog open={reconcileDialogOpen} onOpenChange={setReconcileDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <RefreshCw className="w-5 h-5" style={{ color: themeColor }} />
              تسوية حسابات الجاري
            </DialogTitle>
            <DialogDescription>
              إنشاء قيد تسوية بين وحدتين لتصفير الأرصدة المتبادلة
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label className="flex items-center gap-2">
                <Building2 className="w-4 h-4" />
                من وحدة (المدينة)
              </Label>
              <Select
                value={reconcileData.fromEntityId}
                onValueChange={(value) => setReconcileData({ ...reconcileData, fromEntityId: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="اختر الوحدة" />
                </SelectTrigger>
                <SelectContent>
                  {entities.map((entity) => (
                    <SelectItem key={entity.id} value={entity.id}>
                      {entity.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label className="flex items-center gap-2">
                <Building2 className="w-4 h-4" />
                إلى وحدة (الدائنة)
              </Label>
              <Select
                value={reconcileData.toEntityId}
                onValueChange={(value) => setReconcileData({ ...reconcileData, toEntityId: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="اختر الوحدة" />
                </SelectTrigger>
                <SelectContent>
                  {entities
                    .filter((e) => e.id !== reconcileData.fromEntityId)
                    .map((entity) => (
                      <SelectItem key={entity.id} value={entity.id}>
                        {entity.name}
                      </SelectItem>
                    ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>مبلغ التسوية</Label>
              <Input
                type="number"
                value={reconcileData.amount}
                onChange={(e) => setReconcileData({ ...reconcileData, amount: e.target.value })}
                placeholder="0.00"
              />
            </div>

            <div className="space-y-2">
              <Label className="flex items-center gap-2">
                <FileText className="w-4 h-4" />
                ملاحظات
              </Label>
              <Textarea
                value={reconcileData.description}
                onChange={(e) => setReconcileData({ ...reconcileData, description: e.target.value })}
                placeholder="وصف التسوية (اختياري)"
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setReconcileDialogOpen(false)}>
              إلغاء
            </Button>
            <Button onClick={handleReconcile} style={{ backgroundColor: themeColor }}>
              إنشاء تسوية
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

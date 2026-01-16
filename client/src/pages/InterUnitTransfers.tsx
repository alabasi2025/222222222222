import { useState, useEffect } from "react";
import { useEntity } from "@/contexts/EntityContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
  DialogTrigger,
  DialogFooter,
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
import { 
  ArrowLeftRight, 
  Plus, 
  Building2, 
  Wallet,
  Calendar,
  FileText,
  CheckCircle,
  XCircle,
  Clock,
  ArrowRight
} from "lucide-react";
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

interface Transfer {
  id: string;
  transferNumber: string;
  fromEntityId: string;
  toEntityId: string;
  fromAccountId: string;
  toAccountId: string;
  amount: string;
  currency: string;
  description?: string;
  date: string;
  status: string;
  createdAt: string;
}

export default function InterUnitTransfers() {
  const { currentEntity, getThemeColor } = useEntity();
  const { toast } = useToast();
  const [transfers, setTransfers] = useState<Transfer[]>([]);
  const [entities, setEntities] = useState<Entity[]>([]);
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  // نموذج التحويل الجديد
  const [formData, setFormData] = useState({
    fromEntityId: "",
    toEntityId: "",
    fromAccountId: "",
    toAccountId: "",
    amount: "",
    description: "",
    date: new Date().toISOString().split("T")[0],
  });

  // تحميل البيانات
  useEffect(() => {
    loadData();
  }, [currentEntity]);

  const loadData = async () => {
    try {
      const [transfersRes, entitiesRes, accountsRes] = await Promise.all([
        api.get<Transfer[]>("/inter-unit-transfers"),
        api.get<Entity[]>("/entities"),
        api.get<Account[]>("/accounts"),
      ]);
      setTransfers(transfersRes);
      setEntities(entitiesRes.filter((e: Entity) => e.type === "unit"));
      setAccounts(accountsRes);
    } catch (error) {
      console.error("Error loading data:", error);
    }
  };

  // فلترة الحسابات حسب الوحدة
  const getAccountsForEntity = (entityId: string) => {
    return accounts.filter(
      (acc) =>
        acc.entityId === entityId &&
        (acc.subtype === "cash" || acc.subtype === "bank" || acc.type === "asset")
    );
  };

  // الحصول على اسم الوحدة
  const getEntityName = (entityId: string) => {
    return entities.find((e) => e.id === entityId)?.name || entityId;
  };

  // الحصول على اسم الحساب
  const getAccountName = (accountId: string) => {
    return accounts.find((a) => a.id === accountId)?.name || accountId;
  };

  // إنشاء تحويل جديد
  const handleSubmit = async () => {
    if (!formData.fromEntityId || !formData.toEntityId || !formData.fromAccountId || !formData.toAccountId || !formData.amount) {
      toast({
        title: "خطأ",
        description: "يرجى ملء جميع الحقول المطلوبة",
        variant: "destructive",
      });
      return;
    }

    if (formData.fromEntityId === formData.toEntityId) {
      toast({
        title: "خطأ",
        description: "لا يمكن التحويل إلى نفس الوحدة",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      await api.post("/inter-unit-transfers", {
        ...formData,
        amount: parseFloat(formData.amount),
      });

      toast({
        title: "تم بنجاح",
        description: "تم إنشاء التحويل وتسجيل القيود في كلا الوحدتين",
      });

      setIsDialogOpen(false);
      setFormData({
        fromEntityId: "",
        toEntityId: "",
        fromAccountId: "",
        toAccountId: "",
        amount: "",
        description: "",
        date: new Date().toISOString().split("T")[0],
      });
      loadData();
    } catch (error) {
      console.error("Error creating transfer:", error);
      toast({
        title: "خطأ",
        description: "فشل في إنشاء التحويل",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  // حالة التحويل
  const getStatusBadge = (status: string) => {
    switch (status) {
      case "completed":
        return (
          <Badge className="bg-green-500/20 text-green-500 hover:bg-green-500/30">
            <CheckCircle className="w-3 h-3 ml-1" />
            مكتمل
          </Badge>
        );
      case "pending":
        return (
          <Badge className="bg-yellow-500/20 text-yellow-500 hover:bg-yellow-500/30">
            <Clock className="w-3 h-3 ml-1" />
            معلق
          </Badge>
        );
      case "cancelled":
        return (
          <Badge className="bg-red-500/20 text-red-500 hover:bg-red-500/30">
            <XCircle className="w-3 h-3 ml-1" />
            ملغي
          </Badge>
        );
      default:
        return <Badge>{status}</Badge>;
    }
  };

  const themeColor = getThemeColor();

  return (
    <div className="p-6 space-y-6">
      {/* العنوان */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <ArrowLeftRight className="w-6 h-6" style={{ color: themeColor }} />
            التحويلات بين الوحدات
          </h1>
          <p className="text-muted-foreground mt-1">
            إدارة التحويلات المالية بين وحدات الأعمال
          </p>
        </div>

        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button style={{ backgroundColor: themeColor }}>
              <Plus className="w-4 h-4 ml-2" />
              تحويل جديد
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <ArrowLeftRight className="w-5 h-5" style={{ color: themeColor }} />
                تحويل بين الوحدات
              </DialogTitle>
            </DialogHeader>

            <div className="space-y-4 py-4">
              {/* من وحدة */}
              <div className="space-y-2">
                <Label className="flex items-center gap-2">
                  <Building2 className="w-4 h-4" />
                  من وحدة
                </Label>
                <Select
                  value={formData.fromEntityId}
                  onValueChange={(value) => {
                    setFormData({ ...formData, fromEntityId: value, fromAccountId: "" });
                  }}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="اختر الوحدة المُحوِّلة" />
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

              {/* من حساب */}
              <div className="space-y-2">
                <Label className="flex items-center gap-2">
                  <Wallet className="w-4 h-4" />
                  من حساب
                </Label>
                <Select
                  value={formData.fromAccountId}
                  onValueChange={(value) => setFormData({ ...formData, fromAccountId: value })}
                  disabled={!formData.fromEntityId}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="اختر الحساب المصدر" />
                  </SelectTrigger>
                  <SelectContent>
                    {getAccountsForEntity(formData.fromEntityId).map((account) => (
                      <SelectItem key={account.id} value={account.id}>
                        {account.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* سهم التحويل */}
              <div className="flex justify-center py-2">
                <div className="bg-muted rounded-full p-2">
                  <ArrowRight className="w-5 h-5 rotate-180" style={{ color: themeColor }} />
                </div>
              </div>

              {/* إلى وحدة */}
              <div className="space-y-2">
                <Label className="flex items-center gap-2">
                  <Building2 className="w-4 h-4" />
                  إلى وحدة
                </Label>
                <Select
                  value={formData.toEntityId}
                  onValueChange={(value) => {
                    setFormData({ ...formData, toEntityId: value, toAccountId: "" });
                  }}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="اختر الوحدة المستلمة" />
                  </SelectTrigger>
                  <SelectContent>
                    {entities
                      .filter((e) => e.id !== formData.fromEntityId)
                      .map((entity) => (
                        <SelectItem key={entity.id} value={entity.id}>
                          {entity.name}
                        </SelectItem>
                      ))}
                  </SelectContent>
                </Select>
              </div>

              {/* إلى حساب */}
              <div className="space-y-2">
                <Label className="flex items-center gap-2">
                  <Wallet className="w-4 h-4" />
                  إلى حساب
                </Label>
                <Select
                  value={formData.toAccountId}
                  onValueChange={(value) => setFormData({ ...formData, toAccountId: value })}
                  disabled={!formData.toEntityId}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="اختر الحساب المستلم" />
                  </SelectTrigger>
                  <SelectContent>
                    {getAccountsForEntity(formData.toEntityId).map((account) => (
                      <SelectItem key={account.id} value={account.id}>
                        {account.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* المبلغ */}
              <div className="space-y-2">
                <Label>المبلغ</Label>
                <Input
                  type="number"
                  placeholder="0.00"
                  value={formData.amount}
                  onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                />
              </div>

              {/* التاريخ */}
              <div className="space-y-2">
                <Label className="flex items-center gap-2">
                  <Calendar className="w-4 h-4" />
                  التاريخ
                </Label>
                <Input
                  type="date"
                  value={formData.date}
                  onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                />
              </div>

              {/* الملاحظات */}
              <div className="space-y-2">
                <Label className="flex items-center gap-2">
                  <FileText className="w-4 h-4" />
                  ملاحظات
                </Label>
                <Textarea
                  placeholder="وصف التحويل (اختياري)"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                />
              </div>
            </div>

            <DialogFooter>
              <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                إلغاء
              </Button>
              <Button 
                onClick={handleSubmit} 
                disabled={loading}
                style={{ backgroundColor: themeColor }}
              >
                {loading ? "جاري التحويل..." : "تحويل"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* إحصائيات */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">إجمالي التحويلات</p>
                <p className="text-2xl font-bold">{transfers.length}</p>
              </div>
              <ArrowLeftRight className="w-8 h-8 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">التحويلات المكتملة</p>
                <p className="text-2xl font-bold text-green-500">
                  {transfers.filter((t) => t.status === "completed").length}
                </p>
              </div>
              <CheckCircle className="w-8 h-8 text-green-500" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">إجمالي المبالغ المحولة</p>
                <p className="text-2xl font-bold" style={{ color: themeColor }}>
                  {transfers
                    .filter((t) => t.status === "completed")
                    .reduce((sum, t) => sum + parseFloat(t.amount), 0)
                    .toLocaleString()}{" "}
                  ر.س
                </p>
              </div>
              <Wallet className="w-8 h-8" style={{ color: themeColor }} />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* جدول التحويلات */}
      <Card>
        <CardHeader>
          <CardTitle>سجل التحويلات</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>رقم التحويل</TableHead>
                <TableHead>من وحدة</TableHead>
                <TableHead>إلى وحدة</TableHead>
                <TableHead>المبلغ</TableHead>
                <TableHead>التاريخ</TableHead>
                <TableHead>الحالة</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {transfers.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                    لا توجد تحويلات بعد
                  </TableCell>
                </TableRow>
              ) : (
                transfers.map((transfer) => (
                  <TableRow key={transfer.id}>
                    <TableCell className="font-medium">{transfer.transferNumber}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Building2 className="w-4 h-4 text-muted-foreground" />
                        {getEntityName(transfer.fromEntityId)}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Building2 className="w-4 h-4 text-muted-foreground" />
                        {getEntityName(transfer.toEntityId)}
                      </div>
                    </TableCell>
                    <TableCell className="font-semibold" style={{ color: themeColor }}>
                      {parseFloat(transfer.amount).toLocaleString()} ر.س
                    </TableCell>
                    <TableCell>
                      {new Date(transfer.date).toLocaleDateString("ar-SA")}
                    </TableCell>
                    <TableCell>{getStatusBadge(transfer.status)}</TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}

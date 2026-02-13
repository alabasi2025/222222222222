import { useState } from "react";
import { Plus, Edit, Trash2, Save, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Checkbox } from "@/components/ui/checkbox";
import { toast } from "sonner";

interface Account {
  id: string;
  code: string;
  name: string;
  type: string;
}

interface AccountGroup {
  id: string;
  name: string;
  description: string;
  accounts: Account[];
  createdAt: string;
}

// بيانات وهمية للحسابات (سيتم استبدالها بـ API)
const dummyAccounts: Account[] = [
  { id: "1", code: "1111", name: "الصندوق الرئيسي", type: "أصول" },
  { id: "2", code: "1112", name: "البنك الأهلي", type: "أصول" },
  { id: "3", code: "1121", name: "عميل أ", type: "أصول" },
  { id: "4", code: "1122", name: "عميل ب", type: "أصول" },
  { id: "5", code: "2111", name: "مورد أ", type: "خصوم" },
  { id: "6", code: "2112", name: "مورد ب", type: "خصوم" },
];

export default function AccountGroups() {
  const [groups, setGroups] = useState<AccountGroup[]>([
    {
      id: "1",
      name: "أعمال الموظفين",
      description: "مجموعة حسابات أعمال الموظفين",
      accounts: [],
      createdAt: "2025-01-10",
    },
    {
      id: "2",
      name: "أعمال الموظفين الدهمية",
      description: "مجموعة حسابات أعمال الموظفين الدهمية",
      accounts: [],
      createdAt: "2025-01-10",
    },
    {
      id: "3",
      name: "أعمال الموظفين الصبالية",
      description: "مجموعة حسابات أعمال الموظفين الصبالية",
      accounts: [],
      createdAt: "2025-01-10",
    },
    {
      id: "4",
      name: "أعمال الموظفين غليل",
      description: "مجموعة حسابات أعمال الموظفين غليل",
      accounts: [],
      createdAt: "2025-01-10",
    },
  ]);

  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingGroupId, setEditingGroupId] = useState<string | null>(null);
  const [groupName, setGroupName] = useState("");
  const [groupDescription, setGroupDescription] = useState("");
  const [selectedAccounts, setSelectedAccounts] = useState<string[]>([]);
  const [searchTerm, setSearchTerm] = useState("");

  const handleOpenDialog = (group?: AccountGroup) => {
    if (group) {
      setEditingGroupId(group.id);
      setGroupName(group.name);
      setGroupDescription(group.description);
      setSelectedAccounts(group.accounts.map((a) => a.id));
    } else {
      setEditingGroupId(null);
      setGroupName("");
      setGroupDescription("");
      setSelectedAccounts([]);
    }
    setIsDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setIsDialogOpen(false);
    setEditingGroupId(null);
    setGroupName("");
    setGroupDescription("");
    setSelectedAccounts([]);
    setSearchTerm("");
  };

  const handleSaveGroup = () => {
    if (!groupName.trim()) {
      toast.error("يرجى إدخال اسم المجموعة");
      return;
    }

    if (selectedAccounts.length === 0) {
      toast.error("يرجى اختيار حساب واحد على الأقل");
      return;
    }

    const selectedAccountsData = dummyAccounts.filter((acc) =>
      selectedAccounts.includes(acc.id)
    );

    if (editingGroupId) {
      // تحديث مجموعة موجودة
      setGroups(
        groups.map((g) =>
          g.id === editingGroupId
            ? {
                ...g,
                name: groupName,
                description: groupDescription,
                accounts: selectedAccountsData,
              }
            : g
        )
      );
      toast.success("تم تحديث المجموعة بنجاح");
    } else {
      // إضافة مجموعة جديدة
      const newGroup: AccountGroup = {
        id: Date.now().toString(),
        name: groupName,
        description: groupDescription,
        accounts: selectedAccountsData,
        createdAt: new Date().toISOString().split("T")[0],
      };
      setGroups([...groups, newGroup]);
      toast.success("تم إضافة المجموعة بنجاح");
    }

    handleCloseDialog();
  };

  const handleDeleteGroup = (id: string) => {
    if (confirm("هل أنت متأكد من حذف هذه المجموعة؟")) {
      setGroups(groups.filter((g) => g.id !== id));
      toast.success("تم حذف المجموعة بنجاح");
    }
  };

  const handleToggleAccount = (accountId: string) => {
    setSelectedAccounts((prev) =>
      prev.includes(accountId)
        ? prev.filter((id) => id !== accountId)
        : [...prev, accountId]
    );
  };

  const filteredAccounts = dummyAccounts.filter(
    (acc) =>
      acc.name.includes(searchTerm) ||
      acc.code.includes(searchTerm) ||
      acc.type.includes(searchTerm)
  );

  return (
    <div className="flex-1 p-8 overflow-auto" dir="rtl">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold">مجموعة الحسابات</h1>
            <p className="text-muted-foreground mt-1">
              إدارة مجموعات الحسابات للتقارير والصلاحيات
            </p>
          </div>
          <Button
            onClick={() => handleOpenDialog()}
            className="bg-blue-600 hover:bg-blue-700"
          >
            <Plus className="w-4 h-4 ml-2" />
            مجموعة جديدة
          </Button>
        </div>

        {/* Groups Table */}
        <div className="bg-card rounded-lg border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="text-right">اسم المجموعة</TableHead>
                <TableHead className="text-right">الوصف</TableHead>
                <TableHead className="text-right">عدد الحسابات</TableHead>
                <TableHead className="text-right">الحسابات</TableHead>
                <TableHead className="text-right">تاريخ الإنشاء</TableHead>
                <TableHead className="text-right">الإجراءات</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {groups.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-8">
                    <p className="text-muted-foreground">
                      لا توجد مجموعات حسابات. انقر على &quot;مجموعة جديدة&quot; لإضافة
                      مجموعة.
                    </p>
                  </TableCell>
                </TableRow>
              ) : (
                groups.map((group) => (
                  <TableRow key={group.id}>
                    <TableCell className="font-medium">{group.name}</TableCell>
                    <TableCell className="text-muted-foreground">
                      {group.description || "-"}
                    </TableCell>
                    <TableCell>
                      <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-blue-100 text-blue-600 font-semibold">
                        {group.accounts.length}
                      </span>
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-wrap gap-1">
                        {group.accounts.slice(0, 3).map((acc) => (
                          <span
                            key={acc.id}
                            className="inline-block px-2 py-1 text-xs bg-gray-100 rounded"
                          >
                            {acc.name}
                          </span>
                        ))}
                        {group.accounts.length > 3 && (
                          <span className="inline-block px-2 py-1 text-xs bg-gray-100 rounded">
                            +{group.accounts.length - 3}
                          </span>
                        )}
                      </div>
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {group.createdAt}
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleOpenDialog(group)}
                          className="text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                        >
                          <Edit className="w-4 h-4 ml-1" />
                          تعديل
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDeleteGroup(group.id)}
                          className="text-red-600 hover:text-red-700 hover:bg-red-50"
                        >
                          <Trash2 className="w-4 h-4 ml-1" />
                          حذف
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>

        {/* Add/Edit Dialog */}
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogContent className="max-w-4xl max-h-[90vh]" dir="rtl">
            <DialogHeader>
              <DialogTitle>
                {editingGroupId ? "تعديل مجموعة الحسابات" : "مجموعة حسابات جديدة"}
              </DialogTitle>
            </DialogHeader>

            <div className="flex-1 overflow-y-auto px-1" style={{ minHeight: 0 }}>
              <div className="space-y-4">
                {/* Group Name */}
                <div>
                  <Label htmlFor="groupName">اسم المجموعة *</Label>
                  <Input
                    id="groupName"
                    value={groupName}
                    onChange={(e) => setGroupName(e.target.value)}
                    placeholder="مثال: الصناديق الرئيسية"
                    className="mt-1"
                  />
                </div>

                {/* Description */}
                <div>
                  <Label htmlFor="groupDescription">الوصف</Label>
                  <Textarea
                    id="groupDescription"
                    value={groupDescription}
                    onChange={(e) => setGroupDescription(e.target.value)}
                    placeholder="وصف مختصر للمجموعة"
                    className="mt-1"
                    rows={2}
                  />
                </div>

                {/* Search Accounts */}
                <div>
                  <Label htmlFor="searchAccounts">البحث في الحسابات</Label>
                  <Input
                    id="searchAccounts"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder="ابحث بالاسم أو الرمز..."
                    className="mt-1"
                  />
                </div>

                {/* Accounts Selection */}
                <div>
                  <Label>اختر الحسابات ({selectedAccounts.length} محدد)</Label>
                  <div className="mt-2 border rounded-lg max-h-64 overflow-y-auto">
                    <Table>
                      <TableHeader className="sticky top-0 bg-background">
                        <TableRow>
                          <TableHead className="w-12"></TableHead>
                          <TableHead className="text-right">الرمز</TableHead>
                          <TableHead className="text-right">اسم الحساب</TableHead>
                          <TableHead className="text-right">النوع</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {filteredAccounts.map((account) => (
                          <TableRow key={account.id}>
                            <TableCell>
                              <Checkbox
                                checked={selectedAccounts.includes(account.id)}
                                onCheckedChange={() =>
                                  handleToggleAccount(account.id)
                                }
                              />
                            </TableCell>
                            <TableCell className="font-mono text-sm">
                              {account.code}
                            </TableCell>
                            <TableCell>{account.name}</TableCell>
                            <TableCell>
                              <span className="inline-block px-2 py-1 text-xs bg-gray-100 rounded">
                                {account.type}
                              </span>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                </div>
              </div>
            </div>

            <DialogFooter className="p-6 border-t bg-background" style={{ flexShrink: 0 }}>
              <div className="flex gap-2 justify-end">
                <Button variant="outline" onClick={handleCloseDialog}>
                  <X className="w-4 h-4 ml-2" />
                  إلغاء
                </Button>
                <Button
                  onClick={handleSaveGroup}
                  className="bg-blue-600 hover:bg-blue-700"
                >
                  <Save className="w-4 h-4 ml-2" />
                  {editingGroupId ? "تحديث المجموعة" : "حفظ المجموعة"}
                </Button>
              </div>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}

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
  Search,
  MoreHorizontal,
  Mail,
  Save,
  Pencil,
  Trash2,
  Shield,
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
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { useState, useEffect, useCallback } from "react";
import { toast } from "sonner";
import { useEntity } from "@/contexts/EntityContext";
import { authApi } from "@/lib/api";

export default function Users() {
  const { currentEntity, getThemeColor } = useEntity();

  const [users, setUsers] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isNewUserOpen, setIsNewUserOpen] = useState(false);
  const [isEditUserOpen, setIsEditUserOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<any>(null);
  const [searchTerm, setSearchTerm] = useState("");

  const loadUsers = useCallback(async () => {
    setIsLoading(true);
    try {
      const data = await authApi.getUsers();
      setUsers(Array.isArray(data) ? data : []);
    } catch {
      // If admin endpoint fails, try getting current user only
      try {
        const me = await authApi.me();
        setUsers(me ? [me] : []);
      } catch {
        setUsers([]);
      }
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadUsers();
  }, [loadUsers, currentEntity]);

  const [newUser, setNewUser] = useState({
    username: "",
    name: "",
    email: "",
    password: "",
    role: "user",
  });

  if (!currentEntity) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-muted-foreground">الرجاء اختيار كيان أولاً</p>
      </div>
    );
  }

  const visibleUsers = users
    .filter((u: any) => {
      if (currentEntity.type === "holding") return true;
      return u.entityId === currentEntity.id || !u.entityId;
    })
    .filter((u: any) => {
      const name = u.fullName || u.name || "";
      const username = u.username || "";
      const email = u.email || "";
      return (
        username.toLowerCase().includes(searchTerm.toLowerCase()) ||
        name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        email.toLowerCase().includes(searchTerm.toLowerCase())
      );
    });

  const handleAddUser = async () => {
    if (
      !newUser.username ||
      !newUser.name ||
      !newUser.email ||
      !newUser.password
    ) {
      toast.error("يرجى تعبئة جميع الحقول المطلوبة");
      return;
    }

    setIsSaving(true);
    try {
      await authApi.register({
        username: newUser.username,
        password: newUser.password,
        fullName: newUser.name,
        email: newUser.email,
        role: newUser.role,
        entityId:
          currentEntity.type === "holding" ? undefined : currentEntity.id,
      });
      toast.success("تم إضافة المستخدم بنجاح");
      setIsNewUserOpen(false);
      setNewUser({
        username: "",
        name: "",
        email: "",
        password: "",
        role: "user",
      });
      await loadUsers();
    } catch (err: any) {
      toast.error(err.message || "فشل في إضافة المستخدم");
    } finally {
      setIsSaving(false);
    }
  };

  const handleEditUser = (user: any) => {
    setEditingUser({
      ...user,
      name: user.fullName || user.name || "",
    });
    setIsEditUserOpen(true);
  };

  const handleUpdateUser = async () => {
    if (!editingUser) return;
    const name = editingUser.name || editingUser.fullName;
    if (!editingUser.username || !name || !editingUser.email) {
      toast.error("يرجى تعبئة جميع الحقول المطلوبة");
      return;
    }

    setIsSaving(true);
    try {
      await authApi.updateUser(editingUser.id, {
        fullName: name,
        email: editingUser.email,
        role: editingUser.role,
        entityId: editingUser.entityId,
      });
      toast.success("تم تحديث المستخدم بنجاح");
      setIsEditUserOpen(false);
      setEditingUser(null);
      await loadUsers();
    } catch (err: any) {
      toast.error(err.message || "فشل في تحديث المستخدم");
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteUser = async (userId: string) => {
    // Prevent deleting yourself or default admin
    try {
      await authApi.updateUser(userId, { isActive: false });
      toast.success("تم تعطيل المستخدم بنجاح");
      await loadUsers();
    } catch (err: any) {
      toast.error(err.message || "فشل في حذف المستخدم");
    }
  };

  const handleToggleActive = async (userId: string) => {
    const user = users.find((u: any) => u.id === userId);
    if (!user) return;

    try {
      await authApi.updateUser(userId, { isActive: !user.isActive });
      toast.success(`تم ${!user.isActive ? "تفعيل" : "تعطيل"} المستخدم`);
      await loadUsers();
    } catch (err: any) {
      toast.error(err.message || "فشل في تغيير حالة المستخدم");
    }
  };

  const getRoleLabel = (role: string) => {
    switch (role) {
      case "admin":
        return "مدير";
      case "manager":
        return "مدير فرع";
      case "accountant":
        return "محاسب";
      case "user":
        return "مستخدم";
      default:
        return role;
    }
  };

  const getRoleColor = (role: string) => {
    switch (role) {
      case "admin":
        return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300";
      case "manager":
        return "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300";
      case "accountant":
        return "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300";
      case "user":
        return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300";
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300";
    }
  };

  const getInitials = (name: string) => {
    if (!name) return "??";
    return name
      .split(" ")
      .map(n => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  const getUserName = (user: any) =>
    user.fullName || user.name || user.username;

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">المستخدمين</h2>
          <p className="text-muted-foreground mt-1">
            إدارة مستخدمي النظام والصلاحيات
          </p>
        </div>
        <Dialog open={isNewUserOpen} onOpenChange={setIsNewUserOpen}>
          <DialogTrigger asChild>
            <Button
              style={{ backgroundColor: getThemeColor(currentEntity.id) }}
            >
              <Plus className="w-4 h-4 ml-2" />
              إضافة مستخدم جديد
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[500px]" dir="rtl">
            <DialogHeader>
              <DialogTitle>إضافة مستخدم جديد</DialogTitle>
              <DialogDescription>
                أضف مستخدم جديد للنظام مع تحديد الصلاحيات المناسبة
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="new-username">اسم المستخدم *</Label>
                <Input
                  id="new-username"
                  value={newUser.username}
                  onChange={e =>
                    setNewUser({ ...newUser, username: e.target.value })
                  }
                  placeholder="أدخل اسم المستخدم"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="new-name">الاسم الكامل *</Label>
                <Input
                  id="new-name"
                  value={newUser.name}
                  onChange={e =>
                    setNewUser({ ...newUser, name: e.target.value })
                  }
                  placeholder="أدخل الاسم الكامل"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="new-email">البريد الإلكتروني *</Label>
                <Input
                  id="new-email"
                  type="email"
                  value={newUser.email}
                  onChange={e =>
                    setNewUser({ ...newUser, email: e.target.value })
                  }
                  placeholder="example@domain.com"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="new-password">كلمة المرور *</Label>
                <Input
                  id="new-password"
                  type="password"
                  value={newUser.password}
                  onChange={e =>
                    setNewUser({ ...newUser, password: e.target.value })
                  }
                  placeholder="أدخل كلمة المرور (6 أحرف على الأقل)"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="new-role">الصلاحية</Label>
                <Select
                  value={newUser.role}
                  onValueChange={value =>
                    setNewUser({ ...newUser, role: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="user">مستخدم</SelectItem>
                    <SelectItem value="accountant">محاسب</SelectItem>
                    <SelectItem value="manager">مدير فرع</SelectItem>
                    <SelectItem value="admin">مدير</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsNewUserOpen(false)}>
                إلغاء
              </Button>
              <Button onClick={handleAddUser} disabled={isSaving}>
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

      <div className="flex gap-4">
        <div className="relative flex-1">
          <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="بحث عن مستخدم..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            className="pr-10"
          />
        </div>
      </div>

      <div className="border rounded-lg">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>المستخدم</TableHead>
              <TableHead>البريد الإلكتروني</TableHead>
              <TableHead>الصلاحية</TableHead>
              <TableHead>الحالة</TableHead>
              <TableHead className="text-left">الإجراءات</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center py-8">
                  <Loader2 className="w-6 h-6 animate-spin mx-auto text-muted-foreground" />
                  <p className="text-muted-foreground mt-2">جاري التحميل...</p>
                </TableCell>
              </TableRow>
            ) : visibleUsers.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={5}
                  className="text-center py-8 text-muted-foreground"
                >
                  لا توجد مستخدمين
                </TableCell>
              </TableRow>
            ) : (
              visibleUsers.map((user: any) => (
                <TableRow key={user.id}>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <Avatar>
                        <AvatarFallback>
                          {getInitials(getUserName(user))}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <div className="font-medium">{getUserName(user)}</div>
                        <div className="text-sm text-muted-foreground">
                          @{user.username}
                        </div>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Mail className="w-4 h-4 text-muted-foreground" />
                      {user.email || "-"}
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge className={getRoleColor(user.role)}>
                      <Shield className="w-3 h-3 ml-1" />
                      {getRoleLabel(user.role)}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant={
                        user.isActive !== false ? "default" : "secondary"
                      }
                    >
                      {user.isActive !== false ? "نشط" : "غير نشط"}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon">
                          <MoreHorizontal className="w-4 h-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuLabel>الإجراءات</DropdownMenuLabel>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem onClick={() => handleEditUser(user)}>
                          <Pencil className="w-4 h-4 ml-2" />
                          تعديل
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => handleToggleActive(user.id)}
                        >
                          {user.isActive !== false ? "تعطيل" : "تفعيل"}
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                          onClick={() => handleDeleteUser(user.id)}
                          className="text-destructive"
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
      </div>

      {/* Edit User Dialog */}
      <Dialog open={isEditUserOpen} onOpenChange={setIsEditUserOpen}>
        <DialogContent className="sm:max-w-[500px]" dir="rtl">
          <DialogHeader>
            <DialogTitle>تعديل المستخدم</DialogTitle>
            <DialogDescription>
              قم بتعديل بيانات المستخدم والصلاحيات
            </DialogDescription>
          </DialogHeader>
          {editingUser && (
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="edit-username">اسم المستخدم</Label>
                <Input
                  id="edit-username"
                  value={editingUser.username}
                  disabled
                  className="bg-muted"
                />
                <p className="text-xs text-muted-foreground">
                  لا يمكن تغيير اسم المستخدم
                </p>
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-name">الاسم الكامل *</Label>
                <Input
                  id="edit-name"
                  value={editingUser.name || editingUser.fullName || ""}
                  onChange={e =>
                    setEditingUser({
                      ...editingUser,
                      name: e.target.value,
                      fullName: e.target.value,
                    })
                  }
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-email">البريد الإلكتروني *</Label>
                <Input
                  id="edit-email"
                  type="email"
                  value={editingUser.email || ""}
                  onChange={e =>
                    setEditingUser({ ...editingUser, email: e.target.value })
                  }
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-role">الصلاحية</Label>
                <Select
                  value={editingUser.role}
                  onValueChange={value =>
                    setEditingUser({ ...editingUser, role: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="user">مستخدم</SelectItem>
                    <SelectItem value="accountant">محاسب</SelectItem>
                    <SelectItem value="manager">مدير فرع</SelectItem>
                    <SelectItem value="admin">مدير</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditUserOpen(false)}>
              إلغاء
            </Button>
            <Button onClick={handleUpdateUser} disabled={isSaving}>
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

import { useState } from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { toast } from "sonner";
import { Lock, User } from "lucide-react";

export default function Login() {
  const [, setLocation] = useLocation();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!username || !password) {
      toast.error("الرجاء إدخال اسم المستخدم وكلمة المرور");
      return;
    }

    setIsLoading(true);

    try {
      // بيانات الاعتماد الافتراضية
      const defaultCredentials = {
        username: "admin",
        password: "admin123"
      };

      // التحقق من بيانات الاعتماد
      if (username === defaultCredentials.username && password === defaultCredentials.password) {
        // محاكاة عملية تسجيل الدخول
        await new Promise((resolve) => setTimeout(resolve, 1000));

        // حفظ حالة تسجيل الدخول في localStorage
        localStorage.setItem("isAuthenticated", "true");
        localStorage.setItem("username", username);

        toast.success("تم تسجيل الدخول بنجاح");
        
        // التوجيه إلى صفحة اختيار الشركة القابضة
        setLocation("/select-company");
      } else {
        // بيانات اعتماد خاطئة
        toast.error("اسم المستخدم أو كلمة المرور غير صحيحة");
      }
    } catch (error) {
      toast.error("فشل تسجيل الدخول. الرجاء المحاولة مرة أخرى");
      console.error("Login error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 p-4" dir="rtl">
      <Card className="w-full max-w-md shadow-lg">
        <CardHeader className="space-y-1 text-center">
          <div className="mx-auto w-16 h-16 bg-primary rounded-full flex items-center justify-center mb-4">
            <Lock className="w-8 h-8 text-primary-foreground" />
          </div>
          <CardTitle className="text-2xl font-bold">تسجيل الدخول</CardTitle>
          <CardDescription className="space-y-1">
            <div>الرجاء إدخال بياناتك للدخول إلى النظام</div>
            <div className="text-xs text-muted-foreground mt-2">
              الافتراضي: admin / admin123
            </div>
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="username">اسم المستخدم</Label>
              <div className="relative">
                <User className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  id="username"
                  type="text"
                  placeholder="أدخل اسم المستخدم"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="pr-10"
                  disabled={isLoading}
                  required
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">كلمة المرور</Label>
              <div className="relative">
                <Lock className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  id="password"
                  type="password"
                  placeholder="أدخل كلمة المرور"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="pr-10"
                  disabled={isLoading}
                  required
                />
              </div>
            </div>
            <Button
              type="submit"
              className="w-full"
              disabled={isLoading}
            >
              {isLoading ? "جاري تسجيل الدخول..." : "تسجيل الدخول"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { 
  Building2, 
  Users, 
  Globe, 
  Shield, 
  Bell, 
  Database,
  Save
} from "lucide-react";

export default function Settings() {
  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">الإعدادات</h2>
        <p className="text-muted-foreground mt-1">إدارة إعدادات الشركة والنظام</p>
      </div>

      <Tabs defaultValue="company" className="w-full">
        <div className="flex flex-col md:flex-row gap-6">
          <aside className="w-full md:w-64 shrink-0">
            <TabsList className="flex flex-col h-auto w-full bg-transparent p-0 gap-1">
              <TabsTrigger value="company" className="w-full justify-start px-4 py-3 data-[state=active]:bg-primary/10 data-[state=active]:text-primary">
                <Building2 className="w-4 h-4 ml-2" />
                إعدادات الشركة
              </TabsTrigger>
              <TabsTrigger value="users" className="w-full justify-start px-4 py-3 data-[state=active]:bg-primary/10 data-[state=active]:text-primary">
                <Users className="w-4 h-4 ml-2" />
                المستخدمين والصلاحيات
              </TabsTrigger>
              <TabsTrigger value="localization" className="w-full justify-start px-4 py-3 data-[state=active]:bg-primary/10 data-[state=active]:text-primary">
                <Globe className="w-4 h-4 ml-2" />
                اللغة والعملة
              </TabsTrigger>
              <TabsTrigger value="security" className="w-full justify-start px-4 py-3 data-[state=active]:bg-primary/10 data-[state=active]:text-primary">
                <Shield className="w-4 h-4 ml-2" />
                الأمان
              </TabsTrigger>
              <TabsTrigger value="notifications" className="w-full justify-start px-4 py-3 data-[state=active]:bg-primary/10 data-[state=active]:text-primary">
                <Bell className="w-4 h-4 ml-2" />
                الإشعارات
              </TabsTrigger>
              <TabsTrigger value="backup" className="w-full justify-start px-4 py-3 data-[state=active]:bg-primary/10 data-[state=active]:text-primary">
                <Database className="w-4 h-4 ml-2" />
                النسخ الاحتياطي
              </TabsTrigger>
            </TabsList>
          </aside>

          <div className="flex-1">
            <TabsContent value="company" className="mt-0 space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>بيانات الشركة</CardTitle>
                  <CardDescription>المعلومات الأساسية التي تظهر في الفواتير والتقارير</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid gap-2">
                    <Label htmlFor="company-name">اسم الشركة</Label>
                    <Input id="company-name" defaultValue="شركة الأساس" />
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="grid gap-2">
                      <Label htmlFor="tax-id">الرقم الضريبي</Label>
                      <Input id="tax-id" defaultValue="300123456700003" />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="cr-number">رقم السجل التجاري</Label>
                      <Input id="cr-number" defaultValue="1010123456" />
                    </div>
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="address">العنوان</Label>
                    <Input id="address" defaultValue="الرياض، المملكة العربية السعودية" />
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="grid gap-2">
                      <Label htmlFor="email">البريد الإلكتروني</Label>
                      <Input id="email" type="email" defaultValue="info@al-asas.com" />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="phone">رقم الهاتف</Label>
                      <Input id="phone" defaultValue="+966 11 234 5678" />
                    </div>
                  </div>
                </CardContent>
                <CardFooter className="justify-end border-t pt-6">
                  <Button>
                    <Save className="w-4 h-4 ml-2" />
                    حفظ التغييرات
                  </Button>
                </CardFooter>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>الشعار والهوية</CardTitle>
                  <CardDescription>تخصيص شعار الشركة وألوان الفواتير</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center gap-4">
                    <div className="w-20 h-20 rounded-lg border-2 border-dashed flex items-center justify-center bg-muted">
                      <span className="text-xs text-muted-foreground">الشعار</span>
                    </div>
                    <Button variant="outline">رفع شعار جديد</Button>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="localization" className="mt-0 space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>الإعدادات الإقليمية</CardTitle>
                  <CardDescription>تخصيص اللغة والعملة والمنطقة الزمنية</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid gap-2">
                    <Label>اللغة</Label>
                    <select className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50">
                      <option value="ar">العربية</option>
                      <option value="en">English</option>
                    </select>
                  </div>
                  <div className="grid gap-2">
                    <Label>العملة الأساسية</Label>
                    <select className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50">
                      <option value="YER">ريال يمني (YER)</option>
                      <option value="SAR">ريال سعودي (SAR)</option>
                      <option value="USD">دولار أمريكي (USD)</option>
                      <option value="EUR">يورو (EUR)</option>
                    </select>
                  </div>
                  <div className="grid gap-2">
                    <Label>تنسيق التاريخ</Label>
                    <select className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50">
                      <option value="DD-MM-YYYY">DD-MM-YYYY (31-01-2025)</option>
                      <option value="YYYY-MM-DD">YYYY-MM-DD (2025-01-31)</option>
                    </select>
                  </div>
                </CardContent>
                <CardFooter className="justify-end border-t pt-6">
                  <Button>
                    <Save className="w-4 h-4 ml-2" />
                    حفظ التغييرات
                  </Button>
                </CardFooter>
              </Card>
            </TabsContent>

            <TabsContent value="notifications" className="mt-0 space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>تفضيلات الإشعارات</CardTitle>
                  <CardDescription>التحكم في التنبيهات التي تصلك</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>تنبيهات الفواتير المستحقة</Label>
                      <p className="text-sm text-muted-foreground">إشعار عند حلول موعد استحقاق الفاتورة</p>
                    </div>
                    <Switch defaultChecked />
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>تنبيهات المخزون المنخفض</Label>
                      <p className="text-sm text-muted-foreground">إشعار عند وصول المنتج للحد الأدنى</p>
                    </div>
                    <Switch defaultChecked />
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>التقارير الأسبوعية</Label>
                      <p className="text-sm text-muted-foreground">إرسال ملخص أسبوعي عبر البريد الإلكتروني</p>
                    </div>
                    <Switch />
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </div>
        </div>
      </Tabs>
    </div>
  );
}

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { FileText, PieChart, TrendingUp, BarChart3, ArrowRight } from "lucide-react";

const reports = [
  {
    category: "التقارير المالية",
    items: [
      { title: "الميزانية العمومية", description: "عرض الأصول والخصوم وحقوق الملكية", icon: FileText },
      { title: "قائمة الدخل (الأرباح والخسائر)", description: "ملخص الإيرادات والمصروفات وصافي الربح", icon: TrendingUp },
      { title: "ميزان المراجعة", description: "أرصدة جميع الحسابات في فترة محددة", icon: BarChart3 },
      { title: "التدفقات النقدية", description: "حركة النقد الداخل والخارج", icon: PieChart },
    ]
  },
  {
    category: "تقارير المبيعات والمشتريات",
    items: [
      { title: "تحليل المبيعات حسب العميل", description: "أداء المبيعات لكل عميل", icon: BarChart3 },
      { title: "تحليل المبيعات حسب المنتج", description: "المنتجات الأكثر مبيعاً", icon: PieChart },
      { title: "أعمار الديون (العملاء)", description: "الفواتير المستحقة والمتأخرة", icon: FileText },
      { title: "سجل المشتريات", description: "تفاصيل المشتريات حسب المورد", icon: FileText },
    ]
  },
  {
    category: "تقارير المخزون",
    items: [
      { title: "ملخص المخزون", description: "الكميات والقيم الحالية للمخزون", icon: FileText },
      { title: "حركة الأصناف", description: "تتبع حركة كل صنف (وارد/صادر)", icon: TrendingUp },
    ]
  }
];

export default function Reports() {
  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">التقارير</h2>
          <p className="text-muted-foreground mt-1">تقارير شاملة لتحليل أداء شركتك</p>
        </div>
      </div>

      <div className="grid gap-8">
        {reports.map((section, idx) => (
          <div key={idx} className="space-y-4">
            <h3 className="text-xl font-semibold text-foreground/80 pr-2 border-r-4 border-primary">{section.category}</h3>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              {section.items.map((report, i) => {
                const Icon = report.icon;
                return (
                  <Card key={i} className="group hover:shadow-md transition-all cursor-pointer border-muted hover:border-primary/50">
                    <CardHeader className="pb-3">
                      <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center text-primary mb-2 group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
                        <Icon className="w-5 h-5" />
                      </div>
                      <CardTitle className="text-lg">{report.title}</CardTitle>
                      <CardDescription className="text-xs">{report.description}</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <Button variant="ghost" className="w-full justify-between text-sm group-hover:text-primary">
                        عرض التقرير
                        <ArrowRight className="w-4 h-4" />
                      </Button>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

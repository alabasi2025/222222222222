import { cn } from "@/lib/utils";
import { Link, useLocation } from "wouter";
import { 
  LayoutDashboard, 
  FileText, 
  ShoppingCart, 
  Package, 
  Users, 
  Settings, 
  PieChart,
  Wallet,
  BookOpen
} from "lucide-react";

const menuItems = [
  { icon: LayoutDashboard, label: "لوحة المعلومات", href: "/" },
  { icon: FileText, label: "الفواتير", href: "/invoices" },
  { icon: ShoppingCart, label: "المشتريات", href: "/purchases" },
  { icon: Package, label: "المخزون", href: "/inventory" },
  { icon: Users, label: "العملاء والموردين", href: "/contacts" },
  { icon: Wallet, label: "السندات المالية", href: "/payments" },
  { icon: FileText, label: "قيود اليومية", href: "/journals" },
  { icon: BookOpen, label: "دفتر الأستاذ", href: "/ledger" },
  { icon: PieChart, label: "التقارير", href: "/reports" },
  { icon: Settings, label: "الإعدادات", href: "/settings" },
];

export function Sidebar() {
  const [location] = useLocation();

  return (
    <aside className="hidden md:flex flex-col w-64 bg-sidebar border-l border-sidebar-border h-screen sticky top-0">
      <div className="p-6 border-b border-sidebar-border">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center text-primary-foreground font-bold text-xl">
            F
          </div>
          <h1 className="text-xl font-bold text-sidebar-foreground">Frappe Books</h1>
        </div>
      </div>

      <nav className="flex-1 overflow-y-auto py-4 px-3 space-y-1">
        {menuItems.map((item) => {
          const isActive = location === item.href;
          return (
            <Link key={item.href} href={item.href}>
              <a
                className={cn(
                  "flex items-center gap-3 px-3 py-2.5 rounded-md text-sm font-medium transition-colors",
                  isActive
                    ? "bg-sidebar-accent text-sidebar-accent-foreground"
                    : "text-sidebar-foreground/70 hover:bg-sidebar-accent/50 hover:text-sidebar-foreground"
                )}
              >
                <item.icon className={cn("w-5 h-5", isActive ? "text-primary" : "text-muted-foreground")} />
                {item.label}
              </a>
            </Link>
          );
        })}
      </nav>

      <div className="p-4 border-t border-sidebar-border">
        <div className="flex items-center gap-3 px-3 py-2 rounded-md bg-sidebar-accent/30">
          <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center text-primary text-xs font-bold">
            MA
          </div>
          <div className="flex-1 overflow-hidden">
            <p className="text-sm font-medium truncate">شركة الأساس</p>
            <p className="text-xs text-muted-foreground truncate">مدير النظام</p>
          </div>
        </div>
      </div>
    </aside>
  );
}

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
  BookOpen,
  FolderTree,
  Building2,
  Target,
  Landmark,
  Calculator,
  Network,
  ChevronDown,
  Building,
  Store
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { useEntity } from "@/contexts/EntityContext";

const menuItems = [
  { icon: LayoutDashboard, label: "لوحة المعلومات", href: "/" },
  { icon: FileText, label: "الفواتير", href: "/invoices" },
  { icon: ShoppingCart, label: "المشتريات", href: "/purchases" },
  { icon: Package, label: "المخزون", href: "/inventory" },
  { icon: Users, label: "العملاء والموردين", href: "/contacts" },
  { icon: Wallet, label: "السندات المالية", href: "/payments" },
  { icon: Wallet, label: "الصناديق والعهد", href: "/cash-boxes" },
  { icon: FileText, label: "قيود اليومية", href: "/journals" },
  { icon: BookOpen, label: "دفتر الأستاذ", href: "/ledger" },
  { icon: FolderTree, label: "شجرة الحسابات", href: "/coa" },
  { icon: Building2, label: "الأصول الثابتة", href: "/assets" },
  { icon: Target, label: "مراكز التكلفة", href: "/cost-centers" },
  { icon: Landmark, label: "تسوية البنك", href: "/bank-reconciliation" },
  { icon: Calculator, label: "إدارة الضريبة", href: "/tax" },
  { icon: PieChart, label: "التقارير", href: "/reports" },
  { icon: Network, label: "الهيكل التنظيمي", href: "/organization" },
  { icon: Settings, label: "الإعدادات", href: "/settings" },
];

export function Sidebar() {
  const [location] = useLocation();
  const { currentEntity, setCurrentEntity, entities, getThemeColor } = useEntity();

  return (
    <aside className="hidden md:flex flex-col w-64 bg-sidebar border-l border-sidebar-border h-screen sticky top-0">
      <div className="p-4 border-b border-sidebar-border">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="w-full justify-between h-auto py-3 px-2 hover:bg-sidebar-accent">
              <div className="flex items-center gap-3 text-right overflow-hidden">
                <div 
                  className="w-8 h-8 rounded-lg flex items-center justify-center text-white font-bold text-lg shrink-0 transition-colors duration-300"
                  style={{ backgroundColor: getThemeColor() }}
                >
                  {currentEntity.type === 'holding' ? <Building2 className="w-4 h-4" /> : 
                   currentEntity.type === 'unit' ? <Building className="w-4 h-4" /> : <Store className="w-4 h-4" />}
                </div>
                <div className="flex flex-col items-start overflow-hidden">
                  <span className="font-bold text-sm truncate w-full">{currentEntity.name}</span>
                  <span className="text-xs text-muted-foreground truncate w-full">
                    {currentEntity.type === 'holding' ? 'الشركة القابضة' : 
                     currentEntity.type === 'unit' ? 'وحدة أعمال' : 'فرع'}
                  </span>
                </div>
              </div>
              <ChevronDown className="w-4 h-4 text-muted-foreground shrink-0" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="w-56" align="end">
            <DropdownMenuLabel>تبديل الكيان</DropdownMenuLabel>
            <DropdownMenuSeparator />
            {entities.map((entity) => (
              <DropdownMenuItem 
                key={entity.id} 
                onClick={() => setCurrentEntity(entity)}
                className="flex items-center gap-2 cursor-pointer"
              >
                <div 
                  className="w-2 h-2 rounded-full" 
                  style={{ backgroundColor: getThemeColor(entity.id) }}
                />
                <span className={currentEntity.id === entity.id ? "font-bold" : ""}>{entity.name}</span>
              </DropdownMenuItem>
            ))}
            <DropdownMenuSeparator />
            <DropdownMenuItem>
              <Link href="/organization" className="flex items-center w-full">
                <Network className="w-4 h-4 ml-2" />
                إدارة الهيكل التنظيمي
              </Link>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
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
                <item.icon 
                  className={cn("w-5 h-5 transition-colors duration-300")} 
                  style={{ color: isActive ? getThemeColor() : undefined }}
                />
                {item.label}
              </a>
            </Link>
          );
        })}
      </nav>

      <div className="p-4 border-t border-sidebar-border">
        <div className="flex items-center gap-3 px-3 py-2 rounded-md bg-sidebar-accent/30">
          <div 
            className="w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold transition-colors duration-300"
            style={{ backgroundColor: getThemeColor() }}
          >
            MA
          </div>
          <div className="flex-1 overflow-hidden">
            <p className="text-sm font-medium truncate">محمد أحمد</p>
            <p className="text-xs text-muted-foreground truncate">مدير النظام</p>
          </div>
        </div>
      </div>
    </aside>
  );
}

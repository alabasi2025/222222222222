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
  Store,
  ChevronLeft,
  Plus,
  ChevronRight,
  DollarSign,
  Receipt,
  CreditCard,
  TrendingUp,
  BarChart3,
  Coins,
  Layers,
  Moon,
  Sun,
  Warehouse,
  ArrowLeftRight,
  UserCircle,
  Truck,
  ShieldCheck
} from "lucide-react";
import { useState } from "react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuSub,
  DropdownMenuSubTrigger,
  DropdownMenuSubContent,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { useEntity } from "@/contexts/EntityContext";
import { useTheme } from "@/contexts/ThemeContext";

const menuItems = [
  { icon: LayoutDashboard, label: "لوحة المعلومات", href: "/" },
  { icon: FileText, label: "الفواتير", href: "/invoices" },
  { icon: ShoppingCart, label: "المشتريات", href: "/purchases" },
  { icon: UserCircle, label: "العملاء", href: "/customers" },
  { icon: Truck, label: "الموردين", href: "/suppliers" },
];

const inventoryItems = [
  { icon: Warehouse, label: "المستودعات", href: "/warehouses" },
  { icon: ArrowLeftRight, label: "حركات المخزون", href: "/stock-movements" },
  { icon: Package, label: "المخزون", href: "/inventory" },
];

const financialSystemItems = [
  { icon: FolderTree, label: "شجرة الحسابات", href: "/coa" },
  { icon: DollarSign, label: "الميزانية العمومية", href: "/financial/balance-sheet" },
  { icon: Receipt, label: "قائمة الدخل", href: "/financial/income-statement" },
  { icon: TrendingUp, label: "قائمة التدفقات النقدية", href: "/financial/cash-flow" },
  { icon: BarChart3, label: "التحليل المالي", href: "/financial/analysis" },
  { icon: Coins, label: "الموازنة التقديرية", href: "/financial/budget" },
  { icon: CreditCard, label: "إدارة الديون", href: "/financial/debt-management" },
  { icon: Wallet, label: "السندات المالية", href: "/payments" },
  { icon: ShieldCheck, label: "الصناديق والعهد", href: "/cash-boxes" },
  { icon: Landmark, label: "البنوك والمحافظ", href: "/banks-wallets" },
  { 
    icon: Settings, 
    label: "إعدادات النظام المالي", 
    href: "/financial/settings",
    subItems: [
      {
        icon: FolderTree,
        label: "إعدادات شجرة الحسابات",
        href: "/financial/settings/coa",
        subItems: [
          { icon: Layers, label: "مجموعة الحسابات", href: "/financial/settings/coa/groups" }
        ]
      }
    ]
  },
];

const otherMenuItems = [
  { icon: ArrowLeftRight, label: "التحويلات بين الوحدات", href: "/inter-unit-transfers" },
  { icon: Building2, label: "حسابات الجاري", href: "/inter-unit-accounts" },
  { icon: FileText, label: "قيود اليومية", href: "/journals" },
  { icon: BookOpen, label: "دفتر الأستاذ", href: "/ledger" },
  { icon: Building2, label: "الأصول الثابتة", href: "/assets" },
  { icon: Target, label: "مراكز التكلفة", href: "/cost-centers" },
  { icon: Landmark, label: "تسوية البنك", href: "/bank-reconciliation" },
  { icon: Calculator, label: "إدارة الضريبة", href: "/tax" },
  { icon: DollarSign, label: "إدارة العملات", href: "/currencies" },
  { icon: PieChart, label: "التقارير", href: "/reports" },
  { icon: Network, label: "الهيكل التنظيمي", href: "/organization" },
  { icon: Settings, label: "الإعدادات", href: "/settings" },
];

export function Sidebar() {
  const [location] = useLocation();
  const { entities, currentEntity, setCurrentEntity, getThemeColor } = useEntity();
  
  // Don't render sidebar if no entity is selected
  if (!currentEntity) {
    return null;
  }
  const { theme, toggleTheme } = useTheme();
  const [isFinancialSystemOpen, setIsFinancialSystemOpen] = useState(false);
  const [isInventoryOpen, setIsInventoryOpen] = useState(false);
  const [openSubMenus, setOpenSubMenus] = useState<Record<string, boolean>>({});
  const [openNestedSubMenus, setOpenNestedSubMenus] = useState<Record<string, boolean>>({});

  const toggleSubMenu = (href: string) => {
    setOpenSubMenus(prev => ({ ...prev, [href]: !prev[href] }));
  };

  const toggleNestedSubMenu = (href: string) => {
    setOpenNestedSubMenus(prev => ({ ...prev, [href]: !prev[href] }));
  };

  // Get all units
  const units = entities.filter(e => e.type === 'unit');

  // Get branches for a specific unit
  const getUnitBranches = (unitId: string) => {
    return entities.filter(e => e.type === 'branch' && e.parentId === unitId);
  };

  return (
    <aside className="hidden md:flex flex-col w-64 bg-sidebar border-l border-sidebar-border h-screen sticky top-0">
      <div 
        className="p-4 border-b border-sidebar-border transition-colors duration-300"
        style={{ backgroundColor: `${getThemeColor()}15` }} // 15 is roughly 8% opacity
      >
        <DropdownMenu dir="rtl">
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="w-full justify-between h-auto py-3 px-2 hover:bg-sidebar-accent">
              <div className="flex items-center gap-3 text-right overflow-hidden">
                <div 
                  className="w-8 h-8 rounded-lg flex items-center justify-center text-white font-bold text-lg shrink-0 transition-colors duration-300 shadow-sm overflow-hidden"
                  style={{ backgroundColor: currentEntity.logo ? 'transparent' : getThemeColor() }}
                >
                  {currentEntity.logo ? (
                    <img src={currentEntity.logo} alt="Logo" className="w-full h-full object-cover" />
                  ) : (
                    currentEntity.type === 'holding' ? <Building2 className="w-4 h-4" /> : 
                    currentEntity.type === 'unit' ? <Building className="w-4 h-4" /> : <Store className="w-4 h-4" />
                  )}
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
          <DropdownMenuContent className="w-64" align="end">
            <DropdownMenuLabel>تحديد الكيان</DropdownMenuLabel>

            <DropdownMenuLabel className="text-xs text-muted-foreground">وحدات الأعمال والفروع</DropdownMenuLabel>

            {/* Units with Submenu for Branches */}
            {units.map((unit) => {
              const branches = getUnitBranches(unit.id);
              
              return (
                <DropdownMenuSub key={unit.id}>
                  <DropdownMenuSubTrigger className="flex items-center gap-2 py-2 cursor-pointer">
                    <div 
                      className="w-6 h-6 rounded-md flex items-center justify-center overflow-hidden shrink-0" 
                      style={{ backgroundColor: unit.logo ? 'transparent' : getThemeColor(unit.id) }}
                    >
                      {unit.logo ? (
                        <img src={unit.logo} alt="Logo" className="w-full h-full object-cover" />
                      ) : (
                        <Building className="w-3 h-3 text-white" />
                      )}
                    </div>
                    <span className={currentEntity.id === unit.id ? "font-bold flex-1" : "flex-1"}>
                      {unit.name}
                    </span>
                  </DropdownMenuSubTrigger>
                  
                  <DropdownMenuSubContent className="w-56 ml-1">
                    {/* Option to select the Unit itself */}
                    <DropdownMenuItem 
                      onClick={() => setCurrentEntity(unit)}
                      className="flex items-center gap-2 cursor-pointer py-2 bg-accent/50"
                    >
                      <Building className="w-4 h-4 text-muted-foreground" />
                      <span className="font-medium">إدارة الوحدة (الكل)</span>
                    </DropdownMenuItem>
                    
                    <DropdownMenuSeparator />
                    
                    {/* Branches List */}
                    {branches.length > 0 ? (
                      branches.map(branch => (
                        <DropdownMenuItem 
                          key={branch.id}
                          onClick={() => setCurrentEntity(branch)}
                          className="flex items-center gap-2 cursor-pointer py-2"
                        >
                          <Store className="w-4 h-4 text-muted-foreground" />
                          <span className={currentEntity.id === branch.id ? "font-bold" : ""}>
                            {branch.name}
                          </span>
                        </DropdownMenuItem>
                      ))
                    ) : (
                      <div className="p-2 text-xs text-muted-foreground text-center">
                        لا توجد فروع
                      </div>
                    )}
                  </DropdownMenuSubContent>
                </DropdownMenuSub>
              );
            })}

            <DropdownMenuSeparator />
            
            {/* Quick Actions based on context */}
            {(currentEntity.type === 'unit' || currentEntity.type === 'branch') && (
              <DropdownMenuItem>
                <Link href="/organization?action=add">
                  <div className="flex items-center w-full cursor-pointer text-primary">
                    <Plus className="w-4 h-4 ml-2" />
                    إضافة فرع جديد
                  </div>
                </Link>
              </DropdownMenuItem>
            )}

            <DropdownMenuItem>
              <Link href="/coa?action=add">
                <div className="flex items-center w-full cursor-pointer text-primary">
                  <FolderTree className="w-4 h-4 ml-2" />
                  إضافة حساب جديد
                </div>
              </Link>
            </DropdownMenuItem>

            <DropdownMenuSeparator />
            <DropdownMenuItem>
              <Link href="/organization">
                <div className="flex items-center w-full cursor-pointer">
                  <Network className="w-4 h-4 ml-2" />
                  إدارة الهيكل التنظيمي
                </div>
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
              <div
                className={cn(
                  "flex items-center gap-3 px-3 py-2.5 rounded-md text-sm font-medium transition-all duration-200 cursor-pointer",
                  isActive
                    ? "bg-sidebar-accent text-sidebar-accent-foreground shadow-sm"
                    : "text-sidebar-foreground/70 hover:bg-sidebar-accent/50 hover:text-sidebar-foreground"
                )}
                style={isActive ? { 
                  backgroundColor: `${getThemeColor()}15`,
                  color: getThemeColor()
                } : undefined}
              >
                <item.icon 
                  className={cn("w-5 h-5 transition-colors duration-300")} 
                  style={{ color: isActive ? getThemeColor() : undefined }}
                />
                {item.label}
              </div>
            </Link>
          );
        })}

        {/* المخزون */}
        <div className="space-y-1">
          <div
            onClick={() => setIsInventoryOpen(!isInventoryOpen)}
            className={cn(
              "flex items-center gap-3 px-3 py-2.5 rounded-md text-sm font-medium transition-all duration-200 cursor-pointer",
              "text-sidebar-foreground/70 hover:bg-sidebar-accent/50 hover:text-sidebar-foreground"
            )}
          >
            <Package className="w-5 h-5" />
            <span className="flex-1">المخزون</span>
            <ChevronLeft 
              className={cn(
                "w-4 h-4 transition-transform duration-200",
                isInventoryOpen && "rotate-90"
              )}
            />
          </div>
          
          {isInventoryOpen && (
            <div className="pr-4 space-y-1">
              {inventoryItems.map((item) => {
                const isActive = location === item.href;
                return (
                  <Link key={item.href} href={item.href}>
                    <div
                      className={cn(
                        "flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-all duration-200 cursor-pointer",
                        isActive
                          ? "bg-sidebar-accent text-sidebar-accent-foreground shadow-sm"
                          : "text-sidebar-foreground/60 hover:bg-sidebar-accent/50 hover:text-sidebar-foreground"
                      )}
                      style={isActive ? { 
                        backgroundColor: `${getThemeColor()}15`,
                        color: getThemeColor()
                      } : undefined}
                    >
                      <item.icon 
                        className={cn("w-4 h-4 transition-colors duration-300")} 
                        style={{ color: isActive ? getThemeColor() : undefined }}
                      />
                      {item.label}
                    </div>
                  </Link>
                );
              })}
            </div>
          )}
        </div>

        {/* النظام المالي */}
        <div className="space-y-1">
          <div
            onClick={() => setIsFinancialSystemOpen(!isFinancialSystemOpen)}
            className={cn(
              "flex items-center gap-3 px-3 py-2.5 rounded-md text-sm font-medium transition-all duration-200 cursor-pointer",
              "text-sidebar-foreground/70 hover:bg-sidebar-accent/50 hover:text-sidebar-foreground"
            )}
          >
            <DollarSign className="w-5 h-5" />
            <span className="flex-1">النظام المالي</span>
            <ChevronLeft 
              className={cn(
                "w-4 h-4 transition-transform duration-200",
                isFinancialSystemOpen && "rotate-90"
              )}
            />
          </div>
          
          {isFinancialSystemOpen && (
            <div className="pr-4 space-y-1">
              {financialSystemItems.map((item) => {
                const isActive = location === item.href;
                const isSubMenuOpen = openSubMenus[item.href] || false;
                
                return (
                  <div key={item.href}>
                    {item.subItems ? (
                      <div>
                        <div
                          onClick={() => toggleSubMenu(item.href)}
                          className={cn(
                            "flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-all duration-200 cursor-pointer",
                            "text-sidebar-foreground/60 hover:bg-sidebar-accent/50 hover:text-sidebar-foreground"
                          )}
                        >
                          <item.icon className="w-4 h-4" />
                          <span className="flex-1">{item.label}</span>
                          <ChevronLeft 
                            className={cn(
                              "w-3 h-3 transition-transform duration-200",
                              isSubMenuOpen && "rotate-90"
                            )}
                          />
                        </div>
                        {isSubMenuOpen && (
                          <div className="pr-4 space-y-1 mt-1">
                            {item.subItems.map((subItem) => {
                              const isSubActive = location === subItem.href;
                              const isNestedSubMenuOpen = openNestedSubMenus[subItem.href] || false;
                              return (
                                <div key={subItem.href}>
                                  {subItem.subItems ? (
                                    <div>
                                      <div
                                        onClick={() => toggleNestedSubMenu(subItem.href)}
                                        className={cn(
                                          "flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-all duration-200 cursor-pointer",
                                          "text-sidebar-foreground/60 hover:bg-sidebar-accent/50 hover:text-sidebar-foreground"
                                        )}
                                      >
                                        <subItem.icon className="w-4 h-4" />
                                        <span className="flex-1">{subItem.label}</span>
                                        <ChevronLeft 
                                          className={cn(
                                            "w-3 h-3 transition-transform duration-200",
                                            isNestedSubMenuOpen && "rotate-90"
                                          )}
                                        />
                                      </div>
                                      {isNestedSubMenuOpen && (
                                        <div className="pr-4 space-y-1 mt-1">
                                          {subItem.subItems.map((nestedItem) => {
                                            const isNestedActive = location === nestedItem.href;
                                            return (
                                              <Link key={nestedItem.href} href={nestedItem.href}>
                                                <div
                                                  className={cn(
                                                    "flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-all duration-200 cursor-pointer",
                                                    isNestedActive
                                                      ? "bg-sidebar-accent text-sidebar-accent-foreground shadow-sm"
                                                      : "text-sidebar-foreground/60 hover:bg-sidebar-accent/50 hover:text-sidebar-foreground"
                                                  )}
                                                  style={isNestedActive ? { 
                                                    backgroundColor: `${getThemeColor()}15`,
                                                    color: getThemeColor()
                                                  } : undefined}
                                                >
                                                  <nestedItem.icon 
                                                    className={cn("w-4 h-4 transition-colors duration-300")} 
                                                    style={{ color: isNestedActive ? getThemeColor() : undefined }}
                                                  />
                                                  {nestedItem.label}
                                                </div>
                                              </Link>
                                            );
                                          })}
                                        </div>
                                      )}
                                    </div>
                                  ) : (
                                    <Link href={subItem.href}>
                                      <div
                                        className={cn(
                                          "flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-all duration-200 cursor-pointer",
                                          isSubActive
                                            ? "bg-sidebar-accent text-sidebar-accent-foreground shadow-sm"
                                            : "text-sidebar-foreground/60 hover:bg-sidebar-accent/50 hover:text-sidebar-foreground"
                                        )}
                                        style={isSubActive ? { 
                                          backgroundColor: `${getThemeColor()}15`,
                                          color: getThemeColor()
                                        } : undefined}
                                      >
                                        <subItem.icon 
                                          className={cn("w-4 h-4 transition-colors duration-300")} 
                                          style={{ color: isSubActive ? getThemeColor() : undefined }}
                                        />
                                        {subItem.label}
                                      </div>
                                    </Link>
                                  )}
                                </div>
                              );
                            })}
                          </div>
                        )}
                      </div>
                    ) : (
                      <Link href={item.href}>
                        <div
                          className={cn(
                            "flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-all duration-200 cursor-pointer",
                            isActive
                              ? "bg-sidebar-accent text-sidebar-accent-foreground shadow-sm"
                              : "text-sidebar-foreground/60 hover:bg-sidebar-accent/50 hover:text-sidebar-foreground"
                          )}
                          style={isActive ? { 
                            backgroundColor: `${getThemeColor()}15`,
                            color: getThemeColor()
                          } : undefined}
                        >
                          <item.icon 
                            className={cn("w-4 h-4 transition-colors duration-300")} 
                            style={{ color: isActive ? getThemeColor() : undefined }}
                          />
                          {item.label}
                        </div>
                      </Link>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {otherMenuItems.map((item) => {
          const isActive = location === item.href;
          return (
            <Link key={item.href} href={item.href}>
              <div
                className={cn(
                  "flex items-center gap-3 px-3 py-2.5 rounded-md text-sm font-medium transition-all duration-200 cursor-pointer",
                  isActive
                    ? "bg-sidebar-accent text-sidebar-accent-foreground shadow-sm"
                    : "text-sidebar-foreground/70 hover:bg-sidebar-accent/50 hover:text-sidebar-foreground"
                )}
                style={isActive ? { 
                  backgroundColor: `${getThemeColor()}15`,
                  color: getThemeColor()
                } : undefined}
              >
                <item.icon 
                  className={cn("w-5 h-5 transition-colors duration-300")} 
                  style={{ color: isActive ? getThemeColor() : undefined }}
                />
                {item.label}
              </div>
            </Link>
          );
        })}
      </nav>

      <div className="p-4 border-t border-sidebar-border space-y-3">
        {/* Theme Toggle Button */}
        <Button
          variant="outline"
          size="sm"
          onClick={toggleTheme}
          className="w-full justify-start gap-3 hover:bg-sidebar-accent/50"
        >
          {theme === 'dark' ? (
            <>
              <Sun className="w-4 h-4" />
              <span className="text-sm">الوضع الفاتح</span>
            </>
          ) : (
            <>
              <Moon className="w-4 h-4" />
              <span className="text-sm">الوضع الداكن</span>
            </>
          )}
        </Button>
        
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

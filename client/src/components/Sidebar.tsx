import { cn } from "@/lib/utils";
import { Link, useLocation } from "wouter";
import { LayoutDashboard, FileText, ShoppingCart, Package, Users, Settings, PieChart, Wallet, BookOpen, FolderTree, Building2, Target, Landmark, Calculator, Network, ChevronDown, Building, Store, ChevronLeft, Plus, DollarSign, Receipt, CreditCard, TrendingUp, BarChart3, Coins, Layers, Moon, Sun, Warehouse, ArrowLeftRight, UserCircle, Truck, ShieldCheck, Tag, List, LogOut } from "lucide-react";
import { Separator } from "@/components/ui/separator";
import { useState, useEffect } from "react";
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
import { toast } from "sonner";

// القائمة الرئيسية
const menuItems = [
  { icon: LayoutDashboard, label: "لوحة المعلومات", href: "/" },
];

// المبيعات
const salesItems = [
  { icon: FileText, label: "الفواتير", href: "/invoices" },
  { icon: UserCircle, label: "العملاء", href: "/customers" },
];

// المشتريات
const purchasingItems = [
  { icon: ShoppingCart, label: "المشتريات", href: "/purchases" },
  { icon: Truck, label: "الموردين", href: "/suppliers" },
];

// المخزون
const inventoryItems = [
  { icon: Warehouse, label: "المستودعات", href: "/warehouses" },
  { icon: Package, label: "المخزون", href: "/inventory" },
  { icon: ArrowLeftRight, label: "حركات المخزون", href: "/stock-movements" },
];

// النظام المالي - الحسابات والقيود
const accountingItems = [
  { icon: FolderTree, label: "شجرة الحسابات", href: "/coa" },
  { icon: FileText, label: "قيود اليومية", href: "/journals" },
  { icon: BookOpen, label: "دفتر الأستاذ", href: "/ledger" },
];

// النظام المالي - النقدية والبنوك
const cashBankItems = [
  { icon: ShieldCheck, label: "الصناديق والعهد", href: "/cash-boxes" },
  { icon: Landmark, label: "البنوك والمحافظ", href: "/banks-wallets" },
  { icon: Landmark, label: "تسوية البنك", href: "/bank-reconciliation" },
  { icon: Wallet, label: "السندات المالية", href: "/payments" },
];

// النظام المالي - الأصول والتكاليف
const assetsCostItems = [
  { icon: Building2, label: "الأصول الثابتة", href: "/assets" },
  { icon: Target, label: "مراكز التكلفة", href: "/cost-centers" },
];

// النظام المالي - القوائم والتقارير المالية
const financialReportsItems = [
  { icon: DollarSign, label: "الميزانية العمومية", href: "/financial/balance-sheet" },
  { icon: Receipt, label: "قائمة الدخل", href: "/financial/income-statement" },
  { icon: TrendingUp, label: "قائمة التدفقات النقدية", href: "/financial/cash-flow" },
  { icon: BarChart3, label: "التحليل المالي", href: "/financial/analysis" },
  { icon: Coins, label: "الموازنة التقديرية", href: "/financial/budget" },
];

// النظام المالي - الإعدادات
const financialSettingsItems = [
  { icon: Calculator, label: "إدارة الضريبة", href: "/tax" },
  { icon: DollarSign, label: "إدارة العملات", href: "/currencies" },
  { icon: CreditCard, label: "إدارة الديون", href: "/financial/debt-management" },
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
          { icon: Layers, label: "مجموعة الحسابات", href: "/financial/settings/coa/groups" },
          { icon: Tag, label: "أنواع الحسابات", href: "/financial/settings/coa/types" },
          { icon: List, label: "أنواع الحسابات الفرعية", href: "/financial/settings/coa/subtypes" }
        ]
      }
    ]
  },
];

// التحويلات بين الوحدات
const interUnitItems = [
  { icon: ArrowLeftRight, label: "التحويلات بين الوحدات", href: "/inter-unit-transfers" },
  { icon: Building2, label: "حسابات الجاري", href: "/inter-unit-accounts" },
];

// التقارير والإعدادات العامة
const reportsAndSettingsItems = [
  { icon: PieChart, label: "التقارير", href: "/reports" },
  { icon: Users, label: "المستخدمين", href: "/users" },
  { icon: Network, label: "الهيكل التنظيمي", href: "/organization" },
  { icon: Settings, label: "الإعدادات", href: "/settings" },
];

export function Sidebar() {
  const [location, setLocation] = useLocation();
  const { entities, currentEntity, setCurrentEntity, getThemeColor } = useEntity();
  
  // Don't render sidebar if no entity is selected
  const { theme, toggleTheme } = useTheme();
  const [isSalesOpen, setIsSalesOpen] = useState(false);
  const [isPurchasingOpen, setIsPurchasingOpen] = useState(false);
  const [isInventoryOpen, setIsInventoryOpen] = useState(false);
  const [isAccountingOpen, setIsAccountingOpen] = useState(false);
  const [isCashBankOpen, setIsCashBankOpen] = useState(false);
  const [isAssetsCostOpen, setIsAssetsCostOpen] = useState(false);
  const [isFinancialReportsOpen, setIsFinancialReportsOpen] = useState(false);
  const [isFinancialSettingsOpen, setIsFinancialSettingsOpen] = useState(false);
  const [openSubMenus, setOpenSubMenus] = useState<Record<string, boolean>>({});
  const [openNestedSubMenus, setOpenNestedSubMenus] = useState<Record<string, boolean>>({});
  
  // Auto-open menus based on current location
  useEffect(() => {
    // Sales
    if (location.startsWith('/invoices') || location.startsWith('/customers')) {
      setIsSalesOpen(true);
    }
    // Purchasing
    if (location.startsWith('/purchases') || location.startsWith('/suppliers')) {
      setIsPurchasingOpen(true);
    }
    // Inventory
    if (location.startsWith('/warehouses') || location.startsWith('/inventory') || location.startsWith('/stock-movements')) {
      setIsInventoryOpen(true);
    }
    // Accounting
    if (location.startsWith('/coa') || location.startsWith('/journals') || location.startsWith('/ledger')) {
      setIsAccountingOpen(true);
    }
    // Cash & Bank
    if (location.startsWith('/cash-boxes') || location.startsWith('/banks-wallets') || location.startsWith('/bank-reconciliation') || location.startsWith('/payments')) {
      setIsCashBankOpen(true);
    }
    // Assets & Cost
    if (location.startsWith('/assets') || location.startsWith('/cost-centers')) {
      setIsAssetsCostOpen(true);
    }
    // Financial Reports
    if (location.startsWith('/financial/balance-sheet') || location.startsWith('/financial/income-statement') || 
        location.startsWith('/financial/cash-flow') || location.startsWith('/financial/analysis') || 
        location.startsWith('/financial/budget')) {
      setIsFinancialReportsOpen(true);
    }
    // Financial Settings
    if (location.startsWith('/tax') || location.startsWith('/currencies') || 
        location.startsWith('/financial/debt-management') || location.startsWith('/financial/settings')) {
      setIsFinancialSettingsOpen(true);
    }
    // Nested menus
    if (location.startsWith('/financial/settings')) {
      setOpenSubMenus(prev => ({ ...prev, '/financial/settings': true }));
    }
    if (location.startsWith('/financial/settings/coa')) {
      setOpenNestedSubMenus(prev => ({ ...prev, '/financial/settings/coa': true }));
    }
  }, [location]);

  if (!currentEntity) {
    return null;
  }


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
    <aside className="hidden md:flex flex-col w-64 bg-sidebar/95 backdrop-blur-sm border-l border-sidebar-border/50 h-screen sticky top-0 shadow-lg">
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

      <nav className="flex-1 overflow-y-auto py-4 px-3 space-y-1 custom-scrollbar">
        {/* لوحة المعلومات */}
        <div className="mb-3">
          {menuItems
            .filter(item => {
              // للشركة القابضة: فقط لوحة المعلومات
              if (currentEntity?.type === 'holding') {
                return item.href === '/';
              }
              return true;
            })
            .map((item) => {
            const isActive = location === item.href;
            return (
              <Link key={item.href} href={item.href}>
                <div
                  className={cn(
                    "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-semibold transition-all duration-200 cursor-pointer group relative",
                    isActive
                      ? "bg-sidebar-accent text-sidebar-accent-foreground shadow-md shadow-primary/10"
                      : "text-sidebar-foreground/80 hover:bg-sidebar-accent/40 hover:text-sidebar-foreground"
                  )}
                  style={isActive ? { 
                    backgroundColor: `${getThemeColor()}18`,
                    color: getThemeColor(),
                    borderRight: `3px solid ${getThemeColor()}`
                  } : {}}
                >
                  <item.icon 
                    className={cn("w-5 h-5 transition-all duration-300", isActive && "scale-110")} 
                    style={{ color: isActive ? getThemeColor() : undefined }}
                  />
                  <span className="flex-1">{item.label}</span>
                  {isActive && (
                    <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-6 rounded-r-full" 
                         style={{ backgroundColor: getThemeColor() }} />
                  )}
                </div>
              </Link>
            );
          })}
        </div>

        {/* فاصل */}
        {currentEntity?.type !== 'holding' && <Separator className="my-4 bg-sidebar-border/50" />}

        {/* المبيعات - للوحدات والفروع فقط */}
        {currentEntity?.type !== 'holding' && (
        <div className="space-y-1 mb-4">
          <div
            onClick={() => setIsSalesOpen(!isSalesOpen)}
            className={cn(
              "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-semibold transition-all duration-200 cursor-pointer group hover:bg-sidebar-accent/40",
              "text-sidebar-foreground/80"
            )}
          >
            <Receipt className="w-5 h-5 transition-transform duration-200 group-hover:scale-110" />
            <span className="flex-1">المبيعات</span>
            <ChevronLeft 
              className={cn(
                "w-4 h-4 transition-transform duration-200 text-sidebar-foreground/50",
                isSalesOpen && "rotate-90"
              )}
            />
          </div>
          {isSalesOpen && (
            <div className="pr-4 space-y-0.5 mt-1">
              {salesItems.map((item) => {
                const isActive = location === item.href;
                return (
                  <Link key={item.href} href={item.href}>
                    <div
                      className={cn(
                        "flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 cursor-pointer group relative",
                        isActive
                          ? "bg-sidebar-accent text-sidebar-accent-foreground shadow-sm"
                          : "text-sidebar-foreground/70 hover:bg-sidebar-accent/30 hover:text-sidebar-foreground hover:translate-x-[-2px]"
                      )}
                      style={isActive ? { 
                        backgroundColor: `${getThemeColor()}12`,
                        color: getThemeColor(),
                        borderRight: `2px solid ${getThemeColor()}`
                      } : {}}
                    >
                      <item.icon 
                        className={cn("w-4 h-4 transition-all duration-300", isActive && "scale-110")} 
                        style={{ color: isActive ? getThemeColor() : undefined }}
                      />
                      <span>{item.label}</span>
                    </div>
                  </Link>
                );
              })}
            </div>
          )}
        </div>
        )}

        {/* المشتريات - للوحدات والفروع فقط */}
        {currentEntity?.type !== 'holding' && (
        <div className="space-y-1 mb-4">
          <div
            onClick={() => setIsPurchasingOpen(!isPurchasingOpen)}
            className={cn(
              "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-semibold transition-all duration-200 cursor-pointer group hover:bg-sidebar-accent/40",
              "text-sidebar-foreground/80"
            )}
          >
            <ShoppingCart className="w-5 h-5 transition-transform duration-200 group-hover:scale-110" />
            <span className="flex-1">المشتريات</span>
            <ChevronLeft 
              className={cn(
                "w-4 h-4 transition-transform duration-200 text-sidebar-foreground/50",
                isPurchasingOpen && "rotate-90"
              )}
            />
          </div>
          {isPurchasingOpen && (
            <div className="pr-4 space-y-0.5 mt-1">
              {purchasingItems.map((item) => {
                const isActive = location === item.href;
                return (
                  <Link key={item.href} href={item.href}>
                    <div
                      className={cn(
                        "flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 cursor-pointer group relative",
                        isActive
                          ? "bg-sidebar-accent text-sidebar-accent-foreground shadow-sm"
                          : "text-sidebar-foreground/70 hover:bg-sidebar-accent/30 hover:text-sidebar-foreground hover:translate-x-[-2px]"
                      )}
                      style={isActive ? { 
                        backgroundColor: `${getThemeColor()}12`,
                        color: getThemeColor(),
                        borderRight: `2px solid ${getThemeColor()}`
                      } : {}}
                    >
                      <item.icon 
                        className={cn("w-4 h-4 transition-all duration-300", isActive && "scale-110")} 
                        style={{ color: isActive ? getThemeColor() : undefined }}
                      />
                      <span>{item.label}</span>
                    </div>
                  </Link>
                );
              })}
            </div>
          )}
        </div>
        )}

        {/* فاصل */}
        {currentEntity?.type !== 'holding' && <Separator className="my-4 bg-sidebar-border/50" />}

        {/* المخزون - للوحدات والفروع فقط */}
        {currentEntity?.type !== 'holding' && (
        <div className="space-y-1 mb-4">
          <div
            onClick={() => setIsInventoryOpen(!isInventoryOpen)}
            className={cn(
              "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-semibold transition-all duration-200 cursor-pointer group hover:bg-sidebar-accent/40",
              "text-sidebar-foreground/80"
            )}
          >
            <Package className="w-5 h-5 transition-transform duration-200 group-hover:scale-110" />
            <span className="flex-1">المخزون</span>
            <ChevronLeft 
              className={cn(
                "w-4 h-4 transition-transform duration-200 text-sidebar-foreground/50",
                isInventoryOpen && "rotate-90"
              )}
            />
          </div>
          {isInventoryOpen && (
            <div className="pr-4 space-y-0.5 mt-1">
              {inventoryItems.map((item) => {
                const isActive = location === item.href;
                return (
                  <Link key={item.href} href={item.href}>
                    <div
                      className={cn(
                        "flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 cursor-pointer group relative",
                        isActive
                          ? "bg-sidebar-accent text-sidebar-accent-foreground shadow-sm"
                          : "text-sidebar-foreground/70 hover:bg-sidebar-accent/30 hover:text-sidebar-foreground hover:translate-x-[-2px]"
                      )}
                      style={isActive ? { 
                        backgroundColor: `${getThemeColor()}12`,
                        color: getThemeColor(),
                        borderRight: `2px solid ${getThemeColor()}`
                      } : {}}
                    >
                      <item.icon 
                        className={cn("w-4 h-4 transition-all duration-300", isActive && "scale-110")} 
                        style={{ color: isActive ? getThemeColor() : undefined }}
                      />
                      <span>{item.label}</span>
                    </div>
                  </Link>
                );
              })}
            </div>
          )}
        </div>
        )}

        {/* فاصل رئيسي */}
        {currentEntity?.type !== 'holding' && (
          <div className="my-6">
            <Separator className="bg-sidebar-border/50" />
            <div className="flex items-center gap-2 mt-3 mb-2 px-3">
              <DollarSign className="w-4 h-4 text-sidebar-foreground/40" />
              <span className="text-xs font-semibold text-sidebar-foreground/50 uppercase tracking-wider">
                النظام المالي
              </span>
            </div>
          </div>
        )}

        {/* النظام المالي - الحسابات والقيود */}
        {currentEntity?.type !== 'holding' && (
        <div className="space-y-1 mb-4">
          <div
            onClick={() => setIsAccountingOpen(!isAccountingOpen)}
            className={cn(
              "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-semibold transition-all duration-200 cursor-pointer group hover:bg-sidebar-accent/40",
              "text-sidebar-foreground/80"
            )}
          >
            <BookOpen className="w-5 h-5 transition-transform duration-200 group-hover:scale-110" />
            <span className="flex-1">الحسابات والقيود</span>
            <ChevronLeft 
              className={cn(
                "w-4 h-4 transition-transform duration-200 text-sidebar-foreground/50",
                isAccountingOpen && "rotate-90"
              )}
            />
          </div>
          {isAccountingOpen && (
            <div className="pr-4 space-y-0.5 mt-1">
              {accountingItems.map((item) => {
                const isActive = location === item.href;
                return (
                  <Link key={item.href} href={item.href}>
                    <div
                      className={cn(
                        "flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 cursor-pointer group relative",
                        isActive
                          ? "bg-sidebar-accent text-sidebar-accent-foreground shadow-sm"
                          : "text-sidebar-foreground/70 hover:bg-sidebar-accent/30 hover:text-sidebar-foreground hover:translate-x-[-2px]"
                      )}
                      style={isActive ? { 
                        backgroundColor: `${getThemeColor()}12`,
                        color: getThemeColor(),
                        borderRight: `2px solid ${getThemeColor()}`
                      } : {}}
                    >
                      <item.icon 
                        className={cn("w-4 h-4 transition-all duration-300", isActive && "scale-110")} 
                        style={{ color: isActive ? getThemeColor() : undefined }}
                      />
                      <span>{item.label}</span>
                    </div>
                  </Link>
                );
              })}
            </div>
          )}
        </div>
        )}

        {/* النظام المالي - النقدية والبنوك */}
        {currentEntity?.type !== 'holding' && (
        <div className="space-y-1 mb-4">
          <div
            onClick={() => setIsCashBankOpen(!isCashBankOpen)}
            className={cn(
              "flex items-center gap-3 px-3 py-2.5 rounded-md text-sm font-medium transition-all duration-200 cursor-pointer",
              "text-sidebar-foreground/70 hover:bg-sidebar-accent/50 hover:text-sidebar-foreground"
            )}
          >
            <Landmark className="w-5 h-5 transition-transform duration-200 group-hover:scale-110" />
            <span className="flex-1">النقدية والبنوك</span>
            <ChevronLeft 
              className={cn(
                "w-4 h-4 transition-transform duration-200 text-sidebar-foreground/50",
                isCashBankOpen && "rotate-90"
              )}
            />
          </div>
          {isCashBankOpen && (
            <div className="pr-4 space-y-0.5 mt-1">
              {cashBankItems.map((item) => {
                const isActive = location === item.href;
                return (
                  <Link key={item.href} href={item.href}>
                    <div
                      className={cn(
                        "flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 cursor-pointer group relative",
                        isActive
                          ? "bg-sidebar-accent text-sidebar-accent-foreground shadow-sm"
                          : "text-sidebar-foreground/70 hover:bg-sidebar-accent/30 hover:text-sidebar-foreground hover:translate-x-[-2px]"
                      )}
                      style={isActive ? { 
                        backgroundColor: `${getThemeColor()}12`,
                        color: getThemeColor(),
                        borderRight: `2px solid ${getThemeColor()}`
                      } : {}}
                    >
                      <item.icon 
                        className={cn("w-4 h-4 transition-all duration-300", isActive && "scale-110")} 
                        style={{ color: isActive ? getThemeColor() : undefined }}
                      />
                      <span>{item.label}</span>
                    </div>
                  </Link>
                );
              })}
            </div>
          )}
        </div>
        )}

        {/* النظام المالي - الأصول والتكاليف */}
        {currentEntity?.type !== 'holding' && (
        <div className="space-y-1 mt-2">
          <div
            onClick={() => setIsAssetsCostOpen(!isAssetsCostOpen)}
            className={cn(
              "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-semibold transition-all duration-200 cursor-pointer group hover:bg-sidebar-accent/40",
              "text-sidebar-foreground/80"
            )}
          >
            <Building2 className="w-5 h-5 transition-transform duration-200 group-hover:scale-110" />
            <span className="flex-1">الأصول والتكاليف</span>
            <ChevronLeft 
              className={cn(
                "w-4 h-4 transition-transform duration-200 text-sidebar-foreground/50",
                isAssetsCostOpen && "rotate-90"
              )}
            />
          </div>
          {isAssetsCostOpen && (
            <div className="pr-4 space-y-0.5 mt-1">
              {assetsCostItems.map((item) => {
                const isActive = location === item.href;
                return (
                  <Link key={item.href} href={item.href}>
                    <div
                      className={cn(
                        "flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 cursor-pointer group relative",
                        isActive
                          ? "bg-sidebar-accent text-sidebar-accent-foreground shadow-sm"
                          : "text-sidebar-foreground/70 hover:bg-sidebar-accent/30 hover:text-sidebar-foreground hover:translate-x-[-2px]"
                      )}
                      style={isActive ? { 
                        backgroundColor: `${getThemeColor()}12`,
                        color: getThemeColor(),
                        borderRight: `2px solid ${getThemeColor()}`
                      } : {}}
                    >
                      <item.icon 
                        className={cn("w-4 h-4 transition-all duration-300", isActive && "scale-110")} 
                        style={{ color: isActive ? getThemeColor() : undefined }}
                      />
                      <span>{item.label}</span>
                    </div>
                  </Link>
                );
              })}
            </div>
          )}
        </div>
        )}

        {/* النظام المالي - القوائم والتقارير المالية */}
        {currentEntity?.type !== 'holding' && (
        <div className="space-y-1 mb-4">
          <div
            onClick={() => setIsFinancialReportsOpen(!isFinancialReportsOpen)}
            className={cn(
              "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-semibold transition-all duration-200 cursor-pointer group hover:bg-sidebar-accent/40",
              "text-sidebar-foreground/80"
            )}
          >
            <BarChart3 className="w-5 h-5 transition-transform duration-200 group-hover:scale-110" />
            <span className="flex-1">القوائم والتقارير المالية</span>
            <ChevronLeft 
              className={cn(
                "w-4 h-4 transition-transform duration-200 text-sidebar-foreground/50",
                isFinancialReportsOpen && "rotate-90"
              )}
            />
          </div>
          {isFinancialReportsOpen && (
            <div className="pr-4 space-y-0.5 mt-1">
              {financialReportsItems.map((item) => {
                const isActive = location === item.href;
                return (
                  <Link key={item.href} href={item.href}>
                    <div
                      className={cn(
                        "flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 cursor-pointer group relative",
                        isActive
                          ? "bg-sidebar-accent text-sidebar-accent-foreground shadow-sm"
                          : "text-sidebar-foreground/70 hover:bg-sidebar-accent/30 hover:text-sidebar-foreground hover:translate-x-[-2px]"
                      )}
                      style={isActive ? { 
                        backgroundColor: `${getThemeColor()}12`,
                        color: getThemeColor(),
                        borderRight: `2px solid ${getThemeColor()}`
                      } : {}}
                    >
                      <item.icon 
                        className={cn("w-4 h-4 transition-all duration-300", isActive && "scale-110")} 
                        style={{ color: isActive ? getThemeColor() : undefined }}
                      />
                      <span>{item.label}</span>
                    </div>
                  </Link>
                );
              })}
            </div>
          )}
        </div>
        )}

        {/* النظام المالي - الإعدادات */}
        {currentEntity?.type !== 'holding' && (
        <div className="space-y-1 mb-4">
          <div
            onClick={() => setIsFinancialSettingsOpen(!isFinancialSettingsOpen)}
            className={cn(
              "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-semibold transition-all duration-200 cursor-pointer group hover:bg-sidebar-accent/40",
              "text-sidebar-foreground/80"
            )}
          >
            <Settings className="w-5 h-5 transition-transform duration-200 group-hover:scale-110" />
            <span className="flex-1">إعدادات النظام المالي</span>
            <ChevronLeft 
              className={cn(
                "w-4 h-4 transition-transform duration-200 text-sidebar-foreground/50",
                isFinancialSettingsOpen && "rotate-90"
              )}
            />
          </div>
          {isFinancialSettingsOpen && (
            <div className="pr-4 space-y-0.5 mt-1">
              {financialSettingsItems.map((item) => {
                const isActive = location === item.href;
                const isSubMenuOpen = openSubMenus[item.href] || false;
                
                return (
                  <div key={item.href || item.label}>
                    {item.subItems ? (
                      <div>
                        <div
                          onClick={() => toggleSubMenu(item.href)}
                          className={cn(
                            "flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 cursor-pointer group relative",
                            "text-sidebar-foreground/70 hover:bg-sidebar-accent/30 hover:text-sidebar-foreground"
                          )}
                        >
                          <item.icon className="w-4 h-4 transition-all duration-300 group-hover:scale-110" />
                          <span className="flex-1">{item.label}</span>
                          <ChevronLeft 
                            className={cn(
                              "w-3 h-3 transition-transform duration-200 text-sidebar-foreground/50",
                              isSubMenuOpen && "rotate-90"
                            )}
                          />
                        </div>
                        {isSubMenuOpen && (
                          <div className="pr-4 space-y-0.5 mt-1">
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
                                          "flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 cursor-pointer group",
                                          "text-sidebar-foreground/70 hover:bg-sidebar-accent/30 hover:text-sidebar-foreground"
                                        )}
                                      >
                                        <subItem.icon className="w-4 h-4 transition-all duration-300 group-hover:scale-110" />
                                        <span className="flex-1">{subItem.label}</span>
                                        <ChevronLeft 
                                          className={cn(
                                            "w-3 h-3 transition-transform duration-200 text-sidebar-foreground/50",
                                            isNestedSubMenuOpen && "rotate-90"
                                          )}
                                        />
                                      </div>
                                      {isNestedSubMenuOpen && (
                                        <div className="pr-4 space-y-0.5 mt-1">
                                          {subItem.subItems.map((nestedItem) => {
                                            const isNestedActive = location === nestedItem.href;
                                            return (
                                              <Link key={nestedItem.href} href={nestedItem.href}>
                                                <div
                                                  className={cn(
                                                    "flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 cursor-pointer group relative",
                                                    isNestedActive
                                                      ? "bg-sidebar-accent text-sidebar-accent-foreground shadow-sm"
                                                      : "text-sidebar-foreground/70 hover:bg-sidebar-accent/30 hover:text-sidebar-foreground hover:translate-x-[-2px]"
                                                  )}
                                                  style={isNestedActive ? { 
                                                    backgroundColor: `${getThemeColor()}12`,
                                                    color: getThemeColor(),
                                                    borderRight: `2px solid ${getThemeColor()}`
                                                  } : {}}
                                                >
                                                  <nestedItem.icon 
                                                    className={cn("w-4 h-4 transition-all duration-300", isNestedActive && "scale-110")} 
                                                    style={{ color: isNestedActive ? getThemeColor() : undefined }}
                                                  />
                                                  <span>{nestedItem.label}</span>
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
                                          "flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 cursor-pointer group relative",
                                          isSubActive
                                            ? "bg-sidebar-accent text-sidebar-accent-foreground shadow-sm"
                                            : "text-sidebar-foreground/70 hover:bg-sidebar-accent/30 hover:text-sidebar-foreground hover:translate-x-[-2px]"
                                        )}
                                        style={isSubActive ? { 
                                          backgroundColor: `${getThemeColor()}12`,
                                          color: getThemeColor(),
                                          borderRight: `2px solid ${getThemeColor()}`
                                        } : {}}
                                      >
                                        <subItem.icon 
                                          className={cn("w-4 h-4 transition-all duration-300", isSubActive && "scale-110")} 
                                          style={{ color: isSubActive ? getThemeColor() : undefined }}
                                        />
                                        <span>{subItem.label}</span>
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
                      <Link href={item.href || '#'}>
                        <div
                          className={cn(
                            "flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 cursor-pointer group relative",
                            isActive
                              ? "bg-sidebar-accent text-sidebar-accent-foreground shadow-sm"
                              : "text-sidebar-foreground/70 hover:bg-sidebar-accent/30 hover:text-sidebar-foreground hover:translate-x-[-2px]"
                          )}
                          style={isActive ? { 
                            backgroundColor: `${getThemeColor()}12`,
                            color: getThemeColor(),
                            borderRight: `2px solid ${getThemeColor()}`
                          } : {}}
                        >
                          <item.icon 
                            className={cn("w-4 h-4 transition-all duration-300", isActive && "scale-110")} 
                            style={{ color: isActive ? getThemeColor() : undefined }}
                          />
                          <span>{item.label}</span>
                        </div>
                      </Link>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
        )}

        {/* فاصل */}
        {currentEntity?.type !== 'holding' && (
          <div className="my-6">
            <Separator className="bg-sidebar-border/50" />
          </div>
        )}

        {/* التحويلات بين الوحدات */}
        {currentEntity?.type !== 'holding' && (
        <div className="space-y-1 mb-4">
          <div className="flex items-center gap-2 px-3 mb-2">
            <Network className="w-4 h-4 text-sidebar-foreground/40" />
            <span className="text-xs font-semibold text-sidebar-foreground/50 uppercase tracking-wider">
              التحويلات
            </span>
          </div>
          <div className="pr-4 space-y-0.5">
            {interUnitItems.map((item) => {
              const isActive = location === item.href;
              return (
                <Link key={item.href} href={item.href}>
                  <div
                    className={cn(
                      "flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 cursor-pointer group relative",
                      isActive
                        ? "bg-sidebar-accent text-sidebar-accent-foreground shadow-sm"
                        : "text-sidebar-foreground/70 hover:bg-sidebar-accent/30 hover:text-sidebar-foreground hover:translate-x-[-2px]"
                    )}
                    style={isActive ? { 
                      backgroundColor: `${getThemeColor()}12`,
                      color: getThemeColor(),
                      borderRight: `2px solid ${getThemeColor()}`
                    } : {}}
                  >
                    <item.icon 
                      className={cn("w-4 h-4 transition-all duration-300", isActive && "scale-110")} 
                      style={{ color: isActive ? getThemeColor() : undefined }}
                    />
                    <span>{item.label}</span>
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
        )}

        {/* فاصل */}
        <div className="my-6">
          <Separator className="bg-sidebar-border/50" />
        </div>

        {/* التقارير والإعدادات العامة */}
        <div className="space-y-1">
          {reportsAndSettingsItems
            .filter(item => {
              // للشركة القابضة: فقط التقارير والهيكل التنظيمي والإعدادات
              if (currentEntity?.type === 'holding') {
                return item.href === '/reports' || 
                       item.href === '/organization' || 
                       item.href === '/settings';
              }
              return true;
            })
            .map((item) => {
            const isActive = location === item.href;
            return (
              <Link key={item.href} href={item.href}>
                <div
                  className={cn(
                    "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-semibold transition-all duration-200 cursor-pointer group relative",
                    isActive
                      ? "bg-sidebar-accent text-sidebar-accent-foreground shadow-md shadow-primary/10"
                      : "text-sidebar-foreground/80 hover:bg-sidebar-accent/40 hover:text-sidebar-foreground"
                  )}
                  style={isActive ? { 
                    backgroundColor: `${getThemeColor()}18`,
                    color: getThemeColor(),
                    borderRight: `3px solid ${getThemeColor()}`
                  } : {}}
                >
                  <item.icon 
                    className={cn("w-5 h-5 transition-all duration-300", isActive && "scale-110")} 
                    style={{ color: isActive ? getThemeColor() : undefined }}
                  />
                  <span className="flex-1">{item.label}</span>
                  {isActive && (
                    <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-6 rounded-r-full" 
                         style={{ backgroundColor: getThemeColor() }} />
                  )}
                </div>
              </Link>
            );
          })}
        </div>
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
        
        <div className="space-y-2">
          <div className="flex items-center gap-3 px-3 py-2 rounded-md bg-sidebar-accent/30">
            <div 
              className="w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold transition-colors duration-300"
              style={{ backgroundColor: getThemeColor() }}
            >
              {localStorage.getItem('username')?.charAt(0).toUpperCase() || 'U'}
            </div>
            <div className="flex-1 overflow-hidden">
              <p className="text-sm font-medium truncate">
                {localStorage.getItem('username') || 'مستخدم'}
              </p>
              <p className="text-xs text-muted-foreground truncate">مدير النظام</p>
            </div>
          </div>
          
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              // مسح بيانات تسجيل الدخول
              localStorage.removeItem("isAuthenticated");
              localStorage.removeItem("username");
              localStorage.removeItem("lastSelectedEntityId");
              localStorage.removeItem("lastSelectedHoldingId");
              localStorage.removeItem("lastSelectedUnitId");
              localStorage.removeItem("selectedHoldingId");
              
              toast.success("تم تسجيل الخروج بنجاح");
              setLocation("/login");
            }}
            className="w-full justify-start gap-3 hover:bg-destructive/10 hover:text-destructive"
          >
            <LogOut className="w-4 h-4" />
            <span className="text-sm">تسجيل الخروج</span>
          </Button>
        </div>
      </div>
    </aside>
  );
}

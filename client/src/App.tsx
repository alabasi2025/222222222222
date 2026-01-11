import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/NotFound";
import { Route, Switch } from "wouter";
import ErrorBoundary from "./components/ErrorBoundary";
import { ThemeProvider } from "./contexts/ThemeContext";
import ModelSwitcherButton from "./components/ModelSwitcherButton";
import { Layout } from "./components/Layout";
import { EntityProvider } from "./contexts/EntityContext";
import Dashboard from "./pages/Dashboard";
import Invoices from "./pages/Invoices";
import Purchases from "./pages/Purchases";
import Inventory from "./pages/Inventory";
import Warehouses from "./pages/Warehouses";
import StockMovements from "./pages/StockMovements";
import Contacts from "./pages/Contacts";
import Customers from "./pages/Customers";
import Suppliers from "./pages/Suppliers";
import Users from "./pages/Users";
import Payments from "./pages/Payments";
import JournalEntries from "./pages/JournalEntries";
import Ledger from "./pages/Ledger";
import ChartOfAccounts from "./pages/ChartOfAccounts";
import CashBoxes from "./pages/CashBoxes";
import FixedAssets from "./pages/FixedAssets";
import CostCenters from "./pages/CostCenters";
import BankReconciliation from "./pages/BankReconciliation";
import TaxManagement from "./pages/TaxManagement";
import Reports from "./pages/Reports";
import Settings from "./pages/Settings";
import OrganizationStructure from "./pages/OrganizationStructure";
import AccountGroups from "./pages/AccountGroups";
import BanksWallets from "./pages/BanksWallets";
import Currencies from "./pages/Currencies";
import InterUnitTransfers from "./pages/InterUnitTransfers";
import InterUnitAccounts from "./pages/InterUnitAccounts";
import Budget from "./pages/Budget";
import AccountTypes from "./pages/AccountTypes";
import AccountSubtypes from "./pages/AccountSubtypes";
import Login from "./pages/Login";
import CompanySelection from "./pages/CompanySelection";
import UnitSelection from "./pages/UnitSelection";

function AppRoutes() {
  // التحقق من تسجيل الدخول
  const isAuthenticated = localStorage.getItem("isAuthenticated") === "true";
  
  if (!isAuthenticated) {
    // إذا لم يكن مسجل دخول، توجيه إلى صفحة تسجيل الدخول
    window.location.href = "/login";
    return null;
  }

  return (
    <Layout>
      <ModelSwitcherButton />
      <Switch>
        <Route path="/" component={Dashboard} />
        <Route path="/invoices" component={Invoices} />
        <Route path="/purchases" component={Purchases} />
        <Route path="/inventory" component={Inventory} />
        <Route path="/warehouses" component={Warehouses} />
        <Route path="/stock-movements" component={StockMovements} />
        <Route path="/contacts" component={Contacts} />
        <Route path="/customers" component={Customers} />
        <Route path="/suppliers" component={Suppliers} />
        <Route path="/users" component={Users} />
        <Route path="/payments" component={Payments} />
        <Route path="/journals" component={JournalEntries} />
        <Route path="/ledger" component={Ledger} />
        <Route path="/coa" component={ChartOfAccounts} />
        <Route path="/cash-boxes" component={CashBoxes} />
        <Route path="/assets" component={FixedAssets} />
        <Route path="/cost-centers" component={CostCenters} />
        <Route path="/bank-reconciliation" component={BankReconciliation} />
        <Route path="/tax" component={TaxManagement} />
        <Route path="/reports" component={Reports} />
        <Route path="/settings" component={Settings} />
        <Route path="/organization" component={OrganizationStructure} />
        <Route path="/currencies" component={Currencies} />
        <Route path="/financial/settings/coa/groups" component={AccountGroups} />
        <Route path="/banks-wallets" component={BanksWallets} />
        <Route path="/inter-unit-transfers" component={InterUnitTransfers} />
        <Route path="/inter-unit-accounts" component={InterUnitAccounts} />
        <Route path="/financial/budget" component={Budget} />
        <Route path="/financial/settings/coa/types" component={AccountTypes} />
        <Route path="/financial/settings/coa/subtypes" component={AccountSubtypes} />
        <Route path="/404" component={NotFound} />
        <Route component={NotFound} />
      </Switch>
    </Layout>
  );
}

function Router() {
  return (
    <Switch>
      <Route path="/login" component={Login} />
      <Route path="/select-company" component={CompanySelection} />
      <Route path="/select-unit" component={UnitSelection} />
      <Route component={AppRoutes} />
    </Switch>
  );
}

function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider defaultTheme="light" switchable={true}>
        <EntityProvider>
          <TooltipProvider>
            <Toaster />
            <Router />
          </TooltipProvider>
        </EntityProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;

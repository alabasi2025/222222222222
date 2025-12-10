import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/NotFound";
import { Route, Switch } from "wouter";
import ErrorBoundary from "./components/ErrorBoundary";
import { ThemeProvider } from "./contexts/ThemeContext";
import { Layout } from "./components/Layout";
import { EntityProvider } from "./contexts/EntityContext";
import Dashboard from "./pages/Dashboard";
import Invoices from "./pages/Invoices";
import Purchases from "./pages/Purchases";
import Inventory from "./pages/Inventory";
import Contacts from "./pages/Contacts";
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

function Router() {
  return (
    <Layout>
      <Switch>
        <Route path="/" component={Dashboard} />
        <Route path="/invoices" component={Invoices} />
        {/* Placeholder routes for other pages */}
        <Route path="/purchases" component={Purchases} />
        <Route path="/inventory" component={Inventory} />
        <Route path="/contacts" component={Contacts} />
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
        <Route path="/financial/settings/coa/groups" component={AccountGroups} />
        
        <Route path="/404" component={NotFound} />
        <Route component={NotFound} />
      </Switch>
    </Layout>
  );
}

function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider defaultTheme="light">
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

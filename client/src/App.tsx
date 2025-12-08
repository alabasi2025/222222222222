import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/NotFound";
import { Route, Switch } from "wouter";
import ErrorBoundary from "./components/ErrorBoundary";
import { ThemeProvider } from "./contexts/ThemeContext";
import { Layout } from "./components/Layout";
import Dashboard from "./pages/Dashboard";
import Invoices from "./pages/Invoices";
import Purchases from "./pages/Purchases";
import Inventory from "./pages/Inventory";
import Contacts from "./pages/Contacts";
import Payments from "./pages/Payments";
import JournalEntries from "./pages/JournalEntries";
import Ledger from "./pages/Ledger";
import ChartOfAccounts from "./pages/ChartOfAccounts";
import Reports from "./pages/Reports";
import Settings from "./pages/Settings";

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
        <Route path="/reports" component={Reports} />
        <Route path="/settings" component={Settings} />
        
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
        <TooltipProvider>
          <Toaster />
          <Router />
        </TooltipProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;

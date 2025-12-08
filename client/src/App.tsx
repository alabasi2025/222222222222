import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/NotFound";
import { Route, Switch } from "wouter";
import ErrorBoundary from "./components/ErrorBoundary";
import { ThemeProvider } from "./contexts/ThemeContext";
import { Layout } from "./components/Layout";
import Dashboard from "./pages/Dashboard";
import Invoices from "./pages/Invoices";

function Router() {
  return (
    <Layout>
      <Switch>
        <Route path="/" component={Dashboard} />
        <Route path="/invoices" component={Invoices} />
        {/* Placeholder routes for other pages */}
        <Route path="/purchases" component={() => <div className="p-8 text-center text-muted-foreground">صفحة المشتريات (قيد التطوير)</div>} />
        <Route path="/inventory" component={() => <div className="p-8 text-center text-muted-foreground">صفحة المخزون (قيد التطوير)</div>} />
        <Route path="/contacts" component={() => <div className="p-8 text-center text-muted-foreground">صفحة العملاء والموردين (قيد التطوير)</div>} />
        <Route path="/payments" component={() => <div className="p-8 text-center text-muted-foreground">صفحة المدفوعات (قيد التطوير)</div>} />
        <Route path="/ledger" component={() => <div className="p-8 text-center text-muted-foreground">صفحة دفتر الأستاذ (قيد التطوير)</div>} />
        <Route path="/reports" component={() => <div className="p-8 text-center text-muted-foreground">صفحة التقارير (قيد التطوير)</div>} />
        <Route path="/settings" component={() => <div className="p-8 text-center text-muted-foreground">صفحة الإعدادات (قيد التطوير)</div>} />
        
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

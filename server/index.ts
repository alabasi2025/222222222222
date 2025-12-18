import express from "express";
import { createServer } from "http";
import path from "path";
import { fileURLToPath } from "url";

// Import routes
import entitiesRouter from "./routes/entities";
import accountsRouter from "./routes/accounts";
import cashBoxesRouter from "./routes/cashBoxes";
import banksWalletsRouter from "./routes/banksWallets";
import inventoryRouter from "./routes/inventory";
import warehousesRouter from "./routes/warehouses";
import stockMovementsRouter from "./routes/stockMovements";
import itemCategoriesRouter from "./routes/itemCategories";
import interUnitTransfersRouter from "./routes/interUnitTransfers";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  const app = express();
  const server = createServer(app);

  // Middleware
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));

  // API routes
  app.use("/api/entities", entitiesRouter);
  app.use("/api/accounts", accountsRouter);
  app.use("/api/cash-boxes", cashBoxesRouter);
  app.use("/api/banks-wallets", banksWalletsRouter);
  app.use("/api/inventory", inventoryRouter);
  app.use("/api/warehouses", warehousesRouter);
  app.use("/api/stock-movements", stockMovementsRouter);
  app.use("/api/item-categories", itemCategoriesRouter);
  app.use("/api/inter-unit-transfers", interUnitTransfersRouter);

  // Serve static files from dist/public in production
  const staticPath =
    process.env.NODE_ENV === "production"
      ? path.resolve(__dirname, "public")
      : path.resolve(__dirname, "..", "dist", "public");

  app.use(express.static(staticPath));

  // Handle client-side routing - serve index.html for all routes
  app.get("*", (_req, res) => {
    res.sendFile(path.join(staticPath, "index.html"));
  });

  const port = process.env.PORT || 3000;

  server.listen(port, () => {
    console.log(`Server running on http://localhost:${port}/`);
    console.log(`API available at http://localhost:${port}/api`);
  });
}

startServer().catch(console.error);

import express from "express";
import { registerRoutes } from "./routes";
import { setupVite, serveStatic } from "./vite";

const app = express();
app.use(express.json());

async function main() {
  registerRoutes(app);

  if (process.env.NODE_ENV === "production") {
    serveStatic(app);
  } else {
    await setupVite(app);
  }

  const port = Number(process.env.PORT) || 5000;
  app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
  });
}

main();

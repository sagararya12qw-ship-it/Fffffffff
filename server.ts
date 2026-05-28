import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import dotenv from "dotenv";

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json());

// API route for creating an order on ZapUPI
app.post("/api/zapupi/create-order", async (req, res) => {
  try {
    const { order_id, amount, customer_mobile } = req.body;
    
    if (!order_id || !amount) {
      return res.status(400).json({ status: "error", message: "Missing order_id or amount" });
    }

    const zap_key = process.env.VITE_ZAP_UPI_KEY || "zapb6bb0f723bb5a438084b6481cd7feae4";

    console.log(`[ZapUPI Proxy] Creating order ${order_id} for ₹${amount}`);

    const zapResponse = await fetch("https://pay.zapupi.com/api/create-order", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        zap_key,
        order_id: String(order_id),
        amount: String(amount),
        customer_mobile: customer_mobile ? String(customer_mobile) : "9652562562"
      })
    });

    const data = await zapResponse.json();
    console.log("[ZapUPI Proxy] Create order response:", data);
    
    return res.status(zapResponse.status).json(data);
  } catch (error: any) {
    console.error("[ZapUPI Proxy] Error creating order:", error);
    return res.status(500).json({ status: "error", message: error.message || "Internal server error" });
  }
});

// API route for polling status of order on ZapUPI
app.post("/api/zapupi/order-status", async (req, res) => {
  try {
    const { order_id } = req.body;
    
    if (!order_id) {
      return res.status(400).json({ status: "error", message: "Missing order_id" });
    }

    const zap_key = process.env.VITE_ZAP_UPI_KEY || "zapb6bb0f723bb5a438084b6481cd7feae4";

    console.log(`[ZapUPI Proxy] Checking status for order ${order_id}`);

    const zapResponse = await fetch("https://pay.zapupi.com/api/order-status", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        zap_key,
        order_id: String(order_id)
      })
    });

    const data = await zapResponse.json();
    console.log("[ZapUPI Proxy] Order status response:", data);

    return res.status(zapResponse.status).json(data);
  } catch (error: any) {
    console.error("[ZapUPI Proxy] Error checking order status:", error);
    return res.status(500).json({ status: "error", message: error.message || "Internal server error" });
  }
});

// Serve Vite dynamic/production code
async function initServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    // In production, resolving __dirname (which will be /dist since server.cjs is in /dist) is the most robust way to locate frontend assets.
    const distPath = typeof __dirname !== "undefined"
      ? path.resolve(__dirname, ".")
      : path.join(process.cwd(), "dist");

    console.log(`[Production Server] Serving static files from: ${distPath}`);
    app.use(express.static(distPath));

    app.get("*", (req, res) => {
      const indexPath = path.join(distPath, "index.html");
      res.sendFile(indexPath, (err) => {
        if (err) {
          console.error(`[Production Server] Error sending index.html:`, err);
          res.status(404).send("Error: Page not found. The frontend assets could not be located. Please make sure the applet has been compiled successfully.");
        }
      });
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server is running at http://0.0.0.0:${PORT}`);
  });
}

initServer();

var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(
  // If the importer is in node compatibility mode or this is not an ESM
  // file that has been converted to a CommonJS file using a Babel-
  // compatible transform (i.e. "__esModule" has not been set), then set
  // "default" to the CommonJS "module.exports" for node compatibility.
  isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target,
  mod
));

// server.ts
var import_express = __toESM(require("express"), 1);
var import_path = __toESM(require("path"), 1);
var import_vite = require("vite");
var import_dotenv = __toESM(require("dotenv"), 1);
import_dotenv.default.config();
var app = (0, import_express.default)();
var PORT = 3e3;
app.use(import_express.default.json());
app.post("/api/zapupi/create-order", async (req, res) => {
  try {
    const { order_id, amount, customer_mobile } = req.body;
    if (!order_id || !amount) {
      return res.status(400).json({ status: "error", message: "Missing order_id or amount" });
    }
    const zap_key = process.env.VITE_ZAP_UPI_KEY || "zapb6bb0f723bb5a438084b6481cd7feae4";
    console.log(`[ZapUPI Proxy] Creating order ${order_id} for \u20B9${amount}`);
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
  } catch (error) {
    console.error("[ZapUPI Proxy] Error creating order:", error);
    return res.status(500).json({ status: "error", message: error.message || "Internal server error" });
  }
});
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
  } catch (error) {
    console.error("[ZapUPI Proxy] Error checking order status:", error);
    return res.status(500).json({ status: "error", message: error.message || "Internal server error" });
  }
});
async function initServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await (0, import_vite.createServer)({
      server: { middlewareMode: true },
      appType: "spa"
    });
    app.use(vite.middlewares);
  } else {
    const distPath = typeof __dirname !== "undefined" ? import_path.default.resolve(__dirname, ".") : import_path.default.join(process.cwd(), "dist");
    console.log(`[Production Server] Serving static files from: ${distPath}`);
    app.use(import_express.default.static(distPath));
    app.get("*", (req, res) => {
      const indexPath = import_path.default.join(distPath, "index.html");
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
//# sourceMappingURL=server.cjs.map

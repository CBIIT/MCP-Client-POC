import { json, Router } from "express";
import { QueryTypes } from "sequelize";

import db from "../database.js";
import { sendFeedback } from "../email.js";
import { proxyMiddleware, requireRole } from "../middleware.js";
// REMOVED: import { textract } from "../textract.js"; // Not used by chat
// REMOVED: import { getLanguages, translate } from "../translate.js"; // Translate tool deleted
import { search } from "../utils.js";

const { VERSION } = process.env;
const api = Router();
api.use(json({ limit: 1024 ** 3 })); // 1GB

api.get("/status", async (req, res) => {
  res.json({
    version: VERSION,
    uptime: process.uptime(),
    database: await db.query("SELECT 'ok' AS health", { plain: true, type: QueryTypes.SELECT }),
  });
});

// Used by chat's search tool
api.get("/search", requireRole(), async (req, res) => {
  res.json(await search(req.query));
});

// Used by chat's browse tool
api.all("/browse/*url", requireRole(), proxyMiddleware);

// REMOVED: /api/textract - Not used by chat
// api.post("/textract", requireRole(), async (req, res) => {
//   res.json(await textract(req.body));
// });

// REMOVED: /api/translate - Translate tool deleted
// api.post("/translate", requireRole(), async (req, res) => {
//   res.json(await translate(req.body));
// });

// REMOVED: /api/translate/languages - Translate tool deleted
// api.get("/translate/languages", requireRole(), async (req, res) => {
//   res.json(await getLanguages());
// });

// Used by chat's feedback button
api.post("/feedback", requireRole(), async (req, res) => {
  const { feedback, context } = req.body;
  const from = req.session?.user?.email;
  const results = await sendFeedback({ from, feedback, context });
  return res.json(results);
});

export default api;

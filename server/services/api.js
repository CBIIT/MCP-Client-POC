import { json, Router } from "express";

import { logErrors, logRequests } from "./middleware.js";
// import adminRoutes from "./routes/admin.js"; // REMOVED: Admin panel not needed for POC
import authRoutes from "./routes/auth.js";
import modelRoutes from "./routes/model.js";
import toolRoutes from "./routes/tools.js";

const api = Router();

api.use(json({ limit: 1024 ** 3 })); // 1GB
api.use(logRequests());
// api.use(adminRoutes); // REMOVED: Admin panel not needed for POC
api.use(authRoutes);
api.use(modelRoutes);
api.use(toolRoutes);
api.use(logErrors());

export default api;

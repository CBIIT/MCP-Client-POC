import { Sequelize } from "sequelize";

import logger from "./logger.js";
import { createModels, seedDatabase } from "./schema.js";

const {
  DB_DIALECT = "postgres",
  DB_STORAGE = ":memory:",
  PGHOST,
  PGPORT,
  PGDATABASE,
  PGUSER,
  PGPASSWORD,
} = process.env;

const dbConfigs = {
  postgres: {
    dialect: "postgres",
    logging: (m) => logger.debug(m),
    host: PGHOST,
    port: +PGPORT,
    database: PGDATABASE,
    username: PGUSER,
    password: PGPASSWORD,
  },
  sqlite: {
    dialect: "sqlite",
    storage: DB_STORAGE,
    logging: (m) => logger.debug(m),
  },
};

// Create database instance with selected dialect
const db = new Sequelize(dbConfigs[DB_DIALECT]);
const models = createModels(db);

// Sync and seed database
const syncOptions = DB_DIALECT === "sqlite" ? { force: false } : { alter: true };
await db.sync(syncOptions);
await seedDatabase(models);

// Auto-create hardcoded dev user for POC (skip OAuth)
const { User } = models;
await User.findOrCreate({
  where: { email: "dev@localhost" },
  defaults: {
    email: "dev@localhost",
    firstName: "Dev",
    lastName: "User",
    status: "active",
    roleId: 1, // Admin role
    limit: null, // Unlimited
    remaining: null,
  },
});

export const { User: ExportedUser, Role, Provider, Model, Usage } = models;
export { ExportedUser as User };
export default db;

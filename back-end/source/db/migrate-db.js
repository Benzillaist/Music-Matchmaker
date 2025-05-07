/**
 * migrate-db.js - Database migration script to add the autobio field to existing tables
 */

import { Sequelize, DataTypes } from "sequelize";
import fs from "fs";
import path from "path";

const DATABASE_PATH = path.join(process.cwd(), "database.sqlite");
const BACKUP_PATH = path.join(process.cwd(), "database.backup.sqlite");

async function migrateDatabase() {
  console.log("Starting database migration...");

  // 1. Create a backup of the current database
  console.log("Creating database backup...");
  if (fs.existsSync(DATABASE_PATH)) {
    fs.copyFileSync(DATABASE_PATH, BACKUP_PATH);
    console.log(`Database backed up to ${BACKUP_PATH}`);
  }

  try {
    // 2. Connect to the database
    const sequelize = new Sequelize({
      dialect: "sqlite",
      storage: DATABASE_PATH,
      logging: console.log
    });

    // 3. Test connection
    await sequelize.authenticate();
    console.log("Database connection established successfully.");

    // 4. Check if the autobio column exists in the Users table
    const [results] = await sequelize.query("PRAGMA table_info(Users);");
    const hasAutobioColumn = results.some(column => column.name === 'autobio');
    
    if (hasAutobioColumn) {
      console.log("The autobio column already exists in the Users table. No migration needed.");
      return;
    }

    // 5. Add the autobio column to the Users table
    console.log("Adding autobio column to Users table...");
    await sequelize.query("ALTER TABLE Users ADD COLUMN autobio TEXT;");
    
    console.log("Migration completed successfully!");

  } catch (error) {
    console.error("Error during migration:", error);
    
    // Restore backup if migration fails
    if (fs.existsSync(BACKUP_PATH)) {
      console.log("Restoring database from backup...");
      fs.copyFileSync(BACKUP_PATH, DATABASE_PATH);
      console.log("Database restored from backup.");
    }
    
    process.exit(1);
  }
}

// Run the migration
migrateDatabase();
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import dotenv from "dotenv";
import pg from "pg";

dotenv.config();

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const pool = new pg.Pool({ connectionString: process.env.DATABASE_URL });

async function run() {
  const files = ["001_init.sql"];

  // เพิ่ม 002_seed.sql เข้าคิวได้ก็ต่อเมื่อสั่งด้วย: node src/migrations/run.js --seed
  if (process.argv.includes("--seed")) {
    files.push("002_seed.sql");
  }

  for (const file of files) {
    const sqlPath = path.join(__dirname, file);
    const sql = fs.readFileSync(sqlPath, "utf-8");
    console.log(`Running migration: ${file}`);
    await pool.query(sql);
  }

  console.log("Migration complete.");
  await pool.end();
}

run().catch((err) => {
  console.error("Migration failed:", err);
  process.exit(1);
});

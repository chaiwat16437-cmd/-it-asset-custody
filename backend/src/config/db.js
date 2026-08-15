import pg from "pg";
import dotenv from "dotenv";

dotenv.config();

// Supabase (และ managed Postgres เจ้าอื่นๆ ส่วนใหญ่) บังคับต่อผ่าน SSL เสมอ
// ส่วน Postgres ที่รันเองใน docker-compose (localhost/db) ไม่รองรับ SSL
// จึงเปิด SSL เฉพาะตอนไม่ได้ต่อ localhost/db เท่านั้น
const isLocalDb = /localhost|127\.0\.0\.1|@db:/.test(process.env.DATABASE_URL || "");

export const pool = new pg.Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: isLocalDb ? false : { rejectUnauthorized: false },
});

pool.on("error", (err) => {
  console.error("Unexpected error on idle Postgres client", err);
  process.exit(1);
});

export async function query(text, params) {
  const start = Date.now();
  const result = await pool.query(text, params);
  const duration = Date.now() - start;
  if (process.env.NODE_ENV !== "production") {
    console.log("query", { text, duration, rows: result.rowCount });
  }
  return result;
}

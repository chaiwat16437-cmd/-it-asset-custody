import pg from "pg";
import dotenv from "dotenv";

dotenv.config();

// Postgres คอลัมน์ชนิด DATE (OID 1082) ปกติ driver "pg" จะแปลงเป็น JS Date object
// ให้อัตโนมัติ พอ res.json() เรียก JSON.stringify จะได้ full timestamp แบบ
// "2026-08-15T00:00:00.000Z" ซึ่งไม่ใช่สิ่งที่ต้องการ (เราต้องการแค่ "2026-08-15")
// สั่งให้ driver ส่งค่ากลับมาเป็น string ดิบตามที่ Postgres ให้มาแทน ไม่ต้องแปลง
pg.types.setTypeParser(1082, (val) => val);

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

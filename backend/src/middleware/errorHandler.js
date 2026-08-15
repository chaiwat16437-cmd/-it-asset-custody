export function errorHandler(err, req, res, next) {
  console.error(err);

  if (err.code === "23505") {
    // unique_violation
    if (err.constraint === "one_active_custody_per_asset") {
      return res.status(409).json({
        error: "อุปกรณ์นี้กำลังถูกครอบครองอยู่ ต้องคืนก่อนจึงจะยืมใหม่ได้",
      });
    }
    return res.status(409).json({ error: "ข้อมูลซ้ำในระบบ", detail: err.detail });
  }

  if (err.code === "23503") {
    // foreign_key_violation
    return res.status(400).json({ error: "อ้างอิงข้อมูลที่ไม่มีอยู่ในระบบ", detail: err.detail });
  }

  if (err.status) {
    return res.status(err.status).json({ error: err.message });
  }

  res.status(500).json({ error: "เกิดข้อผิดพลาดภายในระบบ" });
}

export class ApiError extends Error {
  constructor(status, message) {
    super(message);
    this.status = status;
  }
}

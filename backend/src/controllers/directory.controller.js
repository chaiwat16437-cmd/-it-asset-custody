import { query } from "../config/db.js";
import { ApiError } from "../middleware/errorHandler.js";

// ---- Departments ----
export async function listDepartments(req, res, next) {
  try {
    const result = await query(`SELECT * FROM departments ORDER BY name`);
    res.json(result.rows);
  } catch (err) {
    next(err);
  }
}

export async function createDepartment(req, res, next) {
  try {
    const { name } = req.body;
    if (!name) throw new ApiError(400, "ต้องระบุชื่อแผนก");
    const result = await query(`INSERT INTO departments (name) VALUES ($1) RETURNING *`, [name]);
    res.status(201).json(result.rows[0]);
  } catch (err) {
    next(err);
  }
}

// ---- Employees ----
export async function listEmployees(req, res, next) {
  try {
    const { department_id, include_inactive } = req.query;
    const conditions = [];
    const params = [];
    if (department_id) {
      params.push(department_id);
      conditions.push(`e.department_id = $${params.length}`);
    }
    if (include_inactive !== "true") {
      conditions.push(`e.is_active = true`);
    }
    const where = conditions.length ? `WHERE ${conditions.join(" AND ")}` : "";
    const result = await query(
      `SELECT e.*, d.name AS department_name
       FROM employees e LEFT JOIN departments d ON d.id = e.department_id
       ${where}
       ORDER BY e.full_name`,
      params
    );
    res.json(result.rows);
  } catch (err) {
    next(err);
  }
}

export async function createEmployee(req, res, next) {
  try {
    const { full_name, position, department_id } = req.body;
    if (!full_name) throw new ApiError(400, "ต้องระบุชื่อพนักงาน");
    const result = await query(
      `INSERT INTO employees (full_name, position, department_id) VALUES ($1, $2, $3) RETURNING *`,
      [full_name, position || null, department_id || null]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    next(err);
  }
}

// DELETE /api/employees/:id -> ลบพนักงานออกจากระบบ
// ถ้ายังไม่เคยมีประวัติยืม-คืนเลย จะลบถาวรจริง
// ถ้าเคยมีประวัติอยู่ (แม้คืนไปแล้ว) database จะกัน DELETE ไว้ (ON DELETE RESTRICT)
// ระบบจะ "ปิดการใช้งาน" (is_active = false) แทนเพื่อรักษาประวัติเก่าไว้ครบ
export async function deleteEmployee(req, res, next) {
  try {
    const { id } = req.params;

    const active = await query(
      `SELECT id FROM custody_records WHERE employee_id = $1 AND status = 'active' LIMIT 1`,
      [id]
    );
    if (active.rows.length) {
      throw new ApiError(400, "พนักงานคนนี้กำลังถืออุปกรณ์อยู่ ต้องคืนอุปกรณ์ให้ครบก่อนจึงจะลบได้");
    }

    try {
      const result = await query(`DELETE FROM employees WHERE id = $1 RETURNING id`, [id]);
      if (!result.rows.length) throw new ApiError(404, "ไม่พบพนักงานนี้ในระบบ");
      return res.json({ deleted: true, id, mode: "hard" });
    } catch (err) {
      if (err.code === "23503") {
        // มีประวัติยืม-คืนเก่าอ้างอิงอยู่ ลบถาวรไม่ได้ -> ปิดการใช้งานแทน
        const result = await query(
          `UPDATE employees SET is_active = false WHERE id = $1 RETURNING id`,
          [id]
        );
        if (!result.rows.length) throw new ApiError(404, "ไม่พบพนักงานนี้ในระบบ");
        return res.json({
          deleted: true,
          id,
          mode: "soft",
          note: "พนักงานคนนี้มีประวัติการยืมอุปกรณ์อยู่ ระบบปิดการใช้งานบัญชีแทนการลบถาวร เพื่อรักษาประวัติการยืม-คืนไว้",
        });
      }
      throw err;
    }
  } catch (err) {
    next(err);
  }
}

// ---- Categories ----
export async function listCategories(req, res, next) {
  try {
    const result = await query(`SELECT * FROM asset_categories ORDER BY name`);
    res.json(result.rows);
  } catch (err) {
    next(err);
  }
}

export async function createCategory(req, res, next) {
  try {
    const { name } = req.body;
    if (!name) throw new ApiError(400, "ต้องระบุชื่อประเภทอุปกรณ์");
    const result = await query(`INSERT INTO asset_categories (name) VALUES ($1) RETURNING *`, [name]);
    res.status(201).json(result.rows[0]);
  } catch (err) {
    next(err);
  }
}

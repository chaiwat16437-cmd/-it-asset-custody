import { query, pool } from "../config/db.js";
import { ApiError } from "../middleware/errorHandler.js";

// GET /api/custody
// Filters: status(active|returned), department_id, employee_id, category_id, overdue=true
// Answers: ใครถืออะไรอยู่ / แผนกไหนมีอุปกรณ์อะไร / อุปกรณ์ที่ยังไม่ได้คืน / ค้นหาตามแผนก-บุคคล-ประเภท
export async function listCustody(req, res, next) {
  try {
    const { status, department_id, employee_id, category_id, overdue } = req.query;
    const conditions = [];
    const params = [];

    if (status) {
      params.push(status);
      conditions.push(`cr.status = $${params.length}`);
    }
    if (department_id) {
      params.push(department_id);
      conditions.push(`cr.department_id = $${params.length}`);
    }
    if (employee_id) {
      params.push(employee_id);
      conditions.push(`cr.employee_id = $${params.length}`);
    }
    if (category_id) {
      params.push(category_id);
      conditions.push(`a.category_id = $${params.length}`);
    }
    if (overdue === "true") {
      conditions.push(`cr.status = 'active' AND cr.due_date IS NOT NULL AND cr.due_date < CURRENT_DATE`);
    }

    const where = conditions.length ? `WHERE ${conditions.join(" AND ")}` : "";

    const result = await query(
      `SELECT cr.*,
              a.asset_code, a.brand, a.model, ac.name AS category_name,
              e.full_name AS employee_name, d.name AS department_name,
              CASE
                WHEN cr.status = 'active' AND cr.due_date < CURRENT_DATE THEN 'overdue'
                WHEN cr.status = 'active' THEN 'on_loan'
                ELSE 'returned'
              END AS loan_status
       FROM custody_records cr
       JOIN assets a ON a.id = cr.asset_id
       JOIN asset_categories ac ON ac.id = a.category_id
       JOIN employees e ON e.id = cr.employee_id
       JOIN departments d ON d.id = cr.department_id
       ${where}
       ORDER BY cr.assigned_date DESC`,
      params
    );

    res.json(result.rows);
  } catch (err) {
    next(err);
  }
}

// GET /api/custody/by-department -> สรุปจำนวนอุปกรณ์ที่แต่ละแผนกถืออยู่ตอนนี้
export async function custodyByDepartment(req, res, next) {
  try {
    const result = await query(
      `SELECT d.id AS department_id, d.name AS department_name, COUNT(cr.id) AS active_assets
       FROM departments d
       LEFT JOIN custody_records cr ON cr.department_id = d.id AND cr.status = 'active'
       GROUP BY d.id, d.name
       ORDER BY d.name`
    );
    res.json(result.rows);
  } catch (err) {
    next(err);
  }
}

// POST /api/custody/checkout -> ยืม/จ่ายอุปกรณ์ให้พนักงาน
export async function checkoutAsset(req, res, next) {
  const client = await pool.connect();
  try {
    const { asset_id, employee_id, department_id, assigned_date, due_date, assigned_by, condition_on_issue, notes } = req.body;

    if (!asset_id || !employee_id || !department_id) {
      throw new ApiError(400, "ต้องระบุ asset_id, employee_id และ department_id");
    }

    await client.query("BEGIN");

    const assetCheck = await client.query("SELECT status FROM assets WHERE id = $1 FOR UPDATE", [asset_id]);
    if (!assetCheck.rows.length) throw new ApiError(404, "ไม่พบอุปกรณ์นี้ในระบบ");
    if (assetCheck.rows[0].status === "retired") {
      throw new ApiError(400, "อุปกรณ์นี้ถูกปลดระวางแล้ว ไม่สามารถยืมได้");
    }

    const custody = await client.query(
      `INSERT INTO custody_records
        (asset_id, employee_id, department_id, assigned_date, due_date, assigned_by, condition_on_issue, notes)
       VALUES ($1, $2, $3, COALESCE($4, CURRENT_DATE), $5, $6, $7, $8)
       RETURNING *`,
      [asset_id, employee_id, department_id, assigned_date || null, due_date || null, assigned_by || null, condition_on_issue || null, notes || null]
    );

    await client.query(`UPDATE assets SET status = 'in_use', updated_at = now() WHERE id = $1`, [asset_id]);

    await client.query("COMMIT");
    res.status(201).json(custody.rows[0]);
  } catch (err) {
    await client.query("ROLLBACK");
    next(err);
  } finally {
    client.release();
  }
}

// POST /api/custody/:id/checkin -> คืนอุปกรณ์
export async function checkinAsset(req, res, next) {
  const client = await pool.connect();
  try {
    const { condition_on_return, notes } = req.body;
    const { id } = req.params;

    await client.query("BEGIN");

    const existing = await client.query(
      `SELECT * FROM custody_records WHERE id = $1 AND status = 'active' FOR UPDATE`,
      [id]
    );
    if (!existing.rows.length) {
      throw new ApiError(404, "ไม่พบรายการยืมนี้ หรือถูกคืนไปแล้ว");
    }

    const updated = await client.query(
      `UPDATE custody_records
       SET returned_date = CURRENT_DATE, status = 'returned',
           condition_on_return = $1, notes = COALESCE($2, notes)
       WHERE id = $3
       RETURNING *`,
      [condition_on_return || null, notes || null, id]
    );

    await client.query(
      `UPDATE assets SET status = 'available', updated_at = now() WHERE id = $1`,
      [existing.rows[0].asset_id]
    );

    await client.query("COMMIT");
    res.json(updated.rows[0]);
  } catch (err) {
    await client.query("ROLLBACK");
    next(err);
  } finally {
    client.release();
  }
}

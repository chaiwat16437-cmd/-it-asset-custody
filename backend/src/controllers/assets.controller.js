import { query } from "../config/db.js";
import { ApiError } from "../middleware/errorHandler.js";

// GET /api/assets  -> list all assets, optional filters: category_id, status, q (search)
export async function listAssets(req, res, next) {
  try {
    const { category_id, status, q } = req.query;
    const conditions = [];
    const params = [];

    if (category_id) {
      params.push(category_id);
      conditions.push(`a.category_id = $${params.length}`);
    }
    if (status) {
      params.push(status);
      conditions.push(`a.status = $${params.length}`);
    }
    if (q) {
      params.push(`%${q}%`);
      conditions.push(
        `(a.asset_code ILIKE $${params.length} OR a.brand ILIKE $${params.length} OR a.model ILIKE $${params.length} OR a.serial_number ILIKE $${params.length})`
      );
    }

    const where = conditions.length ? `WHERE ${conditions.join(" AND ")}` : "";

    const result = await query(
      `SELECT a.*, ac.name AS category_name
       FROM assets a
       JOIN asset_categories ac ON ac.id = a.category_id
       ${where}
       ORDER BY a.created_at DESC`,
      params
    );

    res.json(result.rows);
  } catch (err) {
    next(err);
  }
}

// GET /api/assets/summary  -> count of assets grouped by category (answers "มีอุปกรณ์อะไรบ้าง แบ่งตามประเภท")
export async function assetsSummaryByCategory(req, res, next) {
  try {
    const result = await query(
      `SELECT ac.id AS category_id, ac.name AS category_name,
              COUNT(a.id) AS total,
              COUNT(a.id) FILTER (WHERE a.status = 'available') AS available,
              COUNT(a.id) FILTER (WHERE a.status = 'in_use') AS in_use,
              COUNT(a.id) FILTER (WHERE a.status = 'maintenance') AS maintenance,
              COUNT(a.id) FILTER (WHERE a.status = 'retired') AS retired
       FROM asset_categories ac
       LEFT JOIN assets a ON a.category_id = ac.id
       GROUP BY ac.id, ac.name
       ORDER BY ac.name`
    );
    res.json(result.rows);
  } catch (err) {
    next(err);
  }
}

// GET /api/assets/:id
export async function getAsset(req, res, next) {
  try {
    const result = await query(
      `SELECT a.*, ac.name AS category_name
       FROM assets a JOIN asset_categories ac ON ac.id = a.category_id
       WHERE a.id = $1`,
      [req.params.id]
    );
    if (!result.rows.length) throw new ApiError(404, "ไม่พบอุปกรณ์นี้ในระบบ");
    res.json(result.rows[0]);
  } catch (err) {
    next(err);
  }
}

// GET /api/assets/:id/custody/current -> "อุปกรณ์เครื่องนี้อยู่กับใคร"
export async function getCurrentCustody(req, res, next) {
  try {
    const result = await query(
      `SELECT cr.*, e.full_name AS employee_name, d.name AS department_name
       FROM custody_records cr
       JOIN employees e ON e.id = cr.employee_id
       JOIN departments d ON d.id = cr.department_id
       WHERE cr.asset_id = $1 AND cr.status = 'active'`,
      [req.params.id]
    );
    res.json(result.rows[0] || null);
  } catch (err) {
    next(err);
  }
}

// GET /api/assets/:id/history -> ประวัติยืม-คืนทั้งหมดของเครื่องนี้
export async function getAssetHistory(req, res, next) {
  try {
    const result = await query(
      `SELECT cr.*, e.full_name AS employee_name, d.name AS department_name
       FROM custody_records cr
       JOIN employees e ON e.id = cr.employee_id
       JOIN departments d ON d.id = cr.department_id
       WHERE cr.asset_id = $1
       ORDER BY cr.assigned_date DESC`,
      [req.params.id]
    );
    res.json(result.rows);
  } catch (err) {
    next(err);
  }
}

// POST /api/assets -> เพิ่มอุปกรณ์เข้าระบบ
export async function createAsset(req, res, next) {
  try {
    const { category_id, asset_code, brand, model, serial_number, purchase_date, purchase_price, notes } = req.body;

    if (!category_id || !asset_code) {
      throw new ApiError(400, "ต้องระบุ category_id และ asset_code");
    }

    const result = await query(
      `INSERT INTO assets (category_id, asset_code, brand, model, serial_number, purchase_date, purchase_price, notes)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
       RETURNING *`,
      [category_id, asset_code, brand, model, serial_number, purchase_date || null, purchase_price || null, notes]
    );

    res.status(201).json(result.rows[0]);
  } catch (err) {
    next(err);
  }
}

// PUT /api/assets/:id -> แก้ไขข้อมูลอุปกรณ์
export async function updateAsset(req, res, next) {
  try {
    const { brand, model, serial_number, status, notes } = req.body;
    const result = await query(
      `UPDATE assets
       SET brand = COALESCE($1, brand),
           model = COALESCE($2, model),
           serial_number = COALESCE($3, serial_number),
           status = COALESCE($4, status),
           notes = COALESCE($5, notes),
           updated_at = now()
       WHERE id = $6
       RETURNING *`,
      [brand, model, serial_number, status, notes, req.params.id]
    );
    if (!result.rows.length) throw new ApiError(404, "ไม่พบอุปกรณ์นี้ในระบบ");
    res.json(result.rows[0]);
  } catch (err) {
    next(err);
  }
}

// DELETE /api/assets/:id -> ลบอุปกรณ์ออกจากระบบ
// - ถ้ากำลังถูกยืมอยู่ (active custody) ห้ามลบ ต้องคืนก่อน
// - ถ้าไม่เคยมีประวัติยืม-คืนเลย -> ลบแถวทิ้งจริง
// - ถ้าเคยมีประวัติแล้ว -> ไม่ลบจริง แต่เปลี่ยน status เป็น 'retired' แทน เพื่อรักษาประวัติไว้
export async function deleteAsset(req, res, next) {
  try {
    const { id } = req.params;

    const asset = await query(`SELECT status FROM assets WHERE id = $1`, [id]);
    if (!asset.rows.length) throw new ApiError(404, "ไม่พบอุปกรณ์นี้ในระบบ");

    const activeCustody = await query(
      `SELECT id FROM custody_records WHERE asset_id = $1 AND status = 'active'`,
      [id]
    );
    if (activeCustody.rows.length) {
      throw new ApiError(400, "อุปกรณ์นี้กำลังถูกยืมอยู่ ต้องบันทึกการคืนก่อนจึงจะลบได้");
    }

    const history = await query(`SELECT id FROM custody_records WHERE asset_id = $1 LIMIT 1`, [id]);

    if (!history.rows.length) {
      await query(`DELETE FROM assets WHERE id = $1`, [id]);
      return res.json({ deleted: true, archived: false });
    }

    await query(
      `UPDATE assets SET status = 'retired', updated_at = now() WHERE id = $1`,
      [id]
    );
    res.json({ deleted: false, archived: true, message: "อุปกรณ์นี้มีประวัติการยืม-คืนอยู่ จึงเปลี่ยนสถานะเป็น 'ปลดระวาง' แทนการลบ เพื่อรักษาประวัติไว้" });
  } catch (err) {
    next(err);
  }
}

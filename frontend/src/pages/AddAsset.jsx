import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { createAsset, getCategories, createCategory } from "../api/client";

const emptyForm = {
  category_id: "",
  asset_code: "",
  brand: "",
  model: "",
  serial_number: "",
  purchase_date: "",
  purchase_price: "",
  notes: "",
};

export default function AddAsset() {
  const navigate = useNavigate();
  const [categories, setCategories] = useState([]);
  const [form, setForm] = useState(emptyForm);
  const [newCategory, setNewCategory] = useState("");
  const [showNewCategory, setShowNewCategory] = useState(false);
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const loadCategories = () => getCategories().then(setCategories);

  useEffect(() => {
    loadCategories();
  }, []);

  const update = (key) => (e) => setForm((f) => ({ ...f, [key]: e.target.value }));

  const handleAddCategory = async (e) => {
    e.preventDefault();
    if (!newCategory.trim()) return;
    const created = await createCategory({ name: newCategory.trim() });
    await loadCategories();
    setForm((f) => ({ ...f, category_id: created.id }));
    setNewCategory("");
    setShowNewCategory(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!form.category_id || !form.asset_code) {
      setError("ต้องระบุประเภทอุปกรณ์และรหัสอุปกรณ์เป็นอย่างน้อย");
      return;
    }

    setSubmitting(true);
    try {
      const created = await createAsset({
        ...form,
        purchase_price: form.purchase_price ? Number(form.purchase_price) : null,
        purchase_date: form.purchase_date || null,
      });
      navigate(`/assets/${created.id}`);
    } catch (err) {
      setError(err?.response?.data?.error || "เพิ่มอุปกรณ์ไม่สำเร็จ กรุณาลองใหม่");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-xl space-y-6">
      <div>
        <h1 className="text-lg font-medium text-ink">เพิ่มอุปกรณ์เข้าระบบ</h1>
        <p className="text-sm text-slate">กรอกข้อมูลอุปกรณ์ใหม่ สถานะเริ่มต้นจะเป็น "ว่าง" พร้อมให้ยืมทันที</p>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 text-sm px-4 py-2.5 rounded-md">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="bg-white rounded-lg border border-gray-200 p-5 space-y-4">
        <div>
          <label className="block text-xs text-slate mb-1">ประเภทอุปกรณ์ *</label>
          <div className="flex gap-2">
            <select
              value={form.category_id}
              onChange={update("category_id")}
              className="flex-1 border border-gray-300 rounded-md px-3 py-2 text-sm"
              required
            >
              <option value="">เลือกประเภท</option>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
            <button
              type="button"
              onClick={() => setShowNewCategory((s) => !s)}
              className="text-sm px-3 py-2 border border-gray-300 rounded-md text-slate hover:bg-gray-50"
            >
              + ประเภทใหม่
            </button>
          </div>
          {showNewCategory && (
            <div className="flex gap-2 mt-2">
              <input
                type="text"
                value={newCategory}
                onChange={(e) => setNewCategory(e.target.value)}
                placeholder="ชื่อประเภทอุปกรณ์ใหม่ เช่น Tablet"
                className="flex-1 border border-gray-300 rounded-md px-3 py-1.5 text-sm"
              />
              <button
                type="button"
                onClick={handleAddCategory}
                className="text-sm px-3 py-1.5 bg-ink text-white rounded-md"
              >
                บันทึก
              </button>
            </div>
          )}
        </div>

        <div>
          <label className="block text-xs text-slate mb-1">รหัสอุปกรณ์ (Asset Code) *</label>
          <input
            type="text"
            value={form.asset_code}
            onChange={update("asset_code")}
            placeholder="เช่น LAP-006"
            className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm"
            required
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-xs text-slate mb-1">ยี่ห้อ</label>
            <input
              type="text"
              value={form.brand}
              onChange={update("brand")}
              placeholder="เช่น Dell"
              className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm"
            />
          </div>
          <div>
            <label className="block text-xs text-slate mb-1">รุ่น</label>
            <input
              type="text"
              value={form.model}
              onChange={update("model")}
              placeholder="เช่น Latitude 5440"
              className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm"
            />
          </div>
        </div>

        <div>
          <label className="block text-xs text-slate mb-1">หมายเลขเครื่อง (Serial Number)</label>
          <input
            type="text"
            value={form.serial_number}
            onChange={update("serial_number")}
            className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-xs text-slate mb-1">วันที่ซื้อ</label>
            <input
              type="date"
              value={form.purchase_date}
              onChange={update("purchase_date")}
              className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm"
            />
          </div>
          <div>
            <label className="block text-xs text-slate mb-1">ราคา (บาท)</label>
            <input
              type="number"
              min="0"
              step="0.01"
              value={form.purchase_price}
              onChange={update("purchase_price")}
              className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm"
            />
          </div>
        </div>

        <div>
          <label className="block text-xs text-slate mb-1">หมายเหตุ</label>
          <textarea
            value={form.notes}
            onChange={update("notes")}
            rows={3}
            className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm"
          />
        </div>

        <div className="flex gap-2 pt-2">
          <button
            type="submit"
            disabled={submitting}
            className="bg-accent text-white text-sm px-4 py-2 rounded-md disabled:opacity-50"
          >
            {submitting ? "กำลังบันทึก..." : "บันทึกอุปกรณ์"}
          </button>
          <button
            type="button"
            onClick={() => navigate("/")}
            className="text-sm px-4 py-2 rounded-md text-slate hover:bg-gray-50"
          >
            ยกเลิก
          </button>
        </div>
      </form>
    </div>
  );
}

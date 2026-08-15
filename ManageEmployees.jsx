import { useEffect, useState } from "react";
import { getDepartments, createDepartment, getEmployees, createEmployee, deleteEmployee } from "../api/client";

export default function ManageEmployees() {
  const [departments, setDepartments] = useState([]);
  const [employees, setEmployees] = useState([]);

  const [fullName, setFullName] = useState("");
  const [position, setPosition] = useState("");
  const [departmentId, setDepartmentId] = useState("");

  const [newDept, setNewDept] = useState("");
  const [showNewDept, setShowNewDept] = useState(false);

  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const load = () => {
    getDepartments().then(setDepartments);
    getEmployees({ include_inactive: "true" }).then(setEmployees);
  };

  useEffect(() => {
    load();
  }, []);

  const handleAddDepartment = async (e) => {
    e.preventDefault();
    if (!newDept.trim()) return;
    const created = await createDepartment({ name: newDept.trim() });
    await load();
    setDepartmentId(created.id);
    setNewDept("");
    setShowNewDept(false);
  };

  const handleDeleteEmployee = async (emp) => {
    const confirmed = window.confirm(`ยืนยันลบพนักงาน "${emp.full_name}" ออกจากระบบ?`);
    if (!confirmed) return;
    try {
      const result = await deleteEmployee(emp.id);
      if (result.mode === "soft") {
        alert(result.note);
      }
      load();
    } catch (err) {
      alert(err?.response?.data?.error || "ลบพนักงานไม่สำเร็จ");
    }
  };

  const handleAddEmployee = async (e) => {
    e.preventDefault();
    setError("");

    if (!fullName.trim()) {
      setError("ต้องระบุชื่อพนักงาน");
      return;
    }

    setSubmitting(true);
    try {
      await createEmployee({
        full_name: fullName.trim(),
        position: position.trim() || null,
        department_id: departmentId || null,
      });
      setFullName("");
      setPosition("");
      setDepartmentId("");
      load();
    } catch (err) {
      setError(err?.response?.data?.error || "เพิ่มพนักงานไม่สำเร็จ กรุณาลองใหม่");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-3xl space-y-6">
      <div>
        <h1 className="text-lg font-medium text-ink">จัดการพนักงาน</h1>
        <p className="text-sm text-slate">
          เพิ่มชื่อพนักงานที่นี่ก่อน แล้วจะไปปรากฏในตัวเลือก "มอบให้พนักงาน" ตอนยืมอุปกรณ์ที่หน้ารายละเอียดอุปกรณ์
        </p>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 text-sm px-4 py-2.5 rounded-md">
          {error}
        </div>
      )}

      <form onSubmit={handleAddEmployee} className="bg-white rounded-lg border border-gray-200 p-5 space-y-4">
        <h2 className="text-sm font-medium">เพิ่มพนักงานใหม่</h2>

        <div>
          <label className="block text-xs text-slate mb-1">ชื่อ-นามสกุล *</label>
          <input
            type="text"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            placeholder="เช่น สมชาย ใจดี"
            className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm"
            required
          />
        </div>

        <div>
          <label className="block text-xs text-slate mb-1">ตำแหน่ง</label>
          <input
            type="text"
            value={position}
            onChange={(e) => setPosition(e.target.value)}
            placeholder="เช่น Sales Executive"
            className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm"
          />
        </div>

        <div>
          <label className="block text-xs text-slate mb-1">แผนก</label>
          <div className="flex gap-2">
            <select
              value={departmentId}
              onChange={(e) => setDepartmentId(e.target.value)}
              className="flex-1 border border-gray-300 rounded-md px-3 py-2 text-sm"
            >
              <option value="">ไม่ระบุแผนก</option>
              {departments.map((d) => (
                <option key={d.id} value={d.id}>{d.name}</option>
              ))}
            </select>
            <button
              type="button"
              onClick={() => setShowNewDept((s) => !s)}
              className="text-sm px-3 py-2 border border-gray-300 rounded-md text-slate hover:bg-gray-50 whitespace-nowrap"
            >
              + แผนกใหม่
            </button>
          </div>
          {showNewDept && (
            <div className="flex gap-2 mt-2">
              <input
                type="text"
                value={newDept}
                onChange={(e) => setNewDept(e.target.value)}
                placeholder="ชื่อแผนกใหม่ เช่น Marketing"
                className="flex-1 border border-gray-300 rounded-md px-3 py-1.5 text-sm"
              />
              <button
                type="button"
                onClick={handleAddDepartment}
                className="text-sm px-3 py-1.5 bg-ink text-white rounded-md"
              >
                บันทึก
              </button>
            </div>
          )}
        </div>

        <button
          type="submit"
          disabled={submitting}
          className="bg-accent text-white text-sm px-4 py-2 rounded-md disabled:opacity-50"
        >
          {submitting ? "กำลังบันทึก..." : "เพิ่มพนักงาน"}
        </button>
      </form>

      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        <div className="px-4 py-3 border-b border-gray-100">
          <h2 className="text-sm font-medium">พนักงานทั้งหมด ({employees.length})</h2>
        </div>
        <table className="w-full text-sm">
          <thead className="bg-gray-50 text-slate text-xs uppercase">
            <tr>
              <th className="text-left px-4 py-2">ชื่อ</th>
              <th className="text-left px-4 py-2">แผนก</th>
              <th className="text-left px-4 py-2">ตำแหน่ง</th>
              <th className="text-left px-4 py-2">สถานะ</th>
              <th className="text-left px-4 py-2"></th>
            </tr>
          </thead>
          <tbody>
            {employees.length === 0 && (
              <tr><td colSpan={5} className="px-4 py-6 text-center text-slate">ยังไม่มีพนักงานในระบบ</td></tr>
            )}
            {employees.map((emp) => (
              <tr key={emp.id} className={`border-t border-gray-100 ${!emp.is_active ? "opacity-50" : ""}`}>
                <td className="px-4 py-2.5">{emp.full_name}</td>
                <td className="px-4 py-2.5">{emp.department_name || "-"}</td>
                <td className="px-4 py-2.5 text-slate">{emp.position || "-"}</td>
                <td className="px-4 py-2.5">
                  {emp.is_active ? (
                    <span className="text-xs text-green-700 bg-green-100 px-2 py-0.5 rounded-full">ใช้งานอยู่</span>
                  ) : (
                    <span className="text-xs text-gray-600 bg-gray-200 px-2 py-0.5 rounded-full">ปิดใช้งานแล้ว</span>
                  )}
                </td>
                <td className="px-4 py-2.5 text-right">
                  {emp.is_active && (
                    <button
                      onClick={() => handleDeleteEmployee(emp)}
                      className="text-xs text-red-600 hover:underline"
                    >
                      ลบ
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

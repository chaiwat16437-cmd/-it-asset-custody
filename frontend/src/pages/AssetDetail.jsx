import { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import {
  getAsset,
  getAssetCurrentCustody,
  getAssetHistory,
  getEmployees,
  checkoutAsset,
  checkinAsset,
  deleteAsset,
} from "../api/client";
import StatusBadge from "../components/StatusBadge";

export default function AssetDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [asset, setAsset] = useState(null);
  const [current, setCurrent] = useState(null);
  const [history, setHistory] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [employeeId, setEmployeeId] = useState("");
  const today = new Date().toISOString().slice(0, 10);
  const [assignedDate, setAssignedDate] = useState(today);
  const [dueDate, setDueDate] = useState("");

  const load = () => {
    getAsset(id).then(setAsset);
    getAssetCurrentCustody(id).then(setCurrent);
    getAssetHistory(id).then(setHistory);
  };

  useEffect(() => {
    load();
    getEmployees().then(setEmployees);
  }, [id]);

  const handleCheckout = async (e) => {
    e.preventDefault();
    const emp = employees.find((x) => x.id === employeeId);
    if (!emp) return alert("กรุณาเลือกพนักงาน");
    await checkoutAsset({
      asset_id: id,
      employee_id: emp.id,
      department_id: emp.department_id,
      assigned_date: assignedDate || null,
      due_date: dueDate || null,
    });
    setEmployeeId("");
    setAssignedDate(today);
    setDueDate("");
    load();
  };

  const handleCheckin = async () => {
    if (!current) return;
    await checkinAsset(current.id, {});
    load();
  };

  const handleDelete = async () => {
    if (current) return; // ป้องกันไว้อีกชั้น เผื่อ UI ไม่ทันอัปเดต
    const confirmed = window.confirm(
      `ยืนยันลบอุปกรณ์ "${asset.asset_code}" ออกจากระบบ?\n\nถ้าไม่เคยมีประวัติยืม-คืนเลย จะลบถาวรทันที\nถ้าเคยมีประวัติอยู่แล้ว ระบบจะเปลี่ยนสถานะเป็น "ปลดระวาง" แทน เพื่อรักษาประวัติเก่าไว้`
    );
    if (!confirmed) return;
    try {
      const result = await deleteAsset(id);
      if (result.archived) {
        alert(result.message);
        load();
      } else {
        navigate("/");
      }
    } catch (err) {
      alert(err?.response?.data?.error || "ลบอุปกรณ์ไม่สำเร็จ");
    }
  };

  if (!asset) return <p className="text-slate">กำลังโหลด...</p>;

  return (
    <div className="space-y-6 max-w-3xl">
      <div>
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-lg font-medium text-ink">{asset.asset_code}</h1>
            <p className="text-sm text-slate">
              {asset.category_name} · {asset.brand} {asset.model} · S/N {asset.serial_number || "-"}
            </p>
          </div>
          {!current && (
            <button
              onClick={handleDelete}
              className="text-sm text-red-600 border border-red-200 hover:bg-red-50 px-3 py-1.5 rounded-md"
            >
              ลบอุปกรณ์นี้
            </button>
          )}
        </div>
      </div>

      <div className="bg-white rounded-lg border border-gray-200 p-4 space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-medium">ผู้ครอบครองปัจจุบัน</h2>
          <StatusBadge status={asset.status} />
        </div>

        {current ? (
          <div className="text-sm space-y-1">
            <p><span className="text-slate">พนักงาน:</span> {current.employee_name}</p>
            <p><span className="text-slate">แผนก:</span> {current.department_name}</p>
            <p><span className="text-slate">รับไปวันที่:</span> {current.assigned_date}</p>
            <p><span className="text-slate">กำหนดคืน:</span> {current.due_date || "-"}</p>
            <button
              onClick={handleCheckin}
              className="mt-2 bg-ink text-white text-sm px-3 py-1.5 rounded-md"
            >
              บันทึกการคืนอุปกรณ์
            </button>
          </div>
        ) : (
          <form onSubmit={handleCheckout} className="flex flex-wrap gap-2 items-end text-sm">
            {employees.length === 0 && (
              <p className="w-full text-slate text-xs bg-amber-50 border border-amber-200 rounded-md px-3 py-2">
                ยังไม่มีพนักงานในระบบ{" "}
                <Link to="/employees" className="text-accent font-medium underline">
                  ไปเพิ่มพนักงานก่อน
                </Link>
              </p>
            )}
            <div>
              <label className="block text-xs text-slate mb-1">มอบให้พนักงาน</label>
              <select
                value={employeeId}
                onChange={(e) => setEmployeeId(e.target.value)}
                className="border border-gray-300 rounded-md px-2 py-1.5"
                required
              >
                <option value="">เลือกพนักงาน</option>
                {employees.map((e) => (
                  <option key={e.id} value={e.id}>
                    {e.full_name} ({e.department_name || "ไม่มีแผนก"})
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs text-slate mb-1">วันที่รับไป</label>
              <input
                type="date"
                value={assignedDate}
                onChange={(e) => setAssignedDate(e.target.value)}
                className="border border-gray-300 rounded-md px-2 py-1.5"
                required
              />
            </div>
            <div>
              <label className="block text-xs text-slate mb-1">กำหนดคืน (ถ้ามี)</label>
              <input
                type="date"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                className="border border-gray-300 rounded-md px-2 py-1.5"
              />
            </div>
            <button type="submit" className="bg-accent text-white px-3 py-1.5 rounded-md">
              จ่ายอุปกรณ์
            </button>
          </form>
        )}
      </div>

      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        <div className="px-4 py-3 border-b border-gray-100">
          <h2 className="text-sm font-medium">ประวัติการยืม-คืน</h2>
        </div>
        <table className="w-full text-sm">
          <thead className="bg-gray-50 text-slate text-xs uppercase">
            <tr>
              <th className="text-left px-4 py-2">พนักงาน</th>
              <th className="text-left px-4 py-2">แผนก</th>
              <th className="text-left px-4 py-2">รับไป</th>
              <th className="text-left px-4 py-2">คืนวันที่</th>
              <th className="text-left px-4 py-2">สถานะ</th>
            </tr>
          </thead>
          <tbody>
            {history.length === 0 && (
              <tr><td colSpan={5} className="px-4 py-6 text-center text-slate">ยังไม่มีประวัติ</td></tr>
            )}
            {history.map((h) => (
              <tr key={h.id} className="border-t border-gray-100">
                <td className="px-4 py-2.5">{h.employee_name}</td>
                <td className="px-4 py-2.5">{h.department_name}</td>
                <td className="px-4 py-2.5">{h.assigned_date}</td>
                <td className="px-4 py-2.5">{h.returned_date || "-"}</td>
                <td className="px-4 py-2.5"><StatusBadge status={h.status} /></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { getCustody } from "../api/client";
import StatusBadge from "../components/StatusBadge";

export default function OverdueReport() {
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getCustody({ overdue: "true" }).then(setRecords).finally(() => setLoading(false));
  }, []);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-lg font-medium text-ink">อุปกรณ์ที่ยังไม่ได้คืน (เกินกำหนด)</h1>
        <p className="text-sm text-slate">รายการที่ status = active และ due_date ผ่านมาแล้ว</p>
      </div>

      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 text-slate text-xs uppercase">
            <tr>
              <th className="text-left px-4 py-2">อุปกรณ์</th>
              <th className="text-left px-4 py-2">พนักงาน</th>
              <th className="text-left px-4 py-2">แผนก</th>
              <th className="text-left px-4 py-2">รับไป</th>
              <th className="text-left px-4 py-2">กำหนดคืน</th>
              <th className="text-left px-4 py-2">สถานะ</th>
            </tr>
          </thead>
          <tbody>
            {!loading && records.length === 0 && (
              <tr><td colSpan={6} className="px-4 py-6 text-center text-slate">ไม่มีอุปกรณ์ที่เกินกำหนดคืน</td></tr>
            )}
            {records.map((r) => (
              <tr key={r.id} className="border-t border-gray-100 hover:bg-gray-50">
                <td className="px-4 py-2.5">
                  <Link to={`/assets/${r.asset_id}`} className="text-accent font-medium">{r.asset_code}</Link>
                </td>
                <td className="px-4 py-2.5">{r.employee_name}</td>
                <td className="px-4 py-2.5">{r.department_name}</td>
                <td className="px-4 py-2.5">{r.assigned_date}</td>
                <td className="px-4 py-2.5 text-red-600 font-medium">{r.due_date}</td>
                <td className="px-4 py-2.5"><StatusBadge status="overdue" /></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

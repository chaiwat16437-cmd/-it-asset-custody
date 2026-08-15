import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { getCustodyByDepartment } from "../api/client";

export default function DepartmentSummary() {
  const [rows, setRows] = useState([]);

  useEffect(() => {
    getCustodyByDepartment().then(setRows);
  }, []);

  return (
    <div className="space-y-6">
      <h1 className="text-lg font-medium text-ink">แผนกไหนมีอุปกรณ์อะไรอยู่บ้าง</h1>

      <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
        {rows.map((d) => (
          <Link
            key={d.department_id}
            to={`/custody?department_id=${d.department_id}`}
            className="bg-white p-4 rounded-lg border border-gray-200 hover:border-accent"
          >
            <p className="text-sm text-slate">{d.department_name}</p>
            <p className="text-2xl font-medium text-ink">{d.active_assets}</p>
            <p className="text-xs text-slate">อุปกรณ์ที่ถืออยู่ตอนนี้</p>
          </Link>
        ))}
        {rows.length === 0 && <p className="text-slate">ยังไม่มีข้อมูลแผนก</p>}
      </div>
    </div>
  );
}

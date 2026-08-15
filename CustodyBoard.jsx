import { useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { getCustody, getDepartments, getEmployees, getCategories } from "../api/client";
import StatusBadge from "../components/StatusBadge";

export default function CustodyBoard() {
  const [searchParams] = useSearchParams();
  const [records, setRecords] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [categories, setCategories] = useState([]);
  const [filters, setFilters] = useState({
    status: "active",
    department_id: searchParams.get("department_id") || "",
    employee_id: "",
    category_id: "",
  });

  useEffect(() => {
    getDepartments().then(setDepartments);
    getCategories().then(setCategories);
  }, []);

  useEffect(() => {
    getEmployees(filters.department_id ? { department_id: filters.department_id } : undefined).then(setEmployees);
  }, [filters.department_id]);

  useEffect(() => {
    const params = Object.fromEntries(Object.entries(filters).filter(([, v]) => v));
    getCustody(params).then(setRecords);
  }, [filters]);

  const update = (key) => (e) => setFilters((f) => ({ ...f, [key]: e.target.value }));

  return (
    <div className="space-y-6">
      <h1 className="text-lg font-medium text-ink">ใครถืออุปกรณ์อะไรอยู่</h1>

      <div className="flex flex-wrap gap-3 bg-white p-4 rounded-lg border border-gray-200">
        <Select label="สถานะ" value={filters.status} onChange={update("status")}>
          <option value="active">กำลังยืม</option>
          <option value="returned">คืนแล้ว</option>
          <option value="">ทั้งหมด</option>
        </Select>
        <Select label="แผนก" value={filters.department_id} onChange={update("department_id")}>
          <option value="">ทุกแผนก</option>
          {departments.map((d) => <option key={d.id} value={d.id}>{d.name}</option>)}
        </Select>
        <Select label="พนักงาน" value={filters.employee_id} onChange={update("employee_id")}>
          <option value="">ทุกคน</option>
          {employees.map((e) => <option key={e.id} value={e.id}>{e.full_name}</option>)}
        </Select>
        <Select label="ประเภทอุปกรณ์" value={filters.category_id} onChange={update("category_id")}>
          <option value="">ทุกประเภท</option>
          {categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
        </Select>
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
            {records.length === 0 && (
              <tr><td colSpan={6} className="px-4 py-6 text-center text-slate">ไม่พบข้อมูล</td></tr>
            )}
            {records.map((r) => (
              <tr key={r.id} className="border-t border-gray-100 hover:bg-gray-50">
                <td className="px-4 py-2.5">
                  <Link to={`/assets/${r.asset_id}`} className="text-accent font-medium">
                    {r.asset_code}
                  </Link>
                  <span className="text-slate"> · {r.category_name}</span>
                </td>
                <td className="px-4 py-2.5">{r.employee_name}</td>
                <td className="px-4 py-2.5">{r.department_name}</td>
                <td className="px-4 py-2.5">{r.assigned_date}</td>
                <td className="px-4 py-2.5">{r.due_date || "-"}</td>
                <td className="px-4 py-2.5"><StatusBadge status={r.loan_status} /></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function Select({ label, children, ...props }) {
  return (
    <div>
      <label className="block text-xs text-slate mb-1">{label}</label>
      <select {...props} className="border border-gray-300 rounded-md px-2 py-1.5 text-sm">
        {children}
      </select>
    </div>
  );
}

import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { getAssets, getAssetsSummary } from "../api/client";
import StatusBadge from "../components/StatusBadge";

export default function AssetList() {
  const [summary, setSummary] = useState([]);
  const [assets, setAssets] = useState([]);
  const [categoryFilter, setCategoryFilter] = useState("");
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getAssetsSummary().then(setSummary);
  }, []);

  useEffect(() => {
    setLoading(true);
    getAssets({ category_id: categoryFilter || undefined, q: search || undefined })
      .then(setAssets)
      .finally(() => setLoading(false));
  }, [categoryFilter, search]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-lg font-medium text-ink">อุปกรณ์ทั้งหมด แบ่งตามประเภท</h1>
        <div className="flex gap-2">
          <input
            type="text"
            placeholder="ค้นหารหัส/ยี่ห้อ/รุ่น/S/N"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="border border-gray-300 rounded-md px-3 py-1.5 text-sm w-64"
          />
          <Link
            to="/assets/new"
            className="bg-accent text-white text-sm px-3 py-1.5 rounded-md whitespace-nowrap"
          >
            + เพิ่มอุปกรณ์
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
        <button
          onClick={() => setCategoryFilter("")}
          className={`text-left p-3 rounded-lg border ${
            categoryFilter === "" ? "border-accent bg-accent/5" : "border-gray-200 bg-white"
          }`}
        >
          <p className="text-xs text-slate">ทั้งหมด</p>
          <p className="text-lg font-medium">
            {summary.reduce((sum, c) => sum + Number(c.total), 0)}
          </p>
        </button>
        {summary.map((cat) => (
          <button
            key={cat.category_id}
            onClick={() => setCategoryFilter(cat.category_id)}
            className={`text-left p-3 rounded-lg border ${
              categoryFilter === cat.category_id ? "border-accent bg-accent/5" : "border-gray-200 bg-white"
            }`}
          >
            <p className="text-xs text-slate">{cat.category_name}</p>
            <p className="text-lg font-medium">{cat.total}</p>
            <p className="text-[11px] text-slate">ว่าง {cat.available} / ใช้งาน {cat.in_use}</p>
          </button>
        ))}
      </div>

      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 text-slate text-xs uppercase">
            <tr>
              <th className="text-left px-4 py-2">รหัสอุปกรณ์</th>
              <th className="text-left px-4 py-2">ประเภท</th>
              <th className="text-left px-4 py-2">ยี่ห้อ/รุ่น</th>
              <th className="text-left px-4 py-2">S/N</th>
              <th className="text-left px-4 py-2">สถานะ</th>
            </tr>
          </thead>
          <tbody>
            {loading && (
              <tr><td colSpan={5} className="px-4 py-6 text-center text-slate">กำลังโหลด...</td></tr>
            )}
            {!loading && assets.length === 0 && (
              <tr><td colSpan={5} className="px-4 py-6 text-center text-slate">ไม่พบอุปกรณ์</td></tr>
            )}
            {assets.map((a) => (
              <tr key={a.id} className="border-t border-gray-100 hover:bg-gray-50">
                <td className="px-4 py-2.5">
                  <Link to={`/assets/${a.id}`} className="text-accent font-medium">
                    {a.asset_code}
                  </Link>
                </td>
                <td className="px-4 py-2.5">{a.category_name}</td>
                <td className="px-4 py-2.5">{a.brand} {a.model}</td>
                <td className="px-4 py-2.5 text-slate">{a.serial_number || "-"}</td>
                <td className="px-4 py-2.5"><StatusBadge status={a.status} /></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

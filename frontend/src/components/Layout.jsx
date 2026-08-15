import { NavLink } from "react-router-dom";

const NAV_ITEMS = [
  { to: "/", label: "อุปกรณ์ทั้งหมด", end: true },
  { to: "/assets/new", label: "+ เพิ่มอุปกรณ์" },
  { to: "/employees", label: "พนักงาน" },
  { to: "/custody", label: "การครอบครอง" },
  { to: "/departments", label: "แยกตามแผนก" },
  { to: "/overdue", label: "ยังไม่ได้คืน" },
];

export default function Layout({ children }) {
  return (
    <div className="min-h-screen flex">
      <aside className="w-56 bg-white border-r border-gray-200 p-4 flex flex-col gap-1">
        <div className="px-2 py-3 mb-2">
          <p className="text-sm font-medium text-ink">IT Asset Custody</p>
          <p className="text-xs text-slate">ระบบบริหารครอบครองอุปกรณ์</p>
        </div>
        {NAV_ITEMS.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.end}
            className={({ isActive }) =>
              `px-3 py-2 rounded-md text-sm ${
                isActive ? "bg-accent/10 text-accent font-medium" : "text-slate hover:bg-gray-100"
              }`
            }
          >
            {item.label}
          </NavLink>
        ))}
      </aside>
      <main className="flex-1 p-6">{children}</main>
    </div>
  );
}

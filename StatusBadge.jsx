const STYLES = {
  available: "bg-green-100 text-green-700",
  in_use: "bg-blue-100 text-blue-700",
  maintenance: "bg-amber-100 text-amber-700",
  retired: "bg-gray-200 text-gray-600",
  on_loan: "bg-blue-100 text-blue-700",
  overdue: "bg-red-100 text-red-700",
  returned: "bg-gray-100 text-gray-600",
  active: "bg-blue-100 text-blue-700",
};

const LABELS = {
  available: "ว่าง",
  in_use: "กำลังใช้งาน",
  maintenance: "ซ่อมบำรุง",
  retired: "ปลดระวาง",
  on_loan: "กำลังยืม",
  overdue: "เกินกำหนดคืน",
  returned: "คืนแล้ว",
  active: "กำลังยืม",
};

export default function StatusBadge({ status }) {
  const style = STYLES[status] || "bg-gray-100 text-gray-600";
  const label = LABELS[status] || status;
  return (
    <span className={`inline-block px-2.5 py-1 rounded-full text-xs font-medium ${style}`}>
      {label}
    </span>
  );
}

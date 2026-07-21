export default function DashboardCard({ title, value, subtitle, accent = "default" }) {
  const accentStyles = {
    default: "border-gray-200",
    warning: "border-red-400 bg-red-50",
    success: "border-green-400 bg-green-50",
  };

  return (
    <div className={`rounded-lg shadow p-4 border ${accentStyles[accent]}`}>
      <p className="text-sm text-gray-500">{title}</p>
      <p className="text-3xl font-bold mt-1">{value}</p>
      {subtitle && <p className="text-xs text-gray-400 mt-1">{subtitle}</p>}
    </div>
  )
}
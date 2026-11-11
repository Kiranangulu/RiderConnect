export default function StatCard({
  title,
  value,
  description,
  icon: Icon
}) {
  return (
    <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm">
      <div className="flex justify-between items-center">
        <p className="text-slate-500 text-sm">{title}</p>
        <Icon size={22} className="text-green-600" />
      </div>

      <h2 className="text-2xl font-bold mt-4 text-slate-800">
        {value}
      </h2>

      <p className="text-xs text-slate-500 mt-2">
        {description}
      </p>
    </div>
  );
}
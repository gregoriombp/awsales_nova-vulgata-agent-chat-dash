interface KPICardProps {
  value: string;
  label: string;
  change: string;
  changePositive?: boolean;
}

export default function KPICard({ value, label, change, changePositive = true }: KPICardProps) {
  return (
    <div className="bg-white rounded-xl border border-[#e5e5e5] p-6">
      <div className="text-3xl font-bold text-text-primary mb-1">{value}</div>
      <div className="text-sm text-text-secondary mb-3">{label}</div>
      <div className={`flex items-center gap-1 text-sm font-medium ${
        changePositive ? "text-success" : "text-chart-red"
      }`}>
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M8 12V4M8 4L4 8M8 4L12 8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
        {change}
      </div>
    </div>
  );
}

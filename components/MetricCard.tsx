// @deprecated — use AwStatCard from @/components/ui/AwStatCard
interface MetricCardProps {
  title: string;
  children: React.ReactNode;
}

export default function MetricCard({ title, children }: MetricCardProps) {
  return (
    <div className="bg-white rounded-xl border border-[#e5e5e5] p-6">
      <div className="flex items-center gap-2 mb-4">
        <h3 className="body-lg font-semibold text-text-primary">{title}</h3>
        <button className="text-text-secondary hover:text-text-primary">
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
            <circle cx="8" cy="8" r="6" stroke="currentColor" strokeWidth="1.5"/>
            <path d="M8 6V8L9.5 9.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
          </svg>
        </button>
      </div>
      {children}
    </div>
  );
}

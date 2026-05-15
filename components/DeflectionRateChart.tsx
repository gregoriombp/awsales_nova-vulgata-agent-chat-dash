export default function DeflectionRateChart() {
  const months = ["JAN", "FEB", "MAR", "APR", "MAY", "JUN", "JUL", "AUG", "SEP", "OCT", "NOV", "DEC"];
  
  // Sample data points for the chart (simplified)
  const blueData = [1200, 1500, 1800, 2000, 2200, 2500, 2800, 3000, 3200, 3500, 3800, 4000];
  const redData = [800, 1000, 1200, 1400, 1600, 1800, 2000, 2200, 2400, 2600, 2800, 3000];
  
  const maxValue = 5000;
  const chartHeight = 200;
  const chartWidth = 800;
  
  // Convert data to SVG coordinates
  const getY = (value: number) => chartHeight - (value / maxValue) * chartHeight;
  
  // Create path strings for area charts
  const createAreaPath = (data: number[], offset: number = 0) => {
    let path = `M 0 ${chartHeight}`;
    data.forEach((value, index) => {
      const x = (index / (data.length - 1)) * chartWidth;
      const y = getY(value) + offset;
      path += ` L ${x} ${y}`;
    });
    path += ` L ${chartWidth} ${chartHeight} Z`;
    return path;
  };
  
  const createLinePath = (data: number[], offset: number = 0) => {
    let path = "";
    data.forEach((value, index) => {
      const x = (index / (data.length - 1)) * chartWidth;
      const y = getY(value) + offset;
      path += index === 0 ? `M ${x} ${y}` : ` L ${x} ${y}`;
    });
    return path;
  };

  return (
    <div className="bg-white rounded-xl border border-[#e5e5e5] p-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <h3 className="body-lg font-semibold text-text-primary">Deflection Rate</h3>
          <button className="text-text-secondary hover:text-text-primary">
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
              <circle cx="8" cy="8" r="6" stroke="currentColor" strokeWidth="1.5"/>
              <path d="M8 6V8L9.5 9.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
            </svg>
          </button>
        </div>
      </div>
      
      <div className="mb-4">
        <div className=" font-bold text-text-primary mb-1">75.7%</div>
        <div className="body-sm text-success font-medium">1.3% vs last year</div>
      </div>
      
      <div className="relative" style={{ height: chartHeight, width: "100%" }}>
        <svg width="100%" height={chartHeight} viewBox={`0 0 ${chartWidth} ${chartHeight}`} preserveAspectRatio="none">
          {/* Red area */}
          <path
            d={createAreaPath(redData)}
            fill="url(#redGradient)"
            opacity={0.3}
          />
          {/* Blue area */}
          <path
            d={createAreaPath(blueData)}
            fill="url(#blueGradient)"
            opacity={0.3}
          />
          {/* Red line */}
          <path
            d={createLinePath(redData)}
            stroke="rgb(239, 68, 68)"
            strokeWidth="2"
            fill="none"
          />
          {/* Blue line */}
          <path
            d={createLinePath(blueData)}
            stroke="rgb(59, 130, 246)"
            strokeWidth="2"
            fill="none"
          />
          
          <defs>
            <linearGradient id="redGradient" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="rgb(239, 68, 68)" stopOpacity="0.4" />
              <stop offset="100%" stopColor="rgb(239, 68, 68)" stopOpacity="0" />
            </linearGradient>
            <linearGradient id="blueGradient" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="rgb(59, 130, 246)" stopOpacity="0.4" />
              <stop offset="100%" stopColor="rgb(59, 130, 246)" stopOpacity="0" />
            </linearGradient>
          </defs>
        </svg>
        
        {/* X-axis labels */}
        <div className="absolute bottom-0 left-0 right-0 flex justify-between body-xs text-text-secondary px-2">
          {months.map((month) => (
            <span key={month}>{month}</span>
          ))}
        </div>
        
        {/* Y-axis labels */}
        <div className="absolute right-0 top-0 bottom-0 flex flex-col justify-between body-xs text-text-secondary pr-2" style={{ paddingTop: "10px", paddingBottom: "20px" }}>
          <span>5k</span>
          <span>4k</span>
          <span>3k</span>
          <span>2k</span>
          <span>1k</span>
          <span>0</span>
        </div>
      </div>
    </div>
  );
}

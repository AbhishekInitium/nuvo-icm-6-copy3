
import { PieChart, Pie, Cell, ResponsiveContainer } from 'recharts';

interface CircularProgressProps {
  value: number;
  max: number;
  size?: number;
  strokeWidth?: number;
  label?: string;
  color?: string;
}

export function CircularProgress({
  value,
  max,
  size = 150,
  strokeWidth = 12,
  label,
  color = "#8B5CF6" // Default purple color
}: CircularProgressProps) {
  const percentage = Math.min(Math.round((value / max) * 100), 100);
  
  // Create data for the chart
  const data = [
    { value: percentage, color },
    { value: 100 - percentage, color: '#E5E7EB' }, // Remaining part (gray)
  ];

  return (
    <div className="flex flex-col items-center justify-center h-full">
      <div style={{ width: size, height: size }} className="relative">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              innerRadius={size / 2 - strokeWidth}
              outerRadius={size / 2}
              startAngle={90}
              endAngle={-270}
              dataKey="value"
              strokeWidth={0}
            >
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Pie>
          </PieChart>
        </ResponsiveContainer>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-3xl font-bold">{percentage}%</span>
          {label && <span className="text-sm text-muted-foreground mt-1">{label}</span>}
        </div>
      </div>
    </div>
  );
}

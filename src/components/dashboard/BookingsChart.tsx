
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  ReferenceLine,
  Legend
} from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ChartContainer, ChartTooltipContent } from '@/components/ui/chart';

interface BookingData {
  month: string;
  bookings: number;
  quota: number;
}

interface BookingsChartProps {
  data: BookingData[];
  title?: string;
}

export function BookingsChart({ data, title = "Quarterly Bookings vs Quota" }: BookingsChartProps) {
  // Format currency for the tooltip
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  // Configuration for chart colors
  const chartConfig = {
    bookings: {
      label: "Bookings",
      theme: {
        light: "#8B5CF6", // purple
        dark: "#A78BFA",
      },
    },
    quota: {
      label: "Quota",
      theme: {
        light: "#EF4444", // red
        dark: "#F87171",
      },
    },
  };

  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle>{title}</CardTitle>
      </CardHeader>
      <CardContent className="pl-2">
        <ChartContainer
          className="aspect-[4/3] w-full h-64"
          config={chartConfig}
        >
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={data}
              margin={{ top: 10, right: 10, left: 0, bottom: 20 }}
            >
              <CartesianGrid strokeDasharray="3 3" vertical={false} opacity={0.2} />
              <XAxis 
                dataKey="month" 
                axisLine={false}
                tickLine={false}
                tickMargin={10}
              />
              <YAxis 
                axisLine={false}
                tickLine={false}
                tickFormatter={(value) => `$${value/1000}k`}
                tickMargin={10}
              />
              <Tooltip
                content={({ active, payload }) => {
                  if (!active || !payload?.length) return null;
                  return (
                    <ChartTooltipContent>
                      <div className="grid gap-2">
                        <div className="flex items-center justify-between gap-2">
                          <span className="font-medium">{payload[0]?.payload.month}</span>
                        </div>
                        {payload.map((entry, index) => (
                          <div key={index} className="flex items-center justify-between gap-8">
                            <div className="flex items-center gap-2">
                              <div
                                className="h-2 w-2 rounded"
                                style={{ backgroundColor: entry.color }}
                              />
                              <span className="text-muted-foreground">
                                {entry.name === "bookings" ? "Bookings" : "Quota"}
                              </span>
                            </div>
                            <span>{formatCurrency(entry.value as number)}</span>
                          </div>
                        ))}
                      </div>
                    </ChartTooltipContent>
                  );
                }}
              />
              <Legend verticalAlign="bottom" height={36} />
              <Bar 
                dataKey="bookings" 
                name="Bookings" 
                fill="var(--color-bookings)" 
                radius={[4, 4, 0, 0]} 
                barSize={30} 
              />
              <ReferenceLine 
                y={0} 
                stroke="#e5e7eb" 
              />
              <Bar 
                dataKey="quota" 
                name="Quota" 
                fill="var(--color-quota)" 
                radius={[4, 4, 0, 0]} 
                barSize={10}
                opacity={0.5}
              />
            </BarChart>
          </ResponsiveContainer>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}

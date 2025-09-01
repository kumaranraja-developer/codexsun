
import { TrendingUp } from "lucide-react"
import { Bar, BarChart, CartesianGrid, LabelList, XAxis } from "recharts"
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from './card'
import {
  type ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from './chart'
import { useState } from "react"

// Define types for better type checking and readability
interface ChartDataItem {
  year: number;
  month: string;
  [key: string]: number | string; // Allows for dynamic data keys like 'desktop', 'mobile', etc.
}

interface ChartCountProps {
  data: ChartDataItem[];
  config: ChartConfig;
  initialSelectedYear?: number;
  chartTitle?: string;
  chartDescription?: string;
  barDataKey: string; // The key from your data that represents the bar's value (e.g., "desktop")
  barColor?: string; // Optional: custom color for the bars
  trendingText?: string;
  footerDescription?: string;
}

export default function ChartCount({
  data,
  config,
  initialSelectedYear,
  chartTitle = "Bar chart",
  chartDescription = "Monthly data",
  barDataKey,
  barColor = "var(--chart-1)", // Default color
  trendingText = "Trending up by 5.2% this month",
  footerDescription = "Showing total visitors for the year",
}: ChartCountProps) {
  const years = Array.from(new Set(data.map(d => d.year)));
  const [selectedYear, setSelectedYear] = useState(initialSelectedYear || years[0]);

  const filteredData = data.filter(d => d.year === selectedYear);

  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-center">
          <div>
            <CardTitle>{chartTitle} - Label</CardTitle>
            <CardDescription>{chartDescription} for {selectedYear}</CardDescription>
          </div>
          <select
            value={selectedYear}
            onChange={(e) => setSelectedYear(Number(e.target.value))}
            className="border rounded px-2 py-1 text-sm  bg-background text-foreground"
          >
            {years.map((year) => (
              <option key={year} value={year}>
                {year}
              </option>
            ))}
          </select>
        </div>
      </CardHeader>

      <CardContent>
        <ChartContainer config={config}>
          <BarChart
            accessibilityLayer
            data={filteredData}
            margin={{ top: 20 }}
          >
            <CartesianGrid vertical={false} />
            <XAxis
              dataKey="month"
              tickLine={false}
              tickMargin={10}
              axisLine={false}
              tickFormatter={(value) => value.slice(0, 3)}
            />
            <ChartTooltip
              cursor={false}
              content={<ChartTooltipContent hideLabel />}
            />
            <Bar dataKey={barDataKey} fill={barColor} radius={8}>
              <LabelList
                position="top"
                offset={12}
                className="fill-foreground"
                fontSize={12}
              />
            </Bar>
          </BarChart>
        </ChartContainer>
      </CardContent>

      <CardFooter className="flex-col items-start gap-2 text-sm">
        <div className="flex gap-2 font-medium leading-none">
          {trendingText} <TrendingUp className="h-4 w-4" />
        </div>
        <div className="leading-none text-muted-foreground">
          {footerDescription} {selectedYear}
        </div>
      </CardFooter>
    </Card>
  )
}
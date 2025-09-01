;

import { useState, useMemo } from "react";
import { TrendingUp } from "lucide-react";
import { Bar, BarChart, CartesianGrid, XAxis } from "recharts";

import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "./card";

import {
  type ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "./chart";

interface ChartDataItem {
  month: string;
  year: number;
  [key: string]: string | number;
}

interface ChartProps {
  data: ChartDataItem[];
  config: ChartConfig;
  title?: string;
  description?: string;
}

export default function Chart({
  data,
  config,
  title = "Bar chart - Filter by Year",
  description = "Showing total visitors for selected year",
}: ChartProps) {
  const years = [...new Set(data.map((d) => d.year))].sort((a, b) => b - a);
  const currentYear = new Date().getFullYear();
  const defaultYear = years.includes(currentYear)
    ? String(currentYear)
    : String(years[0]);

  const [selectedYear, setSelectedYear] = useState(defaultYear);

  const filteredData = useMemo(() => {
    return data
      .filter((d) => d.year === parseInt(selectedYear))
      .sort((a, b) => {
        const monthOrder = [
          "January", "February", "March", "April", "May", "June",
          "July", "August", "September", "October", "November", "December",
        ];
        return (
          monthOrder.indexOf(a.month) - monthOrder.indexOf(b.month)
        );
      });
  }, [selectedYear, data]);

  return (
    <Card>
      <CardHeader>
        <div className="flex flex-row justify-between items-center ">
          <div>
            <CardTitle>{title}</CardTitle>
            <CardDescription className="mt-3">
              {description}
            </CardDescription>
          </div>
          <div>
            <select
              value={selectedYear}
              onChange={(e) => setSelectedYear(e.target.value)}
              className="bg-card-background text-foreground text-sm border border-ring p-2 rounded"
            >
              {years.map((y) => (
                <option key={y} value={y}>
                  {y}
                </option>
              ))}
            </select>
          </div>
        </div>
      </CardHeader>

      <CardContent>
        <ChartContainer config={config}>
          <BarChart data={filteredData}>
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
              content={<ChartTooltipContent indicator="dashed" />}
            />
            {Object.keys(config).map((key) => (
              <Bar
                key={key}
                dataKey={key}
                fill={config[key].color}
                radius={4}
              />
            ))}
          </BarChart>
        </ChartContainer>
      </CardContent>

      <CardFooter className="flex-col items-start gap-2 text-sm">
        <div className="flex gap-2 font-medium leading-none">
          Trending up by 5.2% this month <TrendingUp className="h-4 w-4" />
        </div>
        <div className="leading-none text-muted-foreground">{description}</div>
      </CardFooter>
    </Card>
  );
}

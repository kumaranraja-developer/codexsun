

import { useState, useMemo } from "react"
import { TrendingUp } from "lucide-react"
import {
  Area,
  AreaChart,
  CartesianGrid,
  XAxis,
  YAxis,
} from "recharts"

import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from './card'
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from './chart'

interface ChartLineProps {
  title?: string
  description?: string
  data: { year: number; month: string; [key: string]: any }[]
  config: ChartConfig
  dataKeys: string[] // e.g. ['desktop', 'mobile']
  defaultYear?: number
}

export default function ChartLine({
  title = "Area chart",
  description = "Showing visitors for",
  data,
  config,
  dataKeys,
  defaultYear,
}: ChartLineProps) {
  const years = [...new Set(data.map((d) => d.year))].sort((a, b) => b - a)
  const initialYear = defaultYear ?? new Date().getFullYear()
  const [selectedYear, setSelectedYear] = useState(
    years.includes(initialYear) ? String(initialYear) : String(years[0])
  )

  const filteredData = useMemo(() => {
    return data
      .filter((d) => d.year === parseInt(selectedYear))
      .sort((a, b) => {
        const months = [
          "January", "February", "March", "April", "May", "June",
          "July", "August", "September", "October", "November", "December"
        ]
        return months.indexOf(a.month) - months.indexOf(b.month)
      })
  }, [selectedYear, data])

  return (
    <Card>
      <CardHeader>
        <div className="flex flex-row justify-between items-center">
          <div>
            <CardTitle>{title}</CardTitle>
            <CardDescription>
              {description} {selectedYear}
            </CardDescription>
          </div>
          <div>
            <select
              value={selectedYear}
              onChange={(e) => setSelectedYear(e.target.value)}
              className="bg-card-background text-foreground text-sm border p-2 rounded"
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
          <AreaChart
            accessibilityLayer
            data={filteredData}
            margin={{ left: -20, right: 12 }}
          >
            <CartesianGrid vertical={false} />
            <XAxis
              dataKey="month"
              tickLine={false}
              axisLine={false}
              tickMargin={8}
              tickFormatter={(value) => value.slice(0, 3)}
            />
            <YAxis
              tickLine={false}
              axisLine={false}
              tickMargin={8}
              tickCount={3}
            />
            <ChartTooltip cursor={false} content={<ChartTooltipContent />} />

            {dataKeys.map((key, index) => (
              <Area
                key={key}
                dataKey={key}
                type="natural"
                fill={`var(--color-chart-${index + 1})`}
                stroke={`var(--color-chart-${(index + 2) % 6 + 1})`}
                fillOpacity={0.4}
                stackId="a"
              />
            ))}
          </AreaChart>
        </ChartContainer>
      </CardContent>

      <CardFooter>
        <div className="flex w-full items-start gap-2 text-sm">
          <div className="grid gap-2">
            <div className="flex items-center gap-2 font-medium leading-none">
              Trending up by 5.2% this month <TrendingUp className="h-4 w-4" />
            </div>
            <div className="flex items-center gap-2 leading-none text-muted-foreground">
              January - June {selectedYear}
            </div>
          </div>
        </div>
      </CardFooter>
    </Card>
  )
}

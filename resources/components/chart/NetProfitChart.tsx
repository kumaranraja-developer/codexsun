

import { TrendingUp } from "lucide-react"
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  LabelList,
} from "recharts"

import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "./card"
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "./chart"

interface NetIncomeChartProps {
  title?: string
  description?: string
  data: { [key: string]: any }[]
  dataKey: string
  labelKey: string
  chartConfig?: ChartConfig
  positiveColor?: string
  negativeColor?: string
  footerInfo?: string
  trend?: string
}

export function NetIncomeChart({
  title = "Bar chart",
  description = "",
  data,
  dataKey,
  labelKey,
  chartConfig = {
    [dataKey]: {
      label: dataKey,
    },
  },
  positiveColor = "var(--profit)",
  negativeColor = "var(--loss)",
  footerInfo = "Showing data for the selected period",
  trend = "Trending",
}: NetIncomeChartProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        {description && <CardDescription>{description}</CardDescription>}
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig}>
          <BarChart data={data}>
            <CartesianGrid vertical={false} />
            <ChartTooltip
              cursor={false}
              content={<ChartTooltipContent hideLabel hideIndicator />}
            />
            <Bar dataKey={dataKey}>
              <LabelList dataKey={labelKey} position="top" />
              {data.map((item, index) => (
                <Cell
                  key={`cell-${index}`}
                  fill={item[dataKey] > 0 ? positiveColor : negativeColor}
                />
              ))}
            </Bar>
          </BarChart>
        </ChartContainer>
      </CardContent>
      <CardFooter className="flex-col items-start gap-2 text-sm">
        <div className="flex gap-2 leading-none font-medium">
          {trend} <TrendingUp className="h-4 w-4" />
        </div>
        <div className="text-muted-foreground leading-none">
          {footerInfo}
        </div>
      </CardFooter>
    </Card>
  )
}

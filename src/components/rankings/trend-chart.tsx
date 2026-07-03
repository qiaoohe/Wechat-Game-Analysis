"use client";

import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { GameTrendPoint } from "@/lib/types";
import { formatDateLabel } from "@/lib/utils";

interface TrendChartProps {
  data: GameTrendPoint[];
  title?: string;
}

export function TrendChart({ data, title = "排名趋势" }: TrendChartProps) {
  const chartData = data.map((point) => ({
    ...point,
    label: formatDateLabel(point.date),
  }));

  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
      </CardHeader>
      <CardContent>
        {chartData.length === 0 ? (
          <div className="flex h-64 items-center justify-center text-sm text-zinc-400">
            暂无历史数据
          </div>
        ) : (
          <div className="h-52 w-full sm:h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis
                  dataKey="label"
                  tick={{ fill: "#71717a", fontSize: 12 }}
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis
                  reversed
                  domain={["dataMin - 1", "dataMax + 1"]}
                  tick={{ fill: "#71717a", fontSize: 12 }}
                  axisLine={false}
                  tickLine={false}
                />
                <Tooltip
                  contentStyle={{
                    borderRadius: 12,
                    border: "1px solid #e4e4e7",
                    boxShadow: "0 8px 24px rgba(0,0,0,0.06)",
                  }}
                  formatter={(value) => [`#${value}`, "排名"]}
                  labelFormatter={(label) => `日期 ${label}`}
                />
                <Line
                  type="monotone"
                  dataKey="rank"
                  stroke="var(--primary)"
                  strokeWidth={2}
                  dot={{ r: 3, fill: "var(--primary)" }}
                  activeDot={{ r: 5 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

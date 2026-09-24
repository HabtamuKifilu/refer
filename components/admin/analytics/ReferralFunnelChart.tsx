"use client";

import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { Card } from "@/components/ui/card";
import type { ReferralFunnelAnalytics } from "@/lib/admin/analytics";

type ReferralFunnelChartProps = {
  data: ReferralFunnelAnalytics;
};

const STAGES = [
  { key: "clicks", label: "Clicks" },
  { key: "registered", label: "Registered" },
  { key: "qualified", label: "Qualified" },
  { key: "completed", label: "Completed" },
] as const;

export function ReferralFunnelChart({
  data,
}: ReferralFunnelChartProps) {
  const chartData = STAGES.map((stage, index) => {
    const value = data[stage.key];
    const previousValue =
      index === 0 ? null : data[STAGES[index - 1].key];

    return {
      stage: stage.label,
      count: value,
      conversion:
        previousValue && previousValue > 0
          ? Math.round((value / previousValue) * 100)
          : null,
    };
  });

  return (
    <Card className="p-5">
      <div>
        <h2 className="font-semibold">Referral funnel</h2>
        <p className="text-muted mt-1 text-sm">
          How referral traffic progresses from a click to a completed
          referral. Each percentage shows conversion from the previous stage.
        </p>
      </div>

      <div className="mt-5 h-72 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={chartData}
            margin={{ top: 8, right: 8, left: 0, bottom: 8 }}
          >
            <CartesianGrid vertical={false} stroke="var(--color-brand-soft)" />
            <XAxis dataKey="stage" stroke="var(--color-muted)" />
            <YAxis allowDecimals={false} stroke="var(--color-muted)" />
            <Tooltip
              formatter={(value, name, item) => {
                if (name === "count") {
                  const conversion = item.payload.conversion;
                  return [
                    `${value} referrals`,
                    conversion === null
                      ? "Stage count"
                      : `Stage count · ${conversion}% conversion`,
                  ];
                }

                return [value, name];
              }}
            />
            <Bar dataKey="count" name="Count" fill="#4338ca" radius={[6, 6, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
        {chartData.map((item) => (
          <div key={item.stage} className="rounded-lg border p-3">
            <p className="text-muted text-xs">{item.stage}</p>
            <p className="mt-1 text-lg font-semibold">{item.count}</p>
            {item.conversion !== null ? (
              <p className="text-muted mt-1 text-xs">
                {item.conversion}% from previous stage
              </p>
            ) : (
              <p className="text-muted mt-1 text-xs">Starting stage</p>
            )}
          </div>
        ))}
      </div>
    </Card>
  );
}

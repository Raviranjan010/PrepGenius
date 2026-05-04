import { useMemo, useState } from "react";

interface ActivityHeatmapProps {
  activeDays: string[]; // ISO date strings like "2026-05-01"
}

const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
const DAYS = ["", "Mon", "", "Wed", "", "Fri", ""];

function getLevel(count: number): number {
  if (count === 0) return 0;
  if (count === 1) return 1;
  if (count <= 3) return 2;
  if (count <= 5) return 3;
  return 4;
}

export const ActivityHeatmap = ({ activeDays }: ActivityHeatmapProps) => {
  const [tooltip, setTooltip] = useState<{ text: string; x: number; y: number } | null>(null);

  const { weeks, monthLabels } = useMemo(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Count occurrences per date
    const countMap: Record<string, number> = {};
    activeDays.forEach((d) => {
      countMap[d] = (countMap[d] || 0) + 1;
    });

    // Build 52 weeks of data (364 days back from today)
    const weeks: { date: Date; count: number; dateStr: string }[][] = [];
    const startDate = new Date(today);
    startDate.setDate(startDate.getDate() - 363); // 364 days including today

    // Adjust start to the beginning of the week (Sunday)
    const dayOfWeek = startDate.getDay();
    startDate.setDate(startDate.getDate() - dayOfWeek);

    const currentDate = new Date(startDate);
    let currentWeek: { date: Date; count: number; dateStr: string }[] = [];

    while (currentDate <= today) {
      const dateStr = currentDate.toISOString().split("T")[0];
      currentWeek.push({
        date: new Date(currentDate),
        count: countMap[dateStr] || 0,
        dateStr,
      });

      if (currentWeek.length === 7) {
        weeks.push(currentWeek);
        currentWeek = [];
      }

      currentDate.setDate(currentDate.getDate() + 1);
    }

    if (currentWeek.length > 0) {
      weeks.push(currentWeek);
    }

    // Calculate month labels
    const monthLabels: { label: string; col: number }[] = [];
    let lastMonth = -1;
    weeks.forEach((week, weekIndex) => {
      const firstDay = week[0];
      if (firstDay) {
        const month = firstDay.date.getMonth();
        if (month !== lastMonth) {
          monthLabels.push({ label: MONTHS[month], col: weekIndex });
          lastMonth = month;
        }
      }
    });

    return { weeks, monthLabels };
  }, [activeDays]);

  const totalContributions = activeDays.length;

  return (
    <div className="w-full">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-semibold text-foreground">
          {totalContributions} interviews in the last year
        </h3>
      </div>

      <div className="overflow-x-auto">
        <div className="inline-block">
          {/* Month labels */}
          <div className="flex mb-1 ml-8">
            {monthLabels.map((m, i) => (
              <span
                key={i}
                className="text-[10px] text-muted-foreground/50"
                style={{
                  position: "relative",
                  left: `${m.col * 14}px`,
                  marginRight: i < monthLabels.length - 1
                    ? `${(monthLabels[i + 1]?.col - m.col) * 14 - 28}px`
                    : 0,
                }}
              >
                {m.label}
              </span>
            ))}
          </div>

          <div className="flex gap-0.5">
            {/* Day labels */}
            <div className="flex flex-col gap-0.5 mr-1">
              {DAYS.map((day, i) => (
                <div key={i} className="w-6 h-[12px] flex items-center justify-end pr-1">
                  <span className="text-[9px] text-muted-foreground/40">{day}</span>
                </div>
              ))}
            </div>

            {/* Grid */}
            {weeks.map((week, wi) => (
              <div key={wi} className="flex flex-col gap-0.5">
                {week.map((day, di) => (
                  <div
                    key={di}
                    className={`w-[12px] h-[12px] heatmap-cell heatmap-level-${getLevel(day.count)}`}
                    onMouseEnter={(e) => {
                      const rect = e.currentTarget.getBoundingClientRect();
                      setTooltip({
                        text: `${day.count} interview${day.count !== 1 ? "s" : ""} on ${day.date.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}`,
                        x: rect.left + rect.width / 2,
                        y: rect.top - 8,
                      });
                    }}
                    onMouseLeave={() => setTooltip(null)}
                  />
                ))}
              </div>
            ))}
          </div>

          {/* Legend */}
          <div className="flex items-center justify-end gap-1 mt-3">
            <span className="text-[10px] text-muted-foreground/40 mr-1">Less</span>
            {[0, 1, 2, 3, 4].map((level) => (
              <div key={level} className={`w-[12px] h-[12px] rounded-sm heatmap-level-${level}`} />
            ))}
            <span className="text-[10px] text-muted-foreground/40 ml-1">More</span>
          </div>
        </div>
      </div>

      {/* Tooltip */}
      {tooltip && (
        <div
          className="fixed z-[100] bg-card border border-border/50 rounded-lg px-3 py-1.5 shadow-xl pointer-events-none animate-scale-in"
          style={{
            left: tooltip.x,
            top: tooltip.y,
            transform: "translate(-50%, -100%)",
          }}
        >
          <span className="text-xs text-foreground">{tooltip.text}</span>
        </div>
      )}
    </div>
  );
};

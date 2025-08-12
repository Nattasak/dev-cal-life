"use client";

import { useMemo } from "react";

interface LifeCalendarProps {
  age: number;
  expectancyYears: number; // dynamic expectancy (years)
  yearsLeftYears?: number; // mirrors realtime breakdown
  lang?: "th" | "en";
}

export default function LifeCalendar({
  age,
  expectancyYears,
  yearsLeftYears,
  lang = "th",
}: LifeCalendarProps) {
  const years = Math.max(
    0,
    Math.min(expectancyYears, Math.floor(expectancyYears))
  );
  const cols = 17; // 17 x 5 grid = 85 squares
  // const rows = Math.ceil(years / cols);

  const items = useMemo(
    () => Array.from({ length: years }, (_, i) => i),
    [years]
  );

  const totalYearsLabel = Math.round(expectancyYears);
  const elapsedYears = Math.max(0, Math.min(Math.floor(age), years));
  const leftY = yearsLeftYears ?? Math.max(0, expectancyYears - age);
  const remainingYears = Math.max(0, Math.round(leftY));
  const remainingMonths = Math.max(0, Math.round(leftY * 12));

  const label =
    lang === "th"
      ? {
          title: `ปฏิทินชีวิต (ประมาณ ${totalYearsLabel} ปี)`,
          legendPast: "ผ่านไปแล้ว",
          legendNow: "ปีนี้",
          legendLeft: "ที่เหลือ",
          pastCount: `${elapsedYears} ปี`,
          leftCount: `~${remainingYears} ปี (~${remainingMonths} เดือน)`,
        }
      : {
          title: `Life calendar (~${totalYearsLabel} years)`,
          legendPast: "Past",
          legendNow: "This year",
          legendLeft: "Remaining",
          pastCount: `${elapsedYears} yrs`,
          leftCount: `~${remainingYears} yrs (~${remainingMonths} mo)`,
        };

  return (
    <div className="glass-card">
      <div className="flex items-center justify-between mb-2">
        <h2 className="section-title m-0">{label.title}</h2>
        <div className="flex items-center gap-4 text-xs subtle">
          <span className="inline-flex items-center gap-1">
            <LegendDot className="bg-black/70 dark:bg-white/80" />
            <span>{label.legendPast}</span>
            <span className="ml-1 text-black/60 dark:text-white/60">
              {label.pastCount}
            </span>
          </span>
          <span className="inline-flex items-center gap-1">
            <LegendDot className="ring-2 ring-fuchsia-500 bg-black/30 dark:bg-white/30" />
            <span>{label.legendNow}</span>
          </span>
          <span className="inline-flex items-center gap-1">
            <LegendDot className="bg-gradient-to-r from-emerald-400/70 to-cyan-400/70" />
            <span>{label.legendLeft}</span>
            <span className="ml-1 text-black/60 dark:text-white/60">
              {label.leftCount}
            </span>
          </span>
        </div>
      </div>
      <div
        className="grid gap-1"
        style={{ gridTemplateColumns: `repeat(${cols}, minmax(0, 1fr))` }}
        aria-label="life-calendar"
      >
        {items.map((i) => {
          const isPast = i < age;
          const isNow = i === Math.floor(age);
          const base =
            "year-cell h-6 transition-all duration-300 text-[10px] leading-none";
          const className = isNow
            ? `${base} year-now rounded-sm pop`
            : isPast
            ? `${base} year-past shape-past`
            : `${base} year-left shape-left sweep`;
          const gapClass = (i + 1) % 5 === 0 ? "mr-2" : "";
          const leftYears = Math.max(
            0,
            Math.round(yearsLeftYears ?? expectancyYears - age)
          );
          const leftMonths = Math.max(
            0,
            Math.round((yearsLeftYears ?? expectancyYears - age) * 12)
          );
          const leftWeeks = Math.max(
            0,
            Math.round(((yearsLeftYears ?? expectancyYears - age) * 365.25) / 7)
          );
          const title = isNow
            ? `${lang === "th" ? "ปีนี้" : "this year"}`
            : isPast
            ? `${lang === "th" ? "ผ่านไปแล้ว" : "past"}`
            : `${
                lang === "th" ? "ที่เหลือ" : "remaining"
              } ~${leftYears}y/${leftMonths}m/${leftWeeks}w`;
          const num = i + 1; // Continuous 1..N for clear counting
          return (
            <div
              key={i}
              className={`${className} ${gapClass}`}
              title={`${i + 1} - ${title}`}
            >
              <span>{num}</span>
            </div>
          );
        })}
      </div>
      <p className="text-xs subtle mt-2">
        {lang === "th"
          ? "แรงบันดาลใจจากแนวคิด Life Calendar เพื่อเห็นภาพเวลาที่เหลือ"
          : "Inspired by the Life Calendar concept to visualize time left."}
      </p>
    </div>
  );
}

function LegendDot({ className }: { className: string }) {
  return <span className={`inline-block size-3 rounded-sm ${className}`} />;
}

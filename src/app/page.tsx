"use client";

import { useEffect, useMemo, useState } from "react";
import InfoIcon from "@/components/InfoIcon";
import LifeCalendar from "@/components/LifeCalendar";
import {
  type HappinessInputs,
  generateRecommendationsBilingual,
  estimateAdjustedExpectancy,
} from "@/lib/happiness";
import {
  inputsFromQuery,
  inputsToQuery,
  loadInputsFromStorage,
  saveInputsToStorage,
  MINIMAL_KEYS,
  getStoredTheme,
} from "@/lib/persist";

// Minimal inputs: age, sleep, exercise, stress
const defaultInputs: HappinessInputs = {
  age: 30,
  sleepHoursPerNight: 7,
  exerciseHoursPerWeek: 2.5,
  socialContactsPerWeek: 3,
  mindfulnessMinutesPerDay: 10,
  purposeScore: 6,
  incomeSatisfaction: 6,
  gratitudeDaysPerWeek: 2,
  screenTimeHoursPerDay: 3,
  natureHoursPerWeek: 1,
  workHoursPerWeek: 40,
  stressLevel: 5,
  pastSelfReport: 6,
  planAdherencePercent: 60,
};

function NumberInput({
  label,
  value,
  onChange,
  min,
  max,
  step = 1,
  infoTitle,
  infoDetails,
}: {
  label: string;
  value: number;
  onChange: (n: number) => void;
  min?: number;
  max?: number;
  step?: number;
  infoTitle: string;
  infoDetails: string;
}) {
  const [raw, setRaw] = useState<string>(
    Number.isFinite(value) ? String(value) : ""
  );
  const [lastCommitted, setLastCommitted] = useState<number>(value);

  useEffect(() => {
    setRaw(Number.isFinite(value) ? String(value) : "");
    setLastCommitted(value);
  }, [value]);

  function commit(input: string) {
    const parsed = parseFloat(input.replace(/,/g, "."));
    if (Number.isFinite(parsed)) {
      let next = parsed;
      if (typeof step === "number" && step > 0) {
        const decimals = String(step).includes(".")
          ? String(step).split(".")[1].length
          : 0;
        next = Number((Math.round(next / step) * step).toFixed(decimals));
      }
      if (typeof min === "number") next = Math.max(min, next);
      if (typeof max === "number") next = Math.min(max, next);
      setRaw(String(next));
      setLastCommitted(next);
      onChange(next);
    } else {
      setRaw(String(lastCommitted));
    }
  }

  return (
    <label className="flex flex-col gap-1">
      <span className="text-sm font-medium text-black/80 dark:text-white/80 flex items-center">
        {label}
        <InfoIcon title={infoTitle} details={infoDetails} />
      </span>
      <input
        type="text"
        inputMode="decimal"
        pattern="[0-9]*[.,]?[0-9]*"
        className="input"
        value={raw}
        onChange={(e) => setRaw(e.target.value)}
        onBlur={(e) => commit(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Enter") {
            e.currentTarget.blur();
          } else if (e.key === "Escape") {
            setRaw(String(lastCommitted));
            (e.target as HTMLInputElement).blur();
          }
        }}
      />
    </label>
  );
}

function TimeLeftDetails({
  years,
  lang,
}: {
  years: number;
  lang: "th" | "en";
}) {
  const days = Math.max(0, Math.round(years * 365.25));
  const months = Math.max(0, Math.round(years * 12));
  const weeks = Math.max(0, Math.round(days / 7));
  const hours = Math.max(0, Math.round(days * 24));
  const yearsRounded = Math.max(0, Math.round(years));

  const items = [
    { key: "years", labelTh: "ปี", labelEn: "years", value: yearsRounded },
    { key: "months", labelTh: "เดือน", labelEn: "months", value: months },
    { key: "weeks", labelTh: "สัปดาห์", labelEn: "weeks", value: weeks },
    { key: "days", labelTh: "วัน", labelEn: "days", value: days },
    { key: "hours", labelTh: "ชั่วโมง", labelEn: "hours", value: hours },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-5 gap-4">
      {items.map((m) => (
        <div key={m.key} className="metric-card items-center text-center">
          <div className="text-sm subtle">
            {lang === "th" ? m.labelTh : m.labelEn}
          </div>
          <div className="metric-value tabular-nums">
            {m.value.toLocaleString()}
          </div>
        </div>
      ))}
    </div>
  );
}

export default function Home() {
  const [inputs, setInputs] = useState<HappinessInputs>(defaultInputs);
  const [lang, setLang] = useState<"th" | "en">("th");
  const [mounted, setMounted] = useState(false);

  const recommendationsBi = useMemo(
    () => generateRecommendationsBilingual(inputs),
    [inputs]
  );

  const update = (key: keyof HappinessInputs) => (n: number) =>
    setInputs((prev) => ({ ...prev, [key]: Number.isFinite(n) ? n : 0 }));

  // Load from URL/localStorage on mount
  useEffect(() => {
    const fromQuery = inputsFromQuery(window.location.search);
    const stored = loadInputsFromStorage() ?? {};
    const merged = {
      ...defaultInputs,
      ...stored,
      ...fromQuery,
    } as HappinessInputs;
    setInputs(merged);
    // Theme bootstrap
    const t = getStoredTheme();
    if (t) {
      document.documentElement.classList.toggle("dark", t === "dark");
    }
    setMounted(true);
  }, []);

  // Persist and update share URL
  useEffect(() => {
    if (!mounted) return;
    saveInputsToStorage(inputs);
    const q = inputsToQuery(inputs, MINIMAL_KEYS);
    const url = `${window.location.pathname}?${q}`;
    window.history.replaceState(null, "", url);
  }, [inputs, mounted]);

  // Theme is initialized from storage; no manual toggle in UI per request

  return (
    <div className="min-h-screen p-6 sm:p-10 max-w-5xl mx-auto flex flex-col gap-8 bg-gradient-to-br from-sky-100 via-white to-rose-100 dark:from-neutral-900 dark:via-neutral-950 dark:to-neutral-900">
      <header className="flex flex-col gap-1 relative">
        <h1 className="text-3xl sm:text-4xl font-semibold bg-gradient-to-r from-fuchsia-600 to-cyan-600 bg-clip-text text-transparent">
          ปฏิทินชีวิต (Life Calendar)
        </h1>
        <p className="text-black/70 dark:text-white/70">
          กรอกเพียง 4 ช่อง แล้วเห็นเวลาโดยประมาณที่เหลืออยู่แบบเรียลไทม์
          ทั้งเป็นปี เดือน สัปดาห์ วัน ชั่วโมง
          เพื่อใช้กับสิ่งที่สำคัญและคนที่คุณรัก
        </p>
        <div className="absolute right-0 top-0 flex items-center gap-2">
          <button
            className="pill-btn"
            onClick={() => setLang((l) => (l === "th" ? "en" : "th"))}
          >
            {lang === "th" ? "EN" : "TH"}
          </button>
        </div>
      </header>

      {/* HERO: Life calendar (adjusted expectancy) */}
      <LifeCalendar
        age={inputs.age}
        expectancyYears={useMemo(
          () =>
            estimateAdjustedExpectancy({
              age: inputs.age,
              sleepHoursPerNight: inputs.sleepHoursPerNight,
              exerciseHoursPerWeek: inputs.exerciseHoursPerWeek,
              stressLevel: inputs.stressLevel,
            }),
          [
            inputs.age,
            inputs.sleepHoursPerNight,
            inputs.exerciseHoursPerWeek,
            inputs.stressLevel,
          ]
        )}
        yearsLeftYears={useMemo(
          () =>
            estimateAdjustedExpectancy({
              age: inputs.age,
              sleepHoursPerNight: inputs.sleepHoursPerNight,
              exerciseHoursPerWeek: inputs.exerciseHoursPerWeek,
              stressLevel: inputs.stressLevel,
            }) - inputs.age,
          [
            inputs.age,
            inputs.sleepHoursPerNight,
            inputs.exerciseHoursPerWeek,
            inputs.stressLevel,
          ]
        )}
        lang={lang}
      />

      {/* Four inputs */}
      <section className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <NumberInput
          label={lang === "th" ? "อายุ (ปี)" : "Age (years)"}
          value={inputs.age}
          onChange={update("age")}
          min={0}
          max={110}
          infoTitle={lang === "th" ? "อายุ" : "Age"}
          infoDetails={
            lang === "th"
              ? "ใช้อายุปัจจุบันในการคำนวณเวลาโดยประมาณที่เหลืออยู่"
              : "Current age used to estimate time left."
          }
        />
        <NumberInput
          label={lang === "th" ? "นอน/คืน (ชม.)" : "Sleep/night (hrs)"}
          value={inputs.sleepHoursPerNight}
          onChange={update("sleepHoursPerNight")}
          min={0}
          max={14}
          step={0.5}
          infoTitle={lang === "th" ? "การนอน" : "Sleep"}
          infoDetails={
            lang === "th"
              ? "โซนดี 7–9 ชม./คืน"
              : "7–9 hours per night is a good zone."
          }
        />
        <NumberInput
          label={
            lang === "th" ? "ออกกำลัง/สัปดาห์ (ชม.)" : "Exercise/week (hrs)"
          }
          value={inputs.exerciseHoursPerWeek}
          onChange={update("exerciseHoursPerWeek")}
          min={0}
          max={20}
          step={0.5}
          infoTitle={lang === "th" ? "ออกกำลังกาย" : "Exercise"}
          infoDetails={
            lang === "th" ? "เป้าหมาย ~150 นาที/สัปดาห์" : "Aim ~150 min/week."
          }
        />
        <NumberInput
          label={lang === "th" ? "เครียด (1–10)" : "Stress (1–10)"}
          value={inputs.stressLevel}
          onChange={update("stressLevel")}
          min={1}
          max={10}
          infoTitle={lang === "th" ? "ความเครียด" : "Stress"}
          infoDetails={
            lang === "th"
              ? "ยิ่งต่ำยิ่งดี ใส่ช่วงพักฟื้นระหว่างวัน"
              : "Lower is better; add recovery breaks."
          }
        />
      </section>

      {/* Advanced inputs removed per request */}

      {/* Removed Past/Present/Future cards */}

      {/* Live time-left breakdown */}
      <section className="glass-card">
        <h2 className="section-title">เวลาที่เหลือโดยประมาณ (Realtime)</h2>
        <TimeLeftDetails
          years={useMemo(
            () =>
              estimateAdjustedExpectancy({
                age: inputs.age,
                sleepHoursPerNight: inputs.sleepHoursPerNight,
                exerciseHoursPerWeek: inputs.exerciseHoursPerWeek,
                stressLevel: inputs.stressLevel,
              }) - inputs.age,
            [
              inputs.age,
              inputs.sleepHoursPerNight,
              inputs.exerciseHoursPerWeek,
              inputs.stressLevel,
            ]
          )}
          lang={lang}
        />
      </section>

      {/* Keep a short note */}
      <section className="glass-card">
        <p className="text-xs subtle">
          ค่านี้เป็นการประมาณแบบ heuristic เพื่อการสะท้อนตนเอง
          ไม่ใช่คำแนะนำทางการแพทย์
        </p>
      </section>

      {/* Calendar shown at top */}

      <section className="glass-card">
        <h2 className="font-medium mb-2">
          {lang === "th" ? "ไอเดียปรับง่าย ๆ" : "Quick improvement ideas"}
        </h2>
        <ul className="list-disc pl-5 space-y-2">
          {(lang === "th" ? recommendationsBi.th : recommendationsBi.en)
            .slice(0, 3)
            .map((r, idx) => (
              <li key={idx} className="text-sm">
                {r}
              </li>
            ))}
        </ul>
      </section>

      <section className="glass-card">
        <h2 className="section-title">อ้างอิงงานวิจัย (ย่อ)</h2>
        <ul className="text-sm list-disc pl-5 space-y-1">
          <li>WHO Physical Activity Guidelines (~150–300 นาที/สัปดาห์)</li>
          <li>Sleep research: ผู้ใหญ่ควรนอน 7–9 ชั่วโมง/คืน</li>
          <li>
            Mindfulness-based stress reduction:
            หลักฐานลดความเครียดระดับเล็กถึงปานกลาง
          </li>
          <li>เวลาในธรรมชาติ ~120 นาที/สัปดาห์ เชื่อมโยงกับสุขภาวะที่ดี</li>
          <li>
            ความสัมพันธ์และความพึงพอใจชีวิต:
            หลายการศึกษายืนยันความเชื่อมโยงเชิงบวก
          </li>
        </ul>
        <p className="text-xs subtle mt-2">
          สูตรนี้เป็น heuristic ที่โปร่งใส ไม่ใช่การวินิจฉัยทางการแพทย์
          และอาจปรับแต่งตามบริบทได้
        </p>
      </section>
    </div>
  );
}

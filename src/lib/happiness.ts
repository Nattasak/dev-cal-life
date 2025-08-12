export interface HappinessInputs {
  age: number;
  sleepHoursPerNight: number;
  exerciseHoursPerWeek: number;
  socialContactsPerWeek: number;
  mindfulnessMinutesPerDay: number;
  purposeScore: number;
  incomeSatisfaction: number;
  gratitudeDaysPerWeek: number;
  screenTimeHoursPerDay: number;
  natureHoursPerWeek: number;
  workHoursPerWeek: number;
  stressLevel: number;
  pastSelfReport: number;
  planAdherencePercent: number;
}

// Basic mappers used by the adjusted expectancy heuristic
function triangularOptimal(
  value: number,
  low: number,
  high: number,
  idealLow: number,
  idealHigh: number
): number {
  if (value <= low || value >= high) return 0;
  if (value >= idealLow && value <= idealHigh) return 1;
  if (value < idealLow) return (value - low) / (idealLow - low);
  return (high - value) / (high - idealHigh);
}

function saturatingAbove(
  value: number,
  knee: number,
  maxUseful: number
): number {
  if (value <= 0) return 0;
  if (value >= maxUseful) return 1;
  if (value <= knee) return value / knee;
  return 0.7 + 0.3 * ((value - knee) / (maxUseful - knee));
}

function clamp01(n: number): number {
  if (Number.isNaN(n) || !Number.isFinite(n)) return 0;
  return Math.max(0, Math.min(1, n));
}

// Adjusted life expectancy (years) from the 4 minimal drivers used in the UI
export function estimateAdjustedExpectancy(
  inputs: Pick<
    HappinessInputs,
    "age" | "sleepHoursPerNight" | "exerciseHoursPerWeek" | "stressLevel"
  >
): number {
  const base = 85;
  const sleep01 = clamp01(
    triangularOptimal(inputs.sleepHoursPerNight, 4, 12, 7, 9)
  );
  const exercise01 = clamp01(
    saturatingAbove(inputs.exerciseHoursPerWeek, 2.5, 5)
  );
  const stress01 = clamp01((10 - inputs.stressLevel) / 10);

  const sleepDelta = (sleep01 - 0.5) * 4;
  const exerciseDelta = (exercise01 - 0.5) * 4;
  const stressDelta = (stress01 - 0.5) * 4;
  const composite01 = clamp01(
    0.4 * sleep01 + 0.35 * exercise01 + 0.25 * stress01
  );
  const compositeDelta = (composite01 - 0.5) * 2;

  const expectancy =
    base + sleepDelta + exerciseDelta + stressDelta + compositeDelta;
  return Math.max(0, expectancy);
}

// Concise bilingual suggestions used by the page
export function generateRecommendationsBilingual(inputs: HappinessInputs): {
  th: string[];
  en: string[];
} {
  const th: string[] = [];
  const en: string[] = [];

  if (inputs.sleepHoursPerNight < 7 || inputs.sleepHoursPerNight > 9) {
    th.push(
      "ตั้งเป้านอน 7–9 ชั่วโมง/คืน ตื่นเวลาเดิม ลดคาเฟอีนช่วงค่ำ และลดหน้าจอ 1 ชั่วโมงก่อนนอน"
    );
    en.push(
      "Aim for 7–9 hours/night. Fixed wake time, limit late caffeine, dim screens 1 hour before bed."
    );
  }
  if (inputs.exerciseHoursPerWeek < 2.5) {
    th.push(
      "ออกกำลังกายอย่างน้อย 150 นาที/สัปดาห์ (เช่น เดินเร็ว 30 นาที 5 วัน/สัปดาห์)"
    );
    en.push(
      "Accumulate ≥150 min/week of moderate activity (e.g., 30 min brisk walk, 5 days/week)."
    );
  }
  if (inputs.stressLevel >= 6) {
    th.push(
      "ลดความเครียดเรื้อรัง: พักฟื้น 3 ครั้ง/วัน ครั้งละ 5 นาที (เดิน หายใจ ยืดเหยียด); พิจารณา CBT/โค้ชหากจำเป็น"
    );
    en.push(
      "Lower chronic stress: insert 3×5-minute recovery breaks/day (walk, breathe, stretch); consider CBT/coaching if needed."
    );
  }
  if (
    inputs.socialContactsPerWeek !== undefined &&
    inputs.socialContactsPerWeek < 3
  ) {
    th.push("นัดพบปะ/สนทนาที่มีความหมาย 3–5 ครั้งต่อสัปดาห์");
    en.push("Schedule 3–5 meaningful social interactions per week.");
  }
  if (
    inputs.mindfulnessMinutesPerDay !== undefined &&
    inputs.mindfulnessMinutesPerDay < 10
  ) {
    th.push("ฝึกสติ 10–15 นาทีทุกวัน");
    en.push("Practice mindfulness 10–15 minutes daily.");
  }

  if (th.length === 0) {
    th.push(
      "คุณใกล้เคียงโซนเหมาะสมแล้ว รักษาวินัยและต่อยอดความสัมพันธ์และความหมายในชีวิต"
    );
    en.push(
      "You are close to optimal. Maintain routines and deepen relationships and meaning."
    );
  }

  return { th, en };
}

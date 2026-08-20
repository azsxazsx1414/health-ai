"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  ArrowRight,
  Droplets,
  Footprints,
  Moon,
  Sparkles,
  TrendingUp,
  Weight,
} from "lucide-react";
import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { auth, db } from "@/lib/firebase";
import { onAuthStateChanged } from "firebase/auth";
import {
  collection,
  doc,
  getDoc,
  getDocs,
  query,
  where,
} from "firebase/firestore";

type Log = {
  log_date: string;
  water: number;
  weight: number;
  steps: number;
  calories: number;
  water_consumed?: number;
  sleep?: number;
};

export default function DashboardPage() {
  const [logs, setLogs] = useState<Log[]>([]);
  const [loading, setLoading] = useState(true);
  const [userId, setUserId] = useState<string | null>(null);
  const [height, setHeight] = useState(0);
  const [analysis, setAnalysis] = useState("");
  const [analysisLoading, setAnalysisLoading] = useState(false);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (user) => {
      const uid = user?.uid ?? null;
      setUserId(uid);
      if (uid) {
        try {
          const q = query(collection(db, "logs"), where("user_id", "==", uid));
          const snap = await getDocs(q);
          const rows = snap.docs.map((d) => d.data() as Log);
          rows.sort((a, b) =>
            String(a.log_date || "").localeCompare(String(b.log_date || ""))
          );
          setLogs(rows);
          const pSnap = await getDoc(doc(db, "users", uid));
          if (pSnap.exists()) {
            const pd: any = pSnap.data();
            setHeight(Number(pd.height) || 0);
          }
        } catch {
          /* ignore */
        }
      }
      setLoading(false);
    });
    return unsub;
  }, []);

  const latest = logs.length > 0 ? logs[logs.length - 1] : null;

  let waterPart = 0;
  let stepsPart = 0;
  let sleepPart = 0;
  let bmiPart = 0;
  if (latest) {
    const wc = Number(latest.water_consumed) || 0;
    waterPart =
      wc > 0 ? Math.min(wc / (Number(latest.water) || 2.5), 1) * 25 : 0;
    stepsPart = Math.min((Number(latest.steps) || 0) / 8000, 1) * 25;
    const sl = Number(latest.sleep) || 0;
    sleepPart = sl > 0 ? Math.max(0, 25 - Math.abs(sl - 8) * 4) : 0;
    if (height > 0) {
      const bmi = (Number(latest.weight) || 0) / Math.pow(height / 100, 2);
      bmiPart =
        bmi >= 18.5 && bmi < 25
          ? 25
          : Math.max(0, 25 - Math.abs(bmi - 22) * 1.5);
    }
  }
  const score = Math.round(waterPart + stepsPart + sleepPart + bmiPart);
  const scoreColor =
    score >= 80
      ? "text-brand-400"
      : score >= 50
        ? "text-orange-400"
        : "text-red-400";

  let trendText = "";
  let predicted: number | null = null;
  if (logs.length >= 2) {
    const n = logs.length;
    const ys: number[] = logs.map((l) => Number(l.weight) || 0);
    const xs: number[] = logs.map((l, i) => i);
    const sx = xs.reduce((a, b) => a + b, 0);
    const sy = ys.reduce((a, b) => a + b, 0);
    const sxy = xs.reduce((a, x, i) => a + x * ys[i], 0);
    const sxx = xs.reduce((a, x) => a + x * x, 0);
    const denom = n * sxx - sx * sx;
    if (denom !== 0) {
      const slope = (n * sxy - sx * sy) / denom;
      predicted = ys[n - 1] + slope * 30;
      trendText = slope < -0.03 ? "کاهشی 📉" : slope > 0.03 ? "افزایشی 📈" : "ثابت ➖";
    }
  }

  const avgWater =
    logs.length > 0
      ? logs.reduce((a, l) => a + (Number(l.water_consumed) || 0), 0) /
        logs.length
      : 0;
  const avgSteps =
    logs.length > 0
      ? logs.reduce((a, l) => a + (Number(l.steps) || 0), 0) / logs.length
      : 0;

  const runAnalysis = async () => {
    setAnalysisLoading(true);
    try {
      const params = new URLSearchParams({
        water: avgWater.toFixed(1),
        waterTarget: latest ? String(latest.water) : "2.5",
        steps: String(Math.round(avgSteps)),
        trend: trendText || "نامشخص",
        predicted: predicted ? predicted.toFixed(1) : "",
        score: String(score),
      });
      const res = await fetch(`/api/analysis?${params.toString()}`);
      const data = await res.json();
      setAnalysis(data.text || "تحلیل در دسترس نیست.");
    } catch {
      setAnalysis("خطا در دریافت تحلیل.");
    }
    setAnalysisLoading(false);
  };

  const chartData = logs.map((l) => ({
    ...l,
    date: new Date(l.log_date).toLocaleDateString("fa-IR", {
      month: "short",
      day: "numeric",
    }),
  }));

  return (
    <div className="bg-aurora min-h-screen">
      <header className="flex items-center justify-between px-6 md:px-12 py-5">
        <Link
          href="/"
          className="flex items-center gap-2 text-gray-300 hover:text-white"
        >
          <ArrowRight className="h-5 w-5" /> بازگشت
        </Link>
        <span className="text-xl font-black">داشبورد من</span>
        <span className="w-20" />
      </header>

      <main className="mx-auto max-w-5xl px-4 pb-24">
        {loading ? (
          <p className="pt-20 text-center text-gray-400">در حال بارگذاری...</p>
        ) : !userId ? (
          <div className="glass mx-auto mt-20 max-w-md rounded-3xl p-10 text-center">
            <p className="mb-4 text-lg font-bold">اول وارد حسابت شو!</p>
            <Link
              href="/auth"
              className="btn-glow inline-block rounded-xl px-6 py-3 font-bold text-white"
            >
              ورود / ثبت‌نام
            </Link>
          </div>
        ) : logs.length === 0 ? (
          <div className="glass mx-auto mt-20 max-w-md rounded-3xl p-10 text-center">
            <p className="text-lg font-bold">هنوز تاریخچه‌ای نداری!</p>
            <p className="mt-3 text-sm text-gray-400">
              از صفحه اصلی یه برنامه بگیر تا امتیاز و نمودارها اینجا ظاهر بشن.
            </p>
          </div>
        ) : (
          <>
            <div className="glass mb-6 rounded-3xl p-6">
              <div className="flex flex-col items-center gap-6 md:flex-row">
                <div className="text-center">
                  <p className={`text-6xl font-black ${scoreColor}`}>
                    {score.toLocaleString("fa-IR")}
                  </p>
                  <p className="mt-1 text-sm text-gray-400">
                    امتیاز سلامت امروز (از ۱۰۰)
                  </p>
                </div>
                <div className="grid w-full flex-1 grid-cols-2 gap-3 md:grid-cols-4">
                  <div className="rounded-2xl bg-white/5 p-3 text-center">
                    <Droplets className="mx-auto h-5 w-5 text-blue-400" />
                    <p className="mt-1 text-sm font-bold">
                      {Math.round(waterPart).toLocaleString("fa-IR")} / ۲۵
                    </p>
                    <p className="text-xs text-gray-400">آب مصرفی</p>
                  </div>
                  <div className="rounded-2xl bg-white/5 p-3 text-center">
                    <Footprints className="mx-auto h-5 w-5 text-brand-400" />
                    <p className="mt-1 text-sm font-bold">
                      {Math.round(stepsPart).toLocaleString("fa-IR")} / ۲۵
                    </p>
                    <p className="text-xs text-gray-400">فعالیت</p>
                  </div>
                  <div className="rounded-2xl bg-white/5 p-3 text-center">
                    <Moon className="mx-auto h-5 w-5 text-purple-400" />
                    <p className="mt-1 text-sm font-bold">
                      {Math.round(sleepPart).toLocaleString("fa-IR")} / ۲۵
                    </p>
                    <p className="text-xs text-gray-400">خواب</p>
                  </div>
                  <div className="rounded-2xl bg-white/5 p-3 text-center">
                    <Weight className="mx-auto h-5 w-5 text-orange-400" />
                    <p className="mt-1 text-sm font-bold">
                      {Math.round(bmiPart).toLocaleString("fa-IR")} / ۲۵
                    </p>
                    <p className="text-xs text-gray-400">وزن (BMI)</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="mb-6 grid grid-cols-1 gap-6 lg:grid-cols-2">
              <div className="glass rounded-3xl p-6">
                <h2 className="mb-3 flex items-center gap-2 text-lg font-bold">
                  <TrendingUp className="h-5 w-5 text-brand-400" /> پیش‌بینی روند وزن
                </h2>
                {predicted !== null ? (
                  <div className="space-y-2 text-sm text-gray-300">
                    <p>
                      روند وزن شما:{" "}
                      <span className="font-bold text-white">{trendText}</span>
                    </p>
                    <p>
                      وزن پیش‌بینی‌شده ۳۰ روز آینده:{" "}
                      <span className="font-bold text-white">
                        {predicted.toFixed(1)} کیلوگرم
                      </span>
                    </p>
                  </div>
                ) : (
                  <p className="text-sm text-gray-400">
                    برای پیش‌بینی روند، حداقل دو روز ثبت وزن لازمه.
                  </p>
                )}
              </div>

              <div className="glass rounded-3xl p-6">
                <h2 className="mb-3 flex items-center gap-2 text-lg font-bold">
                  <Sparkles className="h-5 w-5 text-orange-400" /> تحلیل هوشمند وضعیت
                </h2>
                <button
                  onClick={runAnalysis}
                  disabled={analysisLoading}
                  className="btn-glow rounded-xl px-4 py-2 text-sm font-bold text-white disabled:opacity-50"
                >
                  {analysisLoading ? "در حال تحلیل..." : "تحلیل با هوش مصنوعی 🤖"}
                </button>
                {analysis && (
                  <p className="mt-3 text-sm leading-7 text-gray-300">{analysis}</p>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
              <div className="glass rounded-3xl p-6">
                <h2 className="mb-4 flex items-center gap-2 text-lg font-bold">
                  <Droplets className="h-5 w-5 text-blue-400" /> نمودار آب (لیتر)
                </h2>
                <div className="h-64 w-full" dir="ltr">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={chartData}>
                      <CartesianGrid stroke="rgba(255,255,255,0.08)" />
                      <XAxis dataKey="date" stroke="#9ca3af" fontSize={12} />
                      <YAxis stroke="#9ca3af" fontSize={12} />
                      <Tooltip
                        contentStyle={{
                          background: "#0f172a",
                          border: "1px solid rgba(255,255,255,0.1)",
                          borderRadius: 12,
                        }}
                      />
                      <Line
                        type="monotone"
                        dataKey="water"
                        stroke="#38bdf8"
                        strokeWidth={3}
                        dot={{ r: 4 }}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </div>

              <div className="glass rounded-3xl p-6">
                <h2 className="mb-4 flex items-center gap-2 text-lg font-bold">
                  <Weight className="h-5 w-5 text-brand-400" /> نمودار وزن (کیلوگرم)
                </h2>
                <div className="h-64 w-full" dir="ltr">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={chartData}>
                      <CartesianGrid stroke="rgba(255,255,255,0.08)" />
                      <XAxis dataKey="date" stroke="#9ca3af" fontSize={12} />
                      <YAxis
                        stroke="#9ca3af"
                        fontSize={12}
                        domain={["dataMin - 2", "dataMax + 2"]}
                      />
                      <Tooltip
                        contentStyle={{
                          background: "#0f172a",
                          border: "1px solid rgba(255,255,255,0.1)",
                          borderRadius: 12,
                        }}
                      />
                      <Line
                        type="monotone"
                        dataKey="weight"
                        stroke="#10b981"
                        strokeWidth={3}
                        dot={{ r: 4 }}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>
          </>
        )}
      </main>
    </div>
  );
}
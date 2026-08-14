"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowRight, Droplets, Weight } from "lucide-react";
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
import { collection, getDocs, query, where } from "firebase/firestore";

type Log = {
  log_date: string;
  water: number;
  weight: number;
  steps: number;
  calories: number;
};

export default function DashboardPage() {
  const [logs, setLogs] = useState<Log[]>([]);
  const [loading, setLoading] = useState(true);
  const [userId, setUserId] = useState<string | null>(null);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (user) => {
      const uid = user?.uid ?? null;
      setUserId(uid);
      if (uid) {
        try {
          const q = query(collection(db, "logs"), where("user_id", "==", uid));
          const snap = await getDocs(q);
          const rows = snap.docs.map((d) => d.data() as Log);
          rows.sort((a, b) => a.log_date.localeCompare(b.log_date));
          setLogs(rows);
        } catch {
          setLogs([]);
        }
      }
      setLoading(false);
    });
    return unsub;
  }, []);

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
              از صفحه اصلی یه برنامه بگیر تا نمودارش اینجا ظاهر شه.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-6 pt-8 lg:grid-cols-2">
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
        )}
      </main>
    </div>
  );
}
"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  ArrowRight,
  Droplets,
  FileText,
  Footprints,
  Shield,
  Users,
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
import { collection, getDocs } from "firebase/firestore";

type Log = {
  user_id: string;
  log_date: string;
  water: number;
  steps: number;
  water_consumed?: number;
};

export default function AdminPage() {
  const [isAdmin, setIsAdmin] = useState(false);
  const [checked, setChecked] = useState(false);
  const [userCount, setUserCount] = useState(0);
  const [logs, setLogs] = useState<Log[]>([]);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (user) => {
      if (user?.email === "test@test.com") {
        setIsAdmin(true);
        try {
          const uSnap = await getDocs(collection(db, "users"));
          setUserCount(uSnap.size);
          const lSnap = await getDocs(collection(db, "logs"));
          const rows = lSnap.docs.map((d) => d.data() as Log);
          rows.sort((a, b) =>
            String(a.log_date || "").localeCompare(String(b.log_date || ""))
          );
          setLogs(rows);
        } catch {
          /* ignore */
        }
      }
      setChecked(true);
    });
    return unsub;
  }, []);

  const totalLogs = logs.length;
  const uniqueUsers = new Set(logs.map((l) => l.user_id)).size;
  const avgWater =
    totalLogs > 0
      ? logs.reduce((a, l) => a + (Number(l.water_consumed) || 0), 0) / totalLogs
      : 0;
  const avgSteps =
    totalLogs > 0
      ? logs.reduce((a, l) => a + (Number(l.steps) || 0), 0) / totalLogs
      : 0;

  const chartMap: Record<string, number> = {};
  logs.forEach((l) => {
    const key = new Date(l.log_date).toLocaleDateString("fa-IR", {
      month: "short",
      day: "numeric",
    });
    chartMap[key] = (chartMap[key] || 0) + 1;
  });
  const chartData = Object.entries(chartMap).map(([date, count]) => ({
    date,
    count,
  }));

  const recent = [...logs].reverse().slice(0, 8);

  return (
    <div className="bg-aurora min-h-screen">
      <header className="flex items-center justify-between px-6 md:px-12 py-5">
        <Link
          href="/"
          className="flex items-center gap-2 text-gray-300 hover:text-white"
        >
          <ArrowRight className="h-5 w-5" /> بازگشت
        </Link>
        <span className="flex items-center gap-2 text-xl font-black">
          <Shield className="h-6 w-6 text-orange-400" /> پنل مدیریت
        </span>
        <span className="w-20" />
      </header>

      <main className="mx-auto max-w-5xl px-4 pb-24">
        {!checked ? (
          <p className="pt-20 text-center text-gray-400">در حال بارگذاری...</p>
        ) : !isAdmin ? (
          <div className="glass mx-auto mt-20 max-w-md rounded-3xl p-10 text-center">
            <p className="text-lg font-bold">⛔ دسترسی فقط برای مدیر سامانه</p>
            <p className="mt-3 text-sm text-gray-400">
              با حساب مدیر وارد شو تا آمار رو ببینی.
            </p>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
              <div className="glass rounded-3xl p-5 text-center">
                <Users className="mx-auto h-7 w-7 text-brand-400" />
                <p className="mt-2 text-3xl font-black">
                  {userCount.toLocaleString("fa-IR")}
                </p>
                <p className="mt-1 text-xs text-gray-400">پروفایل ثبت‌شده</p>
              </div>
              <div className="glass rounded-3xl p-5 text-center">
                <FileText className="mx-auto h-7 w-7 text-blue-400" />
                <p className="mt-2 text-3xl font-black">
                  {totalLogs.toLocaleString("fa-IR")}
                </p>
                <p className="mt-1 text-xs text-gray-400">گزارش روزانه</p>
              </div>
              <div className="glass rounded-3xl p-5 text-center">
                <Droplets className="mx-auto h-7 w-7 text-blue-400" />
                <p className="mt-2 text-3xl font-black">
                  {avgWater.toFixed(1).toLocaleString("fa-IR")}
                </p>
                <p className="mt-1 text-xs text-gray-400">میانگین آب (لیتر)</p>
              </div>
              <div className="glass rounded-3xl p-5 text-center">
                <Footprints className="mx-auto h-7 w-7 text-brand-400" />
                <p className="mt-2 text-3xl font-black">
                  {Math.round(avgSteps).toLocaleString("fa-IR")}
                </p>
                <p className="mt-1 text-xs text-gray-400">میانگین قدم</p>
              </div>
            </div>

            <div className="glass mt-6 rounded-3xl p-6">
              <h2 className="mb-4 text-lg font-bold">
                فعالیت کاربران سامانه (تعداد گزارش در روز)
              </h2>
              <div className="h-64 w-full" dir="ltr">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={chartData}>
                    <CartesianGrid stroke="rgba(255,255,255,0.08)" />
                    <XAxis dataKey="date" stroke="#9ca3af" fontSize={12} />
                    <YAxis stroke="#9ca3af" fontSize={12} allowDecimals={false} />
                    <Tooltip
                      contentStyle={{
                        background: "#0f172a",
                        border: "1px solid rgba(255,255,255,0.1)",
                        borderRadius: 12,
                      }}
                    />
                    <Line
                      type="monotone"
                      dataKey="count"
                      stroke="#f59e0b"
                      strokeWidth={3}
                      dot={{ r: 4 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="glass mt-6 rounded-3xl p-6">
              <h2 className="mb-4 text-lg font-bold">آخرین گزارش‌های کاربران</h2>
              <div className="overflow-x-auto">
                <table className="w-full text-right text-sm">
                  <thead className="text-gray-400">
                    <tr>
                      <th className="pb-3 pl-4">تاریخ</th>
                      <th className="pb-3 pl-4">وزن</th>
                      <th className="pb-3 pl-4">قدم</th>
                      <th className="pb-3">آب مصرفی</th>
                    </tr>
                  </thead>
                  <tbody>
                    {recent.map((l, i) => (
                      <tr key={i} className="border-t border-white/5">
                        <td className="py-3 pl-4">
                          {new Date(l.log_date).toLocaleDateString("fa-IR")}
                        </td>
                        <td className="py-3 pl-4">{l.weight} کیلو</td>
                        <td className="py-3 pl-4">
                          {Number(l.steps).toLocaleString("fa-IR")}
                        </td>
                        <td className="py-3">
                          {Number(l.water_consumed || 0).toLocaleString("fa-IR")} لیتر
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </>
        )}
      </main>
    </div>
  );
}
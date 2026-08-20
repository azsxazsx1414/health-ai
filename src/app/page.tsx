"use client";

// HOME PAGE - صفحه اصلی

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import {
  Bot,
  Droplets,
  Flame,
  Footprints,
  HeartPulse,
  LayoutDashboard,
  LogOut,
  Sparkles,
  Thermometer,
  UtensilsCrossed,
  Weight,
  User,
  Moon,
} from "lucide-react";
import { auth, db } from "@/lib/firebase";
import { onAuthStateChanged, signOut } from "firebase/auth";
import { doc, setDoc } from "firebase/firestore";

type Meal = { name: string; desc: string; cal: number };

export default function Home() {
  const [weight, setWeight] = useState("");
  const [steps, setSteps] = useState("");
  const [temp, setTemp] = useState("");
  const [plan, setPlan] = useState<{ water: number; calories: number } | null>(null);
  const [userId, setUserId] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);
  const [meals, setMeals] = useState<Meal[]>([]);
  const [mealsLoading, setMealsLoading] = useState(false);
  const [waterIn, setWaterIn] = useState("");
const [sleep, setSleep] = useState("");

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (user) => {
      setUserId(user?.uid ?? null);
    });
    return unsub;
  }, []);

  const showPlan = async () => {
    const w = parseFloat(weight) || 70;
    const s = parseFloat(steps) || 5000;
    const t = parseFloat(temp) || 25;
    const wc = parseFloat(waterIn) || 0;
const sl = parseFloat(sleep) || 0;

    const water = Number(
      (w * 0.033 + (s / 1000) * 0.25 + Math.max(0, t - 25) * 0.15).toFixed(1)
    );
    const calories = Math.round(w * 24 * (1.2 + (s / 20000) * 0.6));

    setPlan({ water, calories });
    setSaved(false);
    setMealsLoading(true);
    setMeals([]);

    try {
      const res = await fetch(`/api/meals?calories=${calories}&temp=${t}`);
      const data = await res.json();
      setMeals(data.meals);
    } catch {
      setMeals([]);
    }
    setMealsLoading(false);

    if (userId) {
      const date = new Date().toISOString().slice(0, 10);
      try {
        await setDoc(doc(db, "logs", `${userId}_${date}`), {
          user_id: userId,
          log_date: date,
          weight: w,
          steps: s,
          temperature: t,
          water_consumed: wc,
sleep: sl,
          water,
          calories,
        });
        setSaved(true);
      } catch {
        setSaved(false);
      }
    }
  };

  const logout = () => signOut(auth);

  return (
    <div className="bg-aurora min-h-screen">
      <header className="flex items-center justify-between px-6 md:px-12 py-5">
        <div className="flex items-center gap-3">
          <div className="btn-glow flex h-10 w-10 items-center justify-center rounded-2xl">
            <HeartPulse className="h-6 w-6 text-white" />
          </div>
          <span className="text-xl font-black">سلامت‌یار</span>
        </div>
        {userId ? (
          <div className="flex items-center gap-2">
            <Link
              href="/dashboard"
              className="glass flex items-center gap-2 rounded-full px-4 py-2 text-xs text-brand-400"
            >
              <LayoutDashboard className="h-4 w-4" /> داشبورد من
            </Link>
            <Link
  href="/profile"
  className="glass flex items-center gap-2 rounded-full px-4 py-2 text-xs text-brand-400"
>
  <User className="h-4 w-4" /> پروفایل
</Link>
            <button
              onClick={logout}
              className="glass flex items-center gap-2 rounded-full px-4 py-2 text-xs text-red-400"
            >
              <LogOut className="h-4 w-4" /> خروج
            </button>
          </div>
        ) : (
          <Link
            href="/auth"
            className="glass flex items-center gap-2 rounded-full px-4 py-2 text-xs text-brand-400"
          >
            <Sparkles className="h-4 w-4" /> ورود / ثبت‌نام
          </Link>
        )}
      </header>

      <main className="mx-auto max-w-5xl px-4 pb-24">
        <motion.section
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7 }}
          className="pb-12 pt-14 text-center"
        >
          <h1 className="text-4xl font-black leading-snug md:text-6xl md:leading-snug">
            دستیار هوشمند{" "}
            <span className="bg-gradient-to-l from-brand-400 to-blue-400 bg-clip-text text-transparent">
              سلامتی تو
            </span>
          </h1>
          <p className="mt-5 text-gray-400 md:text-lg">
            آب، کالری و غذای امروزت رو بر اساس وزن، قدم‌ها و هوای شهرت شخصی‌سازی کن
          </p>
        </motion.section>

        <motion.section
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.15 }}
          className="glass rounded-3xl p-6 md:p-8"
        >
          <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
            <label className="block">
              <span className="mb-2 flex items-center gap-2 text-sm text-gray-300">
                <Weight className="h-4 w-4 text-brand-400" /> وزن (کیلوگرم)
              </span>
              <input
                value={weight}
                onChange={(e) => setWeight(e.target.value)}
                inputMode="decimal"
                placeholder="مثلاً 75"
                className="input-glass w-full rounded-xl px-4 py-3"
              />
            </label>
            <label className="block">
              <span className="mb-2 flex items-center gap-2 text-sm text-gray-300">
                <Footprints className="h-4 w-4 text-brand-400" /> قدم‌های امروز
              </span>
              <input
                value={steps}
                onChange={(e) => setSteps(e.target.value)}
                inputMode="numeric"
                placeholder="مثلاً 8000"
                className="input-glass w-full rounded-xl px-4 py-3"
              />
            </label>
            <label className="block">
              <span className="mb-2 flex items-center gap-2 text-sm text-gray-300">
                <Thermometer className="h-4 w-4 text-brand-400" /> دمای هوا (°C)
              </span>
              <input
                value={temp}
                onChange={(e) => setTemp(e.target.value)}
                inputMode="decimal"
                placeholder="مثلاً 33"
                className="input-glass w-full rounded-xl px-4 py-3"
              />
            </label>
          </div>
          <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-2">
            <label className="block">
              <span className="mb-2 flex items-center gap-2 text-sm text-gray-300">
                <Droplets className="h-4 w-4 text-blue-400" /> آب مصرفی امروز (لیتر) — اختیاری
              </span>
              <input
                value={waterIn}
                onChange={(e) => setWaterIn(e.target.value)}
                inputMode="decimal"
                placeholder="مثلاً 2"
                className="input-glass w-full rounded-xl px-4 py-3"
              />
            </label>
            <label className="block">
              <span className="mb-2 flex items-center gap-2 text-sm text-gray-300">
                <Moon className="h-4 w-4 text-purple-400" /> خواب دیشب (ساعت) — اختیاری
              </span>
              <input
                value={sleep}
                onChange={(e) => setSleep(e.target.value)}
                inputMode="decimal"
                placeholder="مثلاً 7"
                className="input-glass w-full rounded-xl px-4 py-3"
              />
            </label>
          </div>
          <button
            onClick={showPlan}
            className="btn-glow mt-6 w-full rounded-xl py-4 text-lg font-bold text-white"
          >
            دریافت برنامه امروز من ✨
          </button>

          {saved && (
            <p className="mt-4 text-center text-sm text-brand-400">
              ✅ برنامه امروزت توی تاریخچه ذخیره شد
            </p>
          )}
          {!userId && (
            <p className="mt-4 text-center text-sm text-gray-400">
              برای ذخیره تاریخچه و دیدن نمودارها، اول{" "}
              <Link href="/auth" className="text-brand-400 underline">
                ثبت‌نام
              </Link>{" "}
              کن
            </p>
          )}
        </motion.section>

        {plan && (
          <motion.section
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="mt-8"
          >
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div className="glass rounded-3xl p-6 text-center">
                <Droplets className="mx-auto h-10 w-10 text-blue-400" />
                <p className="mt-3 text-4xl font-black text-blue-400">
                  {plan.water.toLocaleString("fa-IR")} لیتر
                </p>
                <p className="mt-2 text-sm text-gray-400">آب پیشنهادی امروز</p>
              </div>
              <div className="glass rounded-3xl p-6 text-center">
                <Flame className="mx-auto h-10 w-10 text-orange-400" />
                <p className="mt-3 text-4xl font-black text-orange-400">
                  {plan.calories.toLocaleString("fa-IR")}
                </p>
                <p className="mt-2 text-sm text-gray-400">کالری پیشنهادی امروز</p>
              </div>
            </div>

            <h2 className="mt-10 mb-4 flex items-center gap-2 text-xl font-bold">
              <Bot className="h-6 w-6 text-brand-400" />
              پیشنهاد غذایی هوش مصنوعی
            </h2>

            {mealsLoading ? (
              <p className="glass animate-pulse rounded-3xl p-6 text-center text-gray-300">
                🤖 هوش مصنوعی داره به وضعیتت فکر می‌کنه...
              </p>
            ) : (
              <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                {meals.map((m) => (
                  <div key={m.name} className="glass rounded-3xl p-5">
                    <p className="font-bold">{m.name}</p>
                    <p className="mt-2 text-sm text-gray-400">{m.desc}</p>
                    <span className="mt-3 inline-block rounded-full bg-orange-500/20 px-3 py-1 text-xs text-orange-300">
                      {m.cal.toLocaleString("fa-IR")} کالری
                    </span>
                  </div>
                ))}
              </div>
            )}
          </motion.section>
        )}
      </main>
    </div>
  );
}
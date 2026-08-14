"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import {
  Droplets,
  Flame,
  Footprints,
  HeartPulse,
  Sparkles,
  Thermometer,
  UtensilsCrossed,
  Weight,
} from "lucide-react";

const MEALS = [
  {
    name: "عدسی با روغن زیتون و لیمو",
    desc: "سرشار از پروتئین و فیبر | آماده در ۲۰ دقیقه",
    cal: 320,
  },
  {
    name: "سینه مرغ گریل با سبزیجات",
    desc: "کم‌چرب و سیرکننده | همراه با برنج کم",
    cal: 450,
  },
  {
    name: "ماست و خیار با گردو و کشمش",
    desc: "سبک و خنک | عالی برای هوای گرم",
    cal: 250,
  },
];

export default function Home() {
  const [weight, setWeight] = useState("");
  const [steps, setSteps] = useState("");
  const [temp, setTemp] = useState("");
  const [plan, setPlan] = useState<{ water: number; calories: number } | null>(null);

  const showPlan = () => {
    const w = parseFloat(weight) || 70;
    const s = parseFloat(steps) || 5000;
    const t = parseFloat(temp) || 25;

    const water = Number(
      (w * 0.033 + (s / 1000) * 0.25 + Math.max(0, t - 25) * 0.15).toFixed(1)
    );
    const calories = Math.round(w * 24 * (1.2 + (s / 20000) * 0.6));

    setPlan({ water, calories });
  };

  return (
    <div className="bg-aurora min-h-screen">
      <header className="flex items-center justify-between px-6 md:px-12 py-5">
        <div className="flex items-center gap-3">
          <div className="btn-glow flex h-10 w-10 items-center justify-center rounded-2xl">
            <HeartPulse className="h-6 w-6 text-white" />
          </div>
          <span className="text-xl font-black">سلامت‌یار</span>
        </div>
        <span className="glass flex items-center gap-2 rounded-full px-4 py-2 text-xs text-brand-400">
          <Sparkles className="h-4 w-4" />
          مبتنی بر هوش مصنوعی
        </span>
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
                <Weight className="h-4 w-4 text-brand-400" />
                وزن (کیلوگرم)
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
                <Footprints className="h-4 w-4 text-brand-400" />
                قدم‌های امروز
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
                <Thermometer className="h-4 w-4 text-brand-400" />
                دمای هوا (°C)
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

          <button
            onClick={showPlan}
            className="btn-glow mt-6 w-full rounded-xl py-4 text-lg font-bold text-white"
          >
            دریافت برنامه امروز من ✨
          </button>
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
              <UtensilsCrossed className="h-6 w-6 text-brand-400" />
              سه پیشنهاد غذایی ساده و در دسترس
            </h2>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
              {MEALS.map((m) => (
                <div key={m.name} className="glass rounded-3xl p-5">
                  <p className="font-bold">{m.name}</p>
                  <p className="mt-2 text-sm text-gray-400">{m.desc}</p>
                  <span className="mt-3 inline-block rounded-full bg-orange-500/20 px-3 py-1 text-xs text-orange-300">
                    {m.cal.toLocaleString("fa-IR")} کالری
                  </span>
                </div>
              ))}
            </div>
          </motion.section>
        )}
      </main>
    </div>
  );
}
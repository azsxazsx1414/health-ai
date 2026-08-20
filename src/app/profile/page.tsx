"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowRight, Flame, Gauge, Ruler, Save, User } from "lucide-react";
import { auth, db } from "@/lib/firebase";
import { onAuthStateChanged } from "firebase/auth";
import {
  collection,
  doc,
  getDoc,
  getDocs,
  query,
  setDoc,
  where,
} from "firebase/firestore";

export default function ProfilePage() {
  const [age, setAge] = useState("");
  const [height, setHeight] = useState("");
  const [gender, setGender] = useState("male");
  const [activity, setActivity] = useState("1.375");
  const [goal, setGoal] = useState("lose");
  const [weight, setWeight] = useState<number | null>(null);
  const [userId, setUserId] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (user) => {
      const uid = user?.uid ?? null;
      setUserId(uid);
      if (uid) {
        try {
          const snap = await getDoc(doc(db, "users", uid));
          if (snap.exists()) {
            const d: any = snap.data();
            setAge(String(d.age ?? ""));
            setHeight(String(d.height ?? ""));
            setGender(d.gender ?? "male");
            setActivity(String(d.activity ?? "1.375"));
            setGoal(d.goal ?? "lose");
          }
          const q = query(collection(db, "logs"), where("user_id", "==", uid));
          const rowsSnap = await getDocs(q);
          const rows = rowsSnap.docs.map((x) => x.data() as any);
          if (rows.length > 0) {
            rows.sort((a: any, b: any) =>
              String(a.log_date || "").localeCompare(String(b.log_date || ""))
            );
            setWeight(Number(rows[rows.length - 1].weight) || null);
          }
        } catch {
          /* ignore */
        }
      }
      setLoading(false);
    });
    return unsub;
  }, []);

  const save = async () => {
    if (!userId) return;
    await setDoc(
      doc(db, "users", userId),
      {
        user_id: userId,
        age: Number(age) || 25,
        height: Number(height) || 170,
        gender,
        activity,
        goal,
        updated_at: new Date().toISOString(),
      },
      { merge: true }
    );
    setSaved(true);
  };

  const ageN = Number(age) || 0;
  const heightN = Number(height) || 0;
  const w = weight ?? 0;
  const bmi = heightN > 0 && w > 0 ? w / Math.pow(heightN / 100, 2) : 0;
  const bmr =
    w > 0 && heightN > 0 && ageN > 0
      ? gender === "female"
        ? 10 * w + 6.25 * heightN - 5 * ageN - 161
        : 10 * w + 6.25 * heightN - 5 * ageN + 5
      : 0;
  const tdee = bmr * Number(activity);

  const bmiLabel =
    bmi <= 0
      ? ""
      : bmi < 18.5
        ? "کمبود وزن"
        : bmi < 25
          ? "وزن طبیعی"
          : bmi < 30
            ? "اضافه وزن"
            : "چاقی";

  const analysis =
    bmi <= 0
      ? ""
      : `شاخص توده بدنی شما ${bmi.toFixed(1)} است (${bmiLabel}). ` +
        (goal === "lose"
          ? "برای کاهش وزن سالم، هدف‌گذاری ما کسری کالری ملایم (حدود ۵۰۰ کالری کمتر از TDEE) همراه با پیاده‌روی روزانه است."
          : goal === "gain"
            ? "برای افزایش وزن سالم، surplus کالری ملایم (حدود ۳۰۰ کالری بیشتر از TDEE) با تمرکز بر پروتئین توصیه می‌شود."
            : "برای حفظ وزن، مصرف کالری برابر با TDEE و حفظ سطح فعالیت فعلی مناسب است.");

  return (
    <div className="bg-aurora min-h-screen">
      <header className="flex items-center justify-between px-6 md:px-12 py-5">
        <Link
          href="/"
          className="flex items-center gap-2 text-gray-300 hover:text-white"
        >
          <ArrowRight className="h-5 w-5" /> بازگشت
        </Link>
        <span className="text-xl font-black">پروفایل من</span>
        <span className="w-20" />
      </header>

      <main className="mx-auto max-w-3xl px-4 pb-24">
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
        ) : (
          <>
            <div className="glass rounded-3xl p-6 md:p-8">
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <label className="block">
                  <span className="mb-2 block text-sm text-gray-300">سن (سال)</span>
                  <input
                    value={age}
                    onChange={(e) => setAge(e.target.value)}
                    inputMode="numeric"
                    placeholder="مثلاً 22"
                    className="input-glass w-full rounded-xl px-4 py-3"
                  />
                </label>
                <label className="block">
                  <span className="mb-2 block text-sm text-gray-300">قد (سانتی‌متر)</span>
                  <input
                    value={height}
                    onChange={(e) => setHeight(e.target.value)}
                    inputMode="numeric"
                    placeholder="مثلاً 175"
                    className="input-glass w-full rounded-xl px-4 py-3"
                  />
                </label>
                <label className="block">
                  <span className="mb-2 block text-sm text-gray-300">جنسیت</span>
                  <select
                    value={gender}
                    onChange={(e) => setGender(e.target.value)}
                    className="input-glass w-full rounded-xl px-4 py-3"
                  >
                    <option value="male">مرد</option>
                    <option value="female">زن</option>
                  </select>
                </label>
                <label className="block">
                  <span className="mb-2 block text-sm text-gray-300">سطح فعالیت</span>
                  <select
                    value={activity}
                    onChange={(e) => setActivity(e.target.value)}
                    className="input-glass w-full rounded-xl px-4 py-3"
                  >
                    <option value="1.2">کم‌تحرک (بدون ورزش)</option>
                    <option value="1.375">سبک (۱-۳ روز در هفته)</option>
                    <option value="1.55">متوسط (۳-۵ روز در هفته)</option>
                    <option value="1.725">زیاد (۶-۷ روز در هفته)</option>
                    <option value="1.9">ورزشکار حرفه‌ای</option>
                  </select>
                </label>
                <label className="block md:col-span-2">
                  <span className="mb-2 block text-sm text-gray-300">هدف</span>
                  <select
                    value={goal}
                    onChange={(e) => setGoal(e.target.value)}
                    className="input-glass w-full rounded-xl px-4 py-3"
                  >
                    <option value="lose">کاهش وزن</option>
                    <option value="maintain">حفظ وزن</option>
                    <option value="gain">افزایش وزن</option>
                  </select>
                </label>
              </div>

              <button
                onClick={save}
                className="btn-glow mt-6 flex w-full items-center justify-center gap-2 rounded-xl py-4 text-lg font-bold text-white"
              >
                <Save className="h-5 w-5" /> ذخیره پروفایل
              </button>
              {saved && (
                <p className="mt-4 text-center text-sm text-brand-400">
                  ✅ پروفایل ذخیره شد
                </p>
              )}
            </div>

            {bmi > 0 && bmr > 0 && (
              <div className="mt-8">
                <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                  <div className="glass rounded-3xl p-6 text-center">
                    <Gauge className="mx-auto h-8 w-8 text-brand-400" />
                    <p className="mt-2 text-3xl font-black">{bmi.toFixed(1)}</p>
                    <p className="mt-1 text-sm text-gray-400">BMI — {bmiLabel}</p>
                  </div>
                  <div className="glass rounded-3xl p-6 text-center">
                    <Flame className="mx-auto h-8 w-8 text-orange-400" />
                    <p className="mt-2 text-3xl font-black">
                      {Math.round(bmr).toLocaleString("fa-IR")}
                    </p>
                    <p className="mt-1 text-sm text-gray-400">BMR (کالری پایه)</p>
                  </div>
                  <div className="glass rounded-3xl p-6 text-center">
                    <Ruler className="mx-auto h-8 w-8 text-blue-400" />
                    <p className="mt-2 text-3xl font-black">
                      {Math.round(tdee).toLocaleString("fa-IR")}
                    </p>
                    <p className="mt-1 text-sm text-gray-400">TDEE (کالری روزانه)</p>
                  </div>
                </div>
                <div className="glass mt-4 rounded-3xl p-6 text-sm leading-7 text-gray-300">
                  <span className="font-bold text-brand-400">تحلیل سلامت‌یار: </span>
                  {analysis}
                </div>
              </div>
            )}

            {bmi <= 0 && (
              <p className="mt-6 text-center text-sm text-gray-400">
                برای دیدن BMI و تحلیل، سن و قد رو پر کن و از صفحه اصلی حداقل یک
                برنامه روزانه بگیر تا وزن ثبت بشه.
              </p>
            )}
          </>
        )}
      </main>
    </div>
  );
}
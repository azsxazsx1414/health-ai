"use client";

import { useEffect, useRef, useState } from "react";
import { Bell, BellOff } from "lucide-react";
import { auth, db } from "@/lib/firebase";
import { collection, getDocs, query, where } from "firebase/firestore";

export default function WaterReminder() {
  const [on, setOn] = useState(false);
  const [mode, setMode] = useState("60");
  const [permission, setPermission] = useState<string>("default");
  const timer = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (typeof Notification !== "undefined") {
      setPermission(Notification.permission);
    }
    if ("serviceWorker" in navigator) {
      navigator.serviceWorker.register("/sw.js").catch(() => {});
    }
    return () => {
      if (timer.current) clearInterval(timer.current);
    };
  }, []);

  const smartInterval = async (): Promise<{ ms: number; reason: string }> => {
    try {
      const uid = auth.currentUser?.uid;
      if (!uid)
        return { ms: 60 * 60000, reason: "برای شخصی‌سازی، وارد حسابت شو." };
      const q = query(collection(db, "logs"), where("user_id", "==", uid));
      const snap = await getDocs(q);
      if (snap.empty)
        return {
          ms: 60 * 60000,
          reason: "هنوز داده‌ای نداری؛ هر ۶۰ دقیقه یادآوری می‌کنم.",
        };
      const rows = snap.docs.map((d) => d.data() as any);
      rows.sort((a: any, b: any) =>
        String(a.log_date || "").localeCompare(String(b.log_date || ""))
      );
      const last = rows[rows.length - 1];
      let minutes = 60;
      const reasons: string[] = [];
      const temp = Number(last.temperature) || 25;
      const steps = Number(last.steps) || 0;
      const wc = Number(last.water_consumed) || 0;
      const wt = Number(last.water) || 2.5;
      if (temp > 30) {
        minutes -= 15;
        reasons.push("هوا گرمه");
      }
      if (steps > 8000) {
        minutes -= 10;
        reasons.push("فعالیتت زیاده");
      }
      if (wc < wt) {
        minutes -= 10;
        reasons.push("آب امروزت کم بوده");
      }
      minutes = Math.max(20, minutes);
      return {
        ms: minutes * 60000,
        reason: reasons.length
          ? `چون ${reasons.join(" و ")}, هر ${minutes} دقیقه یادآوری می‌کنم.`
          : `شرایطت متعادله؛ هر ${minutes} دقیقه یادآوری می‌کنم.`,
      };
    } catch {
      return { ms: 60 * 60000, reason: "هر ۶۰ دقیقه یادآوری می‌کنم." };
    }
  };

  const toggle = async () => {
    if (on) {
      if (timer.current) clearInterval(timer.current);
      setOn(false);
      return;
    }

    let perm = permission;
    if (perm === "default") {
      perm = await Notification.requestPermission();
      setPermission(perm);
    }
    if (perm !== "granted") {
      alert("برای یادآوری، اجازه اعلان رو در مرورگر تأیید کن");
      return;
    }

    let ms = 60 * 60000;
    let reason = "";
    if (mode === "smart") {
      const s = await smartInterval();
      ms = s.ms;
      reason = s.reason;
    } else {
      ms = Math.max(1, parseInt(mode) || 60) * 60 * 1000;
    }

    timer.current = setInterval(() => {
      new Notification("سلامت‌یار 💧", {
        body: "وقت آب خوردنه! یه لیوان آب بنوش 🌊",
      });
    }, ms);
    setOn(true);
    new Notification("سلامت‌یار 💧", {
      body:
        mode === "smart"
          ? `یادآوری هوشمند فعال شد. ${reason}`
          : `یادآوری آب هر ${mode} دقیقه فعال شد`,
    });
  };

  return (
    <div className="fixed bottom-4 left-4 z-50 flex items-center gap-2">
      <select
        value={mode}
        onChange={(e) => setMode(e.target.value)}
        className="glass rounded-full px-3 py-2 text-xs text-gray-300"
      >
        <option value="smart">هوشمند 🤖 (پیشنهادی)</option>
        <option value="1">هر ۱ دقیقه (تست)</option>
        <option value="60">هر ۶۰ دقیقه</option>
        <option value="90">هر ۹۰ دقیقه</option>
      </select>
      <button
        onClick={toggle}
        className={`glass flex items-center gap-2 rounded-full px-4 py-2 text-xs font-bold ${
          on ? "text-brand-400" : "text-gray-300"
        }`}
      >
        {on ? <Bell className="h-4 w-4" /> : <BellOff className="h-4 w-4" />}
        {on ? "یادآوری: روشن" : "یادآوری: خاموش"}
      </button>
    </div>
  );
}
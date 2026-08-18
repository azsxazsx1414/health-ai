"use client";

import { useEffect, useRef, useState } from "react";
import { Bell, BellOff } from "lucide-react";

export default function WaterReminder() {
  const [on, setOn] = useState(false);
  const [minutes, setMinutes] = useState("60");
  const [permission, setPermission] = useState<string>("default");
  const timer = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (typeof Notification !== "undefined") {
      setPermission(Notification.permission);
      if ("serviceWorker" in navigator) {
        navigator.serviceWorker.register("/sw.js").catch(() => {});
      }
    }
    return () => {
      if (timer.current) clearInterval(timer.current);
    };
  }, []);

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

    const ms = Math.max(1, parseInt(minutes) || 60) * 60 * 1000;
    timer.current = setInterval(() => {
      new Notification("سلامت‌یار 💧", {
        body: "وقت آب خوردنه! یه لیوان آب بنوش 🌊",
      });
    }, ms);
    setOn(true);
    new Notification("سلامت‌یار 💧", {
      body: `یادآوری آب هر ${minutes} دقیقه فعال شد`,
    });
  };

  return (
    <div className="fixed bottom-4 left-4 z-50 flex items-center gap-2">
      <select
        value={minutes}
        onChange={(e) => setMinutes(e.target.value)}
        className="glass rounded-full px-3 py-2 text-xs text-gray-300"
      >
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
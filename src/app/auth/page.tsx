"use client";

// AUTH PAGE - صفحه ثبت‌نام و ورود

import { useState } from "react";
import { useRouter } from "next/navigation";
import { auth } from "@/lib/firebase";
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
} from "firebase/auth";
import { HeartPulse, LogIn, UserPlus } from "lucide-react";

export default function AuthPage() {
  const [mode, setMode] = useState<"register" | "login">("register");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const submit = async () => {
    setError("");
    setLoading(true);
    try {
      if (mode === "register") {
        await createUserWithEmailAndPassword(auth, email, password);
      } else {
        await signInWithEmailAndPassword(auth, email, password);
      }
      router.push("/");
    } catch (e: any) {
      setError("خطا: " + (e.message || "مشکلی پیش اومد"));
    }
    setLoading(false);
  };

  return (
    <div className="bg-aurora flex min-h-screen items-center justify-center px-4">
      <div className="glass w-full max-w-md rounded-3xl p-8">
        <div className="mb-8 flex items-center justify-center gap-3">
          <div className="btn-glow flex h-12 w-12 items-center justify-center rounded-2xl">
            <HeartPulse className="h-7 w-7 text-white" />
          </div>
          <span className="text-2xl font-black">سلامت‌یار</span>
        </div>

        <div className="mb-6 grid grid-cols-2 gap-2 rounded-xl bg-white/5 p-1">
          <button
            onClick={() => setMode("register")}
            className={`flex items-center justify-center gap-2 rounded-lg py-2.5 text-sm font-bold transition ${
              mode === "register" ? "btn-glow text-white" : "text-gray-400"
            }`}
          >
            <UserPlus className="h-4 w-4" /> ثبت‌نام
          </button>
          <button
            onClick={() => setMode("login")}
            className={`flex items-center justify-center gap-2 rounded-lg py-2.5 text-sm font-bold transition ${
              mode === "login" ? "btn-glow text-white" : "text-gray-400"
            }`}
          >
            <LogIn className="h-4 w-4" /> ورود
          </button>
        </div>

        <label className="block">
          <span className="mb-2 block text-sm text-gray-300">ایمیل</span>
          <input
            dir="ltr"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            type="email"
            placeholder="you@example.com"
            className="input-glass w-full rounded-xl px-4 py-3 text-left"
          />
        </label>

        <label className="mt-4 block">
          <span className="mb-2 block text-sm text-gray-300">رمز عبور</span>
          <input
            dir="ltr"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            type="password"
            placeholder="حداقل ۶ کاراکتر"
            className="input-glass w-full rounded-xl px-4 py-3 text-left"
          />
        </label>

        {error && (
          <p className="mt-4 rounded-xl bg-red-500/10 px-4 py-3 text-sm text-red-400">
            {error}
          </p>
        )}

        <button
          onClick={submit}
          disabled={loading}
          className="btn-glow mt-6 w-full rounded-xl py-4 text-lg font-bold text-white disabled:opacity-50"
        >
          {loading
            ? "صبر کن..."
            : mode === "register"
              ? "ساخت حساب ✨"
              : "ورود به سلامت‌یار"}
        </button>
      </div>
    </div>
  );
}
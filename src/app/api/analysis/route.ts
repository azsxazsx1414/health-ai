import { NextResponse } from "next/server";

const MODELS = ["gemini-3.6-flash", "gemini-3.5-flash-lite"];

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const water = searchParams.get("water") || "0";
  const waterTarget = searchParams.get("waterTarget") || "2.5";
  const steps = searchParams.get("steps") || "0";
  const trend = searchParams.get("trend") || "نامشخص";
  const predicted = searchParams.get("predicted") || "";
  const score = searchParams.get("score") || "0";
  const key = process.env.GEMINI_API_KEY;

  const prompt = `تو دستیار تحلیل سلامت یک اپلیکیشن ایرانی هستی. آمار کاربر: میانگین آب مصرفی ${water} لیتر (هدف ${waterTarget} لیتر)، میانگین قدم روزانه ${steps}، روند وزن ${trend}${
    predicted ? `، وزن پیش‌بینی‌شده ۳۰ روز آینده ${predicted} کیلوگرم` : ""
  }، امتیاز سلامت ${score} از ۱۰۰. در ۳ تا  جمله کوتاه، دوستانه و به زبان فارسی، وضعیت رو تحلیل کن و مهم‌ترین توصیه رو بگو.`;

  if (key) {
    for (const model of MODELS) {
      try {
        const res = await fetch(
          `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${key}`,
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              contents: [{ parts: [{ text: prompt }] }],
            }),
          }
        );
        if (!res.ok) continue;
        const data: any = await res.json();
        const parts: Array<{ text?: string }> =
          data?.candidates?.[0]?.content?.parts || [];
        const text: string = parts
          .map((p: { text?: string }) => p.text || "")
          .join("\n")
          .trim();
        if (text.length > 0) {
          return NextResponse.json({ text });
        }
      } catch {
        continue;
      }
    }
  }

  return NextResponse.json({
    text: "بر اساس آمارت، منظم بودن در ثبت روزانه مهم‌ترین قدمه. مصرف آب و فعالیتت رو کمی جدی‌تر بگیر تا امتیاز سلامتت بالاتر بره.",
  });
}
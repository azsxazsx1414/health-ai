import { NextResponse } from "next/server";

const FALLBACK = [
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

const MODELS = ["gemini-3.6-flash", "gemini-3.5-flash-lite"];

type DebugInfo = { model: string; status?: number; error?: string };

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const calories = searchParams.get("calories") || "2000";
  const temp = searchParams.get("temp") || "25";
  const key = process.env.GEMINI_API_KEY;
  const debug: DebugInfo[] = [];

  const prompt = `تو یک متخصص تغذیه ایرانی هستی. برای یک روز با کالری هدف ${calories} و هوای ${temp} درجه، سه غذای ساده، ارزان و در دسترس در ایران پیشنهاد بده. جواب رو دقیقاً با این فرمت و بدون توضیح اضافه برگردون (هر غذا یک خط):
نام غذا | کالری تقریبی | یک جمله کوتاه درباره‌ش`;

  if (!key) {
    debug.push({ model: "none", error: "key not found" });
  } else {
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
        if (!res.ok) {
          const errText = await res.text();
          debug.push({ model, status: res.status, error: errText.slice(0, 200) });
          continue;
        }
        const data: any = await res.json();
        const parts: Array<{ text?: string }> =
          data?.candidates?.[0]?.content?.parts || [];
        const text: string = parts
          .map((p: { text?: string }) => p.text || "")
          .join("\n");
        const lines: string[] = text
          .split("\n")
          .map((l: string) => l.trim().replace(/^\d+[.)-]?\s*/, ""))
          .filter((l: string) => l.includes("|"));
        const meals = lines.slice(-3).map((line: string) => {
          const p: string[] = line.split("|").map((x: string) => x.trim());
          return {
            name: p[0] || "غذای ساده",
            cal: parseInt(p[1]) || 300,
            desc: p[2] || "",
          };
        });
        if (meals.length > 0) {
          return NextResponse.json({ meals, source: "ai" });
        }
        debug.push({ model, error: "parsed 0 meals" });
      } catch (e: unknown) {
        debug.push({ model, error: String(e) });
        continue;
      }
    }
  }

  return NextResponse.json({ meals: FALLBACK, source: "fallback", debug });
}
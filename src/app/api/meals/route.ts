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

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const calories = searchParams.get("calories") || "2000";
  const temp = searchParams.get("temp") || "25";

  const prompt = `تو یک متخصص تغذیه ایرانی هستی. برای یک روز با کالری هدف ${calories} و هوای ${temp} درجه، سه غذای ساده، ارزان و در دسترس در ایران پیشنهاد بده. جواب رو دقیقاً با این فرمت و بدون توضیح اضافه برگردون (هر غذا یک خط):
نام غذا | کالری تقریبی | یک جمله کوتاه درباره‌ش`;

  try {
    const res = await fetch(
      `https://text.pollinations.ai/${encodeURIComponent(prompt)}`
    );
    if (!res.ok) throw new Error("ai failed");
    const text = await res.text();
    const lines = text
      .split("\n")
      .map((l) => l.trim().replace(/^\d+[.)-]?\s*/, ""))
      .filter((l) => l.includes("|"));
    const meals = lines.slice(0, 3).map((line) => {
      const parts = line.split("|").map((p) => p.trim());
      return {
        name: parts[0] || "غذای ساده",
        cal: parseInt(parts[1]) || 300,
        desc: parts[2] || "",
      };
    });
    if (meals.length === 0) throw new Error("empty");
    return NextResponse.json({ meals, source: "ai" });
  } catch {
    return NextResponse.json({ meals: FALLBACK, source: "fallback" });
  }
}
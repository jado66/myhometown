import { NextResponse } from "next/server";
import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(req) {
  try {
    const { text } = await req.json();

    if (!text) {
      return NextResponse.json(
        { error: "Missing required field: text" },
        { status: 400 }
      );
    }

    const languages = ["Spanish", "Portuguese", "Filipino"];
    const translations = {};

    for (const language of languages) {
      const completion = await openai.chat.completions.create({
        model: "gpt-3.5-turbo",
        messages: [
          {
            role: "system",
            content: `You are a translator. Translate the following text to ${language}.`,
          },
          { role: "user", content: text },
        ],
      });

      translations[language.toLowerCase()] =
        completion.choices[0].message.content;
    }

    return NextResponse.json(translations);
  } catch (error) {
    console.error("Translation error:", error);
    return NextResponse.json({ error: "Translation failed" }, { status: 500 });
  }
}

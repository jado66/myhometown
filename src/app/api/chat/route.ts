// import { GoogleGenerativeAI } from "@google/generative-ai";
import { type NextRequest, NextResponse } from "next/server";

// const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");

export async function POST(request: NextRequest) {
  try {
    const { message, history } = await request.json();

    if (!process.env.GEMINI_API_KEY) {
      return NextResponse.json(
        { error: "GEMINI_API_KEY is not configured" },
        { status: 500 }
      );
    }

    // const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    // // Convert chat history to Gemini format
    // const chatHistory = history
    //   .slice(1) // Skip the initial greeting
    //   .map((msg: any) => ({
    //     role: msg.role === "assistant" ? "model" : "user",
    //     parts: [{ text: msg.content }],
    //   }));

    // const chat = model.startChat({
    //   history: chatHistory,
    //   generationConfig: {
    //     maxOutputTokens: 1000,
    //     temperature: 0.7,
    //   },
    // });

    // const result = await chat.sendMessage(message);
    // const response = await result.response;
    // const text = response.text();

    return NextResponse.json({ message: "text" });
  } catch (error) {
    console.error("Error in chat API:", error);
    return NextResponse.json(
      { error: "Failed to generate response" },
      { status: 500 }
    );
  }
}

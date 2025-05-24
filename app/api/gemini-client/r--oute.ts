import { GoogleGenerativeAI } from "@google/generative-ai";
import { validateSchema } from "../core/schema-validator";
import { NextResponse } from "next/server"
import { buildPrompt } from "../core/prompt-engine";
import { UISchema } from "../../../lib/types";
import { generateCode } from "../core/code-generator";
import z from "zod";
import { message } from "../../../lib/types";


import { GoogleGenAI } from "@google/genai";

export async function POST(req: Request) {
  try{
const { messages, modelVersion = "gemini-2.0-flash" } = await req.json();

    // Get API key from environment variables
    const apiKey = process.env.GEMINI_API_KEY;
    

    if (!apiKey) {
      console.error("Missing Gemini API key");
      return NextResponse.json(
        {
          error:
            "Missing API key. Please add GOOGLE_API_KEY to your environment variables.",
        },
        { status: 500 }
      );
    }

    // Initialize the Gemini API
    const genAI = new GoogleGenAI({
      apiKey,
    });

    // Format messages for Gemini
    const formattedMessages = messages.map((message: message) => ({
      role: message.role === "user" ? "user" : "model",
      parts: [{ text: buildPrompt(message.content) }],
    }));

    // Create a chat session
    const chat = genAI.chats.create({
      model: modelVersion,
      history: formattedMessages.slice(0, -1),
    });

const schema = await chat.sendMessage({
  message: buildPrompt(messages[messages.length - 1].content),
 
});

  return new Response(schema, {
      headers: {
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache",
        Connection: "keep-alive",
      },
    });
  } catch (error) {
    console.error("API route error:", error);
    return NextResponse.json(
      { error: "Failed to process request" },
      { status: 500 }
    );
  }
}

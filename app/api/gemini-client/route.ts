import { NextResponse } from "next/server";
import { buildPrompt } from "../core/prompt-engine";
// import { validateSchema } from "../core/schema-validator";
import { GoogleGenAI } from "@google/genai";
import { message } from "@/lib/types";
// Allow streaming responses up to 30 seconds
export const maxDuration = 30;

export async function POST(req: Request) {
  try {
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

    // Get the last message (the one we're responding to)
    const lastMessage = formattedMessages[formattedMessages.length - 1];

    // Create a new ReadableStream for streaming the response
    const stream = new ReadableStream({
      async start(controller) {
        try {
          const result = await chat.sendMessageStream({ message: lastMessage });

          for await (const chunk of result) {
            const text = chunk.text;

            if (text) {
              controller.enqueue(
                new TextEncoder().encode(
                  `data: ${JSON.stringify({ text })}\n\n`
                )
              );
            }
          }

          controller.enqueue(new TextEncoder().encode("data: [DONE]\n\n"));
          controller.close();
        } catch (error) {
          console.error("Error streaming response:", error);
          controller.enqueue(
            new TextEncoder().encode(
              `data: ${JSON.stringify({
                error: error || "Error generating response",
              })}\n\n`
            )
          );
          controller.close();
        }
      },
    });

    console.log("Streaming response started");

    return new Response(stream, {
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

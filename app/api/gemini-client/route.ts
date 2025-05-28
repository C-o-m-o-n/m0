import { NextResponse } from "next/server";
import { createWorkflow } from "../core/agentic-core/workflow";
import { AgentState } from "@/lib/types";

export const maxDuration = 30;

export async function POST(req: Request) {
  try {
    const { messages } = await req.json();
    const lastMessage = messages[messages.length - 1].content;

    // Initialize workflow
    const workflow = await createWorkflow();
    
    // Create a new ReadableStream for streaming
    const stream = new ReadableStream({
      async start(controller) {
        try {
          // Initial state
          const initialState: AgentState = {
            messages,
            prompt: lastMessage,
            schema: null,
            code: null,
            errors: [],
            validationPassed: false
          };

          // Generate a unique thread ID for this conversation
          const threadId = Date.now().toString();

          // Execute workflow with thread_id configuration
          const streamResult = await workflow.stream(
            initialState,
            { configurable: { thread_id: threadId } }
          );
          
          for await (const step of streamResult) {
            // The step is the current state
            const state = step as AgentState;
            
            // Send updates to client if there are new messages
            if (state.messages && state.messages.length > 0) {
              const lastMsg = state.messages[state.messages.length - 1];
              if (lastMsg.role === "assistant") {
                controller.enqueue(
                  new TextEncoder().encode(
                    `data: ${JSON.stringify({ text: lastMsg.content })}\n\n`
                  )
                );
              }
            }
          }

          controller.enqueue(new TextEncoder().encode("data: [DONE]\n\n"));
          controller.close();
        } catch (error) {
          console.error("Error in workflow:", error);
          controller.enqueue(
            new TextEncoder().encode(
              `data: ${JSON.stringify({ error: "Workflow execution failed" })}\n\n`
            )
          );
          controller.close();
        }
      },
    });

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
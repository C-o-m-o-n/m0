import { GoogleGenerativeAI } from "@google/generative-ai";
import { AgentState, UISchema } from "../../../../../lib/types";

export async function generateUISchema(state: AgentState): Promise<AgentState> {
  const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);
  const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });
  
  const prompt = `
    Generate a React Native UI schema in JSON for: "${state.prompt}".
    Rules:
    - Use ONLY: View, Text, TextInput, Button, Image
    - Include StyleSheet styles
    - Return ONLY valid JSON
    Example: { "components": [{ "type": "View", "props": {}, "children": [] }] }
  `;

  const result = await model.generateContent(prompt);
  const text = result.response.text();
  
  // Extract JSON from response
  const jsonStart = text.indexOf('{');
  const jsonEnd = text.lastIndexOf('}') + 1;
  const jsonString = text.slice(jsonStart, jsonEnd);

  return {
    ...state,
    schema: JSON.parse(jsonString) as UISchema,
    messages: [
      ...state.messages,
      { 
        id: Date.now().toString(),
        role: "assistant",
        content: `Generated schema: ${jsonString}` 
      }
    ]
  };
}
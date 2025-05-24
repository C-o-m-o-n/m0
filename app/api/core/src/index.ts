import { buildPrompt } from "../prompt-engine";
import { generateUISchema } from "../../gemini-client/r--oute";
import { validateSchema } from "../schema-validator";
import { generateCode } from "../code-generator";
import { PipelineInput, PipelineOutput } from "../../../../lib/types";

// The core pipeline (easy to replace with LangGraph later)
export async function runPipeline(
  input: PipelineInput
): Promise<PipelineOutput> {
  // 1. Generate prompt
  const prompt = buildPrompt(input.prompt);

  // 2. Call Gemini
  const rawJson = await generateUISchema(prompt);

  // 3. Validate
  const schema = validateSchema(rawJson);

  // 4. Generate code
  const code = generateCode(schema);

  return { code, schema };
}

// Example usage
// runPipeline({ prompt: "A login screen with a logo" })
//   .then(console.log)
//   .catch(console.error);
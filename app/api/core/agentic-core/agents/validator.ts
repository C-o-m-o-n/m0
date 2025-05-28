import { z } from "zod";
import { AgentState, UIComponent, UISchema } from "../../../../../lib/types";

export type ComponentType = UIComponent;

const componentSchema: z.ZodType<ComponentType> = z.object({
  type: z.enum(["View", "Text", "TextInput", "Button", "Image"]),
  props: z.record(z.unknown()),
  children: z.array(z.lazy(() => componentSchema)).optional()
});

const uiSchema = z.object({
  components: z.array(componentSchema)
});

export async function validateSchema(state: AgentState): Promise<AgentState> {
  try {
    if (!state.schema) throw new Error("No schema to validate");
    
    const result = uiSchema.parse(state.schema) as UISchema;
    
    return {
      ...state,
      schema: result,
      validationPassed: true,
      messages: [
        ...state.messages,
        { 
          id: Date.now().toString(),
          role: "assistant", 
          content: "Schema validation passed" 
        }
      ]
    };
  } catch (error) {
    return {
      ...state,
      validationPassed: false,
      errors: [
        ...(state.errors || []),
        error instanceof Error ? error.message : "Validation failed"
      ],
      messages: [
        ...state.messages,
        { 
          id: Date.now().toString(),
          role: "assistant", 
          content: `Validation failed: ${error}` 
        }
      ]
    };
  }
}
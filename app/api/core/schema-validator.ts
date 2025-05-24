import { z } from "zod";
import { UISchema } from "../../../lib/types";

// Define all allowed component types
const allowedComponents = [
  "View", "Text", "TextInput", 
  "Button", "Image", "ScrollView"
] as const;

// Zod schema for style objects
const styleSchema = z.record(z.any()).optional();

// Zod schema for a single component
const componentSchema = z.object({
  type: z.enum(allowedComponents),
  props: z.record(z.any()).optional(),
  children: z.lazy(() => z.array(componentSchema).optional()),
  style: styleSchema,
});

// Main schema validator
export const validateSchema = (data: any): UISchema => {
  const schema = z.object({
    components: z.array(componentSchema),
  });

  try {
    const result = schema.parse(data);
    
    // Additional validation checks
    if (result.components.length === 0) {
      throw new Error("Schema must contain at least one component");
    }
    
    return result;
  } catch (error) {
    if (error instanceof z.ZodError) {
      console.error("Validation errors:", error.errors);
      throw new Error(`Schema validation failed: ${error.errors.map(e => e.message).join(", ")}`);
    }
    throw error;
  }
};
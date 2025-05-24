// Shared interfaces for future LangGraph compatibility
export interface UISchema {
  components: {
    type: string; // "View", "TextInput", etc.
    props: Record<string, unknown>;
    children?: UISchema[];
  }[];
  styles?: Record<string, unknown>;
}

export interface PipelineInput {
  prompt: string;
  theme?: "light" | "dark"; // Extend later
}

export interface PipelineOutput {
  code: string;
  schema: UISchema;
}

export interface message {
  id: string
  content: string
  role: "user" | "assistant"
  timestamp?: number
}
export interface Conversation {
  id: string
  title: string
  messages: message[]
}
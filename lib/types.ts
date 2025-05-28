// Shared interfaces for future LangGraph compatibility
export type UIComponent = {
  type: "View" | "Text" | "TextInput" | "Button" | "Image";
  props: Record<string, unknown>;
  children?: UIComponent[];
};

export interface UISchema {
  components: UIComponent[];
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

export interface AgentState {
  messages: message[];
  prompt: string;
  schema: UISchema | null;
  code: string | null;
  errors: string[];
  validationPassed: boolean;
}

export interface NodeResult {
  key: string;
  result: unknown;
}
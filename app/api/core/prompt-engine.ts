// import { UISchema } from "../../../lib/types";

export const buildPrompt = (input: string): string => {

  return `
    Generate a React Native UI schema in JSON for: "${input}".
    Rules:
    - Use ONLY these components: View, Text, TextInput, Button, Image.
    - Styles must use React Native's StyleSheet syntax.
    - Ensure the JSON is valid and well-formed.
    - Example: { components: [{ type: "View", props: {}, children: [...] }] }
    - Do not include any additional text or comments, just the JSON.
    - generate the react native code for the above schema.
    - make sure to import all the components used in the schema.
    
  `;
};
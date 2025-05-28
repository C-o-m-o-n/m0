import { AgentState } from "../../../../../lib/types";

type Component = {
  type: "View" | "Text" | "TextInput" | "Button" | "Image";
  props: Record<string, unknown>;
  children?: Component[];
};

export async function generateCode(state: AgentState): Promise<AgentState> {
  if (!state.validationPassed || !state.schema) {
    return {
      ...state,
      errors: [
        ...(state.errors || []),
        "Cannot generate code without valid schema"
      ]
    };
  }

  const { components } = state.schema;
  const usedComponents = new Set<string>();

  // Extract all component types
  const extractComponents = (comps: Component[]) => {
    comps.forEach(comp => {
      usedComponents.add(comp.type);
      if (comp.children) extractComponents(comp.children);
    });
  };
  extractComponents(components as unknown as Component[]);

  // Generate component JSX
  const generateComponentJSX = (comp: Component, indent = 2): string => {
    const props = comp.props ? Object.entries(comp.props)
      .map(([key, val]) => {
        if (key === 'style') {
          return `style={styles.${val as string}}`;
        }
        return `${key}={${JSON.stringify(val)}}`;
      })
      .join(' ') : '';
      
    const children = comp.children 
      ? comp.children.map(child => generateComponentJSX(child, indent + 2)).join('\n' + ' '.repeat(indent))
      : '';
      
    return `${''.padStart(indent)}<${comp.type} ${props}>${children ? '\n' + children + '\n' + ''.padStart(indent) : ''}</${comp.type}>`;
  };

  const componentJSX = (components as unknown as Component[])
    .map(comp => generateComponentJSX(comp))
    .join('\n');

  const code = `import React from 'react';
import { ${Array.from(usedComponents).join(', ')}, StyleSheet } from 'react-native-web';

export default function GeneratedScreen() {
  return (
${componentJSX}
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
  },
  text: {
    fontSize: 16,
    color: '#000',
  },
  input: {
    height: 40,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    padding: 10,
    marginVertical: 10,
  },
  button: {
    backgroundColor: '#007AFF',
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  image: {
    width: '100%',
    height: 200,
    borderRadius: 8,
    marginVertical: 10,
  },
});`;

  return {
    ...state,
    code,
    messages: [
      ...state.messages,
      { 
        id: Date.now().toString(),
        role: "assistant",
        content: "```tsx\n" + code + "\n```" 
      }
    ]
  };
}

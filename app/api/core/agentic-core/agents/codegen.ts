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

  const code = `import React from 'react';
import { View, Text, TextInput, Pressable, Image, StyleSheet } from 'react-native-web';

export default function GeneratedScreen() {
  return (
    <View style={styles.container}>
      <Image 
        source={require('./assets/logo.png')}
        style={styles.logo}
      />
      <Text style={styles.title}>Login</Text>
      <TextInput
        style={styles.input}
        placeholder="Email"
        keyboardType="email-address"
        placeholderTextColor="#999"
      />
      <TextInput
        style={styles.input}
        placeholder="Password"
        secureTextEntry
        placeholderTextColor="#999"
      />
      <Pressable 
        style={styles.button}
        onPress={() => alert('Login pressed')}
      >
        <Text style={styles.buttonText}>Login</Text>
      </Pressable>
      <Text style={styles.footerText}>
        Don't have an account? Sign up
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#f5f5f5',
  },
  logo: {
    width: 120,
    height: 120,
    marginBottom: 30,
    resizeMode: 'contain',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#000',
    marginBottom: 20,
    textAlign: 'center',
  },
  input: {
    width: '100%',
    height: 45,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    marginBottom: 15,
    backgroundColor: '#fff',
  },
  button: {
    width: '100%',
    backgroundColor: '#007AFF',
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 10,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  footerText: {
    marginTop: 20,
    color: '#666',
    fontSize: 14,
    textAlign: 'center',
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

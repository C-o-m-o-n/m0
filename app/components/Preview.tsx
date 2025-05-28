import React, { FC, useEffect, useState } from 'react';
import { View, Text, TextInput, Button, Image, StyleSheet } from 'react-native-web';
import { message } from '@/lib/types';

interface PreviewProps {
  messages: message[];
}

type Dependencies = {
  'react': typeof React;
  'react-native-web': {
    View: typeof View;
    Text: typeof Text;
    TextInput: typeof TextInput;
    Button: typeof Button;
    Image: typeof Image;
    StyleSheet: typeof StyleSheet;
  };
};

const Preview: FC<PreviewProps> = ({ messages }) => {
  const [Component, setComponent] = useState<React.ComponentType | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const lastMessage = messages[messages.length - 1];
    if (!lastMessage || lastMessage.role !== 'assistant' || !lastMessage.content) {
      return;
    }

    try {
      // Extract the code from the message content
      const codeMatch = lastMessage.content.match(/```(?:jsx|tsx)?\n([\s\S]*?)\n```/);
      if (!codeMatch) {
        setError('No valid code block found in the message');
        return;
      }

      const code = codeMatch[1];

      // Create the module code with proper exports
      const moduleCode = `
        const React = require('react');
        const ReactNativeWeb = require('react-native-web');
        const { View, Text, TextInput, Button, Image, StyleSheet } = ReactNativeWeb;

        ${code}

        return GeneratedScreen;
      `;

      // Create and evaluate the component
      const createComponent = new Function('require', moduleCode);
      
      const dependencies: Dependencies = {
        'react': React,
        'react-native-web': {
          View, Text, TextInput, Button, Image, StyleSheet
        }
      };

      const mockRequire = (moduleName: keyof Dependencies) => {
        return dependencies[moduleName];
      };

      const GeneratedComponent = createComponent(mockRequire) as React.ComponentType;
      setComponent(() => GeneratedComponent);
      setError(null);
    } catch (err) {
      console.error('Error rendering preview:', err);
      setError(err instanceof Error ? err.message : 'Failed to render preview');
    }
  }, [messages]);

  if (error) {
    return (
      <View style={styles.container}>
        <View style={styles.errorContainer}>
          <Text style={styles.error}>Error: {error}</Text>
        </View>
      </View>
    );
  }

  if (!Component) {
    return (
      <View style={styles.container}>
        <View style={styles.placeholderContainer}>
          <Text style={styles.placeholder}>
            Your preview will appear here
          </Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.phoneFrame}>
        <View style={styles.notch} />
        <View style={styles.preview}>
          <Component />
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#f5f5f5',
    padding: 20,
  },
  phoneFrame: {
    width: 375,
    height: 812,
    backgroundColor: 'white',
    borderRadius: 40,
    overflow: 'hidden',
    position: 'relative',
    boxShadow: '0 10px 20px rgba(0,0,0,0.1)',
  },
  notch: {
    position: 'absolute',
    top: 0,
    left: '50%',
    transform: [{ translateX: -75 }],
    width: 150,
    height: 30,
    backgroundColor: '#000',
    borderBottomLeftRadius: 15,
    borderBottomRightRadius: 15,
    zIndex: 1,
  },
  preview: {
    flex: 1,
    padding: 20,
    paddingTop: 50,
  },
  placeholderContainer: {
    padding: 20,
    backgroundColor: 'white',
    borderRadius: 10,
  },
  placeholder: {
    fontSize: 16,
    color: '#666',
  },
  errorContainer: {
    padding: 20,
    backgroundColor: '#fee',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#fcc',
  },
  error: {
    fontSize: 14,
    color: '#c00',
  },
});

export default Preview; 
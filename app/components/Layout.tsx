import React, { useState } from 'react';
import { View, StyleSheet } from 'react-native-web';
import Chat from './Chat';
import EditorPreview from './EditorPreview';
import { message } from '@/lib/types';

export default function Layout() {
  const [messages, setMessages] = useState<message[]>([]);
  const [generatedCode, setGeneratedCode] = useState('');

  const handleNewMessage = async (content: string) => {
    const userMessage: message = {
      id: Date.now().toString(),
      role: 'user',
      content
    };

    setMessages(prev => [...prev, userMessage]);

    try {
      const response = await fetch('/api/gemini-client', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          messages: [...messages, userMessage]
        })
      });

      if (!response.body) throw new Error('No response body');

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let assistantMessage = '';

      while (true) {
        const { value, done } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value);
        const lines = chunk.split('\n');

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            const data = line.slice(5);
            if (data === '[DONE]') continue;

            try {
              const parsed = JSON.parse(data);
              if (parsed.text) {
                assistantMessage = parsed.text;
                // Extract code from the message
                const codeMatch = assistantMessage.match(/```(?:jsx|tsx)?\n([\s\S]*?)\n```/);
                if (codeMatch) {
                  setGeneratedCode(codeMatch[1]);
                }
                
                setMessages(prev => {
                  const lastMessage = prev[prev.length - 1];
                  if (lastMessage?.role === 'assistant') {
                    return [...prev.slice(0, -1), {
                      id: lastMessage.id,
                      role: 'assistant',
                      content: assistantMessage
                    }];
                  } else {
                    return [...prev, {
                      id: Date.now().toString(),
                      role: 'assistant',
                      content: assistantMessage
                    }];
                  }
                });
              }
            } catch (e) {
              console.error('Error parsing SSE message:', e);
            }
          }
        }
      }
    } catch (error) {
      console.error('Error sending message:', error);
    }
  };

  const handleCodeChange = (newCode: string) => {
    setGeneratedCode(newCode);
  };

  return (
    <View style={styles.container}>
      {/* Left side - Chat */}
      <View style={styles.chatSection}>
        <Chat messages={messages} onSendMessage={handleNewMessage} />
      </View>

      {/* Right side - Editor/Preview */}
      <View style={styles.editorSection}>
        <EditorPreview 
          messages={messages} 
          code={generatedCode} 
          onCodeChange={handleCodeChange}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: 'row',
    minHeight: '100%',
    backgroundColor: '#0F1117',
  },
  chatSection: {
    flex: 0.4,
    borderRightWidth: 1,
    borderRightColor: '#2D2D2D',
  },
  editorSection: {
    flex: 0.6,
  },
}); 
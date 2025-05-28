import React, { useState } from 'react';
import { View, Text, TextInput, ScrollView, Pressable, StyleSheet } from 'react-native-web';
import { message } from '@/lib/types';

interface ChatProps {
  messages: message[];
  onSendMessage: (content: string) => void;
}

export default function Chat({ messages, onSendMessage }: ChatProps) {
  const [input, setInput] = useState('');

  const handleSend = () => {
    if (!input.trim()) return;
    onSendMessage(input.trim());
    setInput('');
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>UI Generator</Text>
        <Text style={styles.version}>v0.1</Text>
      </View>

      {/* Messages */}
      <ScrollView style={styles.messages}>
        {messages.length === 0 ? (
          <View style={styles.emptyState}>
            <Text style={styles.emptyTitle}>Welcome to UI Generator</Text>
            <Text style={styles.emptyText}>
              Describe the UI you want to create, and I'll help you generate it.
            </Text>
          </View>
        ) : (
          messages.map((msg) => (
            <View
              key={msg.id}
              style={[
                styles.message,
                msg.role === 'user' ? styles.userMessage : styles.assistantMessage
              ]}
            >
              <Text style={styles.messageText}>{msg.content}</Text>
            </View>
          ))
        )}
      </ScrollView>

      {/* Input */}
      <View style={styles.inputContainer}>
        <TextInput
          style={styles.input}
          value={input}
          onChangeText={setInput}
          placeholder="Type a message..."
          placeholderTextColor="#666"
          multiline
          onSubmitEditing={handleSend}
        />
        <Pressable style={styles.sendButton} onPress={handleSend}>
          <Text style={styles.sendButtonText}>Send</Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0F1117',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#2D2D2D',
  },
  title: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  version: {
    color: '#666',
    fontSize: 14,
  },
  messages: {
    flex: 1,
    padding: 16,
  },
  emptyState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  emptyTitle: {
    color: '#fff',
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 12,
  },
  emptyText: {
    color: '#666',
    fontSize: 16,
    textAlign: 'center',
  },
  message: {
    marginBottom: 16,
    padding: 12,
    borderRadius: 8,
    maxWidth: '80%',
  },
  userMessage: {
    backgroundColor: '#2D2D2D',
    alignSelf: 'flex-end',
  },
  assistantMessage: {
    backgroundColor: '#1E1E1E',
    alignSelf: 'flex-start',
  },
  messageText: {
    color: '#fff',
    fontSize: 14,
    lineHeight: 20,
  },
  inputContainer: {
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: '#2D2D2D',
    flexDirection: 'row',
    alignItems: 'flex-end',
  },
  input: {
    flex: 1,
    backgroundColor: '#1E1E1E',
    borderRadius: 8,
    padding: 12,
    color: '#fff',
    fontSize: 14,
    marginRight: 12,
    maxHeight: 120,
    minHeight: 40,
  },
  sendButton: {
    backgroundColor: '#2D2D2D',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 6,
  },
  sendButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '500',
  },
}); 
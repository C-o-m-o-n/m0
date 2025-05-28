import React, { useState } from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native-web';
import Preview from './Preview';
import CodeEditor from './CodeEditor';
import { message } from '@/lib/types';

type Tab = 'preview' | 'code';

interface EditorPreviewProps {
  messages: message[];
  code: string;
  onCodeChange: (code: string) => void;
}

export default function EditorPreview({ messages, code, onCodeChange }: EditorPreviewProps) {
  const [activeTab, setActiveTab] = useState<Tab>('preview');

  return (
    <View style={styles.container}>
      {/* Tab Header */}
      <View style={styles.header}>
        <View style={styles.tabs}>
          <Pressable
            style={[styles.tab, activeTab === 'preview' && styles.activeTab]}
            onPress={() => setActiveTab('preview')}
          >
            <Text style={[styles.tabText, activeTab === 'preview' && styles.activeTabText]}>
              Preview
            </Text>
          </Pressable>
          <Pressable
            style={[styles.tab, activeTab === 'code' && styles.activeTab]}
            onPress={() => setActiveTab('code')}
          >
            <Text style={[styles.tabText, activeTab === 'code' && styles.activeTabText]}>
              Code
            </Text>
          </Pressable>
        </View>
        <View style={styles.actions}>
          <Pressable style={styles.actionButton}>
            <Text style={styles.actionButtonText}>v5 ▼</Text>
          </Pressable>
          <Pressable style={styles.actionButton}>
            <Text style={styles.actionButtonText}>Deploy</Text>
          </Pressable>
        </View>
      </View>

      {/* Content */}
      <View style={styles.content}>
        {activeTab === 'preview' ? (
          <Preview messages={messages} />
        ) : (
          <CodeEditor code={code} onChange={onCodeChange} />
        )}
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
    padding: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#2D2D2D',
  },
  tabs: {
    flexDirection: 'row',
    gap: 10,
  },
  tab: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 6,
  },
  activeTab: {
    backgroundColor: '#2D2D2D',
  },
  tabText: {
    color: '#888',
    fontSize: 14,
    fontWeight: '500',
  },
  activeTabText: {
    color: '#fff',
  },
  actions: {
    flexDirection: 'row',
    gap: 10,
  },
  actionButton: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 6,
    backgroundColor: '#2D2D2D',
  },
  actionButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '500',
  },
  content: {
    flex: 1,
  },
}); 
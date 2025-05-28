import { FC, useEffect, useRef, useState } from 'react';
import { message } from '@/lib/types';
import ChatMessage from './ChatMessage';
import ChatInput from './ChatInput';
import Preview from './Preview';

const Chat: FC = () => {
  const [messages, setMessages] = useState<message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = async (content: string) => {
    const userMessage: message = {
      id: Date.now().toString(),
      role: 'user',
      content
    };

    setMessages(prev => [...prev, userMessage]);
    setIsLoading(true);

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
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex h-screen bg-white dark:bg-gray-900">
      {/* Chat section */}
      <div className="flex flex-col w-1/2 border-r border-gray-200 dark:border-gray-700">
        {/* Messages container */}
        <div className="flex-1 overflow-y-auto pb-36">
          {messages.length === 0 ? (
            <div className="h-full flex items-center justify-center">
              <div className="text-center space-y-3 max-w-xl mx-auto px-4">
                <h1 className="text-4xl font-bold text-gray-900 dark:text-white">
                  UI Generator Assistant
                </h1>
                <p className="text-gray-600 dark:text-gray-400">
                  Describe the UI you want to create, and I{"'"}ll help you generate it.
                </p>
              </div>
            </div>
          ) : (
            messages.map(message => (
              <ChatMessage key={message.id} message={message} />
            ))
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input container */}
        <ChatInput onSend={handleSendMessage} disabled={isLoading} />
      </div>

      {/* Preview section */}
      <div className="w-1/2 h-full">
        <Preview messages={messages} />
      </div>
    </div>
  );
}

export default Chat; 
import React, { useState } from 'react';
import { Input, Button, List } from 'antd';
import axios from 'axios';

export default function AISuggestions() {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');

  const handleSend = async () => {
    if (!input.trim()) return;

    const userMessage = { sender: 'user', text: input };
    setMessages((prev) => [...prev, userMessage]);

    try {
      const response = await axios.post('/api/gemini/chat', { query: input });
      const aiMessage = { sender: 'ai', text: response.data.reply };
      setMessages((prev) => [...prev, aiMessage]);
    } catch (error) {
      console.error('Error:', error.response?.data || error.message || error);

      // Extract error details and ensure they are displayed as a string
      const errorDetails =
        typeof error.response?.data?.details === 'string'
          ? error.response.data.details
          : JSON.stringify(error.response?.data?.details || error.message || 'Something went wrong.');

      const errorMessage = {
        sender: 'ai',
        text: `Error: ${errorDetails}`,
      };
      setMessages((prev) => [...prev, errorMessage]);
    }

    setInput('');
  };

  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold mb-4">Personal AI Suggestions</h2>
      <div style={{ maxHeight: '400px', overflowY: 'auto', marginBottom: '16px' }}>
        <List
          dataSource={messages}
          renderItem={(message) => (
            <List.Item>
              <div style={{ textAlign: message.sender === 'user' ? 'right' : 'left' }}>
                <strong>{message.sender === 'user' ? 'You' : 'AI'}:</strong> {message.text}
              </div>
            </List.Item>
          )}
        />
      </div>
      <Input
        placeholder="Type your message..."
        value={input}
        onChange={(e) => setInput(e.target.value)}
        onPressEnter={handleSend}
        style={{ marginBottom: '8px' }}
      />
      <Button type="primary" onClick={handleSend}>
        Send
      </Button>
    </div>
  );
}
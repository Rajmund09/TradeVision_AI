import React, { createContext, useState } from 'react';

export const ChatContext = createContext(null);

export function ChatProvider({ children }) {
  const [messages, setMessages] = useState([]);

  const addMessage = (msg) => setMessages((prev) => [...prev, msg]);

  return (
    <ChatContext.Provider value={{ messages, addMessage }}>
      {children}
    </ChatContext.Provider>
  );
}

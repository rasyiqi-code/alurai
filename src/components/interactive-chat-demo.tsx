'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Bot, Send } from 'lucide-react';

export function InteractiveChatDemo() {
  const [messages, setMessages] = useState([
    { id: 1, type: 'bot', content: "Hi! What's your name?" },
    { id: 2, type: 'user', content: "John Smith" },
    { id: 3, type: 'bot', content: "Nice! What's your email?" }
  ]);
  const [inputValue, setInputValue] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Helper function to get message alignment class
  const getMessageAlignmentClass = (type: string) => {
    return type === 'user' ? 'justify-end' : 'justify-start';
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = () => {
    if (inputValue.trim() === '') return;

    // Add user message
    const newUserMessage = {
      id: messages.length + 1,
      type: 'user' as const,
      content: inputValue
    };
    
    setMessages(prev => [...prev, newUserMessage]);
    setInputValue('');

    // Add bot response after delay
    setTimeout(() => {
      const botResponses = [
        "Perfect! What's your phone number?",
        "Great! What type of inquiry is this?",
        "Thank you! We'll get back to you soon. Have a great day! 🎉"
      ];
      
      const nextResponse = botResponses[Math.min(messages.length - 3, botResponses.length - 1)];
      
      const newBotMessage = {
        id: messages.length + 2,
        type: 'bot' as const,
        content: nextResponse
      };
      
      setMessages(prev => [...prev, newBotMessage]);
    }, 1000);
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleSendMessage();
    }
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 h-full overflow-hidden">
      <div className="h-full flex flex-col">
        {/* Chat Header */}
        <div className="border-b border-gray-200 dark:border-gray-700 p-3 bg-gray-50 dark:bg-gray-900/50">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center">
              <Bot className="h-3 w-3 text-white" />
            </div>
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">AlurAI Assistant</span>
            <div className="w-2 h-2 bg-green-500 rounded-full ml-auto"></div>
          </div>
        </div>
        
        {/* Chat Messages */}
        <div className="flex-1 p-3 space-y-3 overflow-y-auto">
          {messages.map((message) => (
            <div key={message.id} className={`flex items-end gap-2 text-sm ${getMessageAlignmentClass(message.type)}`}>
              {message.type === 'bot' && (
                <div className="h-6 w-6 bg-blue-500 text-white rounded-full flex items-center justify-center flex-shrink-0">
                  <Bot size={12} />
                </div>
              )}
              <div className={`max-w-[75%] rounded-lg px-3 py-2 ${
                message.type === 'user' 
                  ? 'bg-blue-500 text-white' 
                  : 'bg-gray-100 dark:bg-gray-700'
              }`}>
                {message.content}
              </div>
              {message.type === 'user' && (
                <div className="h-6 w-6 bg-gray-200 dark:bg-gray-600 rounded-full flex items-center justify-center flex-shrink-0">
                  <span className="text-xs font-medium text-gray-600 dark:text-gray-300">U</span>
                </div>
              )}
            </div>
          ))}
          <div ref={messagesEndRef} />
        </div>
        
        {/* Input Area */}
        <div className="border-t border-gray-200 dark:border-gray-700 p-3 bg-gray-50 dark:bg-gray-900/50">
          <div className="flex gap-2">
            <input 
              type="text" 
              placeholder="Type your answer..." 
              className="flex-1 px-3 py-2 text-sm border border-gray-200 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyPress={handleKeyPress}
            />
            <button 
              className="px-3 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
              onClick={handleSendMessage}
            >
              <Send size={14} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

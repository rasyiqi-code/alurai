'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Bot, Send, FileText, Zap } from 'lucide-react';
import Link from 'next/link';

export function InteractiveDemo() {
  const [currentStep, setCurrentStep] = useState(0);
  const [messages, setMessages] = useState([
    {
      type: 'bot',
      content: "Hi! I'd love to help you get in touch. What's your name?",
      timestamp: new Date()
    }
  ]);

  // Helper function to get message alignment class
  const getMessageAlignmentClass = (type: string) => {
    return type === 'user' ? 'justify-end' : 'justify-start';
  };

  const questions = [
    "Hi! I'd love to help you get in touch. What's your name?",
    "Nice to meet you! What's your email address?",
    "Perfect! What's your phone number?",
    "Great! Tell us about your project or inquiry.",
    "Thank you! We'll get back to you soon. Have a great day! 🎉"
  ];

  const addUserMessage = (message: string) => {
    const newMessage = {
      type: 'user' as const,
      content: message,
      timestamp: new Date()
    };
    setMessages(prev => [...prev, newMessage]);
  };

  const addBotMessage = () => {
    if (currentStep < questions.length - 1) {
      const newMessage = {
        type: 'bot' as const,
        content: questions[currentStep + 1],
        timestamp: new Date()
      };
      setMessages(prev => [...prev, newMessage]);
      setCurrentStep(prev => prev + 1);
    }
  };

  const handleSendMessage = () => {
    const input = document.getElementById('chat-input') as HTMLInputElement;
    const value = input.value.trim();
    if (value) {
      addUserMessage(value);
      input.value = '';
      setTimeout(() => addBotMessage(), 1000);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSendMessage();
    }
  };

  return (
    <Card className="border-2 border-purple-200 dark:border-purple-800 bg-white dark:bg-gray-900 shadow-2xl">
      <CardContent className="p-0">
        <div className="grid grid-cols-1 lg:grid-cols-2 min-h-[600px]">
          {/* Left: Form Editor Preview */}
          <div className="p-6 border-r border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50">
            <div className="mb-4">
              <h3 className="text-lg font-semibold text-gray-700 dark:text-gray-300 mb-2">Form Editor</h3>
              <div className="flex gap-2 mb-4">
                <Button size="sm" variant="outline" className="text-xs">
                  <FileText className="mr-1 h-3 w-3" />
                  Save Draft
                </Button>
                <Button size="sm" variant="outline" className="text-xs">
                  <Zap className="mr-1 h-3 w-3" />
                  Optimize Flow
                </Button>
                <Button size="sm" className="text-xs bg-blue-500 hover:bg-blue-600">
                  <Send className="mr-1 h-3 w-3" />
                  Publish
                </Button>
              </div>
            </div>
            
            <div className="space-y-3">
              <div className="p-3 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-600">
                <h4 className="font-medium text-gray-800 dark:text-gray-200 text-sm">Contact Form</h4>
              </div>
              
              <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg border-2 border-blue-200 dark:border-blue-700">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-lg">#</span>
                  <span className="text-sm font-medium text-blue-700 dark:text-blue-300">What's your name?</span>
                </div>
                <p className="text-xs text-blue-600 dark:text-blue-400">Short answer</p>
              </div>
              
              <div className="p-3 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-600">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-lg">@</span>
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300">What's your email?</span>
                </div>
                <p className="text-xs text-gray-500 dark:text-gray-400">Email</p>
              </div>
              
              <div className="p-3 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-600">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-lg">📱</span>
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300">What's your phone number?</span>
                </div>
                <p className="text-xs text-gray-500 dark:text-gray-400">Phone</p>
              </div>
              
              <div className="p-3 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-600">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-lg">💬</span>
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Tell us about your project</span>
                </div>
                <p className="text-xs text-gray-500 dark:text-gray-400">Long answer</p>
              </div>
            </div>
          </div>

          {/* Right: Interactive Chat Preview */}
          <div className="p-6 bg-white dark:bg-gray-900">
            <div className="mb-4">
              <h3 className="text-lg font-semibold text-gray-700 dark:text-gray-300 mb-2">Live Preview</h3>
            </div>
            
            {/* Interactive Chat Interface */}
            <div className="bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 h-[500px] flex flex-col">
              {/* Chat Header */}
              <div className="border-b border-gray-200 dark:border-gray-700 p-3 bg-white dark:bg-gray-900 rounded-t-lg">
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center">
                    <Bot className="h-3 w-3 text-white" />
                  </div>
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300">AlurAI Assistant</span>
                  <div className="w-2 h-2 bg-green-500 rounded-full ml-auto"></div>
                </div>
              </div>
              
              {/* Chat Messages */}
              <div className="flex-1 p-4 space-y-4 overflow-y-auto">
                {messages.map((message, index) => (
                  <div key={index} className={`flex items-end gap-2 text-sm ${getMessageAlignmentClass(message.type)}`}>
                    {message.type === 'bot' && (
                      <div className="h-8 w-8 bg-blue-500 text-white rounded-full flex items-center justify-center flex-shrink-0">
                        <Bot size={16} />
                      </div>
                    )}
                    <div className={`max-w-[75%] rounded-lg px-4 py-2 ${
                      message.type === 'user' 
                        ? 'bg-blue-500 text-white' 
                        : 'bg-gray-100 dark:bg-gray-700'
                    }`}>
                      {message.content}
                    </div>
                    {message.type === 'user' && (
                      <div className="h-8 w-8 bg-gray-200 dark:bg-gray-600 rounded-full flex items-center justify-center flex-shrink-0">
                        <span className="text-xs font-medium text-gray-600 dark:text-gray-300">U</span>
                      </div>
                    )}
                  </div>
                ))}
              </div>
              
              {/* Input Area */}
              <div className="border-t border-gray-200 dark:border-gray-700 p-4 bg-white dark:bg-gray-900 rounded-b-lg">
                <div className="flex gap-2">
                  <input 
                    type="text" 
                    placeholder="Type your answer here..." 
                    className="flex-1 px-3 py-2 text-sm border border-gray-200 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                    id="chat-input"
                    onKeyPress={handleKeyPress}
                  />
                  <button 
                    className="px-3 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
                    onClick={handleSendMessage}
                  >
                    <Send size={16} />
                  </button>
                </div>
                <div className="mt-2">
                  <button className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400 hover:text-blue-500 transition-colors">
                    <Bot className="h-3 w-3" />
                    Auto-fill with AI
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

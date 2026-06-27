import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageSquare, X, Send, Bot, User, Loader2 } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import './ChatBot.css';
import { PYTHON_BACKEND_URL } from '../../config/env';

const ChatBot = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    { role: 'ai', text: '👋 Hi! I\'m **FloodGuard AI**, your expert on Pakistan\'s flood history.\n\nI have comprehensive knowledge from **1950 to 2025**. Ask me about:\n• Historical flood events\n• Damages and casualties\n• Risk assessments\n• Safety measures\n\nWhat would you like to know?' }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isOpen]);

  const handleSend = async () => {
    if (!input.trim()) return;

    const userMessage = { role: 'user', text: input };
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      console.log("Sending request to:", `${PYTHON_BACKEND_URL}/api/chat?query=${encodeURIComponent(userMessage.text)}`);
      const response = await fetch(`${PYTHON_BACKEND_URL}/api/chat?query=${encodeURIComponent(userMessage.text)}`);
      console.log("Response status:", response.status);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      console.log("Response data:", data);

      const aiMessage = { role: 'ai', text: data.response };
      setMessages(prev => [...prev, aiMessage]);
    } catch (error) {
      console.error("Chat error details:", error);
      console.error("Error message:", error.message);
      setMessages(prev => [...prev, { role: 'ai', text: "I'm having trouble accessing my knowledge base right now. Please try again in a moment." }]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <>
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="fixed bottom-24 right-6 w-96 h-[500px] bg-slate-900/95 backdrop-blur-xl border border-slate-700/50 rounded-2xl shadow-2xl flex flex-col z-50 overflow-hidden"
          >
            {/* Header */}
            <div className="p-4 border-b border-slate-700/50 bg-slate-800/50 flex justify-between items-center">
              <div className="flex items-center gap-2">
                <div className="p-2 bg-blue-500/20 rounded-lg">
                  <Bot className="w-5 h-5 text-blue-400" />
                </div>
                <div>
                  <h3 className="font-semibold text-white">FloodGuard AI</h3>
                  <div className="flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                    <span className="text-xs text-slate-400">Expert Assistant • Ready</span>
                  </div>
                </div>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className="p-2 hover:bg-slate-700/50 rounded-lg transition-colors text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4 scrollbar-thin scrollbar-thumb-slate-700 scrollbar-track-transparent">
              {messages.map((msg, idx) => (
                <div key={idx} className={`flex gap-3 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                  {msg.role === 'ai' && (
                    <div className="w-8 h-8 rounded-full bg-blue-500/20 flex items-center justify-center flex-shrink-0">
                      <Bot className="w-4 h-4 text-blue-400" />
                    </div>
                  )}
                  <div className={`
                    max-w-[80%] p-3 rounded-2xl text-sm leading-relaxed
                    ${msg.role === 'user'
                      ? 'bg-blue-600 text-white rounded-tr-sm'
                      : 'bg-slate-800/80 text-slate-200 border border-slate-700/50 rounded-tl-sm'}
                  `}>
                    {msg.role === 'ai' ? (
                      <ReactMarkdown
                        components={{
                          p: ({children}) => <p className="mb-2 last:mb-0">{children}</p>,
                          strong: ({children}) => <strong className="font-bold text-white">{children}</strong>,
                          ul: ({children}) => <ul className="list-disc ml-4 my-2 space-y-1">{children}</ul>,
                          ol: ({children}) => <ol className="list-decimal ml-4 my-2 space-y-1">{children}</ol>,
                          li: ({children}) => <li className="text-slate-200">{children}</li>,
                          h3: ({children}) => <h3 className="font-bold text-white mb-2 mt-3 first:mt-0">{children}</h3>,
                          code: ({children}) => <code className="bg-slate-900/50 px-1.5 py-0.5 rounded text-blue-300">{children}</code>,
                        }}
                      >
                        {msg.text}
                      </ReactMarkdown>
                    ) : (
                      <span className="whitespace-pre-line">{msg.text}</span>
                    )}
                  </div>
                  {msg.role === 'user' && (
                    <div className="w-8 h-8 rounded-full bg-slate-700/50 flex items-center justify-center flex-shrink-0">
                      <User className="w-4 h-4 text-slate-300" />
                    </div>
                  )}
                </div>
              ))}
              {isLoading && (
                <div className="flex gap-3">
                  <div className="w-8 h-8 rounded-full bg-blue-500/20 flex items-center justify-center">
                    <Bot className="w-4 h-4 text-blue-400" />
                  </div>
                  <div className="bg-slate-800/80 p-3 rounded-2xl rounded-tl-sm border border-slate-700/50 flex items-center gap-2">
                    <Loader2 className="w-4 h-4 text-blue-400 animate-spin" />
                    <span className="text-xs text-slate-400">Analyzing historical records...</span>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Input */}
            <div className="p-4 border-t border-slate-700/50 bg-slate-800/30">
              <div className="relative">
                <input
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={handleKeyPress}
                  placeholder="Ask about historical floods..."
                  className="w-full bg-slate-900/50 border border-slate-700 rounded-xl py-3 pl-4 pr-12 text-slate-200 placeholder-slate-500 focus:outline-none focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/50 transition-all"
                />
                <button
                  onClick={handleSend}
                  disabled={!input.trim() || isLoading}
                  className="absolute right-2 top-2 p-1.5 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 disabled:hover:bg-blue-600 rounded-lg text-white transition-colors"
                >
                  <Send className="w-4 h-4" />
                </button>
              </div>
              <div className="mt-2 flex flex-wrap justify-center gap-2">
                {['2010 floods', 'Lahore risk', 'What is flash flood?', 'Sindh damages'].map(suggestion => (
                  <button
                    key={suggestion}
                    onClick={() => {
                      setInput(suggestion);
                    }}
                    className="text-[10px] px-2 py-1 rounded-full bg-slate-800 border border-slate-700 text-slate-400 hover:text-white hover:border-slate-500 transition-colors"
                  >
                    {suggestion}
                  </button>
                ))}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => setIsOpen(!isOpen)}
        className="fixed bottom-6 right-6 p-4 bg-blue-600 hover:bg-blue-500 rounded-full shadow-lg shadow-blue-900/40 z-50 group flex items-center justify-center text-white"
        title="NDMA AI Analyst"
      >
        {isOpen ? (
          <X className="w-6 h-6" />
        ) : (
          <>
            <MessageSquare className="w-6 h-6" />
            <span className="absolute -top-1 -right-1 w-3 h-3 bg-emerald-400 rounded-full animate-pulse border-2 border-slate-900" />

            {/* Tooltip on hover */}
            <span className="absolute right-full mr-4 bg-slate-800 px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none border border-slate-700/50 text-blue-200">
              💬 Ask FloodGuard AI
            </span>
          </>
        )}
      </motion.button>
    </>
  );
};

export default ChatBot;


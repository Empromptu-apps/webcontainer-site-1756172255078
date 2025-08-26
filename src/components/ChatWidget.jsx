import React, { useState, useEffect, useRef } from 'react';

const ChatWidget = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [agentId, setAgentId] = useState(null);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    createSupportAgent();
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const createSupportAgent = async () => {
    try {
      const response = await fetch('https://builder.empromptu.ai/api_tools/create-agent', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer eeba1d9993534ab38cf63d3ee6ac4465',
          'X-Generated-App-ID': '1a83b945-41c4-4604-b24a-023ad43210e9',
          'X-Usage-Key': 'e08ae9e2a43e1db30b1f4dcab313c943'
        },
        body: JSON.stringify({
          instructions: `You are a helpful support assistant for the Tiny HabitsÂ® app. You can help users with:
          
1. Understanding the Tiny HabitsÂ® Method by BJ Fogg
2. How to create effective habit recipes
3. Troubleshooting app features
4. General questions about habit formation
5. Tips for staying motivated

Be friendly, supportive, and concise in your responses. Always encourage users to start small and celebrate their wins.`,
          agent_name: "Tiny Habits Support"
        })
      });
      
      const data = await response.json();
      if (data.agent_id) {
        setAgentId(data.agent_id);
        // Add welcome message
        setMessages([{
          type: 'ai',
          content: "Hi! I'm here to help you with the Tiny HabitsÂ® app. Ask me anything about creating habits, using the app, or the Tiny HabitsÂ® method!"
        }]);
      }
    } catch (error) {
      console.error('Support agent creation error:', error);
    }
  };

  const sendMessage = async () => {
    if (!inputValue.trim() || !agentId || isLoading) return;

    const userMessage = inputValue.trim();
    setInputValue('');
    setMessages(prev => [...prev, { type: 'user', content: userMessage }]);
    setIsLoading(true);

    try {
      const response = await fetch('https://builder.empromptu.ai/api_tools/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer eeba1d9993534ab38cf63d3ee6ac4465',
          'X-Generated-App-ID': '1a83b945-41c4-4604-b24a-023ad43210e9',
          'X-Usage-Key': 'e08ae9e2a43e1db30b1f4dcab313c943'
        },
        body: JSON.stringify({
          agent_id: agentId,
          message: userMessage
        })
      });

      const data = await response.json();
      setMessages(prev => [...prev, { 
        type: 'ai', 
        content: data.response || 'Sorry, I encountered an error. Please try again.' 
      }]);
    } catch (error) {
      console.error('Chat error:', error);
      setMessages(prev => [...prev, { 
        type: 'ai', 
        content: 'Sorry, I encountered an error. Please try again.' 
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  return (
    <>
      {/* Chat Widget Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`fixed bottom-6 right-6 z-50 w-14 h-14 gradient-brand hover:opacity-90 text-white rounded-full shadow-lg hover:shadow-xl transition-all duration-200 flex items-center justify-center ${
          isOpen ? 'rotate-45' : ''
        }`}
        aria-label="Open help chat"
      >
        {isOpen ? (
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        ) : (
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        )}
      </button>

      {/* Chat Panel */}
      {isOpen && (
        <div className="fixed bottom-24 right-6 z-40 w-80 sm:w-96 h-96 bg-white dark:bg-gray-800 rounded-2xl shadow-2xl border border-brand-secondary/30 dark:border-gray-700 flex flex-col overflow-hidden">
          {/* Header */}
          <div className="gradient-brand text-white p-4 flex items-center space-x-3">
            <div className="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 5.636l-3.536 3.536m0 5.656l3.536 3.536M9.172 9.172L5.636 5.636m3.536 9.192L5.636 18.364M12 2.25a9.75 9.75 0 100 19.5 9.75 9.75 0 000-19.5z" />
              </svg>
            </div>
            <div>
              <h3 className="font-semibold">Help</h3>
              <p className="text-xs text-white/80">Tiny HabitsÂ® Support</p>
            </div>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-brand-secondary/5" role="log" aria-live="polite">
            {messages.map((message, index) => (
              <div
                key={index}
                className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-xs px-3 py-2 rounded-2xl text-sm ${
                    message.type === 'user'
                      ? 'bg-brand-main text-white'
                      : 'bg-white dark:bg-gray-700 text-brand-brown dark:text-gray-200 border border-brand-secondary/30'
                  }`}
                >
                  {message.content}
                </div>
              </div>
            ))}
            {isLoading && (
              <div className="flex justify-start">
                <div className="bg-white dark:bg-gray-700 border border-brand-secondary/30 px-3 py-2 rounded-2xl text-brand-brown dark:text-gray-400">
                  <div className="flex items-center space-x-2">
                    <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-brand-main"></div>
                    <span className="text-sm">Typing...</span>
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <div className="p-4 border-t border-brand-secondary/20 dark:border-gray-700">
            <div className="flex space-x-2">
              <input
                type="text"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Ask me anything..."
                className="flex-1 px-3 py-2 border border-brand-secondary/30 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-brand-main focus:border-transparent bg-white dark:bg-gray-700 text-brand-brown dark:text-gray-100 text-sm"
                disabled={isLoading}
                aria-label="Type your message"
              />
              <button
                onClick={sendMessage}
                disabled={!inputValue.trim() || isLoading}
                className="bg-brand-main hover:bg-brand-green1 text-white p-2 rounded-lg disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors duration-200"
                aria-label="Send message"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Mobile Full-Screen Overlay */}
      {isOpen && (
        <div className="fixed inset-0 z-30 bg-black/20 backdrop-blur-sm sm:hidden" onClick={() => setIsOpen(false)} />
      )}
    </>
  );
};

export default ChatWidget;

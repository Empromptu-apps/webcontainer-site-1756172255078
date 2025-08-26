import React, { useState, useEffect, useRef } from 'react';

const CreateHabitForm = ({ 
  user, 
  selectedHabit, 
  habits, 
  onSave, 
  onBack, 
  logApiCall, 
  createdObjects, 
  setCreatedObjects 
}) => {
  const [anchorMoment, setAnchorMoment] = useState(selectedHabit?.anchor_moment || '');
  const [newHabit, setNewHabit] = useState(selectedHabit?.new_habit || '');
  const [celebration, setCelebration] = useState(selectedHabit?.celebration || '');
  const [chatMessages, setChatMessages] = useState([]);
  const [chatInput, setChatInput] = useState('');
  const [isValidating, setIsValidating] = useState(false);
  const [agentId, setAgentId] = useState(null);
  const chatEndRef = useRef(null);

  useEffect(() => {
    createHabitValidationAgent();
  }, []);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatMessages]);

  const createHabitValidationAgent = async () => {
    try {
      const agentData = {
        instructions: `You are a Tiny HabitsÂ® Method expert assistant helping users create effective habit recipes. Follow BJ Fogg's methodology:

1. Help users create habits using the format: "After I [anchor moment], I will [new habit] and celebrate by [celebration]"
2. Ensure the anchor moment is specific and happens naturally in their routine
3. Make sure the new habit is TINY - something that takes less than 30 seconds
4. Gently encourage adding a celebration but don't insist if they prefer not to
5. Ask clarifying questions about their routine, goals, and constraints
6. Validate that the habit fits their actual life circumstances
7. Suggest improvements to make habits more likely to succeed
8. Keep the conversation friendly and supportive
9. When the user is satisfied with their habit recipe, clearly state the final validated version

Remember: Start fresh each conversation, focus on making habits tiny and achievable, and help users find the right anchor moments in their existing routines.`,
        agent_name: "Tiny Habits Coach"
      };

      const response = await fetch('https://builder.empromptu.ai/api_tools/create-agent', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer eeba1d9993534ab38cf63d3ee6ac4465',
          'X-Generated-App-ID': '1a83b945-41c4-4604-b24a-023ad43210e9',
          'X-Usage-Key': 'e08ae9e2a43e1db30b1f4dcab313c943'
        },
        body: JSON.stringify(agentData)
      });
      
      const data = await response.json();
      logApiCall('/create-agent', 'POST', agentData, data);
      
      if (data.agent_id) {
        setAgentId(data.agent_id);
        setCreatedObjects(prev => [...prev, `agent_${data.agent_id}`]);
      }
    } catch (error) {
      console.error('Agent creation error:', error);
      logApiCall('/create-agent', 'POST', 'Agent Creation', { error: error.message });
    }
  };

  const sendChatMessage = async (message) => {
    if (!agentId || !message.trim()) return;

    setIsValidating(true);
    setChatMessages(prev => [...prev, { type: 'user', content: message }]);
    setChatInput('');

    try {
      const chatData = {
        agent_id: agentId,
        message: message
      };

      const response = await fetch('https://builder.empromptu.ai/api_tools/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer eeba1d9993534ab38cf63d3ee6ac4465',
          'X-Generated-App-ID': '1a83b945-41c4-4604-b24a-023ad43210e9',
          'X-Usage-Key': 'e08ae9e2a43e1db30b1f4dcab313c943'
        },
        body: JSON.stringify(chatData)
      });

      const data = await response.json();
      logApiCall('/chat', 'POST', chatData, data);
      
      setChatMessages(prev => [...prev, { type: 'ai', content: data.response || 'Sorry, I encountered an error. Please try again.' }]);
    } catch (error) {
      console.error('Chat error:', error);
      logApiCall('/chat', 'POST', { agent_id: agentId, message }, { error: error.message });
      setChatMessages(prev => [...prev, { type: 'ai', content: 'Sorry, I encountered an error. Please try again.' }]);
    } finally {
      setIsValidating(false);
    }
  };

  const startAIValidation = () => {
    const habitText = `I want to create this habit: "After I ${anchorMoment}, I will ${newHabit}${celebration ? ` and celebrate by ${celebration}` : ''}". Can you help me validate and improve this habit recipe?`;
    sendChatMessage(habitText);
  };

  const handleSave = () => {
    if (anchorMoment && newHabit) {
      onSave(anchorMoment, newHabit, celebration);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <header className="bg-white dark:bg-gray-800 shadow-sm border-b border-brand-secondary/20 dark:border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-4">
              <div className="w-10 h-10 gradient-brand rounded-xl flex items-center justify-center">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <h1 className="text-2xl font-bold text-brand-main dark:text-gray-100">
                {selectedHabit ? 'Edit Habit' : 'Create New Habit'}
              </h1>
            </div>
            <button
              onClick={onBack}
              className="btn-secondary flex items-center space-x-2"
              aria-label="Back to dashboard"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
              <span>Back to Dashboard</span>
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Habit Form Column */}
          <div className="card-luxury p-8 border-l-4 border-brand-main">
            <h2 className="text-xl font-semibold text-brand-main mb-6 flex items-center space-x-2">
              <svg className="w-6 h-6 text-brand-accent" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              <span>Tiny Habit Recipe</span>
            </h2>
            
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-semibold text-brand-main mb-3">
                  After I... <span className="text-brand-brown font-normal">(anchor moment)</span>
                </label>
                <input
                  type="text"
                  value={anchorMoment}
                  onChange={(e) => setAnchorMoment(e.target.value)}
                  className="input-luxury"
                  placeholder="brush my teeth"
                  aria-label="Anchor moment - what you already do"
                />
                <p className="text-xs text-brand-secondary mt-1">
                  Choose something you already do consistently every day
                </p>
              </div>

              <div>
                <label className="block text-sm font-semibold text-brand-main mb-3">
                  I will... <span className="text-brand-brown font-normal">(new tiny habit)</span>
                </label>
                <input
                  type="text"
                  value={newHabit}
                  onChange={(e) => setNewHabit(e.target.value)}
                  className="input-luxury"
                  placeholder="do 2 push-ups"
                  aria-label="New tiny habit - what you want to start doing"
                />
                <p className="text-xs text-brand-secondary mt-1">
                  Make it tiny - something that takes less than 30 seconds
                </p>
              </div>

              <div>
                <label className="block text-sm font-semibold text-brand-main mb-3">
                  And celebrate by... <span className="text-brand-brown font-normal">(optional but recommended)</span>
                </label>
                <input
                  type="text"
                  value={celebration}
                  onChange={(e) => setCelebration(e.target.value)}
                  className="input-luxury"
                  placeholder="saying 'I'm awesome!'"
                  aria-label="Celebration - how you'll reward yourself"
                />
                <p className="text-xs text-brand-secondary mt-1">
                  A quick way to feel good about completing your habit
                </p>
              </div>

              <div className="pt-6 space-y-4">
                <button
                  onClick={startAIValidation}
                  disabled={!anchorMoment || !newHabit || isValidating}
                  className="w-full btn-success py-3 px-6 font-semibold disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center justify-center space-x-2 transition-colors duration-200"
                  aria-label="Get AI validation for your habit"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                  </svg>
                  <span>Validate with AI Coach</span>
                </button>

                <button
                  onClick={handleSave}
                  disabled={!anchorMoment || !newHabit}
                  className="w-full btn-primary py-3 text-lg font-semibold disabled:bg-gray-400 disabled:cursor-not-allowed"
                  aria-label="Save your habit"
                >
                  {selectedHabit ? 'Update Habit' : 'Save Habit'}
                </button>
              </div>
            </div>
          </div>

          {/* AI Chat Column */}
          <div className="card-luxury p-8 border-l-4 border-brand-accent">
            <h2 className="text-xl font-semibold text-brand-main mb-6 flex items-center space-x-2">
              <div className="w-8 h-8 gradient-brand rounded-lg flex items-center justify-center">
                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                </svg>
              </div>
              <span>AI Habit Coach</span>
            </h2>
            
            <div className="h-96 border-2 border-dashed border-brand-secondary/30 rounded-xl p-4 overflow-y-auto mb-4 bg-brand-secondary/5">
              {chatMessages.length === 0 ? (
                <div className="text-center text-brand-brown mt-16">
                  <div className="w-16 h-16 bg-brand-secondary/20 rounded-2xl flex items-center justify-center mx-auto mb-4">
                    <svg className="w-8 h-8 text-brand-main" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                    </svg>
                  </div>
                  <p className="text-sm leading-relaxed">
                    Fill out your habit recipe and click <br />
                    <strong className="text-brand-main">"Validate with AI Coach"</strong> to get <br />
                    personalized feedback!
                  </p>
                </div>
              ) : (
                <div className="space-y-4" role="log" aria-live="polite" aria-label="Chat conversation">
                  {chatMessages.map((message, index) => (
                    <div
                      key={index}
                      className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
                    >
                      <div
                        className={`max-w-xs lg:max-w-md px-4 py-3 rounded-2xl shadow-sm ${
                          message.type === 'user'
                            ? 'bg-brand-main text-white chat-bubble-user'
                            : 'bg-white dark:bg-gray-700 border border-brand-secondary/30 text-brand-brown dark:text-gray-200 chat-bubble-ai'
                        }`}
                      >
                        <p className="text-sm leading-relaxed">{message.content}</p>
                      </div>
                    </div>
                  ))}
                  {isValidating && (
                    <div className="flex justify-start">
                      <div className="bg-white dark:bg-gray-700 border border-brand-secondary/30 px-4 py-3 rounded-2xl text-brand-brown dark:text-gray-400 shadow-sm">
                        <div className="flex items-center space-x-3">
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-brand-main"></div>
                          <span className="text-sm">AI Coach is thinking...</span>
                        </div>
                      </div>
                    </div>
                  )}
                  <div ref={chatEndRef} />
                </div>
              )}
            </div>

            <div className="flex space-x-3">
              <input
                type="text"
                value={chatInput}
                onChange={(e) => setChatInput(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && !e.shiftKey && sendChatMessage(chatInput)}
                className="flex-1 input-luxury"
                placeholder="Ask me anything..."
                disabled={isValidating}
                aria-label="Chat with AI coach"
              />
              <button
                onClick={() => sendChatMessage(chatInput)}
                disabled={!chatInput.trim() || isValidating}
                className="btn-primary px-4 disabled:bg-gray-400 disabled:cursor-not-allowed"
                aria-label="Send message"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default CreateHabitForm;
